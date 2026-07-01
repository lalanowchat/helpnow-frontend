import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://helpnow-backend-v4.fly.dev/api/v1'

const headers = {}
if (import.meta.env.VITE_API_TOKEN) {
  headers.Authorization = `Bearer ${import.meta.env.VITE_API_TOKEN}`
}

const axiosInstance = axios.create({
  baseURL,
  headers,
})

export default axiosInstance
