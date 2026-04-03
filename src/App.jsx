import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import EventsPage from "./pages/EventsPage";
import UploadPage from "./pages/UploadPage";
import MatchPage from "./pages/MatchPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: "#fdf6f0" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
