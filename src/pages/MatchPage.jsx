import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { getEvents, matchSelfie } from "../api/client";

function thumbnailUrl(url) {
  if (!url) return url;
  return url.replace("/object/public/", "/render/image/public/") + "?width=800&quality=70&resize=contain";
}

export default function MatchPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [threshold, setThreshold] = useState(0.45);
  const [mode, setMode] = useState("camera");
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieBlob, setSelfieBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const webcamRef = useRef(null);

  useEffect(() => {
    getEvents().then((d) => setEvents(d.events));
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelfiePreview(imageSrc);
    fetch(imageSrc).then((r) => r.blob()).then(setSelfieBlob);
    setResult(null);
    setError("");
  }, []);

  const onDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (!file) return;
    setSelfieBlob(file);
    setSelfiePreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleMatch = async () => {
    if (!selfieBlob) return setError("Please capture or upload a selfie first.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await matchSelfie(selfieBlob, selectedEvent || undefined, threshold);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Match failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-rose-300 tracking-widest text-sm uppercase mb-1">✦ Relive the Magic ✦</p>
        <h1 className="text-4xl text-rose-900" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          Find My Photos
        </h1>
        <div className="w-16 h-px bg-rose-300 mx-auto mt-3" />
      </div>

      {/* Selfie input */}
      <div className="bg-white border border-rose-100 rounded-2xl p-5 mb-4 shadow-sm">
        <p className="text-sm text-rose-700 tracking-wide mb-3">Take or upload your selfie</p>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-2 rounded-xl text-xs tracking-widest uppercase transition-all ${
              mode === "camera" ? "text-white shadow" : "text-rose-700 bg-rose-50"
            }`}
            style={mode === "camera" ? { backgroundColor: "#9f3f4f" } : {}}
          >
            Camera
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-2 rounded-xl text-xs tracking-widest uppercase transition-all ${
              mode === "upload" ? "text-white shadow" : "text-rose-700 bg-rose-50"
            }`}
            style={mode === "upload" ? { backgroundColor: "#9f3f4f" } : {}}
          >
            Upload
          </button>
        </div>

        {mode === "camera" ? (
          <div className="space-y-2">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-xl w-full"
              videoConstraints={{ facingMode: "user" }}
            />
            <button
              onClick={capture}
              className="w-full py-2 rounded-xl text-xs tracking-widest uppercase text-white"
              style={{ backgroundColor: "#9f3f4f" }}
            >
              Capture Selfie
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-rose-200 rounded-xl p-8 text-center cursor-pointer bg-rose-50"
          >
            <input {...getInputProps()} />
            <p className="text-2xl mb-2">🤳</p>
            <p className="text-rose-400 text-sm">Tap to select your selfie</p>
          </div>
        )}

        {selfiePreview && (
          <div className="mt-3 flex items-center gap-3">
            <img src={selfiePreview} alt="selfie" className="w-14 h-14 rounded-full object-cover border-2 border-rose-200" />
            <p className="text-sm text-rose-500">✓ Selfie ready</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-white border border-rose-100 rounded-2xl p-5 mb-4 shadow-sm space-y-4">
        <div>
          <label className="block text-sm text-rose-700 tracking-wide mb-1">Search in event</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full border border-rose-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50"
          >
            <option value="">All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-rose-700 tracking-wide mb-1">
            Match strictness: {Math.round(threshold * 100)}%
          </label>
          <input
            type="range" min={0.45} max={0.9} step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <p className="text-xs text-rose-300 mt-1">Higher = fewer but more accurate results</p>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

      <button
        onClick={handleMatch}
        disabled={loading || !selfieBlob}
        className="w-full py-3 rounded-xl text-sm tracking-widest uppercase font-light text-white disabled:opacity-40 mb-2"
        style={{ backgroundColor: "#9f3f4f" }}
      >
        {loading ? "Searching..." : "Find My Photos"}
      </button>

      {loading && (
        <p className="text-xs text-rose-300 text-center mb-4">This may take 10–30 seconds...</p>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6">
          <div className="text-center mb-5">
            <p className="text-rose-300 text-xs tracking-widest uppercase mb-1">✦ Results ✦</p>
            <h2 className="text-2xl text-rose-900" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
              {result.matchCount === 0
                ? "No matches found"
                : `${result.matchCount} photo${result.matchCount !== 1 ? "s" : ""} found`}
            </h2>
            {result.matchCount === 0 && (
              <p className="text-xs text-rose-300 mt-1">Try lowering the match strictness</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {result.matches.map((match) => (
              <div key={match.photoId} className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="w-full bg-rose-50 flex items-center justify-center">
                  <img
                    src={thumbnailUrl(match.downloadUrl)}
                    alt={match.filename}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-rose-600">{match.similarityPercent}% match</p>
                  {match.eventName && <p className="text-xs text-rose-300">{match.eventName}</p>}
                  <a
                    href={match.downloadUrl}
                    download={match.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-xs text-center rounded-xl px-2 py-1.5 text-white"
                    style={{ backgroundColor: "#9f3f4f" }}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
