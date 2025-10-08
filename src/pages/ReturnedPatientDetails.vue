<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1200px; width: 100%">
        <!-- Header with back button and title -->
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col-auto">
              <q-btn icon="arrow_back" flat round dense @click="goBack" />
            </div>
            <div class="col">
              <div class="text-h6 text-green-9 q-ml-md">Transaction Details</div>
            </div>
          </div>
        </q-card-section>

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

        <!-- LABORATORY SERVICES TABLE -->
        <q-card-section v-if="mergedLabResults.length">
          <div class="text-subtitle2 q-mb-sm" v-if="!loading">Laboratory Services</div>
          <q-table
            v-if="!loading"
            :rows="mergedLabResults"
            :columns="mergedColumns"
            row-key="unique_id"
            flat
            bordered
            dense
            :table-header-class="'bg-grey-3 text-black'"
          />
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

      showPrescriptionConfirm: false,
      isProcessingLab: false,
      isHandlingPrescription: false,

      // Separate edit modes for transaction and vital signs
      isTransactionEditMode: false,
      isVitalSignsEditMode: false,

      // Backup data for cancellation
      originalTransactionData: null,
      originalVitalSigns: null,

      mergedLabResults: [],

      mergedColumns: [
        { name: 'id', label: 'Item No.', field: 'id', align: 'center' },
        { name: 'category', label: 'Category', field: 'category', align: 'left' },
        { name: 'description', label: 'Description', field: 'description', align: 'left' },
        {
          name: 'selling_price',
          label: 'Selling Price / Rate',
          field: 'selling_price',
          align: 'right',
        },
        { name: 'service_fee', label: 'Service Fee', field: 'service_fee', align: 'right' },
        { name: 'total_amount', label: 'Total Amount', field: 'total_amount', align: 'right' },
      ],
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },
  },

  mounted() {
    // Get patientId and transactionId from route query parameters
    this.patientId = this.$route.query.patientId
    this.transactionId = this.$route.query.transactionId

    console.log(
      `Mounted TransactionDetails. Patient ID: ${this.patientId}, Transaction ID: ${this.transactionId}`,
    )

    // Load data once we have the required IDs
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
  },

  methods: {
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
        this.$router.push({ path: '/customers/returnConsultation' })
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
        this.$router.push({ path: '/customers/returnConsultation' })
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
        this.$router.push({ path: '/customers/returnConsultation' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update Consultation: ${error.message}`,
        })
      }
    },

    async loadTransactionData() {
      this.loading = true
      try {
        // fetch transaction
        this.transaction = await this.patientStore.getTransactionDetails(this.transactionId)
        this.vitalSigns = this.transaction.vital || {}

        // fetch lab details
        const labData = await this.patientStore.fetchLaboratoryDetails(this.transactionId)

        // normalize and merge into one array
        let counter = 1

        const examinations = (labData.examination || []).map((item) => ({
          id: counter++, // auto-increment
          category: 'Examination',
          description: item.item_description,
          selling_price: item.selling_price,
          service_fee: item.service_fee,
          total_amount: item.total_amount,
          unique_id: `exam-${counter}`,
        }))

        const radiologies = (labData.radiologies || []).map((item) => ({
          id: counter++, // continue increment
          category: 'Radiology',
          description: item.item_description,
          selling_price: item.selling_price,
          service_fee: item.service_fee,
          total_amount: item.total_amount,
          unique_id: `rad-${counter}`,
        }))

        const ultrasounds = (labData.ultrasound || []).map((item) => ({
          id: counter++, // continue increment
          category: 'Ultrasound',
          description: item.body_parts,
          selling_price: item.rate,
          service_fee: item.service_fee,
          total_amount: item.total_amount,
          unique_id: `ultra-${counter}`,
        }))

        const mammograms = (labData.mammogram || []).map((item) => ({
          id: counter++, // continue increment
          category: 'Mammogram',
          description: item.procedure,
          selling_price: item.rate,
          service_fee: item.service_fee,
          total_amount: item.total_amount,
          unique_id: `mammo-${counter}`,
        }))

        this.mergedLabResults = [...examinations, ...radiologies, ...ultrasounds, ...mammograms]

        console.log('Merged Lab Results:', this.mergedLabResults)

        // fetch patient for latest check
        const patientData = await this.patientStore.getPatient(this.patientId)
        if (patientData) {
          this.patient = patientData
          if (patientData.transaction && Array.isArray(patientData.transaction)) {
            const sorted = [...patientData.transaction].sort(
              (a, b) =>
                new Date(b.transaction_date || b.created_at) -
                new Date(a.transaction_date || a.created_at),
            )
            const latest = sorted[0]
            this.isLatest = Number(latest.id) === Number(this.transactionId)
          }
        }
      } catch (error) {
        console.error('Error loading transaction data:', error)
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

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>
