<template>
  <q-page>
    <div class="q-pa-md">
      <!-- Header with back button and title -->
      <div class="row items-center q-mb-md">
        <div class="col-auto">
          <q-btn icon="arrow_back" flat round dense @click="goBack" />
        </div>
        <div class="col">
          <div class="text-h5 text-green-9 q-ml-md">Transaction Details</div>
        </div>
      </div>

      <q-inner-loading :showing="loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>

      <div class="row q-col-gutter-md" v-if="!loading">
        <!-- Left Card - Patient Information -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-sm">
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="person" class="q-mr-sm" />
                Patient Information
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pt-md">
              <!-- Patient Basic Info -->
              <div class="q-mb-md">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Personal Details</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="text-body1 text-weight-medium">
                      {{ patient.firstname }} {{ patient.middlename ? patient.middlename + ' ' : ''
                      }}{{ patient.lastname }}{{ patient.ext ? ' ' + patient.ext : '' }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">PhilSys ID</div>
                    <div class="text-body2">{{ patient.philsys_id || 'Not provided' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">PhilHealth ID</div>
                    <div class="text-body2">{{ patient.philhealth_id || 'Not provided' }}</div>
                  </div>

                  <div class="col-6">
                    <div class="text-caption text-grey-7">Age</div>
                    <div class="text-body2">{{ patient.age }} years old</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Gender</div>
                    <div class="text-body2 text-capitalize">{{ patient.gender }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Birthdate</div>
                    <div class="text-body2">{{ formatDate(patient.birthdate) }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Category</div>
                    <div class="text-body2">{{ patient.category }}</div>
                  </div>
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <!-- Contact Information -->
              <div class="q-mb-md">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Contact Information</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="text-caption text-grey-7">Contact Number</div>
                    <div class="text-body2">{{ patient.contact_number || 'Not provided' }}</div>
                  </div>
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <!-- Address Information -->
              <div class="q-mb-md">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Permanent Address</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Street</div>
                    <div class="text-body2">{{ patient.permanent_street || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Purok</div>
                    <div class="text-body2">{{ patient.permanent_purok || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Barangay</div>
                    <div class="text-body2">{{ patient.permanent_barangay || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">City</div>
                    <div class="text-body2">{{ patient.permanent_city || 'N/A' }}</div>
                  </div>
                  <div class="col-12">
                    <div class="text-caption text-grey-7">Province</div>
                    <div class="text-body2">{{ patient.permanent_province || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Address Information -->
              <div class="q-mb-md">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Present Address</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Street</div>
                    <div class="text-body2">{{ patient.street || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Purok</div>
                    <div class="text-body2">{{ patient.purok || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Barangay</div>
                    <div class="text-body2">{{ patient.barangay || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">City</div>
                    <div class="text-body2">{{ patient.city || 'N/A' }}</div>
                  </div>
                  <div class="col-12">
                    <div class="text-caption text-grey-7">Province</div>
                    <div class="text-body2">{{ patient.province || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <!-- Additional Information -->
              <div class="q-mb-md">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Additional Information</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Civil Status</div>
                    <div class="text-body2">{{ patient.civil_status || 'Not provided' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Religion</div>
                    <div class="text-body2">{{ patient.religion || 'Not provided' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Education</div>
                    <div class="text-body2">{{ patient.education || 'Not provided' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Occupation</div>
                    <div class="text-body2">{{ patient.occupation || 'Not provided' }}</div>
                  </div>
                  <div class="col-12">
                    <div class="text-caption text-grey-7">Special Categories</div>
                    <div class="text-body2">
                      <q-chip
                        v-if="patient.is_pwd"
                        color="orange"
                        text-color="white"
                        size="sm"
                        class="q-mr-xs"
                      >
                        PWD
                      </q-chip>
                      <q-chip v-if="patient.is_solo" color="purple" text-color="white" size="sm">
                        Solo Parent
                      </q-chip>
                      <span v-if="!patient.is_pwd && !patient.is_solo" class="text-grey-5">
                        None
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Representative Information -->
              <div v-if="hasRepresentative">
                <q-separator inset class="q-my-md" />
                <div class="q-mb-md">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Representative Information</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <div class="text-caption text-grey-7">Name</div>
                      <div class="text-body2">{{ representative.rep_name }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-7">Relationship</div>
                      <div class="text-body2">{{ representative.rep_relationship || 'N/A' }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-7">Contact</div>
                      <div class="text-body2">{{ representative.rep_contact || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Card - Transaction and Vital Signs -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-sm">
              <div class="text-h6 text-secondary q-mb-md">
                <q-icon name="medical_services" class="q-mr-sm" />
                Medical Details
                <q-btn
                  v-if="transaction.status === 'Complete'"
                  flat
                  round
                  color="primary"
                  icon="description"
                  class="float-right"
                  @click="generateReport"
                  size="sm"
                >
                  <q-tooltip>Generate Report</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-separator />

            <!-- Transaction Information -->
            <q-card-section class="q-pt-md">
              <div class="q-mb-md">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Transaction Information</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="text-caption text-grey-7">Transaction Number</div>
                    <div class="text-body2 text-weight-medium">
                      {{ transaction.transaction_number }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Date</div>
                    <div class="text-body2">{{ formatDate(transaction.transaction_date) }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Type</div>
                    <div class="text-body2">
                      <q-badge
                        :color="getTransactionTypeColor(transaction.transaction_type)"
                        :label="transaction.transaction_type"
                      />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Mode</div>
                    <div class="text-body2">{{ transaction.transaction_mode || 'N/A' }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Status</div>
                    <div class="text-body2">
                      <q-badge
                        :color="getStatusColor(transaction.status)"
                        :label="transaction.status"
                        class="text-capitalize"
                      />
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="text-caption text-grey-7">Purpose</div>
                    <div class="text-body2">{{ transaction.purpose || 'Not provided' }}</div>
                  </div>
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <!-- Vital Signs -->
              <div class="q-mb-md" v-if="vitalSigns && Object.keys(vitalSigns).length > 0">
                <div class="text-subtitle2 text-grey-8 q-mb-sm">Vital Signs</div>

                <!-- Physical Measurements -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">Physical Measurements</div>
                  <div class="row q-col-gutter-xs">
                    <div class="col-3" v-if="vitalSigns.height">
                      <div class="text-caption text-grey-7">Height</div>
                      <div class="text-body2">{{ vitalSigns.height }}</div>
                    </div>
                    <div class="col-3" v-if="vitalSigns.weight">
                      <div class="text-caption text-grey-7">Weight</div>
                      <div class="text-body2">{{ vitalSigns.weight }}</div>
                    </div>
                    <div class="col-3" v-if="vitalSigns.bmi">
                      <div class="text-caption text-grey-7">BMI</div>
                      <div class="text-body2">
                        {{ vitalSigns.bmi }}
                        <q-badge
                          :color="getBmiColor(vitalSigns.bmi)"
                          :label="getBmiCategory(vitalSigns.bmi)"
                          size="xs"
                          class="q-ml-xs"
                        />
                      </div>
                    </div>
                    <div class="col-3" v-if="vitalSigns.waist">
                      <div class="text-caption text-grey-7">Waist</div>
                      <div class="text-body2">{{ vitalSigns.waist }}</div>
                    </div>
                  </div>
                </div>

                <!-- Vital Signs -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">Vital Signs</div>
                  <div class="row q-col-gutter-xs">
                    <div class="col-4" v-if="vitalSigns.blood_pressure">
                      <div class="text-caption text-grey-7">Blood Pressure</div>
                      <div class="text-body2">{{ vitalSigns.blood_pressure }}</div>
                    </div>
                    <div class="col-4" v-if="vitalSigns.heart_rate">
                      <div class="text-caption text-grey-7">Heart Rate</div>
                      <div class="text-body2">{{ vitalSigns.heart_rate }}</div>
                    </div>
                    <div class="col-4" v-if="vitalSigns.pulse_rate">
                      <div class="text-caption text-grey-7">Pulse Rate</div>
                      <div class="text-body2">{{ vitalSigns.pulse_rate }}</div>
                    </div>
                    <div class="col-4" v-if="vitalSigns.respiratory_rate">
                      <div class="text-caption text-grey-7">Respiratory Rate</div>
                      <div class="text-body2">{{ vitalSigns.respiratory_rate }}</div>
                    </div>
                    <div class="col-4" v-if="vitalSigns.temperature">
                      <div class="text-caption text-grey-7">Temperature</div>
                      <div class="text-body2">{{ vitalSigns.temperature }}</div>
                    </div>
                    <div class="col-4" v-if="vitalSigns.sp02">
                      <div class="text-caption text-grey-7">SpO2</div>
                      <div class="text-body2">{{ vitalSigns.sp02 }}</div>
                    </div>
                  </div>
                </div>

                <!-- Additional Information -->
                <div v-if="vitalSigns.LMP || vitalSigns.medicine">
                  <div class="text-caption text-grey-6 q-mb-xs">Additional Information</div>
                  <div class="row q-col-gutter-xs">
                    <div class="col-6" v-if="vitalSigns.LMP">
                      <div class="text-caption text-grey-7">Last Menstrual Period</div>
                      <div class="text-body2">{{ formatDate(vitalSigns.LMP) }}</div>
                    </div>
                    <div class="col-12" v-if="vitalSigns.medicine">
                      <div class="text-caption text-grey-7">Maintenance Medicine</div>
                      <div class="text-body2">{{ vitalSigns.medicine }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Laboratory Details -->
              <div
                v-if="
                  transaction.laboratories_details && transaction.laboratories_details.length > 0
                "
              >
                <q-separator inset class="q-my-md" />
                <div class="q-mb-md">
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Laboratory Details</div>
                  <div
                    v-for="(lab, index) in transaction.laboratories_details"
                    :key="index"
                    class="q-mb-sm"
                  >
                    <q-card flat bordered class="q-pa-sm">
                      <div class="text-body2">{{ lab.name || 'Laboratory Test' }}</div>
                      <div class="text-caption text-grey-7">
                        {{ lab.description || 'No description available' }}
                      </div>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
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
      return this.representative && this.representative.rep_name
    },
  },

  mounted() {
    this.initializeComponent()
  },

  methods: {
    initializeComponent() {
      // Method 1: Get IDs from route query parameters
      this.patientId = this.$route.query.patientId
      this.transactionId = this.$route.query.transactionId

      // Method 2: Get IDs from route params (if using route params instead)
      if (!this.patientId) {
        this.patientId = this.$route.params.patientId
      }
      if (!this.transactionId) {
        this.transactionId = this.$route.params.transactionId
      }

      // Method 3: Get IDs from store (fallback for GL navigation)
      if (!this.patientId && this.patientStore.patient_id) {
        this.patientId = this.patientStore.patient_id
      }
      if (!this.transactionId && this.patientStore.transaction_id) {
        this.transactionId = this.patientStore.transaction_id
      }

      // Validate that we have the required IDs
      if (!this.patientId || !this.transactionId) {
        this.$q.notify({
          type: 'negative',
          message: 'Missing patient ID or transaction ID',
          position: 'top',
          timeout: 3000,
        })
        this.loading = false
        return
      }

      // Load the transaction data
      this.loadTransactionData()
    },

    async loadTransactionData() {
      this.loading = true

      try {
        console.log('Loading transaction data for:', {
          patientId: this.patientId,
          transactionId: this.transactionId,
        })

        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          this.transaction = transactionData
          this.vitalSigns = transactionData.vital || {}
          this.patient = transactionData.patient || {}

          if (transactionData.representative) {
            this.representative = { ...transactionData.representative }
          }

          console.log('Transaction data loaded successfully:', transactionData)
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load transaction data',
            position: 'top',
            timeout: 3000,
          })
        }
      } catch (error) {
        console.error('Error loading transaction data:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error loading transaction data: ${error.message}`,
          position: 'top',
          timeout: 3000,
        })
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'

      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } catch {
        return dateString
      }
    },

    getTransactionTypeColor(type) {
      const colors = {
        Laboratory: 'blue',
        Consultation: 'green',
        'Follow-up': 'orange',
        Emergency: 'red',
      }
      return colors[type] || 'grey'
    },

    getStatusColor(status) {
      const colors = {
        Complete: 'green',
        assessment: 'blue',
        cancelled: 'red',
      }
      return colors[status] || 'grey'
    },

    getBmiCategory(bmi) {
      const numBmi = parseFloat(bmi)

      if (isNaN(numBmi)) return ''

      if (numBmi < 18.5) return 'Underweight'
      if (numBmi < 25) return 'Normal'
      if (numBmi < 30) return 'Overweight'
      return 'Obese'
    },

    getBmiColor(bmi) {
      const numBmi = parseFloat(bmi)

      if (isNaN(numBmi)) return 'grey'

      if (numBmi < 18.5) return 'blue'
      if (numBmi < 25) return 'green'
      if (numBmi < 30) return 'orange'
      return 'red'
    },

    goBack() {
      this.$router.go(-1)
    },

    generateReport() {
      // Set IDs in stores
      this.patientStore.patient_id = this.patientId
      this.patientStore.transaction_id = this.transactionId

      console.log('Navigating to report with IDs:', {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
      })

      // Navigate to report page
      this.$router.push('/gl/report')
    },
  },
}
</script>

<style scoped></style>
