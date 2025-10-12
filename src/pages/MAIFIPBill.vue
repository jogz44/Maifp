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
      <div class="header-section">
        <div class="header-left">
          <q-btn flat round color="primary" icon="arrow_back" @click="$router.back()" />
        </div>
        <div class="header-actions">
          <q-btn
            color="orange-9"
            label="MAIFIP"
            icon="volunteer_activism"
            class="q-mr-sm"
            :loading="processing"
            :disable="processing"
            @click="showAssistanceDialog = true"
          />
          <q-btn
            color="primary"
            label="Submit"
            icon="save"
            class="q-mr-sm"
            @click="showConfirmDialog = true"
            :loading="submitting"
          />
          <q-btn color="secondary" label="Print PDF" icon="picture_as_pdf" @click="handlePrint" />
        </div>
      </div>

      <!-- Confirm Dialog -->
      <q-dialog v-model="showConfirmDialog" persistent>
        <q-card style="min-width: 400px">
          <q-card-section class="row items-center">
            <q-avatar icon="help" color="green-9" text-color="white" />
            <span class="q-ml-sm text-h6">Complete Transaction</span>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="text-body1">Are you sure you want to fund this statement of account?</div>
            <div class="q-mt-md text-body2 text-grey-7">
              <strong>Patient:</strong> {{ patientFullName }}<br />
              <strong>Amount:</strong> {{ formatAmount(finalAmountDue) }}
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn
              flat
              label="Cancel"
              @click="showConfirmDialog = false"
              :disable="submitting"
              color="dark"
            />
            <q-btn
              flat
              label="Confirm"
              @click="handleSubmit"
              :loading="submitting"
              color="green-9"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Error Dialog -->
      <q-dialog v-model="showErrorDialog" persistent>
        <q-card style="min-width: 400px">
          <q-card-section class="row items-center">
            <q-avatar icon="error" color="negative" text-color="white" />
            <span class="q-ml-sm text-h6">Error</span>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="text-body1" v-for="(msg, index) in errorMessage" :key="index">
              {{ msg }}
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" @click="showErrorDialog = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Assistance Application Dialog -->
      <q-dialog v-model="showAssistanceDialog" persistent>
        <q-card style="min-width: 500px">
          <q-card-section class="row items-center">
            <q-avatar icon="volunteer_activism" color="orange-9" text-color="white" />
            <span class="q-ml-sm text-h6">Apply Financial Assistance</span>
          </q-card-section>
          <q-card-section>
            <div class="assistance-form-container">
              <div class="row q-gutter-md">
                <div class="col-4">
                  <q-input
                    v-model="assistanceForm.controlNumber"
                    label="Control Number"
                    outlined
                    dense
                    :rules="[(val) => !!val || 'Control number is required']"
                  />
                </div>
                <div class="col-4">
                  <q-input label="MAIFIP" outlined dense readonly />
                </div>
                <div class="col">
                  <q-input
                    v-model.number="assistanceForm.amount"
                    label="MAIFIP Amount"
                    type="number"
                    outlined
                    dense
                    prefix="₱"
                    :rules="assistanceAmountRules"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div class="billing-summary q-pa-md bg-grey-1 rounded-borders q-mt-md">
              <div class="row justify-between">
                <span>Original Total:</span>
                <span class="text-weight-bold">{{ formatAmount(finalAmountDue) }}</span>
              </div>
              <div class="row justify-between">
                <span>MAIFIP Assistance:</span>
                <span class="text-weight-bold text-orange-9"
                  >-{{ formatAmount(assistanceForm.amount || 0) }}</span
                >
              </div>
              <q-separator class="q-my-sm" />
              <div class="row justify-between text-h6">
                <span class="text-weight-bold">Final Amount Due:</span>
                <span class="text-weight-bold text-primary">{{
                  formatAmount(
                    Math.max(0, parseAmount(finalAmountDue) - (assistanceForm.amount || 0)),
                  )
                }}</span>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="grey"
              @click="cancelAssistance"
              :disable="processing"
            />
            <q-btn
              flat
              label="Apply Assistance"
              color="orange-9"
              @click="applyMAIFIP"
              :loading="processing"
              :disable="processing || !isAssistanceFormValid"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="certification-report-container">
        <div class="report-content">
          <div class="header-container">
            <table class="header-table">
              <tbody>
                <tr>
                  <td class="logo-cell" width="25%">
                    <div class="logo-container">
                      <img src="/Doh.svg" alt="DOH" class="logo" />
                      <img src="/BP.png" alt="BP" class="logo" />
                    </div>
                  </td>
                  <td class="header-text" width="50%">
                    <div>Republic of the Philippines</div>
                    <div>Province of Davao Del Norte</div>
                    <div>City Government of Tagum</div>
                    <div class="header-office">City Health Office</div>
                  </td>
                  <td class="logo-cell" width="25%">
                    <div class="logo-container right">
                      <img src="/CHO-logo.png" alt="CHO Logo" class="logo" />
                      <img src="/logo.png" alt="City of Tagum Logo" class="logo" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="office-heading">
            <h3>BILLING STATEMENT</h3>
          </div>

          <div class="patient-info">
            <div class="info-section-title">Patient Information</div>
            <q-separator />
            <div class="row">
              <div class="col-6">
                <p>
                  <strong>Date of Transaction:</strong>
                  {{ formatDate(billingData.transaction_date) }}
                </p>
                <p><strong>Surname:</strong> {{ billingData.lastname || 'N/A' }}</p>
                <p><strong>First Name:</strong> {{ billingData.firstname || 'N/A' }}</p>
                <p><strong>Middle Name:</strong> {{ billingData.middlename || 'N/A' }}</p>
              </div>
              <div class="col-6">
                <p><strong>Gender:</strong> {{ billingData.gender || 'N/A' }}</p>
                <p><strong>Age:</strong> {{ billingData.age || 'N/A' }}</p>
                <p><strong>Birthdate:</strong> {{ formatDate(billingData.birthdate) }}</p>
                <p>
                  <strong>Address:</strong>
                  {{ formatAddress(billingData.address) }}
                </p>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table class="billing-table">
              <thead>
                <tr>
                  <th class="text-left">Particulars</th>
                  <th class="text-left">Qty</th>
                  <th class="text-left">Unit</th>
                  <th class="text-right">Unit Price (₱)</th>
                  <th class="text-right">Amount (₱)</th>
                </tr>
              </thead>
              <tbody>
                <!-- Consultation -->
                <tr v-if="parseAmount(billingData.consultation_amount) > 0">
                  <td>Consultation</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(billingData.consultation_amount) }}</td>
                </tr>
                <!-- Radiology -->
                <tr v-for="rad in billingData.radiologies_details" :key="'rad-' + rad.id">
                  <td>{{ rad.item_description }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(rad.total_amount) }}</td>
                </tr>
                <!-- Exam -->
                <tr v-for="exam in billingData.examination_details" :key="'exam-' + exam.id">
                  <td>{{ exam.item_description }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(exam.total_amount) }}</td>
                </tr>
                <!-- Mammo -->
                <tr v-for="mammo in billingData.mammogram_details" :key="'mammo-' + mammo.id">
                  <td>{{ mammo.procedure }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(mammo.total_amount) }}</td>
                </tr>
                <!-- Ultra -->
                <tr v-for="ultra in billingData.ultrasound_details" :key="'ultra-' + ultra.id">
                  <td>{{ ultra.body_parts }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(ultra.total_amount) }}</td>
                </tr>
                <!-- Medicine -->
                <tr
                  v-for="med in billingData.medication || []"
                  :key="'med-' + (med.id || med.item_description)"
                  class="med-row"
                >
                  <td>{{ med.item_description || 'N/A' }}</td>
                  <td class="text-left">{{ med.quantity || '' }}</td>
                  <td class="text-left">{{ med.unit || '' }}</td>
                  <td class="text-right">{{ formatAmount(med.amount || 0) }}</td>
                  <td class="text-right">{{ formatAmount(med.total || 0) }}</td>
                </tr>
                <!-- Total -->
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(billingData.total_billing) }}</strong>
                  </td>
                </tr>
                <tr class="total-row" v-if="billingData.discount > 0">
                  <td colspan="4" class="text-right"><strong>PWD/Senior Discount (20%)</strong></td>
                  <td class="text-right">
                    <strong>-{{ formatAmount(billingData.discount) }}</strong>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Subtotal</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(billingData.final_billing) }}</strong>
                  </td>
                </tr>
                <!-- Financial Assistance Rows - Show existing assistance -->
                <template v-if="hasExistingAssistance">
                  <tr
                    v-for="(fund, index) in billingData.funds"
                    :key="'assistance-' + fund.id || index"
                    class="assistance-row"
                  >
                    <td colspan="4" class="text-right">
                      <strong>Financial Assistance ({{ fund.fund_source }})</strong>
                    </td>
                    <td class="text-right">
                      <strong>-{{ formatAmount(fund.fund_amount) }}</strong>
                    </td>
                  </tr>
                </template>
                <!-- Grand Total -->
                <tr class="grand-total-row">
                  <td colspan="4" class="text-right"><strong>Grand Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(finalAmountDue) }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p class="signature-line">
              Prepared by: <span class="preparer-name">{{ preparerName }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useAssistanceStore } from 'src/stores/assistanceStore'
