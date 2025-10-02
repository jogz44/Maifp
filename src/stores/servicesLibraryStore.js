// stores/ServicesLibrary_Store.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useServicesLibraryStore = defineStore('servicesLibrary', {
  state: () => ({
    loading: false,
    error: null,

    laboratoryExams: [],
    radiologiesExams: [],
    ultrasoundExams: [],
    mammogramExams: [],

    isSave: true,
    isEdit: false,
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,

    totalLaboratoryExams: (state) => state.laboratoryExams.length,
    totalRadiologiesExams: (state) => state.radiologiesExams.length,
    totalUltrasoundExams: (state) => state.ultrasoundExams.length,
    totalMammogramExams: (state) => state.mammogramExams.length,
  },

  actions: {
    resetStore() {
      this.error = null
      this.loading = false
      this.isSave = true
      this.isEdit = false
    },

    handleApiError(error) {
      console.error('API Error:', error)
      this.error = error.response?.data?.message || error.message
    },

    // ================== EXAMINATION ==================
    async fetchExaminations() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/laboratory/exam/index')
        this.laboratoryExams = response.data ?? []
        return this.laboratoryExams
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    async storeExamination(payload) {
      this.loading = true
      try {
        const response = await api.post('/laboratory/exam/store', payload)
        if (response.data) {
          this.laboratoryExams.push(response.data)
        }
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateExamination(id, payload) {
      this.loading = true
      try {
        const response = await api.put(`/laboratory/exam/update/${id}`, payload)
        await this.fetchExaminations()
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteExamination(id) {
      this.loading = true
      try {
        const response = await api.delete(`/laboratory/exam/delete/${id}`)
        this.laboratoryExams = this.laboratoryExams.filter((exam) => exam.id !== id)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ================== RADIOLOGY ==================
    async fetchRadiologies() {
      this.loading = true
      try {
        const response = await api.get('/laboratory/radiology/index')
        // expect API shape: { radiologies: [...] }
        this.radiologiesExams = response.data?.radiologies ?? []
        return this.radiologiesExams
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    async storeRadiology(payload) {
      this.loading = true
      try {
        const response = await api.post('/laboratory/radiology/store', payload)
        if (response.data) {
          this.radiologiesExams.push(response.data)
        }
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRadiology(id, payload) {
      this.loading = true
      try {
        const response = await api.put(`/laboratory/radiology/update/${id}`, payload)
        await this.fetchRadiologies()
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRadiology(id) {
      this.loading = true
      try {
        const response = await api.delete(`/laboratory/radiology/delete/${id}`)
        this.radiologiesExams = this.radiologiesExams.filter((item, idx) => idx + 1 !== id)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ================== ULTRASOUND ==================
    async fetchUltrasounds() {
      this.loading = true
      try {
        const response = await api.get('/laboratory/ultrasound/index')
        this.ultrasoundExams = response.data ?? []
        return this.ultrasoundExams
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    async storeUltrasound(payload) {
      this.loading = true
      try {
        const response = await api.post('/laboratory/ultrasound/store', payload)
        if (response.data) {
          this.ultrasoundExams.push(response.data)
        }
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUltrasound(id, payload) {
      this.loading = true
      try {
        const response = await api.put(`/laboratory/ultrasound/update/${id}`, payload)
        await this.fetchUltrasounds()
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUltrasound(id) {
      this.loading = true
      try {
        const response = await api.delete(`/laboratory/ultrasound/delete/${id}`)
        this.ultrasoundExams = this.ultrasoundExams.filter((item) => item.id !== id)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ================== MAMMOGRAM ==================
    async fetchMammograms() {
      this.loading = true
      try {
        const response = await api.get('/laboratory/mammogram/index')
        this.mammogramExams = response.data ?? []
        return this.mammogramExams
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    async storeMammogram(payload) {
      this.loading = true
      try {
        const response = await api.post('/laboratory/mammogram/store', payload)
        if (response.data) {
          this.mammogramExams.push(response.data)
        }
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateMammogram(id, payload) {
      this.loading = true
      try {
        const response = await api.put(`/laboratory/mammogram/update/${id}`, payload)
        await this.fetchMammograms()
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteMammogram(id) {
      this.loading = true
      try {
        const response = await api.delete(`/laboratory/mammogram/delete/${id}`)
        this.mammogramExams = this.mammogramExams.filter((item) => item.id !== id)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
