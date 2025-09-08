<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <!-- Patient Information Section -->
        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-md" style="max-width: 1000px; width: 100%">
              <!-- Header -->
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-green text-weight-bolder">Patient Information</div>
                <div class="row q-gutter-sm">
                  <q-btn
                    v-if="!isEditMode"
                    color="orange"
                    label="Edit"
                    @click="toggleEditMode"
                    :loading="patientStore.loading"
                  />
                  <template v-else>
                    <q-btn
                      color="green"
                      label="Save"
                      @click="savePatientChanges"
                      :loading="patientStore.loading"
                    />
                    <q-btn color="grey" label="Cancel" @click="cancelEdit" />
                  </template>
                </div>
              </div>

              <q-separator />

              <!-- Personal Details -->
              <div class="text-subtitle2 text-grey-8 q-mt-md q-mb-sm">Personal Details</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.lastname"
                    label="Last Name"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.firstname"
                    label="First Name"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.middlename"
                    label="Middle Name"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.ext"
                    label="Extension"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-12 col-md-3">
                  <component
                    :is="isEditMode ? 'q-select' : 'q-input'"
                    outlined
                    dense
                    v-model="patient.gender"
                    :options="isEditMode ? patientStore.genderOptions : undefined"
                    label="Gender"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2">
                  <q-input outlined dense v-model="patient.age" label="Age" readonly />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="patient.birthdate"
                    label="Birthdate"
                    :readonly="!isEditMode"
                    @update:model-value="updateAge"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model="patient.contact_number"
                    label="Contact Number"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Address Section -->
              <div class="text-subtitle2 text-grey-8 q-mt-lg q-mb-sm">Address</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-2">
                  <q-input
                    outlined
                    dense
                    v-model="patient.purok"
                    label="Purok"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.street"
                    label="Street"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.barangay"
                    label="Barangay"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    outlined
                    dense
                    v-model="patient.city"
                    label="City"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Other Information -->
              <div class="text-subtitle2 text-grey-8 q-mt-lg q-mb-sm">Other Details</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    outlined
                    dense
                    v-model="patient.category"
                    label="Category"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2 flex items-center">
                  <q-checkbox
                    v-model="patient.is_pwd"
                    label="PWD"
                    :readonly="!isEditMode"
                    :disable="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 flex items-center">
                  <q-checkbox
                    v-model="patient.is_solo"
                    label="Solo Parent"
                    :readonly="!isEditMode"
                    :disable="!isEditMode"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </q-card-section>

        <!-- Patient Transactions Section -->
        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-sm" style="max-width: 1000px; width: 100%">
              <!-- Header with title and filter side by side -->
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-green text-weight-bolder">Patient Transaction History</div>
                <q-input
                  v-model="filterDate"
                  label="Filter by Date"
                  type="date"
                  outlined
                  dense
                  style="width: 200px"
                  :max="today"
                />
              </div>
              <q-separator />

              <q-table
                bordered
                dense
                :rows="filteredTransactions"
                :columns="transactionColumns"
                row-key="id"
                no-data-label="No transaction history available"
                hide-bottom
              >
                <!-- Body slot -->
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="id" style="font-size: 11px" align="left">
                      {{ props.row.id }}
                    </q-td>
                    <q-td key="transaction_number" style="font-size: 11px" align="left">
                      {{ props.row.transaction_number }}
                    </q-td>
                    <q-td key="transaction_date" style="font-size: 11px" align="left">
                      {{ formatDate(props.row.transaction_date || props.row.created_at) }}
                    </q-td>
                    <q-td key="transaction_type" style="font-size: 11px" align="left">
                      {{ props.row.transaction_type || 'N/A' }}
                    </q-td>
                    <q-td key="purpose" style="font-size: 11px" align="left">
                      {{ props.row.purpose || 'N/A' }}
                    </q-td>
                    <q-td key="status" style="font-size: 11px" align="center">
                      <q-toggle
                        :model-value="props.row.status === 'qualified'"
                        color="green"
                        @update:model-value="
                          (isChecked) =>
                            confirmStatusChange(props.row, isChecked ? 'qualified' : 'unqualified')
                        "
                        :loading="props.row.statusUpdating"
                      />
                      <div
                        class="text-caption q-mt-xs"
                        :class="props.row.status === 'qualified' ? 'text-green' : 'text-orange'"
                      >
                        {{ props.row.status || 'unqualified' }}
                      </div>
                    </q-td>
                    <q-td key="actions" style="font-size: 11px" align="center">
                      <q-btn
                        icon="visibility"
                        flat
                        class="text-blue"
                        @click="viewTransactionDetails(props.row)"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>

              <div class="q-pa-sm flex justify-end">
                <q-btn color="red" label="Close" @click="goBack" />
              </div>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Status Change Confirmation Modal -->
    <q-dialog v-model="showStatusConfirmModal" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="orange" text-color="white" />
          <span class="q-ml-sm text-h6">Confirm Status Change</span>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="q-mb-sm">
            Are you sure you want to change the status of transaction
            <strong>{{ pendingStatusChange.transaction?.transaction_number }}</strong>
            from <strong class="text-capitalize">{{ pendingStatusChange.oldStatus }}</strong> to
            <strong class="text-capitalize">{{ pendingStatusChange.newStatus }}</strong
            >?
          </p>
          <p class="text-caption text-grey-7">
            This action will update the qualification status of this transaction.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="cancelStatusChange" />
          <q-btn
            label="Confirm"
            color="orange"
            @click="confirmStatusUpdate"
            :loading="updatingStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'
