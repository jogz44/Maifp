import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
export const useIndicatorStore = defineStore('indicator', {
  state: () => ({
    isOpen: false,
    isClose: false,
    indicator_id: 0,

  }),

  actions: {

    async getStatus (){
      try {
        const response = await api.get('/indicators/current')
        this.isOpen = response.data.data.is_open
        this.isClose = response.data.data.is_close

      } catch (error) {
        throw   error.response?.data?.message || error.message || 'An unexpected error occurred'
      }
    },
    async open_status() {
      try {
        await api.post('/indicators/open')

      } catch (error) {
        throw error.response?.data?.message || error.message || 'An unexpected error occurred'
      }
    },

    async close_status() {
      try {
      await api.post('/indicators/close')

      } catch (error) {
        throw error.response?.data?.message || error.message || 'An unexpected error occurred'
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIndicatorStore, import.meta.hot))
}