import { useQuasar, LocalStorage } from 'quasar'
import { useRouter } from 'vue-router'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Initialize stores and utilities
const store = usePatientStore()
const assistanceStore = useAssistanceStore()
const $q = useQuasar()
const router = useRouter()

// Reactive variables
const loading = ref(true)
const error = ref(null)
const processing = ref(false)
const submitting = ref(false)
const showConfirmDialog = ref(false)
const showAssistanceDialog = ref(false)
const showErrorDialog = ref(false)
const errorMessage = ref([])
const currentUser = ref(null)

// Updated billing data structure to match new JSON format
const billingData = ref({
  patient_id: null,
  transaction_id: null,
  transaction_type: '',
  firstname: '',
  lastname: '',
  middlename: '',
  birthdate: '',
  age: null,
  gender: '',
  category: '',
  is_pwd: 0,
  is_solo: 0,
  contact_number: '',
  maifip: 0,
  transaction_status: '',
  philhealth: 0,
  address: {
    street: '',
    purok: '',
    barangay: '',
  },
  transaction_date: '',
  consultation_amount: '0.00',
  radiology_total: 0,
  ultrasound_total: 0,
  examination_total: 0,
  mammogram_total: 0,
  medication_total: 0,
  total_billing: 0,
  discount: 0,
  final_billing: 0,
  radiologies_details: [], // Changed from radiology_details
  examination_details: [],
  mammogram_details: [],
  ultrasound_details: [],
  medication: [],
  representative: {
    id: null,
    rep_name: '',
    relationship: '',
    address: '',
  },
  assistance: null,
  funds: [], // Keep this for existing assistance functionality
})

