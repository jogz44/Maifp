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
          <div class="text-subtitle2 q-mb-sm">Transaction Information</div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="transaction.transaction_date"
                type="date"
                label="Date"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
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
                readonly
                autogrow
              />
            </div>
          </div>
        </q-card-section>

        <q-separator spaced inset v-if="!loading" />

        <!-- Representative Information Section - Only show if representative data exists -->
        <q-card-section v-if="!loading && hasRepresentative">
          <div class="text-subtitle2 q-mb-sm">Representative Information</div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="representative.rep_name"
                label="Representative Name"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="representative.rep_relationship"
                label="Relationship to Patient"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="representative.rep_contact"
                label="Contact Number"
                class="text-caption"
                readonly
              />
            </div>

            <!-- Representative Address -->
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="representative.rep_barangay"
                label="Barangay"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="representative.rep_purok"
                label="Purok"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="representative.rep_street"
                label="Street"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="representative.rep_city"
                label="City"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="representative.rep_province"
                label="Province"
                class="text-caption"
                readonly
              />
            </div>
          </div>
        </q-card-section>

        <q-separator spaced inset v-if="!loading && hasRepresentative" />

        <!-- Vital Signs Section -->
        <q-card-section v-if="!loading && vitalSigns">
          <div class="text-subtitle2 q-mb-sm">Vital Signs</div>

          <!-- Basic measurements -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.height"
                label="Height (cm)"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.weight"
                label="Weight (kg)"
                class="text-caption"
                readonly
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
                readonly
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
                readonly
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.blood_pressure"
                label="Blood Pressure (mmHg)"
                class="text-caption"
                readonly
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
                readonly
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.pulse_rate"
                label="Pulse Rate"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.temperature"
                label="Temperature (°C)"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.sp02"
                label="SpO2 (%)"
                class="text-caption"
                readonly
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
                readonly
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
                readonly
                autogrow
              />
            </div>
          </div>
        </q-card-section>
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
      representative: {},
      loading: true,
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },

    hasRepresentative() {
      return (
        this.transaction &&
        this.transaction.representative &&
        this.transaction.representative.rep_name
      )
    },
  },

  mounted() {
    this.patientId = this.$route.query.patientId
    this.transactionId = this.$route.query.transactionId

    console.log(
      `Mounted TransactionDetails. Patient ID: ${this.patientId}, Transaction ID: ${this.transactionId}`,
    )

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
    async loadTransactionData() {
      this.loading = true
      console.log(`Loading transaction data for ID: ${this.transactionId}`)

      try {
        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          console.log('Transaction data loaded:', transactionData)
          this.transaction = transactionData

          this.vitalSigns = transactionData.vital || {}
          console.log('Vital signs data:', this.vitalSigns)

          if (transactionData.representative) {
            console.log('Representative data found:', transactionData.representative)
            this.representative = { ...transactionData.representative }
          }

          if (this.vitalSigns.height && this.vitalSigns.weight) {
            this.calculateBMI()
          }

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

    calculateBMI() {
      if (this.vitalSigns.height && this.vitalSigns.weight) {
        const height = parseFloat(this.vitalSigns.height) / 100
        const weight = parseFloat(this.vitalSigns.weight)

        if (height > 0 && weight > 0) {
          const bmi = weight / (height * height)
          this.vitalSigns.bmi = bmi.toFixed(2)
        }
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

    goBack() {
      this.$router.go(-1)
    },
  },
}
</script>

<style scoped>
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
</style>
