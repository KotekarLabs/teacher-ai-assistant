// apps/web/src/api/client.ts
import axios from "axios";

const apiHost = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  // prepend the API version segment
  baseURL: `${apiHost}/api/v1`,
  withCredentials: true,
});
