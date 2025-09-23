import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_SERVER, // or process.env.REACT_APP_API_BASE_URL for CRA
  // withCredentials: true, // if you're using cookies/sessions
  // timeout: 10000, // optional timeout
});

export default api;
