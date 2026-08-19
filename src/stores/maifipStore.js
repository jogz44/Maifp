import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const usemaifipStore = defineStore('maifip', {
  state: () => ({
    loading: false,
    reportData: [],
  }),

  getters: {
    isLoading: (state) => state.loading,
    getReportData: (state) => state.reportData,
  },

  actions: {
    async getReport(payload) {
      this.loading = true
      try {
        const res = await api.post('/report/store', payload)
        this.reportData = res.data
        return { success: true, data: res.data }
      } catch (error) {
        console.error('Error fetching report:', error)
        this.reportData = []
        return {
          success: false,
          error: error?.response?.data?.message || error.message,
        }
      } finally {
        this.loading = false
      }
    },

    async getDate() {
      this.loading = true
      try {
        const res = await api.get('/report')
        this.reportData = res.data
        return { success: true, data: res.data }
      } catch (error) {
        console.error('Error fetching report:', error)
        this.reportData = []
        return {
          success: false,
          error: error?.response?.data?.message || error.message,
        }
      } finally {
        this.loading = false
      }
    },

    async generateAnnexB(payload) {
      this.loading = true
      try {
        const res = await api.post('/report/generate-doh', payload, {
          responseType: 'blob',
        })
        return { success: true, data: res.data, headers: res.headers }
      } catch (error) {
        console.error('Error generating Annex B report:', error)
        return {
          success: false,
          error: error?.response?.data?.message || error.message,
        }
      } finally {
        this.loading = false
      }
    },
  },
})
