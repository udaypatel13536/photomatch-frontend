import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://photomatch-backend.onrender.com";

const api = axios.create({ baseURL: `${API_BASE}/api` });

export const getEvents = () => api.get("/events").then((r) => r.data);

export const createEvent = (name, description) =>
  api.post("/events", { name, description }).then((r) => r.data);

export const uploadPhotos = (eventId, files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));

  return api
    .post(`/events/${eventId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000,
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    })
    .then((r) => r.data);
};

export const matchSelfie = (selfieBlob, eventId, threshold = 0.65) => {
  const formData = new FormData();
  formData.append("selfie", selfieBlob, "selfie.jpg");
  if (eventId) formData.append("eventId", eventId);
  formData.append("threshold", threshold.toString());

  return api
    .post("/match", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    })
    .then((r) => r.data);
};

export default api;