import { date } from 'quasar'

export default {
  name: 'PatientProfile',

  data() {
    return {
      patientId: null,
      isEditMode: false,
      originalPatientData: null, // Store original data for cancellation
      patient: {
        id: null,
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
      },
      transactions: [],
      selectedTransaction: null,

      filterDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
      today: date.formatDate(new Date(), 'YYYY-MM-DD'),

      // Status change confirmation
      showStatusConfirmModal: false,
      updatingStatus: false,
      pendingStatusChange: {
        transaction: null,
        newStatus: '',
        oldStatus: '',
      },

      // New Transaction Modal
      showNewTransactionModal: false,
      creatingTransaction: false,
      newTransaction: {
        transaction_date: '',
        transaction_mode: '',
        transaction_type: '',
        purpose: '',
        patient_id: null,
        height: '',
        weight: '',
        bmi: '',
        waist: '',
        heart_rate: '',
        blood_pressure: '',
        respiratory_rate: '',
        pulse_rate: '',
        temperature: '',
        sp02: '',
        LMP: '',
        medicine: '',
        status: '',
      },

      transactionColumns: [
        {
          name: 'id',
          label: 'ID',
          field: 'id',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_number',
          label: 'Transaction Number',
          field: 'transaction_number',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_date',
          label: 'Transaction Date',
          field: (row) => this.formatDate(row.transaction_date || row.created_at),
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_type',
          label: 'Type',
          field: 'transaction_type',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'purpose',
          label: 'Purpose',
          field: 'purpose',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
          sortable: true,
          align: 'center',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'center',
          headerClasses: 'bg-grey-7 text-white',
        },
      ],
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },
    filteredTransactions() {
      if (!this.filterDate) return this.transactions

      return this.transactions.filter((t) => {
        const transactionDate = date.formatDate(t.transaction_date || t.created_at, 'YYYY-MM-DD')
        return transactionDate === this.filterDate
      })
    },
  },

  watch: {
    showNewTransactionModal(newVal) {
      if (newVal) {
        // Set default date to today
        this.newTransaction.transaction_date = date.formatDate(new Date(), 'YYYY-MM-DD')
        this.newTransaction.patient_id = this.patient.id
      }
    },
  },

  mounted() {
    // Initialize patient ID from route params or store
    this.patientId = this.$route.query.patientId || this.patientStore.patient_id

    // Load patient data once component is mounted
    if (this.patientId) {
      this.loadPatientData()
    } else {
      this.$q.notify({
        type: 'negative',
        message: 'No patient selected',
        position: 'top',
        timeout: 2000,
      })
      this.goBack()
    }
  },

  methods: {
    async loadPatientData() {
      try {
        // Get patient ID from store or route params
        if (!this.patientId) {
          this.$q.notify({
            type: 'negative',
            message: 'No patient selected',
            position: 'top',
            timeout: 2000,
          })
          this.goBack()
          return
        }

        console.log(`Loading patient data for ID: ${this.patientId}`)

        // Fetch patient data
        const patientData = await this.patientStore.getPatient(this.patientId)
        if (patientData) {
          console.log('Patient data loaded:', patientData)
          this.patient = { ...patientData }

          // If transactions are included in the patient data
          if (patientData.transaction && Array.isArray(patientData.transaction)) {
            this.transactions = patientData.transaction.map((transaction) => ({
              ...transaction,
              status: transaction.status || 'unqualified',
              statusUpdating: false,
            }))
            console.log(`Loaded ${this.transactions.length} transactions from patient data`)
          } else {
            // If transactions are not included, fetch them separately
            console.log('Transactions not included in patient data, fetching separately')
            const transactionsData =
              (await this.patientStore.getPatientTransactions(this.patientId)) || []
            this.transactions = transactionsData.map((transaction) => ({
              ...transaction,
              status: transaction.status || 'unqualified',
              statusUpdating: false,
            }))
            console.log(`Loaded ${this.transactions.length} transactions`)
          }
        } else {
          console.error('No patient data returned from store')
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load patient data',
            position: 'top',
            timeout: 2000,
          })
        }
      } catch (error) {
        console.error('Error loading patient data:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error loading patient data: ${error.message}`,
          position: 'top',
          timeout: 2000,
        })
      }
    },

    confirmStatusChange(transaction, newStatus) {
      // Store the current status before showing confirmation
      const oldStatus = transaction.status || 'unqualified'

      console.log('Status change requested:', { oldStatus, newStatus, transaction: transaction.id })

      // If status is the same, no need to confirm
      if (oldStatus === newStatus) {
        console.log('Status is the same, no change needed')
        return
      }

      // Set up pending status change data
      this.pendingStatusChange = {
        transaction: transaction,
        newStatus: newStatus,
        oldStatus: oldStatus,
      }

      console.log('Showing confirmation modal for:', this.pendingStatusChange)

      // Show confirmation modal
      this.showStatusConfirmModal = true
    },

    async confirmStatusUpdate() {
      try {
        this.updatingStatus = true
        const transaction = this.pendingStatusChange.transaction
        const newStatus = this.pendingStatusChange.newStatus

        // Set loading state for this specific transaction
        transaction.statusUpdating = true

        // Update the status first
        const updatedTransaction = await this.patientStore.updateTransactionStatus(
          transaction.id,
          newStatus
        )

        if (updatedTransaction) {
          // Update the local transaction data
          transaction.status = newStatus

          this.$q.notify({
            type: 'positive',
            message: `Transaction status updated to ${newStatus}`,
            position: 'top',
            timeout: 2000,
          })

          // ✅ Check if it qualifies for consultation
          if (newStatus === 'qualified' && transaction.transaction_type === 'consultation') {
            await this.addToConsultations(transaction.patient_id)
          }
        }

        // Close the confirmation modal
        this.showStatusConfirmModal = false
        this.resetPendingStatusChange()
      } catch (error) {
        console.error('Error updating transaction status:', error)
        this.$q.notify({
          type: 'negative',
          message: `Failed to update status: ${error.message}`,
          position: 'top',
          timeout: 2000,
        })
      } finally {
        this.updatingStatus = false
        if (this.pendingStatusChange.transaction) {
          this.pendingStatusChange.transaction.statusUpdating = false
        }
      }
    },

    cancelStatusChange() {
      // Just close the modal without making changes
      this.showStatusConfirmModal = false
      this.resetPendingStatusChange()
    },

    resetPendingStatusChange() {
      this.pendingStatusChange = {
        transaction: null,
        newStatus: '',
        oldStatus: '',
      }
    },

    toggleEditMode() {
      this.isEditMode = true
      // Store original data for potential cancellation
      this.originalPatientData = { ...this.patient }
    },

    async savePatientChanges() {
      try {
        // Validate required fields
        if (!this.patient.firstname || !this.patient.lastname) {
          this.$q.notify({
            type: 'negative',
            message: 'First name and last name are required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        // Update the patient using the store action
        const updatedPatient = await this.patientStore.updatePatient(this.patient.id, this.patient)

        if (updatedPatient) {
          this.$q.notify({
            type: 'positive',
            message: 'Patient information updated successfully',
            position: 'top',
            timeout: 2000,
          })

          // Exit edit mode
          this.isEditMode = false
          this.originalPatientData = null
        }
      } catch (error) {
        console.error('Error updating patient:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update patient information',
          position: 'top',
          timeout: 2000,
        })
      }
    },

    cancelEdit() {
      // Restore original data
      if (this.originalPatientData) {
        this.patient = { ...this.originalPatientData }
      }
      this.isEditMode = false
      this.originalPatientData = null
    },

    updateAge() {
      if (this.patient.birthdate) {
        this.patient.age = this.patientStore.calculateAge(this.patient.birthdate)
      }
    },

    viewTransactionDetails(transaction) {
      console.log('Viewing transaction:', transaction)
      this.$router.push({
        path: '/assessment/profile/transaction',
        query: { patientId: this.patient.id, transactionId: transaction.id },
      })
    },

    addNewTransaction() {
      console.log('Adding new transaction for patient ID:', this.patient.id)
      // Navigate to transaction creation page or open a dialog
      // Include patient ID so new transaction is linked to this patient
      this.$router.push({
        path: '/customers/profile',
        query: { patientId: this.patient.id },
      })
    },

    // New Transaction Modal Methods
    resetNewTransaction() {
      this.newTransaction = {
        transaction_date: '',
        transaction_mode: '',
        transaction_type: '',
        purpose: '',
        patient_id: this.patient.id,
        height: '',
        weight: '',
        bmi: '',
        waist: '',
        heart_rate: '',
        blood_pressure: '',
        respiratory_rate: '',
        pulse_rate: '',
        temperature: '',
        sp02: '',
        LMP: '',
        medicine: '',
        status: 'unqualified', // Default status
      }
    },

    updateNewTransactionBMI() {
      const height = parseFloat(this.newTransaction.height)
      const weight = parseFloat(this.newTransaction.weight)

      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100
        const bmi = weight / (heightInMeters * heightInMeters)
        this.newTransaction.bmi = bmi.toFixed(1)
      } else {
        this.newTransaction.bmi = ''
      }
    },

    getBmiCategory(bmi) {
      const bmiValue = parseFloat(bmi)
      if (bmiValue < 18.5) return 'Underweight'
      if (bmiValue < 25) return 'Normal'
      if (bmiValue < 30) return 'Overweight'
      return 'Obese'
    },

    async createNewTransaction() {
      try {
        // Validate required fields
        if (!this.newTransaction.transaction_date) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction date is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        if (!this.newTransaction.transaction_mode) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction mode is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        if (!this.newTransaction.transaction_type) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction type is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        this.creatingTransaction = true

        // Prepare transaction data with vital signs
        const transactionData = {
          ...this.newTransaction,
          patient_id: this.patient.id,
          vital_signs: this.newTransaction,
        }

        // Create the transaction using the store action
        const createdTransaction = await this.patientStore.createNewTransaction(transactionData)

        if (createdTransaction) {
          this.$q.notify({
            type: 'positive',
            message: 'Transaction created successfully',
            position: 'top',
            timeout: 2000,
          })

          // Add the new transaction to the local list with default status
          const newTransactionWithStatus = {
            ...createdTransaction,
            status: createdTransaction.status || 'unqualified',
            statusUpdating: false,
          }
          this.transactions.unshift(newTransactionWithStatus)

          // Close modal and reset form
          this.showNewTransactionModal = false
          this.resetNewTransaction()
        }
      } catch (error) {
        console.error('Error creating transaction:', error)
        this.$q.notify({
          type: 'negative',
          message: `Failed to create transaction: ${error.message}`,
          position: 'top',
          timeout: 2000,
        })
      } finally {
        this.creatingTransaction = false
      }
    },

    goBack() {
      this.$router.go(-1)
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return date.formatDate(dateString, 'YYYY-MM-DD')
    },
  },
}
</script>

<style scoped>
.q-item {
  transition: background-color 0.3s ease;
}

.q-item:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

.q-table th {
  font-size: 12px !important;
}

.q-toggle .q-toggle__inner {
  font-size: 11px;
}
</style>
