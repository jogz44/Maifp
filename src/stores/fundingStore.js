import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useFundsStore = defineStore('funds', {
  state: () => ({
    funds: [],
    loading: false,
  }),

  getters: {
    rows: (state) => state.funds,
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
        console.error('Failed to add fund:', error)
      }
    },

    // async removeFund(id) {
    //   try {
    //     await api.delete(`/funds/${id}`)
    //     this.funds = this.funds.filter((f) => f.id !== id)
    //   } catch (error) {
    //     console.error('Failed to remove fund:', error)
    //   }
    // },

    // async addAdditional(id, amount) {
    //   try {
    //     const res = await api.post(`/funds/${id}/add`, { amount })
    //     const index = this.funds.findIndex((f) => f.id === id)
    //     if (index !== -1) this.funds[index].funds = res.data.funds
    //   } catch (error) {
    //     console.error('Failed to add funds:', error)
    //   }
    // },
  },
})
