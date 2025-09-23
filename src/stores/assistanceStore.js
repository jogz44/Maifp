import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useAssistanceStore = defineStore('assistance', {
  state: () => ({
    loading: false,
  }),

  getters: {
    isLoading: (state) => state.loading,
  },

  actions: {
    async applyAssistance(payload) {
      this.loading = true
      try {
        const res = await api.post('/assistance/store', payload)
        return res.data
      } catch (error) {
        console.error('Error applying assistance:', error)
        return { success: false, error: error?.response?.data?.message || error.message }
      } finally {
        this.loading = false
      }
    },
  },
})
