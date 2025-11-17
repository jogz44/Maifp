import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  // baseURL: 'http://192.168.8.11:8000/api',
  // baseURL: 'http://10.0.1.23:89/api',
  // baseURL: 'http://10.0.1.35:8000/api',
  // baseURL: process.env.API_URL, //office
  baseURL: 'http://192.168.8.182:8000/api', //Home
  // baseURL: 'http://127.0.0.1:8000/api',
  // baseURL: 'https://tagumcity.gov.ph/champ_backend/public/api',

  withCredentials: true,
})

const token = localStorage.getItem('auth_token')
// If token exists, set it in the default headers
if (token) {
  const sanitized_object = token.replace('__q_strn|', '')
  // console.log('Sanitized token:', sanitized_object)
  api.defaults.headers.common['Authorization'] = `Bearer ${sanitized_object}`
}

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
