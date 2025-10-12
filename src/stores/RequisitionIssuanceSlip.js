import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useRequisitionIssuanceSlip = defineStore('ris', {
  state: () => ({
    return_id: 0,
    return_ris_id: '',
    ris_no: {},
    ris_list: [],
    ris_medicine_list: [],
    ris_info: {},
  }),

  actions: {
    async RIS_byDate(payload) {
      try {
        const response = await api.post('daily/ris/date', payload)
        this.ris_list = response.data.list
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

    async allRIS() {
      try {
        const reponse = await api.get('/daily/ris/list')
        this.ris_list = reponse.data.list
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

    async getRISinfo(payload) {
      console.log(payload)
      try {
        const response = await api.post('/daily/ris/info', payload)
        console.log(response.data.info[0])
        this.ris_info = response.data.info[0]
        console.log('store get ris => ', this.ris_info)
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

    async RIS_Transactions(payload) {
      try {
        const reponse = await api.post('/daily/ris/transactions', payload)
        this.ris_medicine_list = reponse.data.list
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

    async newRIS(payload) {
      try {
        const response = await api.post('/daily/ris/new', payload)
        this.return_ris_id = response.data.ris_id
        this.return_id = response.data.id

        Notify.create({
          type: 'positive',
          message: response.data.message,
          position: 'center',
          timeout: 1500,
        })
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
  },
})
