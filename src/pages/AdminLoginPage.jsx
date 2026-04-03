import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(password)) {
      navigate("/");
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#fdf6f0" }}>
      <div className="bg-white border border-rose-100 rounded-2xl p-8 shadow-sm w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-rose-300 tracking-widest text-xs uppercase mb-2">✦ Admin Access ✦</p>
          <h1 className="text-3xl text-rose-900" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            SweNik
          </h1>
          <div className="w-12 h-px bg-rose-200 mx-auto mt-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-rose-500 tracking-widest uppercase mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full border border-rose-200 rounded-xl px-4 py-2 text-sm bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-sm tracking-widest uppercase text-white"
            style={{ backgroundColor: "#9f3f4f" }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
