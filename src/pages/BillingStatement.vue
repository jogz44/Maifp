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
            color="green-9"
            label="Complete"
            icon="save"
            class="q-mr-sm"
            :loading="completing"
            :disable="completing"
            @click="showConfirmDialog = true"
          />
          <q-btn color="secondary" label="Print PDF" icon="picture_as_pdf" @click="handlePrint" />
        </div>
      </div>

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
            <div class="row">
              <div class="col-6">
                <p>
                  <strong>Date of Transaction:</strong> {{ formatDate(patient.transaction_date) }}
                </p>
                <p><strong>Surname:</strong> {{ patient.lastname }}</p>
                <p><strong>First Name:</strong> {{ patient.firstname }}</p>
                <p><strong>Middle Name:</strong> {{ patient.middlename }}</p>
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
                <!-- Laboratories -->
                <tr v-for="lab in patient.laboratories" :key="'lab-' + lab.id">
                  <td>{{ lab.laboratory_type }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(lab.amount) }}</td>
                </tr>
                <!-- Medicine -->
                <tr v-for="med in patient.medication" :key="'med-' + med.id" class="med-row">
                  <td>{{ med.item_description }}</td>
                  <td class="text-left">{{ med.quantity }}</td>
                  <td class="text-left">{{ med.unit }}</td>
                  <td class="text-right">{{ formatAmount(med.amount) }}</td>
                  <td class="text-right">{{ formatAmount(med.total) }}</td>
                </tr>
                <!-- Total -->
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.total_billing) }}</strong>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>PWD/Senior Discount (20%)</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.discount) }}</strong>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Grand Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.final_billing) }}</strong>
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
import { useRouter } from 'vue-router'
import { useQuasar, LocalStorage } from 'quasar'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = usePatientStore()
const router = useRouter()
const $q = useQuasar()
const currentUser = ref(null)

const loading = ref(true)
const error = ref(null)
const completing = ref(false)
const showConfirmDialog = ref(false)
const patient = ref({
  firstname: '',
  middlename: '',
  lastname: '',
  age: '',
  gender: '',
  birthdate: '',
  address: {},
  contact_number: '',
  transaction_date: '',
  consultation_amount: 0,
  laboratories: [],
  medication: [],
  total_billing: 0,
  discount: 0,
  final_billing: 0,
})

// Safely get the current user data using Quasar's LocalStorage
try {
  currentUser.value = LocalStorage.getItem('user')
} catch (err) {
  console.error('Error retrieving user data:', err)
}

// Create a computed property for the preparer's name
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
    } else {
      error.value = 'No billing data found'
    }
  } catch {
    error.value = 'Failed to load billing data'
  } finally {
    loading.value = false
  }
})

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

async function completeTransaction() {
  if (!store.transaction_id) {
    $q.notify({ type: 'negative', message: 'Transaction ID not found', position: 'top' })
    return
  }
  completing.value = true
  try {
    const result = await store.updateTransactionStatus(store.transaction_id, 'Complete')
    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Transaction completed successfully!',
        position: 'top',
      })
      setTimeout(() => router.push('/billing'), 1500)
    } else {
      throw new Error('Failed to update transaction status')
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to complete transaction. Please try again.',
      position: 'top',
    })
  } finally {
    completing.value = false
    showConfirmDialog.value = false
  }
}

async function handlePrint() {
  const element = document.querySelector('.certification-report-container')
  if (!element) {
    $q.notify({ type: 'negative', message: 'No report found to export', position: 'top' })
    return
  }

  try {
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pageWidth
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    let position = 0
    if (pdfHeight > pageHeight) {
      let heightLeft = pdfHeight
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
        if (heightLeft > 0) {
          position = -(pdfHeight - heightLeft)
          pdf.addPage()
        }
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    }

    const pdfBlob = pdf.output('bloburl')
    window.open(pdfBlob, '_blank')
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
}

.report-content {
  padding: 0.2in 0.5in 0.5in 0.5in;
  min-height: 11in;
  position: relative;
  display: flex;
  flex-direction: column;
}

.header-container {
  margin-bottom: 20px;
  border: 1px solid #000;
  padding: 10px;
}

.header-table {
  width: 100%;
  border-collapse: collapse;
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
}

.header-office {
  font-size: 11pt;
  font-weight: bold;
}

.office-heading {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.office-heading h3 {
  font-size: 18pt;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 5px 0;
}

.patient-info {
  margin-bottom: 25px;
  border: 1px solid #000;
  padding: 15px;
  border-radius: 4px;
}

.patient-info p {
  margin: 6px 0;
  font-size: 10pt;
}

.patient-info strong {
  font-weight: bold;
  margin-right: 5px;
}

.table-container {
  margin-bottom: 30px;
  overflow-x: auto;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
}

.billing-table th,
.billing-table td {
  border: 1px solid #000;
  padding: 8px 12px;
}

.billing-table th {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
}

.total-row {
  border-top: 2px solid #000;
  font-weight: bold;
}

.total-row td {
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  font-weight: bold;
  background-color: #f0f0f0;
}

.footer {
  margin-top: auto;
  text-align: left;
  padding-top: 40px;
}

.signature-line {
  font-size: 10pt;
  margin-bottom: 5px;
}

.preparer-name {
  font-weight: bold;
  border-bottom: 1px solid #000;
  padding-bottom: 2px;
  display: inline-block;
  min-width: 200px;
  text-align: center;
}

@media print {
  .certification-report-container {
    box-shadow: none;
  }

  .billing-table th,
  .billing-table td {
    border: 1px solid #000 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .med-row td {
    background-color: #f7f7f7 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .billing-table th {
    background-color: #f0f0f0 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
