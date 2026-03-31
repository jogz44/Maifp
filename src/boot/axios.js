import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://192.168.8.11:8000/api',
  // baseURL: 'http://10.0.1.23:89/api',
  // baseURL: 'http://10.0.1.35:8000/api',
  // baseURL: process.env.API_URL, //office
  // baseURL: 'http://192.168.8.182:5000/api', //Home
  // baseURL: 'http://127.0.0.1:8000/api',
  // baseURL: 'https://tagumcity.gov.ph/maifpbackend/public/api',
  baseURL: 'https://tagumcity.gov.ph/champ_backend/public/api',

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
      // window.location.href = '/'
      this.$router.push({ name: 'login' })
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
