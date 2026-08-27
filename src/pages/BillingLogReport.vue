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
          <q-btn color="secondary" label="Print PDF" icon="picture_as_pdf" @click="handlePrint" />
        </div>
      </div>

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
                  <strong>Date of Transaction:</strong> {{ formatDate(patient.transaction_date) }}
                </p>
                <p><strong>Surname:</strong> {{ patient.lastname }}</p>
                <p><strong>First Name:</strong> {{ patient.firstname }}</p>
                <p><strong>Middle Name:</strong> {{ patient.middlename || 'N/A' }}</p>
              </div>
              <div class="col-6">
                <p><strong>Gender:</strong> {{ patient.gender }}</p>
                <p><strong>Age:</strong> {{ patient.age }}</p>
                <p><strong>Birthdate:</strong> {{ patient.birthdate }}</p>
                <p>
                  <strong>Address:</strong>
                  {{ patient.address?.street }}, {{ patient.address?.purok }},
                  {{ patient.address?.barangay }}
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
                <tr v-if="parseAmount(patient.consultation_amount) > 0">
                  <td>Consultation</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(patient.consultation_amount) }}</td>
                </tr>

                <!-- Radiology -->
                <tr v-for="rad in patient.radiologies_details" :key="'rad-' + rad.id">
                  <td>{{ rad.item_description }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(rad.total_amount) }}</td>
                </tr>

                <!-- Exam -->
                <tr v-for="exam in patient.examination_details" :key="'exam-' + exam.id">
                  <td>{{ exam.item_description }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(exam.total_amount) }}</td>
                </tr>

                <!-- Mammo -->
                <tr v-for="mammo in patient.mammogram_details" :key="'mammo-' + mammo.id">
                  <td>{{ mammo.procedure }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(mammo.total_amount) }}</td>
                </tr>

                <!-- Ultra -->
                <tr v-for="ultra in patient.ultrasound_details" :key="'ultra-' + ultra.id">
                  <td>{{ ultra.body_parts }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(ultra.total_amount) }}</td>
                </tr>

                <!-- Medicine -->
                <tr v-for="med in patient.medication" :key="'med-' + med.id" class="med-row">
                  <td>{{ med.item_description }}</td>
                  <td class="text-left">{{ med.quantity }}</td>
                  <td class="text-left">{{ med.unit }}</td>
                  <td class="text-right">{{ formatAmount(med.amount) }}</td>
                  <td class="text-right">{{ formatAmount(med.total) }}</td>
                </tr>

                <!-- Subtotal Row -->
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.total_billing) }}</strong>
                  </td>
                </tr>

                <!-- Discount Row -->
                <tr class="total-row" v-if="parseAmount(patient.discount) > 0">
                  <td colspan="4" class="text-right">
                    <strong>PWD/Senior Discount (20%)</strong>
                  </td>
                  <td class="text-right">
                    <strong>-{{ formatAmount(patient.discount) }}</strong>
                  </td>
                </tr>

                <!-- Subtotal after discount -->
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Subtotal</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.final_billing) }}</strong>
                  </td>
                </tr>

                <!-- Financial Assistance Rows - Show non-MAIFIP assistance only -->
                <template v-if="hasNonMAIFIPAssistance">
                  <tr
                    v-for="(fund, index) in nonMAIFIPAssistanceFunds"
                    :key="'assistance-' + index"
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

                <!-- Grand Total Row -->
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
import { ref, onMounted, computed } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useQuasar, LocalStorage } from 'quasar'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = usePatientStore()
const $q = useQuasar()
const currentUser = ref(null)

const loading = ref(true)
const error = ref(null)

const patient = ref({
  id: null,
  firstname: '',
  middlename: '',
  lastname: '',
  age: '',
  gender: '',
  birthdate: '',
  address: {},
  contact_number: '',
  transaction_date: '',
  representative: {},
  consultation_amount: 0,
  radiologies_details: [],
  examination_details: [],
  mammogram_details: [],
  ultrasound_details: [],
  medication: [],
  total_billing: 0,
  discount: 0,
  final_billing: 0,
  assistance: null,
})

try {
  currentUser.value = LocalStorage.getItem('user')
} catch (err) {
  console.error('Error retrieving user data:', err)
}

/**
 * Get preparer name from current user
 */
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

/**
 * Check if assistance exists
 */
const hasAssistance = computed(() => {
  return (
    patient.value.assistance &&
    patient.value.assistance.funds &&
    patient.value.assistance.funds.length > 0
  )
})

/**
 * Filter assistance funds to exclude MAIFIP
 * MAIFIP funds are handled separately in reports
 */
const nonMAIFIPAssistanceFunds = computed(() => {
  if (!hasAssistance.value) return []

  return patient.value.assistance.funds.filter(
    (fund) => fund.fund_source !== 'MAIFIP-LGU' && fund.fund_source !== 'MAIFIP-Congressman',
  )
})

/**
 * Check if there are non-MAIFIP assistance funds
 */
const hasNonMAIFIPAssistance = computed(() => {
  return nonMAIFIPAssistanceFunds.value.length > 0
})

