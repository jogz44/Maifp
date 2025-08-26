<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <!-- Patient Information Section -->
        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-sm" style="max-width: 1000px; width: 100%">
              <div class="row items-center justify-between">
                <!-- Left: Patient Information -->
                <div class="text-h6 text-green text-weight-bolder">Patient Information</div>

                <!-- Right: Action Buttons -->
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

              <q-separator></q-separator>

              <!-- Patient Personal Information -->
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.lastname"
                    label="Last name"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.firstname"
                    label="First name"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.middlename"
                    label="Middle name"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.ext"
                    label="Ext"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Additional Patient Information -->
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-select
                    v-if="isEditMode"
                    outlined
                    dense
                    v-model="patient.gender"
                    :options="patientStore.genderOptions"
                    label="Gender"
                    class="full-width text-caption"
                  />
                  <q-input
                    v-else
                    outlined
                    dense
                    v-model="patient.gender"
                    label="Gender"
                    class="full-width text-caption"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-1 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.age"
                    label="Age"
                    class="full-width text-caption"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.birthdate"
                    label="Birthdate"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                    type="date"
                    @update:model-value="updateAge"
                  />
                </div>
                <div class="col-12 col-md-4 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.contact_number"
                    label="Contact Number"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.category"
                    label="Category"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Address Information -->
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.purok"
                    label="Purok"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.street"
                    label="Street"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.barangay"
                    label="Barangay"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.city"
                    label="City"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Status Indicators -->
              <div class="row q-gutter-sm q-mt-xs">
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-checkbox
                    v-model="patient.is_pwd"
                    label="PWD"
                    :readonly="!isEditMode"
                    :disable="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
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
              <div class="text-h6 text-green text-weight-bolder">Patient Transaction History</div>
              <q-separator />

              <q-table
                bordered
                dense
                :rows="transactions"
                :columns="transactionColumns"
                row-key="id"
                no-data-label="No transaction history available"
                hide-bottom
              >
                <!-- Body slot -->
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="transaction_number" style="font-size: 11px" align="left">
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
                    <q-td key="transaction_mode" style="font-size: 11px" align="left">
                      {{ props.row.transaction_mode || 'N/A' }}
                    </q-td>
                    <q-td key="purpose" style="font-size: 11px" align="left">
                      {{ props.row.purpose || 'N/A' }}
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
                <q-btn
                  color="green-9"
                  label="New Transaction"
                  @click="showNewTransactionModal = true"
                  class="q-mr-md"
                />
                <q-btn color="red" label="Close" @click="goBack" />
              </div>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- New Transaction Modal -->
    <q-dialog v-model="showNewTransactionModal" persistent>
      <q-card style="min-width: 800px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-green-9 text-weight-bold">New Transaction</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetNewTransaction" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-md text-grey-8">
            Patient: {{ patient.firstname }} {{ patient.middlename }} {{ patient.lastname }}
            {{ patient.ext }}
          </div>

          <!-- Transaction Information -->
          <div class="text-subtitle2 q-mb-sm text-weight-bold">Transaction Information</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="newTransaction.transaction_date"
                type="date"
                label="Date *"
                class="text-caption"
                :rules="[(val) => !!val || 'Transaction date is required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="newTransaction.transaction_mode"
                :options="patientStore.transactionModes"
                label="Mode of Transaction *"
                class="text-caption"
                :rules="[(val) => !!val || 'Transaction mode is required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="newTransaction.transaction_type"
                :options="patientStore.transaction_type"
                label="Type of Transaction *"
                class="text-caption"
                :rules="[(val) => !!val || 'Transaction type is required']"
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model="newTransaction.purpose"
                label="Purpose"
                type="textarea"
                class="text-caption"
                autogrow
                rows="3"
              />
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Vital Signs -->
          <div class="text-subtitle2 q-mb-sm text-weight-bold">Vital Signs</div>

          <!-- Basic measurements -->
          <div class="text-caption text-grey-7 q-mb-sm">Basic Measurements</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.height"
                label="Height (cm)"
                class="text-caption"
                type="number"
                @update:model-value="updateNewTransactionBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.weight"
                label="Weight (kg)"
                class="text-caption"
                type="number"
                @update:model-value="updateNewTransactionBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.bmi"
                label="BMI"
                class="text-caption"
                readonly
              >
                <template v-slot:append v-if="newTransaction.bmi">
                  <q-badge color="primary" text-color="white">
                    {{ getBmiCategory(newTransaction.bmi) }}
                  </q-badge>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.waist"
                label="Waist Circumference (cm)"
                class="text-caption"
                type="number"
              />
            </div>
          </div>

          <!-- Vital signs -->
          <div class="text-caption text-grey-7 q-mb-sm">Vital Signs</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.heart_rate"
                label="Heart Rate (bpm)"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.blood_pressure"
                label="Blood Pressure"
                class="text-caption"
                placeholder="120/80"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.respiratory_rate"
                label="Respiratory Rate"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.pulse_rate"
                label="Pulse Rate"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.temperature"
                label="Temperature (°C)"
                class="text-caption"
                type="number"
                step="0.1"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.sp02"
                label="SpO2 (%)"
                class="text-caption"
                type="number"
              />
            </div>
          </div>

          <!-- Additional information -->
          <div class="text-caption text-grey-7 q-mb-sm">Additional Information</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="newTransaction.LMP"
                label="Last Menstrual Period (LMP)"
                type="date"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="newTransaction.medicine"
                label="Maintenance Medicine"
                class="text-caption"
                type="textarea"
                autogrow
                rows="2"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey" v-close-popup @click="resetNewTransaction" />
          <q-btn
            label="Create Transaction"
            color="green-9"
            :loading="creatingTransaction"
            @click="createNewTransaction"
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

      // New Transaction Modal
      showNewTransactionModal: false,
      creatingTransaction: false,
      newTransaction: {
        transaction_date: '',
        transaction_mode: '',
        transaction_type: '',
        purpose: '',
        patient_id: null,
        consultation_date: '',   // ✅ added
        status: 'pending',       // ✅ added
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
      },

      transactionColumns: [
        {
          name: 'id',
          label: 'id',
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
          name: 'transaction_mode',
          label: 'Mode',
          field: 'transaction_mode',
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
  },

  watch: {
    showNewTransactionModal(newVal) {
      if (newVal) {
        // Set defaults when modal opens
        this.newTransaction.transaction_date = date.formatDate(new Date(), 'YYYY-MM-DD')
        this.newTransaction.consultation_date = date.formatDate(new Date(), 'YYYY-MM-DD') // ✅ added
        this.newTransaction.status = 'pending' // ✅ default status
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
            this.transactions = patientData.transaction
            console.log(`Loaded ${this.transactions.length} transactions from patient data`)
          } else {
            // If transactions are not included, fetch them separately
            console.log('Transactions not included in patient data, fetching separately')
            this.transactions =
              (await this.patientStore.getPatientTransactions(this.patientId)) || []
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
        path: '/customers/profile/transaction',
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
        consultation_date: date.formatDate(new Date(), 'YYYY-MM-DD'), // ✅ reset default
        status: 'pending', // ✅ reset default
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
        // ✅ validate consultation_date + status too
        if (!this.newTransaction.consultation_date) {
          this.$q.notify({
            type: 'negative',
            message: 'Consultation date is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        if (!this.newTransaction.status) {
          this.$q.notify({
            type: 'negative',
            message: 'Status is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        this.creatingTransaction = true

        const transactionData = {
          ...this.newTransaction,
          patient_id: this.patient.id,
          vital_signs: this.newTransaction,
        }

        const createdTransaction = await this.patientStore.createNewTransaction(transactionData)

        if (createdTransaction) {
          this.$q.notify({
            type: 'positive',
            message: 'Transaction created successfully',
            position: 'top',
            timeout: 2000,
          })

          this.transactions.unshift(createdTransaction)
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
</style>
