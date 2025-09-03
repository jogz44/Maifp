<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1200px; width: 100%">
        <!-- Header with back button and title -->
        <q-card-section>
          <div class="row items-center q-mb-md">
            <!-- Back Button -->
            <div class="col-auto">
              <q-btn icon="arrow_back" flat round dense @click="goBack" />
            </div>

            <!-- Title -->
            <div class="col">
              <div class="text-h6 text-green-9 q-ml-md">Transaction Details</div>
            </div>

            <!-- Toast + Info Button (Right Corner) -->
            <div class="col-auto flex items-center">
              <!-- Floating toast -->
              <transition name="fade-slide">
                <div
                  v-if="showDoctorToast"
                    class="q-pa-sm text-white text-caption shadow-4 absolute-top-right"
                    style="
                      margin-top: 15px;
                      margin-right: 48px; /* push it left of the info button */
                      border-radius: 10px;
                      background: rgba(33, 150, 243, 0.75);
                      backdrop-filter: blur(6px);
                      white-space: nowrap;"
                      >
                      Doctor's fee loaded
                </div>
              </transition>
              <!-- Info button -->
              <q-btn
                icon="info"
                color="primary"
                round
                dense
                flat
                @click="openDoctorDialog"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Doctor Fee Dialog -->
        <q-dialog v-model="doctorDialog" persistent>
          <q-card style="min-width: 600px">
            <q-card-section>
              <div class="text-h6">Doctor's Fee</div>
            </q-card-section>

            <q-card-section>
              <q-table
                :rows="patientStore.doctors"
                :columns="doctorColumns"
                row-key="id"
                flat
                dense
              >
                <!-- Doctor Fee Column -->
                <template v-slot:body-cell-doctor_amount="props">
                  <q-td :props="props">
                    <q-input
                      v-model="props.row.doctor_amount"
                      type="number"
                      outlined
                      dense
                      :disable="!props.row.editMode"
                    >
                      <template v-slot:prepend>
                        <q-td>₱</q-td>
                      </template>
                    </q-input>
                  </q-td>
                </template>

                <!-- Actions Column -->
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <div v-if="!props.row.editMode">
                      <q-btn flat color="primary" label="Edit" size="sm" @click="props.row.editMode = true" />
                    </div>
                    <div v-else>
                      <q-btn flat color="positive" label="Save" size="sm" @click="saveDoctorFee(props.row)" />
                      <q-btn flat color="negative" label="Cancel" size="sm" @click="cancelEdit(props.row)" />
                    </div>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Close" color="grey" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-separator />

        <q-inner-loading :showing="loading">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>

        <!-- Transaction Information Section -->
        <q-card-section v-if="!loading">
          <div class="row items-center justify-between">
            <div class="text-subtitle2 q-mb-sm">Transaction Information</div>
          </div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="transaction.transaction_date"
                type="date"
                label="Date"
                class="text-caption"
                :readonly="!isTransactionEditMode"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-if="isTransactionEditMode"
                outlined
                dense
                v-model="transaction.transaction_mode"
                :options="patientStore.transactionModes"
                label="Mode of Transaction"
                class="text-caption"
              />
              <q-input
                v-else
                outlined
                dense
                v-model="transaction.transaction_mode"
                label="Mode of Transaction"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-if="isTransactionEditMode"
                outlined
                dense
                v-model="transaction.transaction_type"
                :options="patientStore.transaction_type"
                label="Type of Transaction"
                class="text-caption"
              />
              <q-input
                v-else
                outlined
                dense
                v-model="transaction.transaction_type"
                label="Type of Transaction"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model="transaction.purpose"
                label="Purpose"
                type="textarea"
                class="text-caption"
                :readonly="!isTransactionEditMode"
                autogrow
              />
            </div>
          </div>
        </q-card-section>

        <q-separator spaced inset v-if="!loading" />

        <!-- Vital Signs Section -->
        <q-card-section v-if="!loading && vitalSigns">
          <div class="row items-center justify-between">
            <div class="text-subtitle2 q-mb-sm">Vital Signs</div>
          </div>

          <!-- Basic measurements -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.height"
                label="Height (cm)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
                @update:model-value="updateBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.weight"
                label="Weight (kg)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
                @update:model-value="updateBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.bmi"
                label="BMI"
                class="text-caption"
                readonly
              >
                <template v-slot:append v-if="vitalSigns.bmi">
                  <q-badge color="primary" text-color="white">
                    {{ getBmiCategory(vitalSigns.bmi) }}
                  </q-badge>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.waist"
                label="Waist Circumference (cm)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>

            <!-- Vital signs -->
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.heart_rate"
                label="Heart Rate (bpm)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.blood_pressure"
                label="Blood Pressure (mmHg)"
                class="text-caption"
                :readonly="!isVitalSignsEditMode"
                placeholder="120/80"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.respiratory_rate"
                label="Respiratory Rate"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.pulse_rate"
                label="Pulse Rate"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.temperature"
                label="Temperature (°C)"
                class="text-caption"
                type="number"
                step="0.1"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.sp02"
                label="SpO2 (%)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>

            <!-- Additional information -->
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="vitalSigns.LMP"
                label="Last Menstrual Period (LMP)"
                type="date"
                class="text-caption"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="vitalSigns.medicine"
                label="Maintenance Medicine"
                class="text-caption"
                type="textarea"
                :readonly="!isVitalSignsEditMode"
                autogrow
              />
            </div>
          </div>
        </q-card-section>
        <!-- Buttons BELOW the card -->
        <div class="q-mt-md flex justify-end q-gutter-sm">
          <q-btn
              color="primary"
              label="Require Medication"
              icon="medication"
              @click="onRequireMedication"
            />
          <q-btn
            color="blue"
            label="Process Lab"
            icon="biotech"
            @click="processLab"
          />
          <q-btn
            color="green"
            label="Done"
            icon="check_circle"
            @click="markDone"
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'

