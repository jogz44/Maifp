import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useFundsStore = defineStore('funds', {
  state: () => ({
    funds: [],
    releasedFundsBySource: [],
    loading: false,
  }),

  actions: {
    async assistanceList() {
      this.loading = true
      try {
        const res = await api.get('/assistance')
        this.funds = res.data
      } catch (error) {
        console.error('Error fetching funds:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchFundsDashboard() {
      this.loading = true
      try {
        const res = await api.get('/assistance/funds')
        this.releasedFundsBySource = res.data
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
