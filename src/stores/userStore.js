import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify, LocalStorage } from 'quasar'

export const useUserStore = defineStore('users', {
  state: () => ({
    user: {},
    users: [],
    selected_id: null,
    authenticatedUser: 0,
    loading: false,
  }),

  actions: {
    async getUsers() {
      this.loading = true
      try {
        const response = await api.get('/system/users')
        this.users = response.data.users
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async getUser(id) {
      this.loading = true
      try {
        const response = await api.get('/system/user/profile/' + id)
        this.user = response.data.user[0]
        // console.log(id)
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async newUser(payload) {
      this.loading = true
      try {
        payload.status = 'Active'
        const response = await api.post('/system/user/new', payload)
        // console.log(response.data.success)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'User Successfully Saved.',
            position: 'center',
            timeout: 5000,
          })
        }
      } catch (error) {
        console.log(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, payload) {
      this.loading = true
      try {
        console.log(payload)
        // Add password_confirmation if password is being updated
        if (payload.password) {
          payload.password_confirmation = payload.confirm_password
        }
        // Remove confirm_password from payload before sending to API

        console.log('Payload sent to API:', payload)
        const response = await api.put('/system/user/profile-update/' + id, {
          ...payload,
          password_confirmation: payload.confirm_password,
        })
        this.user = response.data.user[0]
        // console.log(response.data.success)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'User Profile Successfully Updated.',
            position: 'center',
            timeout: 5000,
          })
        }
      } catch (error) {
        console.log(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async removeUser(id) {
      this.loading = true
      try {
        const response = await api.post('/system/user/profile-remove/' + id)
        // console.log(response.data.success)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'User Successfully Removed.',
            position: 'center',
            timeout: 5000,
          })
        }
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async deactivateUser(id) {
      this.loading = true
      try {
        const response = await api.put('/system/user/profile-deactivate/' + id)
        // console.log(response.data.success)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'User Successfully Deactivated.',
            position: 'center',
            timeout: 5000,
          })
        }
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async activateUser(id) {
      this.loading = true
      try {
        const response = await api.put('/system/user/profile-activate/' + id)
        // console.log(response.data.success)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'User Successfully Activated.',
            position: 'center',
            timeout: 5000,
          })
        }
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      } finally {
        this.loading = false
      }
    },

    async loginUser(payload) {
      this.loading = true
      try {
        const response = await api.post('/user/login', payload)
        console.log(response.data)

        if (response.data.success) {
          LocalStorage.set('auth_token', response.data.data.token)
          LocalStorage.set('user', response.data.data.user)
          LocalStorage.set('role_name', response.data.data.user.role_name)

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
        }

        return response.data
      } catch (error) {
        console.error('Login error:', error)

        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Login failed',
        }
      } finally {
        this.loading = false
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