/**
 * Calculate total non-MAIFIP assistance amount
 */
const totalNonMAIFIPAssistance = computed(() => {
  return nonMAIFIPAssistanceFunds.value.reduce((total, fund) => {
    return total + parseAmount(fund.fund_amount)
  }, 0)
})

/**
 * Calculate final amount due (excluding MAIFIP)
 * MAIFIP is handled separately in other reports
 */
const finalAmountDue = computed(() => {
  const originalAmount = parseAmount(patient.value.final_billing)
  const assistanceAmount = totalNonMAIFIPAssistance.value

  return Math.max(0, originalAmount - assistanceAmount)
})

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
      patient.value = data
      console.log('Billing data loaded:', {
        patientName: `${data.firstname} ${data.lastname}`,
        transactionDate: data.transaction_date,
        totalBilling: data.total_billing,
        finalBilling: data.final_billing,
        assistanceFunds: data.assistance?.funds || [],
      })
    } else {
      error.value = 'No billing data found'
    }
  } catch (err) {
    console.error('Error loading billing details:', err)
    error.value = 'Failed to load billing data'
  } finally {
    loading.value = false
  }
})

/**
 * Parse amount string to number
 */
function parseAmount(amount) {
  if (typeof amount === 'number') return amount
  if (!amount) return 0
  return parseFloat(amount) || 0
}

/**
 * Format amount as currency
 */
function formatAmount(amount) {
  const num = parseAmount(amount)
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

/**
 * Format date string
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return 'N/A'
  }
}

/**
 * Generate and download PDF
 */
async function handlePrint() {
  const element = document.querySelector('.certification-report-container')
  if (!element) {
    $q.notify({ type: 'negative', message: 'No report found to export', position: 'top' })
    return
  }

  try {
    const allElements = element.querySelectorAll('*')
    const originalStyles = []

    // Save original styles
    allElements.forEach((el, index) => {
      originalStyles[index] = {
        letterSpacing: el.style.letterSpacing,
        textRendering: el.style.textRendering,
        webkitFontSmoothing: el.style.webkitFontSmoothing,
        mozOsxFontSmoothing: el.style.mozOsxFontSmoothing,
      }

      // Apply optimal rendering styles
      el.style.letterSpacing = '0.5px'
      el.style.textRendering = 'optimizeLegibility'
      el.style.webkitFontSmoothing = 'antialiased'
      el.style.mozOsxFontSmoothing = 'grayscale'
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Generate canvas
    const canvas = await html2canvas(element, {
      scale: 5,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    })

    // Restore original styles
    allElements.forEach((el, index) => {
      if (originalStyles[index]) {
        el.style.letterSpacing = originalStyles[index].letterSpacing
        el.style.textRendering = originalStyles[index].textRendering
        el.style.webkitFontSmoothing = originalStyles[index].webkitFontSmoothing
        el.style.mozOsxFontSmoothing = originalStyles[index].mozOsxFontSmoothing
      }
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)

    // Create PDF
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

    // Add images to PDF
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

    // Open PDF in new window
    window.open(pdf.output('bloburl'), '_blank')

    $q.notify({
      type: 'positive',
      message: 'PDF generated successfully',
      position: 'top',
    })
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
  margin-bottom: 10px;
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
  margin-bottom: 15px;
}

.office-heading h3 {
  font-size: 15pt;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 0;
}

/* Patient info styles */
.patient-info {
  margin-bottom: 15px;
  border: 1px solid #000;
  padding: 7px;
  letter-spacing: 0.5px;
}

.info-section-title {
  font-size: 11pt;
  font-weight: bold;
  color: #2c3e50;
  letter-spacing: 0.5px;
  margin: 5px 0;
}

.patient-info p {
  margin: 5px 0;
  font-size: 9pt;
  letter-spacing: 0.5px;
}

.patient-info strong {
  font-weight: bold;
  margin-right: 5px;
  letter-spacing: 0.5px;
}

/* Table styles */
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
  padding: 4px 8px;
  letter-spacing: 0.5px;
}

.billing-table th {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.5px;
}

.billing-table td {
  text-align: left;
}

.billing-table td.text-left {
  text-align: left;
}

.billing-table td.text-right {
  text-align: right;
}

.med-row td {
  background-color: #f7f7f7;
}

.total-row {
  background-color: #f0f0f0;
  font-weight: bold;
}

.total-row td {
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-weight: bold;
  background-color: #f0f0f0;
  letter-spacing: 0.5px;
}

.assistance-row {
  background-color: #fff3e0;
}

.assistance-row td {
  border: 1px solid #000;
  font-weight: bold;
  background-color: #fff3e0;
  color: #ff9800;
  letter-spacing: 0.5px;
}

.grand-total-row {
  background-color: #e3f2fd;
}

.grand-total-row td {
  border: 1px solid #000;
  font-weight: bold;
  background-color: #e3f2fd;
  color: #1976d2;
  letter-spacing: 0.5px;
  font-size: 10pt;
}

/* Footer styles */
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

/* Global text spacing for better PDF rendering */
.certification-report-container * {
  letter-spacing: 0.5px !important;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Print-specific styles */
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
