import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useUnitStore = defineStore('units', {
  state: () => ({
    counter: 0,
    unit_id: 0,
    units: [],
    unit: {},
  }),

  actions: {

    async getUnits() {
      try {
        const response = await api.get('/system/library/units')
        this.units = response.data.units
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
    async getUnit(id) {
      try {
        const response = await api.get('/system/library/units/'+ id)
        this.unit = response.data.unit
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

    async newUnit(payload) {
      try {
        const response = await api.post('/system/library/units', payload)
        this.units.push(response.data.unit)
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

    async updateUnit(id,payload) {
      try {
        await api.post('/system/library/units/'+ id, payload)
        this.getUnits()
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

    async removeUnit(id) {
    try {
      await api.delete('/system/library/units/'+ id)
      this.getUnits()
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
  }

  },




})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUnitStore, import.meta.hot))
}
