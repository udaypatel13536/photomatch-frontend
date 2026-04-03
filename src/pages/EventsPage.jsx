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
      setError("Failed to load events.");
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-rose-300 tracking-widest text-sm uppercase mb-1">✦ Our Special Day ✦</p>
        <h1 className="text-4xl text-rose-900" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
          Wedding Events
        </h1>
        <div className="w-16 h-px bg-rose-300 mx-auto mt-3" />
      </div>

      <form onSubmit={handleCreate} className="bg-white border border-rose-100 rounded-2xl p-5 mb-8 shadow-sm space-y-3">
        <h2 className="text-lg text-rose-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Create New Event
        </h2>
        <input
          type="text"
          placeholder="Event name (e.g. Wedding Ceremony)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-rose-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50"
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-rose-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="w-full py-2 rounded-xl text-sm tracking-widest uppercase font-light text-white disabled:opacity-50"
          style={{ backgroundColor: "#9f3f4f" }}
        >
          {creating ? "Creating..." : "Create Event"}
        </button>
      </form>

      {loading ? (
        <p className="text-rose-300 text-center text-sm">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">💍</p>
          <p className="text-rose-300 text-sm">No events yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-rose-900 text-sm">{ev.name}</p>
                  {ev.description && <p className="text-xs text-rose-400 mt-0.5">{ev.description}</p>}
                  <p className="text-xs text-rose-300 mt-1">
                    {ev.photo_count} photo{ev.photo_count !== "1" ? "s" : ""} · {new Date(ev.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-rose-200 text-xl">🌸</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
