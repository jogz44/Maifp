import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    logs: [], // list of activity logs
    loading: false,
  }),

  getters: {
    allLogs: (state) => state.logs,
  },

  actions: {
    async fetchActivityLogs() {
      this.loading = true
      try {
        const res = await api.get('/activity')
        this.logs = res.data
        return this.logs
      } catch (error) {
        console.error('Error fetching activity logs:', error)
        return []
      } finally {
        this.loading = false
      }
    },
  },
})
