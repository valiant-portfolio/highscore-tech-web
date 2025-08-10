import axios from 'axios';
import { getCookie } from './cookies';
import { toast } from 'sonner';

export const backendUrl = () => {
  let localhostUrl = "http://localhost:8000";
  let remoteUrl = "https://highscore-tech-server.onrender.com";
  
  // Check if window is defined (client-side) before accessing location
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  
  const _api = isLocalhost ? localhostUrl : remoteUrl;
  return remoteUrl;
};

const api = axios.create({
  baseURL: backendUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    // Do Add auth token
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error?.response?.data);
  }
);

export default api;
