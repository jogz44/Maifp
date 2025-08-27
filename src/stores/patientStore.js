import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { date } from 'quasar'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    loading: false,
    error: null,
    currentPatient: null,
    patients: [],
    assessmentPatients: [],
    medicationPatients: [],
    billingPatients: [],
    glPatients: [],
    qualifiedPatients: [],
    returnedPatients: [],
    laboratoryPatients: [],
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
      transaction_date: date.formatDate(new Date(), 'YYYY-MM-DD'),
      transaction_type: '',
      transaction_mode: 'Walk-in',
      purpose: '',

      // Vital signs default values (now part of single form)
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
    transactionModes: ['Walk-in', 'Referral'],
    transaction_type: ['Consultation', 'Medication', 'Laboratory'],
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    totalAssessedCount: (state) => state.assessmentPatients.length,
    totalMedicationCount: (state) => state.medicationPatients.length,
    totalBillingCount: (state) => state.billingPatients.length,
    totalGLCount: (state) => state.glPatients.length,
    totalQualifiedCount: (state) => state.qualifiedPatients.length,
    totalReturnedCount: (state) => state.returnedPatients.length,
    totalLaboratoryCount: (state) => state.laboratoryPatients?.length || 0,

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

    getPatientById: (state) => (id) => {
      return state.patients.find((patient) => patient.id === id)
    },

    // Count only consultations
    consultationCount: (state) => {
      return state.patients.filter((p) => p.transaction_type === 'Consultation').length
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

    // Step 1 Assessment
    async fetchPatientsAssessment() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/patients/assessment')
        this.assessmentPatients = response.data
        return this.assessmentPatients
      } catch (error) {
        this.handleApiError(error)
        this.assessmentPatients = []
        return []
      } finally {
        this.loading = false
      }
    },

    // Step 2 New Consultation
    async fetchPatientsNew() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/transactions/qualified')
        this.patients = response.data
        return this.patients
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Step 3 Laboratory
    async fetchPatientsLaboratory() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/laboratory')
        this.patients = response.data
        return this.patients
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Step 4 Returned Consultation
    async fetchPatientsReturned() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/patients/consultation/return')
        this.patients = response.data
        return this.patients
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Step 5 Medicine
    async fetchPatientsMedicine() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/medications')
        this.medicationPatients = response.data
        return this.medicationPatients
      } catch (error) {
        this.handleApiError(error)
        this.medicationPatients = []
        return []
      } finally {
        this.loading = false
      }
    },

    // Step 6 Billing
    async fetchPatientsBilling() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/billing')
        this.billingPatients = response.data
        return this.billingPatients
      } catch (error) {
        this.handleApiError(error)
        this.billingPatients = []
        return []
      } finally {
        this.loading = false
      }
    },

    //Step 7 Guarantee Letter
    async fetchPatientsGL() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/guarantee')
        this.glPatients = response.data
        return this.glPatients
      } catch (error) {
        this.handleApiError(error)
        this.glPatients = []
        return []
      } finally {
        this.loading = false
      }
    },

    //consultation patients
    async fetchConsultationPatients() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/new_consultations')
        this.patients = response.data.filter((p) => p.transaction_type === 'Consultation')
      } catch (error) {
        this.handleApiError(error)
      }
    },

    // Store Laboratory Patient
    async storeLaboratoryPatient(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/new_consultations/store', payload)

        // If backend returns the stored patient, push it into list
        if (response.data && response.data.patient) {
          this.patients.push(response.data.patient)
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async storeNewConsultation(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/new_consultations/store', payload)

        // Optionally push into patients list if API returns updated patient
        if (response.data && response.data.patient) {
          this.patients.push(response.data.patient)
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async laboratoryReturn(id, payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post(`/laboratory/update/${id}`, payload)

        if (response.data && response.data.patient) {
          this.patients.push(response.data.patient)
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch New Consultation Qualified
    async fetchQualifiedPatients() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/transactions/qualified')
        this.qualifiedPatients = response.data
        return this.qualifiedPatients
      } catch (error) {
        this.handleApiError(error)
        this.qualifiedPatients = []
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch New Consultation Qualified
    async fetchReturnedPatients() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/patients/consultation/return')
        this.returnedPatients = response.data
        return this.returnedPatients
      } catch (error) {
        this.handleApiError(error)
        this.returnedPatients = []
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch Qualified Laboratory
    async fetchLaboratoryPatients() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/laboratory')
        this.laboratoryPatients = response.data // save into store
      } catch (error) {
        this.handleApiError(error)
        this.laboratoryPatients = [] // reset on error
      } finally {
        this.loading = false
      }
    },

    async storeLaboratoryResult(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/laboratory/store', payload)

        // Optionally push into patients list if API returns updated patient
        if (response.data && response.data.patient) {
          this.patients.push(response.data.patient)
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLaboratoryResults(transactionId) {
      try {
        const response = await api.get(`/transactions/${transactionId}`)
        // response.data is a transaction object with .laboratories inside
        this.laboratoryResults = response.data.laboratories || []
        return this.laboratoryResults
      } catch (error) {
        console.error('API Error (getLaboratoryResults):', error)
        throw error
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

    // Get patient transactions
    async getPatientTransactions(patientId) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/patients/${patientId}/transactions`)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

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

    async getBillingDetails(id) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/billing/${id}`)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        return null
      } finally {
        this.loading = false
      }
    },

    async addGL(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/guarantee/store', payload)
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
    updateBMI(data) {
      if (data && data.height && data.weight) {
        data.bmi = this.calculateBMI(parseFloat(data.height), parseFloat(data.weight))
      } else {
        data.bmi = ''
      }
      return data
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
        const response = await api.put(`/patients/update/${id}`, patientData)

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

    async updateTransaction(id, transactionData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.put(`/transactions/update/${id}`, transactionData)

        // Update the current patient's transactions if they exist
        if (this.currentPatient && this.currentPatient.transaction) {
          const index = this.currentPatient.transaction.findIndex((t) => t.id === id)
          if (index !== -1) {
            this.currentPatient.transaction[index] = response.data
          }
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTransactionStatus(id, status) {
      this.loading = true
      this.error = null

      try {
        console.log(`Updating transaction ${id} status to: ${status}`)

        // Send only the status field to the API
        const response = await api.put(`/transactions/${id}/update/status`, {
          status: status,
        })

        console.log('Transaction status update response:', response.data)

        // Update the current patient's transactions if they exist
        if (this.currentPatient && this.currentPatient.transaction) {
          const transactionIndex = this.currentPatient.transaction.findIndex((t) => t.id === id)
          if (transactionIndex !== -1) {
            // Only update the status field, preserve all other transaction data
            this.currentPatient.transaction[transactionIndex].status = status
            console.log(`Updated transaction ${id} in currentPatient`)
          }
        }

        // Also update the patients list if the transaction exists there
        if (this.patients && this.patients.length > 0) {
          for (let patient of this.patients) {
            if (patient.transaction && Array.isArray(patient.transaction)) {
              const transactionIndex = patient.transaction.findIndex((t) => t.id === id)
              if (transactionIndex !== -1) {
                // Only update the status field, preserve all other transaction data
                patient.transaction[transactionIndex].status = status
                console.log(`Updated transaction ${id} in patients list`)
                break
              }
            }
          }
        }

        // Update any cached transactions list (if exists in your store)
        if (this.transactions && this.transactions.length > 0) {
          const transactionIndex = this.transactions.findIndex((t) => t.id === id)
          if (transactionIndex !== -1) {
            this.transactions[transactionIndex].status = status
            console.log(`Updated transaction ${id} in transactions list`)
          }
        }

        return { id: id, status: status }
      } catch (error) {
        console.error('Error updating transaction status:', error)
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateVital(id, vital) {
      this.loading = true
      this.error = null

      try {
        const response = await api.put(`/vital/update/${id}`, vital)

        // Update the current patient's transactions if they exist
        if (this.currentPatient && this.currentPatient.Vital) {
          const index = this.currentPatient.vital.findIndex((v) => v.id === id)
          if (index !== -1) {
            this.currentPatient.vital[index] = response.data
          }
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create new transaction - UPDATED to send all data in single form
    async createNewTransaction(transactionData) {
      this.loading = true
      this.error = null

      try {
        // Ensure user_id is set
        if (!transactionData.user_id) {
          const user = this.getUserFromLocalStorage()
          if (user) {
            transactionData.user_id = user.id
          }
        }

        // Ensure patient_id is set
        if (!transactionData.patient_id) {
          throw new Error('Patient ID is required for transaction creation')
        }

        // Calculate BMI if height and weight are provided
        if (transactionData.height && transactionData.weight) {
          transactionData.bmi = this.calculateBMI(
            parseFloat(transactionData.height),
            parseFloat(transactionData.weight),
          )
        }

        // Prepare the complete transaction data
        const completeTransactionData = {
          // Transaction fields
          patient_id: transactionData.patient_id,
          user_id: transactionData.user_id,
          transaction_number: transactionData.transaction_number,
          transaction_date: transactionData.transaction_date,
          transaction_type: transactionData.transaction_type,
          transaction_mode: transactionData.transaction_mode,
          purpose: transactionData.purpose || '',

          // Vital signs fields
          height: transactionData.height || '',
          weight: transactionData.weight || '',
          bmi: transactionData.bmi || '',
          waist: transactionData.waist || '',
          heart_rate: transactionData.heart_rate || '',
          blood_pressure: transactionData.blood_pressure || '',
          respiratory_rate: transactionData.respiratory_rate || '',
          pulse_rate: transactionData.pulse_rate || '',
          temperature: transactionData.temperature || '',
          sp02: transactionData.sp02 || '',
          LMP: transactionData.LMP || '',
          medicine: transactionData.medicine || '',
        }

        console.log('Sending transaction data:', completeTransactionData)

        // Create the transaction with all data in one form
        const response = await api.post('/transactions/add', completeTransactionData)

        // Update current patient's transactions if this patient is currently loaded
        if (this.currentPatient && this.currentPatient.id === transactionData.patient_id) {
          if (!this.currentPatient.transaction) {
            this.currentPatient.transaction = []
          }
          this.currentPatient.transaction.unshift(response.data)
        }

        return response.data
      } catch (error) {
        console.error('Transaction creation error:', error)
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
