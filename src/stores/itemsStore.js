import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useItemStore = defineStore('items', {
  state: () => ({
    counter: 0,
    item_id: 0,
    items: [],
    item: {},
    expiring: [],
    expired: [],
    po_items: [],
    po_temp:[],
    zero_stocks: [],
    low_stocks: [],
    stockMiniInfo: [],
    stockCard: [],
    temp_id: '',
    hasOpening: false,
    dosageForm: [],

    selected_stockCard:{
      generic_name: '',
      brand_name: '',
    }
  }),

  actions: {
    injectToken() {
      const token = localStorage.getItem('auth_token')
      // If token exists, set it in the default headers
      if (token) {
        const sanitized_object = token.replace('__q_strn|', '')
       // console.log('Sanitized token:', sanitized_object)
        api.defaults.headers.common['Authorization'] = `Bearer ${sanitized_object}`
      }
    },

    async getDosageForm() {
      try {
        const response = await api.get('/system/library/dosages')
        this.dosageForm = response.data.dosagetypes
        console.log(this.dosageForm)
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

    async openLookup() {
      try {
        const response = await api.get('/daily/inventoryOpen/today')
        this.hasOpening = response.data.status
       // console.log(this.hasOpening)
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

    async getTempID() {
      try {
        const response = await api.get('/items/generate/tempno')
        this.temp_id = response.data
        //console.log(this.temp_id)
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

    async getStockMiniInfo() {
      try {
        const response = await api.get('/system/library/medlist')
        this.stockMiniInfo = response.data.items
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
    async getItems(payload) {
      try {
        const response = await api.post('/items',payload)
        this.items = response.data.items
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

    async getItem(id) {
      try {
        const response = await api.get('/items/' + id)
        this.item = response.data.items[0]
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
  async getTempPO() {
      try {
        const response = await api.get('/items/temp/po')
        this.po_temp = response.data.list
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

    async UpdateTempPO(id,request ) {
      try {
        console.log('temp => ', id, 'new po => ', request)
        const response = await api.post('/items/temp/po/' + id, {'po_no': request})
          Notify.create({
          type: 'positive',
          message: response.data.message,
          position: 'center',
          timeout: 2000,
        })
        this.po_temp = response.data.list
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

    async getItemsByPO(po_num) {
      try {
        const response = await api.get('/items/po/show/' + po_num)
        this.po_items = response.data.items
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

    async postItem(payload) {
      try {
         await api.post('/items/new', payload)

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

    async batchInsert(payload){
      try {
        const response = await api.post('/items/batch/new', payload)
        Notify.create({
          type: 'positive',
          message: response.data.message ,
          position: 'center',
          timeout: 2000,
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

    async updateItem(id, payload) {
      try {
        const response = await api.post('/items/' + id, payload)
        this.item = response.data.item[0]
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

    async deleteItem(id) {
      try {
         await api.delete('/items/' + id)
      //  console.log(response.data.success, ' --- ', response.data.message)
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

    async deletePOItems(po_no) {
      try {
        await api.delete('/items/po/' + po_no)
      //  console.log(response.data.success, ' --- ', response.data.message)
        Notify.create({
          type: 'positive',
          message: 'Items Deleted Successfully',
          position: 'center',
          timeout: 5000,
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

    async getExpiringItems() {
      try {
        const response = await api.get('/items/expire/list')
        this.expiring = response.data.items
        //console.log(response.data.success, ' --- ', response.data.message)
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

     async getJoinedTable_DailyInventor_Items_filtered() {
      try {
        const response = await api.get('/items/stock/filteredlist')
        this.items = response.data
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
    async getJoinedTable_DailyInventor_Items() {
      try {
        const response = await api.get('/items/stock/list')
        this.items = response.data
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

    async closingStocks($id) {
      try {
        await api.post('/daily/inventory/close-latest/' + $id)

        Notify.create({
          type: 'positive',
          message: 'Successfully closed the latest inventory',
          position: 'center',
          timeout: 2000,
        })

      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Show notification for HTTP 409 error
          Notify.create({
            type: 'negative',
            message: error.response.data.message || 'A conflict occurred.',
            position: 'center',
            timeout: 5000,
          })
        } else {
          // Show generic error notification
          Notify.create({
            type: 'negative',
            message:
              error.response?.data?.message || error.message || 'An unexpected error occurred',
            position: 'center',
            timeout: 5000,
          })
        }
        throw error // Optional: Re-throw the error for further handling
      }
    },

    async getStocksList(date) {
      try {
        const response = await api.get('/daily/inventory/get-list/' + date)
        this.items = response.data.list
     //   console.log(this.items)
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

        async getStocksListbyDate(payload) {
      try {
        const response = await api.post('/items/inventory/bydate',payload)
        this.items = response.data.items
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

    async openingStocks(payload) {
      try {
        await api.post('/daily/inventory/open-latest/' + payload)
        Notify.create({
          type: 'positive',
          message: 'Regenerated new stock list for today',
          position: 'center',
          timeout: 2000,
        })
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Show notification for HTTP 409 error
          Notify.create({
            type: 'negative',
            message: error.response.data.message || 'A conflict occurred.',
            position: 'center',
            timeout: 5000,
          })
        } else {
          // Show generic error notification
          Notify.create({
            type: 'negative',
            message:
              error.response?.data?.message || error.message || 'An unexpected error occurred',
            position: 'center',
            timeout: 5000,
          })
        }
        throw error // Optional: Re-throw the error for further handling
      }
    },

    async LowStocks(threshold) {

      // console.log('Store Threshold:', threshold)
      try {
        const response = await api.get('/daily/inventory/lowquantity/' + threshold)
        this.low_stocks = response.data.stocks
        console.log('Low Stocks:', this.low_stocks)

      } catch (error) {

        Notify.create({
          type: 'negative',
          message: error.response.data.message || 'An error occurred.',
          position: 'center',
          timeout: 5000,
        })

      }
    },

     async EmptyStocks() {
      try {
        const response = await api.get('/daily/inventory/emptyquantity')
        this.zero_stocks = response.data.stocks

        // Notify.create({
        //   type: 'positive',
        //   message: 'Regenerated new stock list for today',
        //   position: 'center',
        //   timeout: 5000,
        // })
      } catch (error) {
        // if (error.response && error.response.status === 409) {
        // Show notification for HTTP 409 error
        Notify.create({
          type: 'negative',
          message: error.response.data.message || 'An error occurred.',
          position: 'center',
          timeout: 5000,
        })
      }
    },

    async getStockCard(payload){
      try {
        const response = await api.post('/items/stockcard',payload)
        this.stockCard = response.data.stockCard
      } catch (error) {
        console.error(error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'An unexpected error occurred',
          position: 'center',
          timeout: 5000,
        })

      }
    }



  },
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemStore, import.meta.hot))
}
