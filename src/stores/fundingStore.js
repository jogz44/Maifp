import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useFundsStore = defineStore('funds', {
  state: () => ({
    funds: [], // list of funds (/Budgets)
    dashboard: {
      // summary (/Budgets/dashboard)
      total_funds: 0,
      released_funds: 0,
      remaining_funds: 0,
    },
    loading: false,
  }),

  getters: {
    rows: (state) => state.funds,
    totalFunds: (state) => state.dashboard.total_funds,
    releasedFunds: (state) => state.dashboard.released_funds,
    remainingFunds: (state) => state.dashboard.remaining_funds,
  },

  actions: {
    async fetchFunds() {
      this.loading = true
      try {
        const res = await api.get('/Budgets')
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
        const res = await api.get('/Budgets/dashboard')
        this.dashboard = {
          total_funds: Number(res.data.total_funds || 0),
          released_funds: Number(res.data.released_funds || 0),
          remaining_funds: Number(res.data.remaining_funds || 0),
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        this.loading = false
      }
    },

    async addFund(payload) {
      try {
        const res = await api.post('/Budgets/store', payload)
        this.funds.push(res.data)
      } catch (error) {
        console.error('Failed to add fund:', error)
      }
    },

    async addAdditional(payload) {
      try {
        const res = await api.post('/Budgets/store', payload)
        this.funds.push(res.data)
      } catch (error) {
        console.error('Failed to add additional fund:', error)
      }
    },
  },
})
