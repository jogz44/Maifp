import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    counter: 0,

    customer: {},
    customer_id: 0,
    customers: [],
    customersOftheDay: [],
    transactions_id: '',

    isEdit: false,
    isSave: true,
    closeNewCustomer: false,

    customer_transactions_list: [],
    customer_transactions_list_exploded: [],
  }),

  actions: {
    async get_transactions(id) {
      try {
        this.customer_transactions_list = []
        const response = await api.get('/customers/transactions/' + id)
        this.customer_transactions_list = response.data.result
      } catch (error) {
        console.log(error)
      }
    },

    async get_transactions_exploded(id, trans_id) {
      try {
        this.customer_transactions_list_exploded = []
        const response = await api.get('/customers/transactions/' + id + '/list/' + trans_id)
        this.customer_transactions_list_exploded = response.data.result
      } catch (error) {
        console.log(error)
      }
    },

    async getCustomersByDate(payload) {
      console.log(payload)
      try {
        const response = await api.post('/customers/list/dates', payload)
        // console.log(response.data.customers)
        console.log(response.data)
        this.customers = response.data.customers
        // console.log(response.data.customers)
      } catch (error) {
        console.log(error)
      }
    },

    async getCustomers() {
      try {
        const response = await api.get('/customers')
        // console.log(response.data.customers)
        this.customers = response.data.customers
        // console.log(response.data.customers)
      } catch (error) {
        console.log(error)
      }
    },

    async getCustomer(id) {
      try {
        const response = await api.get('/customers/' + id)
        //console.log(response.data[0])
        this.customer = response.data[0]
        // console.log(this.customer[0])
      } catch (error) {
        console.error(error)
      }
    },

    async newCustomer(payload) {
      try {
        if (!payload.contact_number) {
          payload.contact_number = 'N/A'
        }
        const response = await api.post('/customers', payload)

        // If customers is an array of objects
        this.customers.push(response.data.customers)

        // Set customer_id from response
        this.customer_id = response.data.customers.id

        Notify.create({
          type: 'positive',
          message: 'Customer registration successful: ',
          position: 'center',
          timeout: 1200,
        })
      } catch (error) {
        // Get a safe error message
        const message = error.response?.data?.message || error.message || 'Unknown error'

        Notify.create({
          type: 'negative',
          message: 'Customer registration not successful: ' + message,
          position: 'center',
          timeout: 1200,
        })

        console.error('Customer registration failed:', error)
      }
    },

    async updateCustomer(id, payload) {
      try {
        const response = await api.put('/customers/' + id, payload)
        this.customer = response.data.customers
      } catch (error) {
        console.log(error)
      }
    },

    async removeCustomer(id) {
      try {
        await api.delete('/customers/' + id)
      } catch (error) {
        console.log(error)
      }
    },

    async getCustomerOftheDay(payload) {
      try {
        const response = await api.get('/orders/transaction/latest/' + payload)
        this.customersOftheDay = response.data.data
      } catch (error) {
        console.log(error)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomerStore, import.meta.hot))
}
