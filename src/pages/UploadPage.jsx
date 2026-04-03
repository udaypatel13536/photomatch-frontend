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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-rose-300 tracking-widest text-sm uppercase mb-1">✦ Preserve the Memories ✦</p>
        <h1 className="text-4xl text-rose-900" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          Upload Photos
        </h1>
        <div className="w-16 h-px bg-rose-300 mx-auto mt-3" />
      </div>

      <div className="bg-white border border-rose-100 rounded-2xl p-5 mb-5 shadow-sm">
        <label className="block text-sm text-rose-700 mb-2 tracking-wide">Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full border border-rose-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50"
        >
          {events.length === 0 && <option value="">No events — create one first</option>}
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-rose-400 bg-rose-50" : "border-rose-200 bg-white hover:border-rose-400"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-4xl mb-3">🌸</p>
        <p className="text-rose-700 text-sm font-light tracking-wide">
          {isDragActive ? "Drop your photos here..." : "Tap to select wedding photos"}
        </p>
        <p className="text-xs text-rose-300 mt-2">JPG, PNG, WEBP — up to 50 MB each</p>
      </div>

      {files.length > 0 && (
        <p className="mt-3 text-sm text-rose-600 text-center">
          {files.length} photo{files.length !== 1 ? "s" : ""} ready to upload
        </p>
      )}

      {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}

      {uploading && (
        <div className="mt-4">
          <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-rose-400 mt-2 text-center">Uploading & detecting faces... {progress}%</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0 || !selectedEvent}
        className="mt-5 w-full py-3 rounded-xl text-sm tracking-widest uppercase font-light text-white disabled:opacity-40"
        style={{ backgroundColor: "#9f3f4f" }}
      >
        {uploading ? "Processing..." : "Upload & Detect Faces"}
      </button>

      {result && (
        <div className="mt-6 bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
          <p className="text-center text-rose-900 font-semibold text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {result.message}
          </p>
          <ul className="mt-4 space-y-2">
            {result.results.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === "success" ? "bg-rose-400" : "bg-red-300"}`} />
                <span className="text-rose-800 truncate">{r.filename}</span>
                {r.status === "success" && (
                  <span className="text-rose-300 flex-shrink-0 text-xs">{r.facesDetected} face{r.facesDetected !== 1 ? "s" : ""}</span>
                )}
                {r.status === "error" && (
                  <span className="text-red-400 flex-shrink-0 text-xs">{r.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