const hasExistingAssistance = computed(() => {
  return billingData.value.funds && billingData.value.funds.length > 0
})

const totalExistingAssistance = computed(() => {
  if (!hasExistingAssistance.value) return 0
  return billingData.value.funds.reduce((total, fund) => {
    return total + parseAmount(fund.fund_amount)
  }, 0)
})

const finalAmountDue = computed(() => {
  const originalAmount = parseAmount(billingData.value.final_billing)
  const assistanceAmount = hasExistingAssistance.value ? totalExistingAssistance.value : 0
  return Math.max(0, originalAmount - assistanceAmount)
})

// Assistance form
const assistanceForm = ref({
  controlNumber: '',
  fund_source: 'MAIFIP',
  amount: finalAmountDue.value,
})

watch(finalAmountDue, (newFinalAmountDue) => {
  assistanceForm.value.amount = newFinalAmountDue
})

// Initialize current user
try {
  currentUser.value = LocalStorage.getItem('user')
} catch (err) {
  console.error('Error retrieving user data:', err)
}

// Computed properties
const preparerName = computed(() => {
  if (!currentUser.value) return 'Staff Member'
  const firstName = currentUser.value.first_name || ''
  const middleName = currentUser.value.middle_name || ''
  const lastName = currentUser.value.last_name || ''
  let fullName = firstName
  if (middleName) fullName += ' ' + middleName
  if (lastName) fullName += ' ' + lastName
  return fullName.trim() || 'Staff Member'
})

