/**
 * Shared API client. GET/HEAD requests retry on Fly cold-start failures
 * (502/503/504, network, timeout) with backoff; UI listens via apiRetryStatus.
 * Pass config.__noRetry to skip retries for a single request.
 */
import axios from 'axios'
import { setApiRetryAttempt } from '@/lib/apiRetryStatus'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://helpnow-backend-v4.fly.dev/api/v1'

const headers = {}
if (import.meta.env.VITE_API_TOKEN) {
  headers.Authorization = `Bearer ${import.meta.env.VITE_API_TOKEN}`
}

/** Backoff for Fly.io cold starts (GET only). */
const RETRY_DELAYS_MS = [1000, 2000, 4000]
const MAX_RETRIES = RETRY_DELAYS_MS.length
const RETRYABLE_STATUSES = new Set([502, 503, 504])

const axiosInstance = axios.create({
  baseURL,
  headers,
  timeout: 30000,
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableRequest(config) {
  if (!config || config.__noRetry) return false
  const method = (config.method ?? 'get').toLowerCase()
  return method === 'get' || method === 'head'
}

function isRetryableError(error) {
  if (!error.response) {
    // Network error, timeout, or CORS while backend wakes up
    return true
  }
  return RETRYABLE_STATUSES.has(error.response.status)
}

// Retry only idempotent GET/HEAD; publish attempt count for Need Help wait messaging.
axiosInstance.interceptors.response.use(
  (response) => {
    setApiRetryAttempt(0)
    return response
  },
  async (error) => {
    const config = error.config

    if (!isRetryableRequest(config) || !isRetryableError(error)) {
      setApiRetryAttempt(0)
      return Promise.reject(error)
    }

    config.__retryCount = config.__retryCount ?? 0
    if (config.__retryCount >= MAX_RETRIES) {
      setApiRetryAttempt(0)
      return Promise.reject(error)
    }

    config.__retryCount += 1
    setApiRetryAttempt(config.__retryCount)

    await sleep(RETRY_DELAYS_MS[config.__retryCount - 1] ?? 4000)
    return axiosInstance(config)
  }
)

export default axiosInstance
