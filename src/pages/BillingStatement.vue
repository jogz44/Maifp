<template>
  <q-page class="q-pa-md flex flex-center bg-grey-2">
    <div v-if="loading" class="text-center">
      <q-spinner size="3em" color="primary" />
      <div class="q-mt-sm">Loading billing data...</div>
    </div>

    <div v-else-if="error" class="text-center text-negative">
      <q-icon name="error" size="3em" />
      <div class="q-mt-sm">{{ error }}</div>
      <q-btn color="primary" class="q-mt-md" label="Back" @click="$router.back()" />
    </div>

    <div v-else class="page-container">
      <!-- HEADER with Buttons -->
      <div class="header-section">
        <!-- Back Button on Left -->
        <div class="header-left">
          <q-btn flat round color="primary" icon="arrow_back" @click="$router.back()" />
        </div>

        <!-- Right-side Actions -->
        <div class="header-actions">
          <q-btn
            color="green-9"
            label="Complete"
            icon="save"
            class="q-mr-sm"
            :loading="completing"
            :disable="completing"
            @click="handleCompleteTransaction"
          />
          <q-btn color="secondary" label="Print" icon="print" @click="handlePrint" />
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <q-dialog v-model="showConfirmDialog" persistent>
        <q-card style="min-width: 400px">
          <q-card-section class="row items-center">
            <q-avatar icon="help" color="green-9" text-color="white" />
            <span class="q-ml-sm text-h6">Complete Transaction</span>
          </q-card-section>

          <q-card-section>
            <p>Are you sure you want to mark this transaction as completed?</p>
            <p class="text-caption text-grey-7">
              <strong>Note:</strong> This action cannot be undone.
            </p>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="grey"
              @click="showConfirmDialog = false"
              :disable="completing"
            />
            <q-btn
              flat
              label="Complete"
              color="green-9"
              @click="completeTransaction"
              :loading="completing"
              :disable="completing"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- BILLING CONTENT -->
      <div class="certification-report-container">
        <div class="report-content">
          <!-- Reusable Header -->
          <ReportHeader :officeName="officeName" />

          <!-- Official Office Title -->
          <div class="office-heading">
            <h3>Statement of Account</h3>
          </div>

          <!-- Patient Info -->
          <div class="patient-info q-mb-md">
            <h4>Patient Information</h4>
            <div class="row">
              <div class="col-6">
                <p><strong>Patient Name:</strong> {{ firstname }} {{ lastname }}</p>
                <p><strong>Age:</strong> {{ age }}</p>
                <p><strong>Gender:</strong> {{ gender }}</p>
              </div>
              <div class="col-6">
                <p>
                  <strong>Address:</strong>
                  {{ address?.street }}, {{ address?.purok }}, {{ address?.barangay }}
                </p>
                <p><strong>Contact:</strong> {{ contact_number }}</p>
                <p><strong>Date of Transaction:</strong> {{ formatDate(transaction_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Billing Table -->
          <!-- Billing Table -->
          <q-markup-table dense bordered class="billing-table">
            <thead>
              <tr>
                <th class="text-left">#</th>
                <th class="text-left">Particulars</th>
                <th class="text-right">Amount (₱)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Consultation row - only show if consultation_amount > 0 -->
              <tr v-if="consultation_amount > 0">
                <td>1</td>
                <td>Consultation</td>
                <td class="text-right">{{ formatAmount(parseFloat(consultation_amount)) }}</td>
              </tr>

              <!-- Laboratory rows with dynamic numbering -->
              <tr v-for="(lab, index) in laboratories" :key="lab.id">
                <td>{{ consultation_amount > 0 ? index + 2 : index + 1 }}</td>
                <td>{{ lab.laboratory_type }}</td>
                <td class="text-right">{{ formatAmount(parseFloat(lab.amount)) }}</td>
              </tr>

              <!-- Total row -->
              <tr class="total-row">
                <td colspan="2" class="text-right"><strong>Total</strong></td>
                <td class="text-right">
                  <strong>{{ formatAmount(total_billing) }}</strong>
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <!-- Spacer to push footer to bottom when content is short -->
          <div class="footer-spacer"></div>

          <!-- Footer positioned at the bottom -->
          <div class="footer">
            <ReportFooter :phone="footerPhone" :email="footerEmail" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import ReportHeader from 'src/components/ReportHeader.vue'
import ReportFooter from 'src/components/ReportFooter.vue'
import { usePatientStore } from 'src/stores/patientStore'

export default {
  name: 'BillingReportPage',
  components: {
    ReportHeader,
    ReportFooter,
  },

  data() {
    return {
      loading: true,
      completing: false, // New loading state for complete button
      showConfirmDialog: false, // Control the confirmation dialog
      error: null,
      // Direct properties from the JSON structure
      transaction_id: null,
      transaction_type: '',
      firstname: '',
      lastname: '',
      age: 0,
      gender: '',
      contact_number: '',
      address: {
        street: '',
        purok: '',
        barangay: '',
      },
      transaction_date: '',
      consultation_amount: 0,
      laboratory_total: 0,
      total_billing: 0,
      laboratories: [],

      // Config
      officeName: 'CITY HEALTH OFFICE',
      footerPhone: '(084) 217-3710',
      footerEmail: 'tagumcho@gmail.com',
    }
  },

  computed: {
    Patients() {
      return usePatientStore()
    },
  },

  mounted() {
    // Get patient ID from the store (set by the first component)
    const patientId = this.Patients.patient_id

    console.log('Patient ID from store:', patientId) // Debug log

    if (patientId) {
      this.getBillingDetails(patientId)
    } else {
      this.loading = false
      this.error = 'No patient ID found. Please select a patient from the billing list.'

      // Optional: Show notification
      this.$q.notify({
        type: 'negative',
        message: 'No patient selected',
        position: 'top',
        timeout: 2000,
      })
    }
  },

  methods: {
    async getBillingDetails(id) {
      this.loading = true
      this.error = null

      console.log('Fetching billing details for ID:', id) // Debug log

      try {
        // FIXED: Call the store method, not the component method
        const data = await this.Patients.getBillingDetails(id)

        console.log('Received billing data:', data) // Debug log

        if (data) {
          // Assign data directly to component properties
          Object.assign(this, data)
        } else {
          this.error = 'No billing data found'
        }
      } catch (err) {
        this.error = 'Failed to load billing data'
        console.error('Error fetching billing data:', err)
      } finally {
        this.loading = false
      }
    },

    async handleCompleteTransaction() {
      // Show the confirmation dialog
      this.showConfirmDialog = true
    },

    async completeTransaction() {
      if (!this.transaction_id) {
        this.$q.notify({
          type: 'negative',
          message: 'Transaction ID not found',
          position: 'top',
          timeout: 3000,
        })
        return
      }

      this.completing = true

      try {
        console.log('Updating transaction status for ID:', this.transaction_id)

        // Call the store method to update transaction status
        const result = await this.Patients.updateTransactionStatus(this.transaction_id, 'Complete')

        console.log('Transaction status update result:', result)

        if (result) {
          // Show success notification
          this.$q.notify({
            type: 'positive',
            message: 'Transaction completed successfully!',
            position: 'top',
            timeout: 3000,
            actions: [
              {
                label: 'Dismiss',
                color: 'white',
              },
            ],
          })

          // Optional: Navigate back to billing list after a short delay
          setTimeout(() => {
            this.$router.push('/billing')
          }, 1500)
        } else {
          throw new Error('Failed to update transaction status')
        }
      } catch (error) {
        console.error('Error completing transaction:', error)

        this.$q.notify({
          type: 'negative',
          message: 'Failed to complete transaction. Please try again.',
          position: 'top',
          timeout: 4000,
          actions: [
            {
              label: 'Dismiss',
              color: 'white',
            },
          ],
        })
      } finally {
        this.completing = false
      }
    },

    formatAmount(amount) {
      return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    handleBilling() {
      this.$router.push('/billing')
    },

    handlePrint() {
      window.print()
    },
  },
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 8.5in;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.certification-report-container {
  width: 8.5in;
  min-height: 11in;
  background-color: white;
  font-family: Arial, sans-serif;
  color: black;
  line-height: 1.5;
  letter-spacing: 0.5px;
  position: relative;
}

.report-content {
  padding: 0.75in 1in 1in 1in;
  min-height: 11in;
  position: relative;
  display: flex;
  flex-direction: column;
}

.office-heading {
  text-align: center;
  margin-bottom: 25px;
}
.office-heading h3 {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 5px 0;
}

.patient-info h4 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  text-decoration: underline;
}
.patient-info p {
  margin: 4px 0;
  font-size: 13px;
}

.billing-table {
  margin-top: 20px;
  margin-bottom: 30px;
  font-size: 13px;
}
.total-row {
  border-top: 2px solid #000;
}

.footer-spacer {
  flex-grow: 1;
  min-height: 20px;
}

.footer {
  margin-top: auto;
  position: absolute;
  bottom: 0.5in;
  left: 0;
  right: 0;
  text-align: center;
}

@media print {
  .header-section {
    display: none;
  }
  @page {
    size: letter;
    margin: 0;
  }

  .footer {
    position: fixed;
    bottom: 0.5in;
  }
}
</style>
