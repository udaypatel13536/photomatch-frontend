import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdmin, logout } from "../auth";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const admin = isAdmin();

  const linkClass = (path) =>
    `px-4 py-2 rounded-full text-sm tracking-widest uppercase transition-all ${
      pathname === path
        ? "bg-rose-800 text-white shadow"
        : "text-rose-900 hover:bg-rose-100"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/match");
  };

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
        <div className="flex gap-2 mt-1 items-center">
          {admin && <Link to="/" className={linkClass("/")}>Events</Link>}
          {admin && <Link to="/upload" className={linkClass("/upload")}>Upload</Link>}
          <Link to="/match" className={linkClass("/match")}>Find Me</Link>
          {admin ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm tracking-widest uppercase text-rose-400 hover:text-rose-700 transition-all"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/admin"
              className="px-3 py-1 text-xs text-rose-200 hover:text-rose-400 transition-all"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
