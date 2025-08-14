import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { date } from 'quasar'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    loading: false,
    error: null,
    currentPatient: null,
    patients: [],
    isSave: true,
    isEdit: false,
    patient_id: 0,

    // Patient form default values
    patientInfoDefault: {
      firstname: '',
      lastname: '',
      middlename: '',
      ext: '',
      birthdate: '',
      contact_number: '',
      age: 0,
      gender: '',
      is_not_tagum: false,
      street: '',
      purok: '',
      barangay: '',
      city: 'Tagum City',
      province: 'Davao del Norte',
      category: '',
      is_pwd: false,
      is_solo: false,

      // Transaction information default values
      // id: null,
      transaction_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
      transaction_type: '',
      transaction_mode: '',
      purpose: '',

      // Vital signs default values
      height: null,
      weight: null,
      bmi: '',
      waist: null,
      heart_rate: null,
      blood_pressure: '',
      respiratory_rate: null,
      pulse_rate: null,
      temperature: null,
      sp02: null,
      LMP: '',
      medicine: '',
    },

    // UI state
    closeNewPatient: false,
    genderOptions: ['Male', 'Female', 'LGBTQ'],
    transactionModes: ['Walk-in', 'Online', 'Referral', 'Phone'],
    transaction_type: ['Consultation', 'Follow-up', 'Medication', 'Laboratory', 'Procedure'],
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,

    // Get full name for each patient
    patientsWithFullName: (state) => {
      return state.patients.map((patient) => ({
        ...patient,
        fullName: [
          patient.firstname || '',
          patient.middlename ? patient.middlename + ' ' : '',
          patient.lastname || '',
          patient.ext ? patient.ext : '',
        ]
          .join(' ')
          .trim(),
      }))
    },

    // Get patient by ID
    getPatientById: (state) => (id) => {
      return state.patients.find((patient) => patient.id === id)
    },
  },

  actions: {
    // Reset store to initial state
    resetStore() {
      this.currentPatient = null
      this.error = null
      this.loading = false
      this.isSave = true
      this.isEdit = false
      this.patient_id = 0
    },

    // Fetch all patients
    async fetchPatients() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/patients')
        this.patients = response.data
        return this.patients
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Get single patient by ID with transactions
    async getPatient(id) {
      this.loading = true
      this.error = null
      this.patient_id = id
      this.isSave = false
      this.isEdit = true

      try {
        const response = await api.get(`/patients/${id}`)
        this.currentPatient = response.data
        return this.currentPatient
      } catch (error) {
        this.handleApiError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    // // Fetch patient transactions
    // async getPatientTransactions(id) {
    //   this.loading = true
    //   this.error = null

    //   try {
    //     const response = await api.get(`/transactions/${id}`)
    //     return response.data
    //   } catch (error) {
    //     this.handleApiError(error)
    //     return []
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // Get transaction details
    async getTransactionDetails(id) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/transactions/${id}`)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    // Calculate BMI based on height and weight - returns string for API compatibility
    calculateBMI(height, weight) {
      if (!height || !weight || height <= 0 || weight <= 0) {
        return ''
      }

      // Convert height from cm to meters
      const heightInMeters = height / 100

      // Calculate BMI: weight (kg) / (height (m) * height (m))
      const bmi = weight / (heightInMeters * heightInMeters)

      // Round to 2 decimal places and return as string
      return (Math.round(bmi * 100) / 100).toString()
    },

    // Update BMI when height or weight changes
    updateBMI(patientData) {
      if (patientData && patientData.height && patientData.weight) {
        patientData.bmi = this.calculateBMI(
          parseFloat(patientData.height),
          parseFloat(patientData.weight),
        )
      } else {
        patientData.bmi = ''
      }
      return patientData
    },

    // Create new patient
    async newPatient(patientData) {
      this.loading = true
      this.error = null

      // Ensure user_id is set
      if (!patientData.user_id) {
        const user = this.getUserFromLocalStorage()
        if (user) {
          patientData.user_id = user.id
        }
      }

      // Ensure BMI is calculated and stored as string
      patientData = this.updateBMI(patientData)

      try {
        const response = await api.post('/patients/store', patientData)
        // Add the new patient to the list
        this.patients.push(response.data)
        this.currentPatient = response.data
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update patient
    async updatePatient(id, patientData) {
      this.loading = true
      this.error = null

      // Ensure BMI is calculated and stored as string
      patientData = this.updateBMI(patientData)

      try {
        const response = await api.put(`/patients/${id}`, patientData)

        // Update patient in the list
        const index = this.patients.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.patients[index] = response.data
        }

        this.currentPatient = response.data
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete patient
    async removePatient(id) {
      this.loading = true
      this.error = null

      try {
        await api.delete(`/patients/${id}`)

        // Remove from the list
        this.patients = this.patients.filter((p) => p.id !== id)

        // Reset current patient if it's the one we deleted
        if (this.currentPatient && this.currentPatient.id === id) {
          this.currentPatient = null
        }
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create new transaction for a patient
    async createTransaction(patientId, transactionData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post(`/patients/${patientId}/transactions`, transactionData)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Calculate age based on birthdate
    calculateAge(birthdate) {
      if (!birthdate) return 0

      const today = new Date()
      const birthDate = new Date(birthdate)

      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDifference = today.getMonth() - birthDate.getMonth()

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      return age
    },

    // Handle API errors
    handleApiError(error) {
      if (error.response) {
        const { data } = error.response
        if (data.errors) {
          this.error = data.errors
        } else if (data.message) {
          this.error = data.message
        } else {
          this.error = 'An unexpected server error occurred'
        }
      } else if (error.request) {
        this.error = 'No response received from server'
      } else {
        this.error = error.message || 'An unexpected error occurred'
      }
      console.error('API Error:', this.error)
    },

    // Helper to get user from localStorage
    getUserFromLocalStorage() {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) return null

        const sanitizedStr = userStr.replace('__q_objt|', '')
        return JSON.parse(sanitizedStr)
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        return null
      }
    },
  },
})
