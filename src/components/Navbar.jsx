import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
      <span className="text-lg font-bold text-blue-600 mr-2">📸 PhotoMatch</span>
      <Link to="/" className={linkClass("/")}>Events</Link>
      <Link to="/upload" className={linkClass("/upload")}>Upload</Link>
      <Link to="/match" className={linkClass("/match")}>Find Me</Link>
    </nav>
  );
}
