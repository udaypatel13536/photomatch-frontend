import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded-full text-sm tracking-widest uppercase transition-all ${
      pathname === path
        ? "bg-rose-800 text-white shadow"
        : "text-rose-900 hover:bg-rose-100"
    }`;

  return (
    <nav className="bg-white border-b border-rose-100 shadow-sm px-4 py-3">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-rose-300 text-lg">✦</span>
          <span
            className="text-3xl text-rose-900 tracking-widest"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            SweNik
          </span>
          <span className="text-rose-300 text-lg">✦</span>
        </div>
        <p className="text-xs text-rose-400 tracking-widest uppercase">Wedding Memories</p>
        <div className="flex gap-2 mt-1">
          <Link to="/" className={linkClass("/")}>Events</Link>
          <Link to="/upload" className={linkClass("/upload")}>Upload</Link>
          <Link to="/match" className={linkClass("/match")}>Find Me</Link>
        </div>
      </div>
    </nav>
  );
}
