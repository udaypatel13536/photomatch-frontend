import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { getEvents, matchSelfie } from "../api/client";

export default function MatchPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [threshold, setThreshold] = useState(0.65);
  const [mode, setMode] = useState("camera"); // "camera" | "upload"
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
    // Convert base64 to blob
    fetch(imageSrc)
      .then((r) => r.blob())
      .then(setSelfieBlob);
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
      const data = await matchSelfie(
        selfieBlob,
        selectedEvent || undefined,
        threshold
      );
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Match failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Find My Photos</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left: selfie input */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("camera")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "camera"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upload Selfie
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
                className="w-full bg-gray-800 text-white py-2 rounded-xl hover:bg-gray-900"
              >
                Capture Selfie
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400"
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">Click or drop selfie here</p>
            </div>
          )}

          {selfiePreview && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Your selfie:</p>
              <img
                src={selfiePreview}
                alt="selfie preview"
                className="rounded-xl w-32 h-32 object-cover border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Right: options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search in event (optional)
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Similarity threshold: {Math.round(threshold * 100)}%
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
            <p className="text-xs text-gray-400 mt-1">
              Higher = stricter matching. Minimum 65% to avoid false matches.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleMatch}
            disabled={loading || !selfieBlob}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find My Photos"}
          </button>

          {loading && (
            <p className="text-xs text-gray-400">
              AI service may take 30-60 s after idle (free tier cold start)...
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">
            {result.matchCount === 0
              ? "No matches found. Try lowering the threshold."
              : `Found ${result.matchCount} photo${result.matchCount !== 1 ? "s" : ""} with you!`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {result.matches.map((match) => (
              <div
                key={match.photoId}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                <img
                  src={match.downloadUrl}
                  alt={match.filename}
                  className="w-full h-36 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs text-gray-500 truncate">{match.filename}</p>
                  <p className="text-xs font-semibold text-blue-600">
                    {match.similarityPercent}% match
                  </p>
                  {match.eventName && (
                    <p className="text-xs text-gray-400">{match.eventName}</p>
                  )}
                  <a
                    href={match.downloadUrl}
                    download={match.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-center bg-blue-50 text-blue-600 rounded px-2 py-1 hover:bg-blue-100"
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
