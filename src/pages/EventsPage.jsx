import { useState, useEffect } from "react";
import { getEvents, createEvent } from "../api/client";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data.events);
    } catch {
      setError("Failed to load events. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createEvent(name.trim(), description.trim());
      setName("");
      setDescription("");
      await fetchEvents();
    } catch {
      setError("Failed to create event.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Events</h1>

      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-700">Create New Event</h2>
        <input
          type="text"
          placeholder="Event name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Event"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-400 text-center py-12 text-sm">No events yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-sm">{ev.name}</p>
              {ev.description && <p className="text-sm text-gray-500">{ev.description}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {ev.photo_count} photo{ev.photo_count !== "1" ? "s" : ""} · {new Date(ev.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
