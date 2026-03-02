import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useDosageStore = defineStore('dosage', {
  state: () => ({
    counter: 0,
    dosage_id: 0,
    dosageTypes: [],
    dosageInfo: {},
  }),

  actions: {
    async getDosagesTypes() {
      try {
        const response = await api.get('/system/library/dosages')
        this.dosageTypes = response.data.dosagetypes
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 2000,
        })
      }
    },
    async getDosageType(id) {
      try {
        const response = await api.get('/system/library/dosages/' + id)
        this.dosageInfo = response.data.dosagetype.type
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 2000,
        })
      }
    },

    async newDosageType(payload) {
      try {
        await api.post('/system/library/dosages', payload)
        this.getDosagesTypes()
        Notify.create({
          type: 'positive',
          message: 'Unit created successfully',
          position: 'center',
          timeout: 2000,
        })
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })
      }
    },

    async updateDosageType(id, payload) {
      try {
        await api.post('/system/library/dosages/' + id, payload)
        this.getDosagesTypes()
        Notify.create({
          type: 'positive',
          message: 'Unit updated successfully',
          position: 'center',
          timeout: 2000,
        })
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 2000,
        })
      }
    },

    async removeDosageType(id) {
      try {
        await api.post('/system/library/dosages/remove',  { id } )
        this.getDosagesTypes()
        Notify.create({
          type: 'positive',
          message: 'Unit deleted successfully',
          position: 'center',
          timeout: 2000,
        })
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 2000,
        })
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDosageStore, import.meta.hot))
}
