import { boot } from 'quasar/wrappers'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

export default boot(({ app }) => {
  const getToken = () => {
    const token = localStorage.getItem('token')
    if (token) {
      return token.replace('__q_strn|', '').replace(/"/g, '')
    }
    return null
  }

  const echo = new Echo({
    broadcaster: 'reverb',
    key: 'wuvces4jyukj1gunkgcv',
    wsHost: '192.168.8.182',
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://192.168.8.182:8000/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/json',
      },
    },
  })

  app.config.globalProperties.$echo = echo
  window.Echo = echo

  console.log('Laravel Echo initialized with Reverb')
})
