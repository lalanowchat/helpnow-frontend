import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: "https://lalanow-backend-v3.fly.dev",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
  },
});

export default axiosInstance;
