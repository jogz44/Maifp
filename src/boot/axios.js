import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.8.182:5000/api', // Home
  // baseURL: 'http://10.0.1.35:5000/api', // Office
  // baseURL: 'https://tagumcity.gov.ph/champ_backend/public/api', //Champ
  // baseURL: process.env.API_URL,
  withCredentials: true,
})

// Attach token on each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      const sanitized = token.replace('__q_strn|', '')
      config.headers.Authorization = `Bearer ${sanitized}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Optional: handle global errors (like Unauthenticated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('API Error: Unauthenticated. Redirecting to login...')
      // Example: clear token and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