export default {
  name: 'TransactionDetails',

  data() {
    return {
      patientId: null,
      transactionId: null,
      transaction: {},
      patient: {},
      vitalSigns: {},
      loading: true,
      showDoctorToast: false,
      doctorDialog: false,
      doctorColumns: [
        { name: 'doctor_amount', label: "Doctor's Fee", field: 'doctor_amount', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ],

      // Separate edit modes for transaction and vital signs
      isTransactionEditMode: false,
      isVitalSignsEditMode: false,

      // Backup data for cancellation
      originalTransactionData: null,
      originalVitalSigns: null,
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },
  },

  mounted () {
    this.patientId = this.$route.query.patientId
    this.transactionId = this.$route.query.transactionId

    if (this.transactionId) {
      this.loadTransactionData()
    } else {
      this.$q.notify({
        type: 'negative',
        message: 'No transaction selected',
        position: 'top',
        timeout: 2000,
      })
      this.loading = false
    }

    // Trigger toast beside Info button
    if (this.$route.query.showDoctorToast) {
      this.showDoctorToast = true
      setTimeout(() => {
        this.showDoctorToast = false
      }, 3000)
    }
  },

  methods: {

    async openDoctorDialog () {
      try {
        await this.patientStore.fetchDoctors()
        this.doctorDialog = true
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load doctor data'
        })
      }
    },

    async updateDoctorFee(row) {
      try {
        const payload = { id: row.id, doctor_amount: row.doctor_amount }
        await this.patientStore.updateDoctorFee(payload)
        this.$q.notify({ type: 'positive', message: "Doctor's fee updated!" })
      } catch {
        this.$q.notify({ type: 'negative', message: 'Failed to update fee' })
      }
    },
    async saveDoctorFee(row) {
      try {
        const payload = { doctor_amount: row.doctor_amount }
        await this.patientStore.updateDoctorFee(row.id, payload)
        row.editMode = false
        this.$q.notify({ type: 'positive', message: "Doctor's fee updated!" })
      } catch {
        this.$q.notify({ type: 'negative', message: 'Failed to update fee' })
      }
    },
    cancelEdit(row) {
      // Reset changes (optional: re-fetch data)
      row.editMode = false
    },

    async onRequireMedication() {
      const patientStore = usePatientStore()

      const now = new Date()
      const consultationDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const consultationTime = now.toTimeString().split(' ')[0] // HH:MM:SS

      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        status: 'Medication',
        transaction_type: 'consultation',
      }

      try {
        await patientStore.storeNewConsultation(payload)

        this.$q.notify({
          type: 'positive',
          message: 'New Consultation status updated to Medication',
        })

        // If you want, redirect to pharmacy page
        this.$router.push({ path: '/customers/newConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update New Consultation: ${error.message}`,
        })
      }
    },

    async processLab() {
      const patientStore = usePatientStore()

      const now = new Date()
      const consultationDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const consultationTime = now.toTimeString().split(' ')[0] // HH:MM:SS

      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        status: 'Processing',
        transaction_type: 'consultation',
      }

      try {
        await patientStore.storeLaboratoryPatient(payload)

        this.$q.notify({
          type: 'positive',
          message: 'Patient sent to Laboratory successfully!',
        })

        // Refresh laboratory list
        await patientStore.fetchLaboratoryPatients()

        // (Optional) Navigate if you want to redirect
        this.$router.push({ path: '/customers/newConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to process Laboratory: ${error.message}`,
        })
      }
    },

    async markDone() {
      const patientStore = usePatientStore()

      const now = new Date()
      const consultationDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const consultationTime = now.toTimeString().split(' ')[0] // HH:MM:SS

      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        status: 'Done',
        transaction_type: 'consultation',
      }

      try {
        await patientStore.storeNewConsultation(payload)

        this.$q.notify({
          type: 'positive',
          message: 'New Consultation status updated to Medication',
        })

        // If you want, redirect to pharmacy page
        this.$router.push({ path: '/customers/returnConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update New Consultation: ${error.message}`,
        })
      }
    },

    async loadTransactionData() {
      this.loading = true
      console.log(`Loading transaction data for ID: ${this.transactionId}`)

      try {
        // Use getTransactionDetails from patientStore
        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          console.log('Transaction data loaded:', transactionData)
          this.transaction = transactionData

          // Extract vital signs data from the vital property
          this.vitalSigns = transactionData.vital || {}
          console.log('Vital signs data:', this.vitalSigns)

          // Load patient data if not already loaded and if patientId is available
          if (this.patientId && (!this.patient || !this.patient.id)) {
            console.log(`Loading patient data for ID: ${this.patientId}`)
            const patientData = await this.patientStore.getPatient(this.patientId)
            if (patientData) {
              console.log('Patient data loaded:', patientData)
              this.patient = patientData
            } else {
              console.error('Failed to load patient data')
            }
          }
        } else {
          console.error('No transaction data returned from store')
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load transaction data',
            position: 'top',
            timeout: 2000,
          })
        }
      } catch (error) {
        console.error('Error loading transaction data:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error loading transaction data: ${error.message}`,
          position: 'top',
          timeout: 2000,
        })
      } finally {
        this.loading = false
      }
    },

    // Transaction Edit Methods
    toggleTransactionEditMode() {
      this.isTransactionEditMode = true
      // Store original data for potential cancellation
      this.originalTransactionData = { ...this.transaction }
    },

    async saveTransactionChanges() {
      try {
        // Validate required fields
        if (!this.transaction.transaction_date || !this.transaction.transaction_type) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction date and type are required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        // Prepare the transaction data (exclude vital signs)
        const transactionDataToUpdate = {
          id: this.transaction.id,
          transaction_date: this.transaction.transaction_date,
          transaction_type: this.transaction.transaction_type,
          transaction_mode: this.transaction.transaction_mode,
          purpose: this.transaction.purpose,
          patient_id: this.transaction.patient_id,
          // Include any other transaction-specific fields but exclude vital
        }

        console.log('Updating transaction with data:', transactionDataToUpdate)

        // Update the transaction using the store action
        const updatedTransaction = await this.patientStore.updateTransaction(
          this.transaction.id,
          transactionDataToUpdate,
        )

        if (updatedTransaction) {
          this.$q.notify({
            type: 'positive',
            message: 'Transaction updated successfully',
            position: 'top',
            timeout: 2000,
          })

          // Update local transaction data with the response
          this.transaction = { ...this.transaction, ...updatedTransaction }

          // Exit edit mode
          this.isTransactionEditMode = false
          this.originalTransactionData = null
        }
      } catch (error) {
        console.error('Error updating transaction:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update transaction',
          position: 'top',
          timeout: 2000,
        })
      }
    },

    cancelTransactionEdit() {
      // Restore original transaction data
      if (this.originalTransactionData) {
        this.transaction = { ...this.originalTransactionData }
      }

      this.isTransactionEditMode = false
      this.originalTransactionData = null
    },

    // Vital Signs Edit Methods
    toggleVitalSignsEditMode() {
      this.isVitalSignsEditMode = true
      // Store original data for potential cancellation
      this.originalVitalSigns = { ...this.vitalSigns }
    },

    async saveVitalSignsChanges() {
      try {
        // Validate vital signs if needed
        // You can add validation here for specific vital sign requirements

        // Prepare the vital signs data
        const vitalDataToUpdate = {
          ...this.vitalSigns,
          transaction_id: this.transactionId, // Ensure transaction_id is included
        }

        console.log('Updating vital signs with data:', vitalDataToUpdate)
        console.log('Current vital signs before update:', this.vitalSigns)

        // Check if vital signs already exist (has an ID) or need to be created
        let updatedVital
        if (this.vitalSigns.id) {
          // Update existing vital signs using the updateVital action
          updatedVital = await this.patientStore.updateVital(this.vitalSigns.id, vitalDataToUpdate)
        } else {
          // If no vital signs exist, you might need to create new ones
          // This depends on your API structure - you may need to add a createVital method
          console.log('No vital signs ID found, may need to create new vital record')
          // For now, we'll assume updateVital can handle both cases
          updatedVital = await this.patientStore.updateVital(
            this.transactionId, // Use transaction ID if no vital ID exists
            vitalDataToUpdate,
          )
        }

        console.log('Updated vital signs response:', updatedVital)

        if (updatedVital) {
          this.$q.notify({
            type: 'positive',
            message: 'Vital signs updated successfully',
            position: 'top',
            timeout: 2000,
          })

          // Update local vital signs data with the response
          // Make sure to preserve the structure
          this.vitalSigns = { ...this.vitalSigns, ...updatedVital }

          // Also update the transaction's vital property to keep data in sync
          if (this.transaction && this.transaction.vital) {
            this.transaction.vital = { ...this.vitalSigns }
          }

          console.log('Local vital signs after update:', this.vitalSigns)

          // Exit edit mode
          this.isVitalSignsEditMode = false
          this.originalVitalSigns = null

          // Optional: Refresh the entire transaction data to ensure consistency
          // Uncomment the line below if the vital signs still don't display properly
          // await this.refreshTransactionData()
        }
      } catch (error) {
        console.error('Error updating vital signs:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update vital signs',
          position: 'top',
          timeout: 2000,
        })
      }
    },

    cancelVitalSignsEdit() {
      // Restore original vital signs data
      if (this.originalVitalSigns) {
        this.vitalSigns = { ...this.originalVitalSigns }
      }

      this.isVitalSignsEditMode = false
      this.originalVitalSigns = null
    },

    // Method to refresh transaction data after updates
    async refreshTransactionData() {
      try {
        console.log('Refreshing transaction data...')
        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          console.log('Refreshed transaction data:', transactionData)
          this.transaction = transactionData
          this.vitalSigns = transactionData.vital || {}
          console.log('Refreshed vital signs:', this.vitalSigns)
        }
      } catch (error) {
        console.error('Error refreshing transaction data:', error)
      }
    },

    updateBMI() {
      if (this.vitalSigns.height && this.vitalSigns.weight) {
        this.vitalSigns.bmi = this.patientStore.calculateBMI(
          parseFloat(this.vitalSigns.height),
          parseFloat(this.vitalSigns.weight),
        )
      } else {
        this.vitalSigns.bmi = ''
      }
    },

    getBmiCategory(bmi) {
      const numBmi = parseFloat(bmi)

      if (isNaN(numBmi)) return ''

      if (numBmi < 18.5) return 'Underweight'
      if (numBmi < 25) return 'Normal'
      if (numBmi < 30) return 'Overweight'
      return 'Obese'
    },

    printRecord() {
      window.print()
    },

    goBack() {
      this.$router.go(-1)
    },
  },
}
</script>

<style scoped>
/* Print-specific styles */
@media print {
  .q-page {
    padding: 0 !important;
  }

  .q-card {
    box-shadow: none !important;
  }

  .q-btn {
    display: none !important;
  }
}

/* Transition classes */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px); /* slides in/out horizontally */
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 0.2;
  transform: translateX(0);
}
</style>
