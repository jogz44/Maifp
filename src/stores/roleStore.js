import { defineStore } from 'pinia'
import { api } from 'boot/axios' // Make sure axios is set up in boot/axios.js

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchRoles() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/role')
        if (response.data && response.data.success) {
          this.roles = response.data.role.map((r) => ({
            label: r.role_name.toUpperCase(),
            value: r.id,
          }))
        } else {
          this.error = 'Failed to fetch roles'
        }
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
})
