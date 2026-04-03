import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { getEvents, uploadPhotos } from "../api/client";

export default function UploadPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents().then((d) => {
      setEvents(d.events);
      if (d.events.length > 0) setSelectedEvent(d.events[0].id);
    });
  }, []);

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => [...prev, ...accepted]);
    setResult(null);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleUpload = async () => {
    if (!selectedEvent) return setError("Please select an event first.");
    if (files.length === 0) return setError("Please add photos first.");
    setUploading(true);
    setError("");
    setResult(null);
    try {
      const data = await uploadPhotos(selectedEvent, files, setProgress);
      setResult(data);
      setFiles([]);
      setProgress(0);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Please retry.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Upload Event Photos</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {events.length === 0 && <option value="">No events — create one first</option>}
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-2xl mb-2">📸</p>
        <p className="text-gray-600 text-sm font-medium">
          {isDragActive ? "Drop photos here..." : "Tap to select photos"}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — up to 50 MB each</p>
      </div>

      {files.length > 0 && (
        <p className="mt-3 text-sm text-gray-600 font-medium">
          {files.length} photo{files.length !== 1 ? "s" : ""} selected
        </p>
      )}

      {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}

      {uploading && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-1">Uploading & detecting faces... {progress}%</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0 || !selectedEvent}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Processing..." : "Upload & Detect Faces"}
      </button>

      {result && (
        <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-800 text-sm">{result.message}</p>
          <ul className="mt-3 space-y-1">
            {result.results.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === "success" ? "bg-green-500" : "bg-red-400"}`} />
                <span className="text-gray-700 truncate">{r.filename}</span>
                {r.status === "success" && (
                  <span className="text-gray-400 flex-shrink-0">— {r.facesDetected} face{r.facesDetected !== 1 ? "s" : ""}</span>
                )}
                {r.status === "error" && (
                  <span className="text-red-500 flex-shrink-0 text-xs">{r.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
