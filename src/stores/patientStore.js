import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { date } from 'quasar'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    loading: false,
    error: null,
    currentPatient: null,
    patients: [],
    doctors: [],
    qualifiedPatients: [],
    returnedPatients: [],
    laboratoryPatients: [],
    laboratoryResults: [],
    laboratoryServices: [],
    laboratoryExams: [],
    radiologyExams: [],
    mammogramExams: [],
    ultrasoundExams: [],
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
      transaction_mode: '',
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
    transactionModes: ['Walk-in', 'Online', 'Referral', 'Phone'],
    transaction_type: ['Consultation', 'Follow-up', 'Medication', 'Laboratory', 'Procedure'],
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
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

    async laboratoryStatus(payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post(`/laboratory/status`, payload)

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

    // laboratoryReturn NOT IN USE rn because change of status to 'laboratoryStatus'
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

    // FETCH LABORATORY EXAM OPTIONS
    async fetchLaboratoryExams() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/laboratory/exam/index')
        this.laboratoryExams = response.data || [] // master list
        return this.laboratoryExams
      } catch (error) {
        this.handleApiError(error)
        this.laboratoryExams = []
        throw error
      } finally {
        this.loading = false
      }
    },

    //STORE LABORATORY EXAM
    async storeLaboratoryExam(payload) {
      try {
        const response = await api.post('/laboratory/store', payload)

        if (response.data && response.data.examination) {
          // store result in state so UI updates
          this.radiologyExams = response.data.examination
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      }
    },

    // FETCH LABORATORY EXAM TRANSACTIONS
    async fetchLaboratoryExamsByTransaction(transactionId) {
      try {
        const response = await api.get(`/laboratory/exam/${transactionId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching laboratory exams by transaction:', error)
        throw error
      }
    },

    async storeNewLaboratoryExam(payload) {
      try {
        const res = await api.post('/laboratory/exam/store', payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async updateLaboratoryExam(id, payload) {
      try {
        const res = await api.post(`/laboratory/exam/update/${id}`, payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async deleteExistingLaboratoryExam(id) {
      try {
        const res = await api.delete(`/laboratory/exam/delete/${id}`)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },

    async fetchLaboratoryResults(transactionId) {
      try {
        const response = await api.get(`/transactions/${transactionId}`)
        // response.data is a transaction object with .laboratories_details inside
        this.laboratoryResults = response.data.laboratories_details || []
        return this.laboratoryResults
      } catch (error) {
        console.error('API Error (getLaboratoryResults):', error)
        throw error
      }
    },

    // FETCH RADIOLOGY EXAM
    async fetchRadiologyExams() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/laboratory/radiology/index')
        this.radiologyExams = response.data || []
        return this.radiologyExams
      } catch (error) {
        console.error('Error fetching radiology exams:', error)
        this.radiologyExams = []
        throw error
      } finally {
        this.loading = false
      }
    },

    // FETCH RADIOLOGY EXAM BY TRANSACTION ID
    async fetchRadiologiesByTransaction(transactionId) {
      try {
        const response = await api.get(`/laboratory/radiology/${transactionId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching radiology exams by transaction:', error)
        throw error
      }
    },

    // STORE RADIOLOGY EXAM
    async storeRadiologyExam(payload) {
      try {
        const response = await api.post('/laboratory/store', payload)

        if (response.data && response.data.radiologies) {
          // store result in state so UI updates
          this.radiologyExams = response.data.radiologies
        }

        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
      }
    },

    async storeNewRadiologyExam(payload) {
      try {
        const res = await api.post('/laboratory/radiology/store', payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async updateRadiologyExam(id, payload) {
      try {
        const res = await api.post(`/laboratory/radiology/update/${id}`, payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async deleteExistingRadiologyExam(id) {
      try {
        const res = await api.delete(`/laboratory/radiology/delete/${id}`)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },

    // FETCH MAMMOGRAM EXAM
    async fetchMammogramExams() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/laboratory/mammogram/index')

        // Normalize response data structure
        const mammogramList =
          response.data?.data || // e.g. { data: [ ... ] }
          response.data?.mammogram || // e.g. { mammogram: [ ... ] }
          response.data || // e.g. [ ... ]
          []

        // Ensure it's always an array
        this.mammogramExams = Array.isArray(mammogramList) ? mammogramList : []

        console.log('Fetched Mammogram Exams:', this.mammogramExams)

        return this.mammogramExams
      } catch (error) {
        console.error('Error fetching mammogram exams:', error)
        this.mammogramExams = []
        throw error
      } finally {
        this.loading = false
      }
    },

    // FETCH MAMMOGRAM EXAM BY TRANSACTION ID
    async fetchMammogramsByTransaction(transactionId) {
      try {
        const response = await api.get(`/laboratory/mammogram/${transactionId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching mammogram by transaction:', error)
        throw error
      }
    },

    // STORE MAMMOGRAM EXAM
    async storeMammogramExam(payload) {
      try {
        const response = await api.post('/laboratory/store', payload)
        if (response.data && response.data.mammogram) {
          this.mammogramExams = response.data.mammogram
        }
        return response.data
      } catch (error) {
        console.error('Error saving mammogram exams:', error)
        throw error
      }
    },

    async storeNewMammogramExam(payload) {
      try {
        const res = await api.post('/laboratory/mammogram/store', payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async updateMammogramExam(id, payload) {
      try {
        const res = await api.post(`/laboratory/mammogram/update/${id}`, payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async deleteExistingMammogramExam(id) {
      try {
        const res = await api.delete(`/laboratory/mammogram/delete/${id}`)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },

    // FETCH ULTRASOUND EXAMS (for dropdown/options)
    async fetchUltrasoundExams() {
      try {
        const response = await api.get('/laboratory/ultrasound/index')
        this.ultrasoundExams = response?.data ?? []
        console.log('Fetched Ultrasound Exams:', this.ultrasoundExams)
        return this.ultrasoundExams
      } catch (error) {
        console.error('Error fetching ultrasound exams:', error)
        this.ultrasoundExams = []
        throw error
      }
    },

    // FETCH ULTRASOUND BY TRANSACTION (for saved rows)
    async fetchUltrasoundsByTransaction(transactionId) {
      try {
        if (!transactionId) {
          console.warn('No transactionId provided for fetchUltrasoundsByTransaction')
          return []
        }

        const response = await api.get(`/laboratory/ultrasound/${transactionId}`)

        // Ensure we always return an array
        const ultrasounds = response?.data?.ultrasound ?? []
        console.log(`Fetched Ultrasounds for Transaction ${transactionId}:`, ultrasounds)

        return ultrasounds
      } catch (error) {
        console.error('Error fetching ultrasound by transaction:', error)
        return [] // fallback so .map() won’t break
      }
    },

    // STORE ULTRASOUND EXAM (save to backend)
    async storeUltrasoundExam(payload) {
      try {
        const response = await api.post('/laboratory/store', payload)

        // Update store state only if backend returns updated list
        if (response?.data?.ultrasound) {
          this.ultrasoundExams = response.data.ultrasound
          console.log('Updated Ultrasound Exams:', this.ultrasoundExams)
        }

        return response?.data
      } catch (error) {
        console.error('Error saving ultrasound exams:', error)
        throw error
      }
    },

    async storeNewUltrasoundExam(payload) {
      try {
        const res = await api.post('/laboratory/ultrasound/store', payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async updateUltrasoundExam(id, payload) {
      try {
        const res = await api.post(`/laboratory/ultrasound/update/${id}`, payload)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },
    async deleteExistingUltrasoundExam(id) {
      try {
        const res = await api.delete(`/laboratory/ultrasound/delete/${id}`)
        return res.data
      } catch (err) {
        this.handleApiError(err)
        throw err
      }
    },

    // DELETE LAB EXAM / RADIOLOGY / MAMMOGRAM / ULTRASOUND
    async deleteLaboratoryExam(transactionId, id, type) {
      try {
        // If examination → backend expects "id"
        const payload =
          type === 'examination'
            ? {
                transaction_id: transactionId,
                type,
                id, // the backend expects this
                item_id: id, // optional, if backend uses it
              }
            : {
                transaction_id: transactionId,
                type,
                id,
              }
        console.log('Delete Payload:', payload)

        const response = await api.delete('/laboratory/delete', { data: payload })
        console.log('Delete Response:', response.data)
        return response.data
      } catch (error) {
        console.error(`Error deleting ${type}:`, error)
        throw error
      }
    },

    // FETCH OVERALL LABORATORY TRANSACTION DETAILS
    async fetchLaboratoryDetails(transactionId) {
      try {
        const response = await api.get(`/laboratory/${transactionId}`)
        console.log('Fetched Laboratory Details:', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching laboratory details:', error)
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

    // Fetch doctor fees
    async fetchDoctors() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/doctor')
        this.doctors = response.data.map((doc) => ({ ...doc, editMode: false })) // add editMode
        return this.doctors
      } catch (error) {
        this.handleApiError(error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Update doctor fee
    async updateDoctorFee(id, payload) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post(`/doctor/update/${id}`, payload)

        // update local store if successful
        if (response.data && response.data.doctor) {
          const index = this.doctors.findIndex((d) => d.id === id)
          if (index !== -1) {
            this.doctors[index] = response.data.doctor
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

    // Add new service to library
    async addLaboratoryService(payload) {
      try {
        const response = await api.post('/laboratory/store/lab_services', payload)
        if (response.data && response.data.laboratory) {
          this.laboratoryServices.push(response.data.laboratory)
        }
        return response.data.laboratory
      } catch (error) {
        this.handleApiError(error)
        throw error
      }
    },

    // Update existing service in library
    async updateLaboratoryService(payload) {
      try {
        const response = await api.post(`/laboratory/update/lab_services/${payload.id}`, payload)
        if (response.data && response.data.laboratory) {
          const index = this.laboratoryServices.findIndex((s) => s.id === payload.id)
          if (index !== -1) {
            this.laboratoryServices[index] = response.data.laboratory
          }
        }
        return response.data.laboratory
      } catch (error) {
        this.handleApiError(error)
        throw error
      }
    },

    // Delete service from library
    async deleteLaboratoryService(id) {
      try {
        const response = await api.delete(`/laboratory/delete/lab_services/${id}`)
        if (response.data.success) {
          this.laboratoryServices = this.laboratoryServices.filter((s) => s.id !== id)
        }
        return response.data
      } catch (error) {
        this.handleApiError(error)
        throw error
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

    async getTransactionsByPatient(patientId) {
      try {
        const response = await api.get(`/transactions?patient_id=${patientId}`)
        return response.data
      } catch (error) {
        this.handleApiError(error)
        return []
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
        const response = await api.put(`/transaction/update/${id}`, transactionData)

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
        const response = await api.put(`/transaction/${id}/update/status`, {
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