const patientFullName = computed(() => {
  const first = billingData.value.firstname || ''
  const last = billingData.value.lastname || ''
  return `${first} ${last}`.trim()
})

const assistanceAmountRules = [
  (val) => val >= 0 || 'Assistance amount cannot be negative',
  (val) => val > 0 || 'Assistance amount must be greater than 0',
  (val) =>
    Math.round(val * 100) <= Math.round(finalAmountDue.value * 100) || 'Exceeds remaining amount',
]

const isAssistanceFormValid = computed(() => {
  const hasControlNumber = !!assistanceForm.value.controlNumber?.trim()
  const amount = Number(assistanceForm.value.amount)
  const finalAmount = Number(finalAmountDue.value)
  const hasValidAmount = amount > 0
  const amountNotExceeded = Math.round(amount * 100) <= Math.round(finalAmount * 100)
  return hasControlNumber && hasValidAmount && amountNotExceeded
})

const transactionId = computed(() => store.transaction_id || billingData.value.transaction_id)

// Lifecycle
onMounted(async () => {
  if (!store.transaction_id) {
    error.value = 'No transaction selected. Please select a patient from the billing list.'
    loading.value = false
    $q.notify({ type: 'negative', message: error.value, position: 'top' })
    return
  }

  try {
    const data = await store.getBillingDetails(store.transaction_id)
    if (data) {
      // Map the new JSON structure directly
      billingData.value = {
        ...data,
        // Ensure arrays exist
        radiologies_details: data.radiologies_details || [],
        examination_details: data.examination_details || [],
        mammogram_details: data.mammogram_details || [],
        ultrasound_details: data.ultrasound_details || [],
        medication: data.medication || [],
        funds: data.funds || [], // Keep for existing assistance functionality
        // Ensure address is properly structured
        address: data.address || { street: '', purok: '', barangay: '' },
        // Ensure representative exists
        representative: data.representative || {
          id: null,
          rep_name: '',
          relationship: '',
          address: '',
        },
      }
    } else {
      error.value = 'No billing data found'
    }
  } catch (err) {
    console.error('Error loading billing data:', err)
    error.value = 'Failed to load billing data'
  } finally {
    loading.value = false
  }
})

// Utility functions
function parseAmount(amount) {
  if (typeof amount === 'number') return amount
  if (!amount) return 0
  return parseFloat(amount) || 0
}

function formatAmount(amount) {
  const num = parseAmount(amount)
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

// New function to handle address formatting
function formatAddress(address) {
  if (!address) return 'N/A'
  if (typeof address === 'string') return address

  const parts = []
  if (address.street) parts.push(address.street)
  if (address.purok) parts.push(`Purok ${address.purok}`)
  if (address.barangay) parts.push(`Brgy. ${address.barangay}`)

  return parts.length > 0 ? parts.join(', ') : 'N/A'
}

// Assistance functions
function cancelAssistance() {
  assistanceForm.value = {
    controlNumber: '',
    amount: 0,
  }
  showAssistanceDialog.value = false
}

async function applyMAIFIP() {
  if (!isAssistanceFormValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
      position: 'top',
    })
    return
  }

  if (!transactionId.value) {
    $q.notify({
      type: 'negative',
      message: 'Transaction ID not found. Please try again.',
      position: 'top',
    })
    return
  }

  processing.value = true
  try {
    const payload = {
      fund_source: 'MAIFIP',
      fund_amount: parseFloat(assistanceForm.value.amount),
      gl_number: assistanceForm.value.controlNumber.trim(),
    }

    const result = await assistanceStore.applyMAIFIP(transactionId.value, payload)

    const isSuccess =
      result?.message?.includes('Successfully') ||
      result?.message?.includes('success') ||
      result?.assistance ||
      (result && !result.error)

    if (isSuccess) {
      billingData.value.funds.push({
        id: result.assistance?.id || Date.now(),
        fund_source: 'MAIFIP',
        fund_amount: assistanceForm.value.amount.toString(),
        control_number: assistanceForm.value.controlNumber,
      })

      showAssistanceDialog.value = false
      assistanceForm.value = {
        controlNumber: '',
        amount: 0,
      }

      $q.notify({
        type: 'positive',
        message: 'MAIFIP assistance has been applied successfully!',
        position: 'top',
      })
    } else {
      throw new Error(result?.error || result?.message || 'Failed to apply assistance')
    }
  } catch (error) {
    console.error('Error applying assistance:', error)
    let errorMessage = 'Failed to apply financial assistance. Please try again.'

    if (error.message.includes('No Assistance record found')) {
      errorMessage = 'Transaction not found. Please refresh the page and try again.'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
    })
  } finally {
    processing.value = false
  }
}

