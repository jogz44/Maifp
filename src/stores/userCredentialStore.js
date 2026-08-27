import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useUserCredentialstore = defineStore('userCredential', {
  state: () => ({
    credential: {},
    credentials: [],
    selected_id: null,
  }),

  actions: {
    async getAllCredentials() {
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
      }
    },

    async getUserCredential(id) {
      try {
        const response = await api.get('/system/user/' + id + '/credentials/')
        console.log(response.data.credential)
        this.credentials = response.data.credential
        console.log(this.credentials)
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      }
    },

    async getUserModuleCredential(id, module) {
      try {
        const response = await api.get('/system/user/profile/' + id, module)
        this.user = response.data.user[0]
        // console.log(id)
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      }
    },

    async newUserCredential(payload) {
      try {
        console.log(payload)
        const response = await api.post('/system/user/credentials', payload)
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
      }
    },

    async updateUser(id, payload) {
      try {
        console.log(payload)
        // Add password_confirmation if password is being updated
        if (payload.password) {
          payload.password_confirmation = payload.confirm_password
        }
        // Remove confirm_password from payload before sending to API

        console.log('Payload sent to API:', payload)
        const response = await api.post('/system/user/profile-update/' + id, {
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
      }
    },

    async removeUser(id) {
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
      }
    },
    async deactivateUser(id) {
      try {
        const response = await api.post('/system/user/profile-deactivate/' + id)
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
      }
    },

    async activateUser(id) {
      try {
        const response = await api.post('/system/user/profile-activate/' + id)
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
      }
    },

    async loginUser(payload) {
      try {
        await api.get('/sanctum/csrf-cookie') // Get CSRF cookie first
        const response = await api.post('/user/login', payload)
        if (response.data.Login_Status) {
          Notify.create({
            type: 'positive',
            message: 'User Logged-in.',
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
      }
    },
  },
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserCredentialstore, import.meta.hot))
}
