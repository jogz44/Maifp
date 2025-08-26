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
          <ReportHeader :officeName="officeName" />
          <div class="office-heading">
            <h3>Statement of Account</h3>
          </div>
          <div class="patient-info q-mb-md">
            <h4>Patient Information</h4>
            <div class="row">
              <div class="col-6">
                <p><strong>Patient Name:</strong> {{ patient.firstname }} {{ patient.lastname }}</p>
                <p><strong>Age:</strong> {{ patient.age }}</p>
                <p><strong>Gender:</strong> {{ patient.gender }}</p>
              </div>
              <div class="col-6">
                <p>
                  <strong>Address:</strong>
                  {{ patient.address?.street }}, {{ patient.address?.purok }},
                  {{ patient.address?.barangay }}
                </p>
                <p><strong>Contact:</strong> {{ patient.contact_number }}</p>
                <p>
                  <strong>Date of Transaction:</strong> {{ formatDate(patient.transaction_date) }}
                </p>
              </div>
            </div>
          </div>

          <q-markup-table dense bordered class="billing-table">
            <thead>
              <tr>
                <th class="text-left">Qty</th>
                <th class="text-left">Unit</th>
                <th class="text-left">Particulars</th>
                <th class="text-right">Amount (₱)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Consultation -->
              <tr v-if="parseAmount(patient.consultation_amount) > 0">
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td>Consultation</td>
                <td class="text-right">{{ formatAmount(patient.consultation_amount) }}</td>
              </tr>
              <!-- Laboratories -->
              <tr v-for="lab in patient.laboratories" :key="'lab-' + lab.id">
                <td class="text-left"></td>
                <td class="text-left"></td>
                <td>{{ lab.laboratory_type }}</td>
                <td class="text-right">{{ formatAmount(lab.amount) }}</td>
              </tr>
              <!-- Medicine -->
              <tr
                v-for="med in patient.medication"
                :key="'med-' + med.id"
                :class="{ 'med-row': true }"
              >
                <td class="text-left">{{ med.quantity }}</td>
                <td class="text-left">{{ med.unit }}</td>
                <td>{{ med.item_description }}</td>
                <td class="text-right">{{ formatAmount(med.amount) }}</td>
              </tr>
              <!-- Total -->
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>Total</strong></td>
                <td class="text-right">
                  <strong>{{ formatAmount(patient.total_billing) }}</strong>
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <div class="footer-spacer"></div>
          <div class="footer">
            <ReportFooter :phone="footerPhone" :email="footerEmail" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import ReportHeader from 'src/components/ReportHeader.vue'
import ReportFooter from 'src/components/ReportFooter.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = usePatientStore()
const router = useRouter()
const $q = useQuasar()

const loading = ref(true)
const error = ref(null)
const completing = ref(false)
const showConfirmDialog = ref(false)
const patient = ref({
  firstname: '',
  lastname: '',
  age: '',
  gender: '',
  address: {},
  contact_number: '',
  transaction_date: '',
  consultation_amount: 0,
  laboratories: [],
  medication: [],
  total_billing: 0,
})

const officeName = 'CITY HEALTH OFFICE'
const footerPhone = '(084) 217-3710'
const footerEmail = 'tagumcho@gmail.com'

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
.med-row td {
  background: #f7f7f7;
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
</style>
