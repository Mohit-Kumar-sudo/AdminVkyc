import axios from "axios";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000" 
    : "http://localhost:5000";

const API = axios.create({
  baseURL, 
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const apiService = {
  get: (url, params) => API.get(url, { params }),
  post: (url, data) => API.post(url, data),
  put: (url, data) => API.put(url, data),
  delete: (url) => API.delete(url),
};

export default API;