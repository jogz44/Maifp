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
                    white-space: nowrap;
                  "
                >
                  Consultation fee loaded
                </div>
              </transition>
              <!-- Info button -->
              <q-btn icon="info" color="primary" round dense flat @click="openDoctorDialog" />
            </div>
          </div>
        </q-card-section>

        <!-- Doctor Fee Dialog -->
        <q-dialog v-model="doctorDialog" persistent>
          <q-card style="min-width: 600px">
            <q-card-section>
              <div class="text-h6">Consultation Fee</div>
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
                      <q-btn
                        flat
                        color="primary"
                        label="Edit"
                        size="sm"
                        @click="props.row.editMode = true"
                      />
                    </div>

                    <div v-else>
                      <q-btn
                        flat
                        color="positive"
                        label="Save"
                        size="sm"
                        :loading="props.row._isSaving"
                        :disable="props.row._isSaving"
                        @click="debouncedSaveDoctorFee(props.row)"
                      />
                      <q-btn
                        flat
                        color="negative"
                        label="Cancel"
                        size="sm"
                        :disable="props.row._isSaving"
                        @click="cancelEdit(props.row)"
                      />
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
        <div class="q-mt-md flex justify-end q-gutter-sm" v-if="isLatest">
        <!-- <q-btn
              color="primary"
              label="Require Medication"
              icon="medication"
              @click="onRequireMedication"
            /> -->
          <q-btn
            color="blue"
            label="Process Lab"
            icon="biotech"
            @click="handleProcessLab"
            :loading="isProcessingLab"
            :disable="isProcessingLab || isHandlingPrescription"
          />
          <q-btn
            color="green"
            label="Done"
            icon="check_circle"
            @click="confirmPrescription"
            :loading="isHandlingPrescription"
            :disable="isProcessingLab || isHandlingPrescription"
          />
        </div>

        <!-- Confirmation Dialog -->
        <q-dialog v-model="showPrescriptionConfirm" persistent>
          <q-card style="min-width: 450px; position: relative">
            <q-btn
              dense
              flat
              round
              icon="close"
              color="grey"
              class="close-btn"
              @click="showPrescriptionConfirm = false"
              :disable="isHandlingPrescription"
            />

            <q-card-section class="row items-center q-pt-xl q-pb-md">
              <q-icon name="help_outline" color="primary" size="30px" class="q-mr-sm" />
              <div class="text-h6">Does the patient have a prescription?</div>
            </q-card-section>

            <q-card-actions align="right" class="q-pt-none">
              <q-btn
                flat
                label="NO"
                color="negative"
                @click="handleNo"
                :loading="isHandlingPrescription"
                :disable="isHandlingPrescription"
              />
              <q-btn
                flat
                label="YES"
                color="primary"
                @click="handleYes"
                :loading="isHandlingPrescription"
                :disable="isHandlingPrescription"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

      </q-card>
    </div>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'
import { debounce } from 'quasar'

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
        {
          name: 'doctor_amount',
          label: 'Consultation Fee',
          field: 'doctor_amount',
          align: 'center',
        },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],

      showPrescriptionConfirm: false,
      isProcessingLab: false,
      isHandlingPrescription: false,

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

  mounted() {
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
    async openDoctorDialog() {
      try {
        await this.patientStore.fetchDoctors()
        this.doctorDialog = true
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load doctor data',
        })
      }
    },

    async saveDoctorFee(row) {
      if (row._isSaving) return // prevent double click
      row._isSaving = true

      try {
        const payload = { doctor_amount: row.doctor_amount }
        await this.patientStore.updateDoctorFee(row.id, payload)

        row.editMode = false
        this.$q.notify({
          type: 'positive',
          message: 'Consultation fee updated!',
        })
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update fee',
        })
      } finally {
        row._isSaving = false
      }
    },

    cancelEdit(row) {
      row.editMode = false
    },

    // debounce wrapper to prevent rapid clicks
    debouncedSaveDoctorFee: debounce(function (row) {
      this.saveDoctorFee(row)
    }, 500),
    
    //  Confirmation Dialog for "Done"
    confirmPrescription() {
      this.showPrescriptionConfirm = true
    },

    async handleYes() {
      this.showPrescriptionConfirm = false
      await this.safeAction(this.onRequireMedication, 'isHandlingPrescription')
    },

    async handleNo() {
      this.showPrescriptionConfirm = false
      await this.safeAction(this.markDone, 'isHandlingPrescription')
    },

    async handleProcessLab() {
      await this.safeAction(this.processLab, 'isProcessingLab')
    },

    // Centralized safe-action helper (prevents double clicks + handles spinner)
    async safeAction(actionFn, flagName) {
      if (this[flagName]) return // already running

      this[flagName] = true
      try {
        await actionFn.call(this)
      } finally {
        this[flagName] = false
      }
    },

    // Require Medication Logic
    async onRequireMedication() {
      const patientStore = usePatientStore()
      const now = new Date()
      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: now.toISOString().split('T')[0],
        consultation_time: now.toTimeString().split(' ')[0],
        status: 'Medication',
        transaction_type: 'consultation',
      }

      try {
        await patientStore.storeNewConsultation(payload)
        this.$q.notify({
          type: 'positive',
          message: 'Consultation status proceeds to Medication',
        })
        this.$router.push({ path: '/customers/newConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update Consultation: ${error.message}`,
        })
      }
    },

    // Process Laboratory Logic
    async processLab() {
      const patientStore = usePatientStore()
      const now = new Date()
      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: now.toISOString().split('T')[0],
        consultation_time: now.toTimeString().split(' ')[0],
        status: 'Processing',
        transaction_type: 'consultation',
      }

      try {
        await patientStore.storeLaboratoryPatient(payload)
        this.$q.notify({
          type: 'positive',
          message: 'Patient sent to Laboratory successfully!',
        })
        await patientStore.fetchLaboratoryPatients()
        this.$router.push({ path: '/customers/newConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to process Laboratory: ${error.message}`,
        })
      }
    },

    // Mark as Done Logic
    async markDone() {
      const patientStore = usePatientStore()
      const now = new Date()
      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: now.toISOString().split('T')[0],
        consultation_time: now.toTimeString().split(' ')[0],
        status: 'Done',
        transaction_type: 'consultation',
      }

      try {
        await patientStore.storeNewConsultation(payload)
        this.$q.notify({
          type: 'positive',
          message: 'Consultation status Done',
        })
        this.$router.push({ path: '/customers/newConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update Consultation: ${error.message}`,
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

          // Merge consultation status if it exists
          if (transactionData.consultation && transactionData.consultation.status) {
            transactionData.status = transactionData.consultation.status
          }

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

              // Check if the current transaction is the latest for this patient
              if (patientData.transaction && Array.isArray(patientData.transaction)) {
                const sorted = [...patientData.transaction].sort(
                  (a, b) =>
                    new Date(b.transaction_date || b.created_at) -
                    new Date(a.transaction_date || a.created_at),
                )
                const latest = sorted[0]
                this.isLatest = Number(latest.id) === Number(this.transactionId)

                console.log(
                  `Latest transaction ID: ${latest.id}, Current ID: ${this.transactionId}, isLatest: ${this.isLatest}`,
                )
              }
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

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>
