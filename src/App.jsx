import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage";
import UploadPage from "./pages/UploadPage";
import MatchPage from "./pages/MatchPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import { isAdmin } from "./auth";

function AdminRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin login — no navbar */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* All other routes with navbar */}
        <Route
          path="*"
          element={
            <div className="min-h-screen" style={{ backgroundColor: "#fdf6f0" }}>
              <Navbar />
              <Routes>
                <Route path="/" element={<AdminRoute><EventsPage /></AdminRoute>} />
                <Route path="/upload" element={<AdminRoute><UploadPage /></AdminRoute>} />
                <Route path="/match" element={<MatchPage />} />
                <Route path="*" element={<Navigate to="/match" replace />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
