import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { getEvents, matchSelfie } from "../api/client";

function thumbnailUrl(url) {
  if (!url) return url;
  return url.replace("/object/public/", "/render/image/public/") + "?width=400&quality=70";
}

export default function MatchPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [threshold, setThreshold] = useState(0.65);
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Find My Photos</h1>

      {/* Selfie input */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              mode === "camera" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            📷 Camera
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              mode === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            🖼 Upload
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
              className="w-full bg-gray-800 text-white py-2 rounded-xl text-sm font-medium"
            >
              Capture Selfie
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <p className="text-gray-500 text-sm">Tap to select a selfie</p>
          </div>
        )}

        {selfiePreview && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={selfiePreview}
              alt="selfie"
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
            <p className="text-sm text-green-600 font-medium">✓ Selfie ready</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event (optional)</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Similarity: {Math.round(threshold * 100)}%
          </label>
          <input
            type="range"
            min={0.65}
            max={0.9}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-gray-400 mt-1">Higher = stricter. Minimum 65%.</p>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleMatch}
        disabled={loading || !selfieBlob}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 mb-2"
      >
        {loading ? "Searching..." : "Find My Photos"}
      </button>

      {loading && (
        <p className="text-xs text-gray-400 text-center mb-4">This may take 10–30 seconds...</p>
      )}

      {/* Results */}
      {result && (
        <div className="mt-4">
          <h2 className="text-base font-semibold mb-3">
            {result.matchCount === 0
              ? "No matches found. Try lowering the threshold."
              : `Found ${result.matchCount} photo${result.matchCount !== 1 ? "s" : ""} with you!`}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {result.matches.map((match) => (
              <div key={match.photoId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="w-full bg-gray-100 flex items-center justify-center">
                  <img
                    src={thumbnailUrl(match.downloadUrl)}
                    alt={match.filename}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-blue-600">{match.similarityPercent}% match</p>
                  {match.eventName && <p className="text-xs text-gray-400">{match.eventName}</p>}
                  <a
                    href={match.downloadUrl}
                    download={match.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-center bg-blue-50 text-blue-600 rounded px-2 py-1"
                  >
                    Download Full
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