async function handleSubmit() {
  if (!transactionId.value) {
    $q.notify({
      type: 'negative',
      message: 'Transaction ID not found. Please try again.',
      position: 'top',
    })
    return
  }

  submitting.value = true
  try {
    const payload = {
      status: 'Funded',
    }

    const response = await store.addGL(transactionId.value, payload)
    const result = response?.data ?? response

    if (result && !result.error) {
      $q.notify({
        type: 'positive',
        message: 'Transaction funded successfully!',
        position: 'top',
      })

      showConfirmDialog.value = false
      setTimeout(() => {
        router.push('/gl')
      }, 1500)
    } else {
      const errorMsg = result?.message || result?.error || 'Failed to fund transaction.'
      errorMessage.value = [errorMsg]
      showErrorDialog.value = true
    }
  } catch (error) {
    console.error('Submit Error:', error)

    let msg = 'An error occurred while funding the transaction.'
    if (error.response?.data?.message) {
      msg = error.response.data.message
    } else if (error.response?.data?.error) {
      msg = error.response.data.error
    } else if (error.message) {
      msg = error.message
    }

    errorMessage.value = [msg]
    showErrorDialog.value = true
  } finally {
    submitting.value = false
    showConfirmDialog.value = false
  }
}

// Print function
async function handlePrint() {
  const element = document.querySelector('.certification-report-container')
  if (!element) {
    $q.notify({ type: 'negative', message: 'No report found to export', position: 'top' })
    return
  }

  try {
    const allElements = element.querySelectorAll('*')
    const originalStyles = []

    allElements.forEach((el, index) => {
      originalStyles[index] = {
        letterSpacing: el.style.letterSpacing,
        textRendering: el.style.textRendering,
        webkitFontSmoothing: el.style.webkitFontSmoothing,
        mozOsxFontSmoothing: el.style.mozOsxFontSmoothing,
      }

      el.style.letterSpacing = '0.5px'
      el.style.textRendering = 'optimizeLegibility'
      el.style.webkitFontSmoothing = 'antialiased'
      el.style.mozOsxFontSmoothing = 'grayscale'
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    const canvas = await html2canvas(element, {
      scale: 5,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    })

    allElements.forEach((el, index) => {
      if (originalStyles[index]) {
        el.style.letterSpacing = originalStyles[index].letterSpacing
        el.style.textRendering = originalStyles[index].textRendering
        el.style.webkitFontSmoothing = originalStyles[index].webkitFontSmoothing
        el.style.mozOsxFontSmoothing = originalStyles[index].mozOsxFontSmoothing
      }
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
      compress: true,
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const margin = 0
    const imgWidth = pageWidth - margin * 2
    const imgProps = pdf.getImageProperties(imgData)
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
    } else {
      let heightLeft = imgHeight
      let position = margin
      let pageCount = 1

      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2

      while (heightLeft > 0) {
        pdf.addPage()
        pageCount++
        position = margin - (pageHeight - margin * 2) * (pageCount - 1)
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
        heightLeft -= pageHeight - margin * 2
      }
    }
    window.open(pdf.output('bloburl'), '_blank')
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({ type: 'negative', message: 'Failed to generate PDF', position: 'top' })
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 8.5in;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.assistance-form-container {
  margin-bottom: 15px;
}

.fund-source-display {
  border-left: 4px solid #ff9800;
}

.billing-summary {
  margin-top: 10px;
  border-left: 4px solid #ff9800;
}

.certification-report-container {
  width: 8.5in;
  min-height: 11in;
  font-family: Arial, sans-serif;
  background-color: white;
  color: black;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  letter-spacing: 0.5px;
}

.report-content {
  padding: 10mm;
  min-height: 11in;
  position: relative;
  display: flex;
  flex-direction: column;
  letter-spacing: 0.5px;
}

.header-container {
  border: 1px solid #000;
  padding: 10px;
  letter-spacing: 0.5px;
}

.header-table {
  width: 100%;
  border-collapse: collapse;
  letter-spacing: 0.5px;
}

.logo-cell {
  vertical-align: middle;
  padding: 5px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-container.right {
  justify-content: flex-end;
}

.logo {
  width: 60px;
  height: auto;
  margin-right: 10px;
  vertical-align: middle;
}

.logo-container.right .logo {
  margin-right: 0;
  margin-left: 10px;
}

.header-text {
  text-align: center;
  vertical-align: middle;
  font-size: 9pt;
  line-height: 1.3;
  padding: 5px;
  letter-spacing: 0.5px;
}

.header-office {
  font-size: 11pt;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.office-heading {
  text-align: center;
  letter-spacing: 0.5px;
}

.office-heading h3 {
  font-size: 15pt;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 0;
}

.patient-info {
  margin-bottom: 25px;
  border: 1px solid #000;
  padding: 7px;
  letter-spacing: 0.5px;
}

.info-section-title {
  font-size: 11pt;
  font-weight: bold;
  color: #2c3e50;
  letter-spacing: 0.5px;
  margin-top: 10px;
}

.info-section-title:first-child {
  margin-top: 0;
}

.patient-info p {
  margin: 6px 0;
  font-size: 10pt;
  letter-spacing: 0.5px;
}

.patient-info strong {
  font-weight: bold;
  margin-right: 5px;
  letter-spacing: 0.5px;
}

.table-container {
  margin-bottom: 30px;
  overflow-x: auto;
  letter-spacing: 0.5px;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  letter-spacing: 0.5px;
}

.billing-table th,
.billing-table td {
  border: 1px solid #000;
  padding: 3px 12px;
  letter-spacing: 0.5px;
}

.billing-table th {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.5px;
}

.total-row {
  border-top: 1px solid #000;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.total-row td {
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-weight: bold;
  background-color: #f0f0f0;
  letter-spacing: 0.5px;
}

.assistance-row td {
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-weight: bold;
  background-color: #fff3e0;
  color: #ff9800;
  letter-spacing: 0.5px;
}

.grand-total-row td {
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  font-weight: bold;
  background-color: #e3f2fd;
  color: #1976d2;
  letter-spacing: 0.5px;
  font-size: 10pt;
}

.footer {
  margin-top: auto;
  text-align: left;
  padding-top: 40px;
  letter-spacing: 0.5px;
}

.signature-line {
  font-size: 10pt;
  margin-bottom: 5px;
  letter-spacing: 0.5px;
}

.preparer-name {
  font-weight: bold;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
  display: inline-block;
  min-width: 200px;
  text-align: center;
  letter-spacing: 0.5px;
}

.certification-report-container * {
  letter-spacing: 0.5px !important;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media print {
  .certification-report-container {
    box-shadow: none;
  }

  .certification-report-container * {
    letter-spacing: 0.5px !important;
  }

  .billing-table th,
  .billing-table td {
    border: 1px solid #000 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    letter-spacing: 0.5px !important;
  }

  .med-row td {
    background-color: #f7f7f7 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    letter-spacing: 0.5px !important;
  }

  .billing-table th {
    background-color: #f0f0f0 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    letter-spacing: 0.5px !important;
  }

  .assistance-row td {
    background-color: #fff3e0 !important;
    color: #ff9800 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    letter-spacing: 0.5px !important;
  }

  .grand-total-row td {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    letter-spacing: 0.5px !important;
  }

  .header-section,
  .q-btn {
    display: none !important;
  }

  body * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
