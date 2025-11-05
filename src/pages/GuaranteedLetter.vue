<template>
  <q-page class="q-pa-md flex flex-center bg-grey-2">
    <div v-if="loading" class="text-center">
      <q-spinner size="3em" color="primary" />
      <div class="q-mt-sm">Loading patient data...</div>
    </div>
    <div v-else class="page-container">
      <!-- HEADER with Buttons -->
      <div class="header-section">
        <div class="header-left">
          <q-btn flat round color="primary" icon="arrow_back" @click="handleBack" />
        </div>
        <div class="header-actions">
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

      <!-- REPORT CONTENT -->
      <div id="report-container" class="certification-report-container">
        <div class="report-content">
          <ReportHeader :officeName="officeName" />
          <div class="certification-title">
            <h1>GUARANTEED LETTER</h1>
          </div>
          <div class="certification-body">
            <p class="concern-text">TO WHOM IT MAY CONCERN:</p>
            <p class="main-text">
              This is to certify that
              <span class="bold">
                {{ gender === 'male' ? 'Mr.' : 'Ms.' }} {{ firstname }} {{ lastname }}
              </span>
              is a beneficiary of the
              <span class="bold">
                Medical Assistance for Indigent and Incapacitated Patients (MAIFIP) </span
              >. Pursuant to {{ gender === 'male' ? 'his' : 'her' }} request for assistance, the
              following amounts have been allocated and guaranteed to cover
              {{ gender === 'male' ? 'his' : 'her' }} necessary medical expenses, subject to the
              rules and guidelines of the program:
            </p>

            <!-- Display Fund Sources and Amounts - Only MAIFIP -->
            <div v-if="displayFunds.length > 0" class="funds-section">
              <div v-for="fund in displayFunds" :key="fund.id" class="fund-item">
                <p>
                  <strong>{{ fund.fund_source }}:</strong> ₱{{ formatAmount(fund.fund_amount) }}
                </p>
              </div>
              <div class="fund-total">
                <p>Total: ₱{{ formatAmount(totalMAIFIPAmount) }}</p>
              </div>
            </div>

            <!-- <p class="closing-text">
              Issued this {{ getCurrentDate() }} at the City Government Center, JV Ayala Avenue,
              Apokon, Tagum City, Davao del Norte.
            </p> -->

            <!-- Signature Section -->
            <div class="signature-container">
              <!-- LGU Signatory -->
              <div v-if="hasLGUFund" class="signature-section">
                <div class="signature-name">REY T. UY</div>
                <div class="signature-line"></div>
                <div class="signature-title">CITY MAYOR</div>
              </div>

              <!-- Congressman Signatory -->
              <div v-if="hasCongressmanFund" class="signature-section">
                <div class="signature-name">CLIFORD M. MILLAN</div>
                <div class="signature-line"></div>
                <div class="signature-title">CONGRESSMAN</div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-spacer"></div>
        <div class="footer">
          <ReportFooter :phone="footerPhone" :email="footerEmail" />
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
              <strong>Patient:</strong> {{ firstname }} {{ lastname }}<br />
              <strong>Amount:</strong> ₱{{ formatAmount(total_billing) }}
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
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <q-avatar icon="error" color="negative" text-color="white" />
            <span class="q-ml-sm text-h6">Error</span>
          </q-card-section>
          <q-card-section>
            <div class="text-body1">{{ errorMessage[0] }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Back" color="primary" @click="handleBack" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ReportHeader from 'src/components/ReportHeader.vue'
import ReportFooter from 'src/components/ReportFooter.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const store = usePatientStore()
const $q = useQuasar()
const router = useRouter()

const loading = ref(true)
const submitting = ref(false)
const showConfirmDialog = ref(false)
const showErrorDialog = ref(false)
const errorMessage = ref([])

const transaction_id = ref(null)
const transaction_type = ref('')
const firstname = ref('')
const lastname = ref('')
const age = ref(0)
const gender = ref('')
const contact_number = ref('')
const address = ref({ street: '', purok: '', barangay: '' })
const transaction_date = ref('')
const consultation_amount = ref(0)
const laboratory_total = ref(0)
const medication_total = ref(0)
const total_billing = ref(0)
const laboratories = ref([])
const issueDate = ref(new Date())
const assistance = ref(null)

const officeName = 'CITY HEALTH OFFICE'
const footerPhone = '(084) 217-3710'
const footerEmail = 'tagumcho@gmail.com'

/**
 * Get display funds from assistance data
 * Only show funds with fund_source containing "MAIFIP-LGU" or "MAIFIP-Congressman"
 */
const displayFunds = computed(() => {
  if (!assistance.value || !assistance.value.funds) {
    return []
  }

  return assistance.value.funds
    .filter((fund) => {
      const source = fund.fund_source ? fund.fund_source.toUpperCase() : ''
      return source.includes('MAIFIP-LGU') || source.includes('MAIFIP-CONGRESSMAN')
    })
    .map((fund) => ({
      id: fund.id,
      fund_source: fund.fund_source,
      fund_amount: fund.fund_amount,
    }))
})

/**
 * Calculate total MAIFIP amount
 */
const totalMAIFIPAmount = computed(() => {
  return displayFunds.value.reduce((total, fund) => {
    return total + parseFloat(fund.fund_amount)
  }, 0)
})

/**
 * Check if LGU fund exists
 */
const hasLGUFund = computed(() => {
  return displayFunds.value.some((f) => f.fund_source.toUpperCase().includes('MAIFIP-LGU'))
})

/**
 * Check if Congressman fund exists
 */
const hasCongressmanFund = computed(() => {
  return displayFunds.value.some((f) => f.fund_source.toUpperCase().includes('MAIFIP-CONGRESSMAN'))
})

/**
 * Get current date in proper format
 */
// function getCurrentDate() {
//   const options = { year: 'numeric', month: 'long', day: 'numeric' }
//   return new Date().toLocaleDateString('en-PH', options)
// }

onMounted(async () => {
  if (!store.transaction_id) {
    errorMessage.value = ['No transaction selected. Please select a patient from the billing list.']
    showErrorDialog.value = true
    loading.value = false
    return
  }
  try {
    const data = await store.getBillingDetails(store.transaction_id)
    if (!data) {
      errorMessage.value = ['No billing data found']
      showErrorDialog.value = true
      loading.value = false
      return
    }
    transaction_id.value = data.transaction_id
    transaction_type.value = data.transaction_type
    firstname.value = data.firstname
    lastname.value = data.lastname
    age.value = data.age
    gender.value = data.gender
    contact_number.value = data.contact_number
    address.value = data.address
    transaction_date.value = data.transaction_date
    consultation_amount.value = data.consultation_amount
    laboratory_total.value = data.laboratory_total
    medication_total.value = data.medication_total
    total_billing.value = data.total_billing
    laboratories.value = data.laboratories || []
    assistance.value = data.assistance || null
    issueDate.value = new Date()

    console.log('✅ Displayed MAIFIP Funds:', displayFunds.value)
  } catch {
    errorMessage.value = ['Failed to load billing data']
    showErrorDialog.value = true
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  submitting.value = true
  try {
    const payload = {
      patient_id: store.patient_id,
      transaction_id: transaction_id.value,
      laboratory_total: laboratory_total.value,
      medication_total: medication_total.value,
      total_billing: total_billing.value,
      consultation_amount: consultation_amount.value,
    }

    const response = await store.addGL(payload)
    const result = response?.data ?? response

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Funded successfully!',
        position: 'top',
      })
      setTimeout(() => router.push('/billing'), 1500)
    } else {
      errorMessage.value = [
        result?.message || 'Not enough funds. Please add more funds before creating this billing.',
      ]
      showErrorDialog.value = true
      console.error('API Error:', errorMessage.value[0])
    }
  } catch (error) {
    let msg = 'An error occurred while funding the guaranteed letter.'

    if (error.response?.data) {
      const data = error.response.data
      if (data.message) {
        msg = data.message
      } else if (data.errors) {
        msg = Array.isArray(data.errors) ? data.errors[0] : JSON.stringify(data.errors)
      }
    } else if (error.message) {
      msg = error.message
    }

    errorMessage.value = [msg]
    showErrorDialog.value = true
    console.error('Catch Error:', errorMessage.value[0])
  } finally {
    submitting.value = false
    showConfirmDialog.value = false
  }
}

function handleBack() {
  router.back()
}

async function handlePrint() {
  const element = document.getElementById('report-container')
  if (!element) return

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'letter')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

  const pdfBlob = pdf.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}

// --- Format Helpers ---
function formatAmount(amount) {
  return parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })
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
  padding: 0.75in 1in 0 1in;
}
.certification-title {
  text-align: center;
  margin-bottom: 30px;
}
.certification-title h1 {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 4px;
}
.certification-body {
  text-align: justify;
}
.concern-text {
  margin-bottom: 20px;
}
.main-text {
  margin-bottom: 15px;
  line-height: 1.8;
}
.funds-section {
  margin: 20px 0;
}
.fund-item {
  margin: 8px 0;
  padding-left: 20px;
}
.fund-item p {
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
}
.fund-total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ccc;
  padding-left: 20px;
}
.fund-total p {
  margin: 0;
  font-weight: bold;
  font-size: 14px;
}
.closing-text {
  margin: 20px 0;
  line-height: 1.8;
}
.bold {
  font-weight: bold;
}
.signature-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  gap: 40px;
  padding-right: 20px;
}
.signature-section {
  width: 2.5in;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
}
.signature-line {
  width: 100%;
  border-bottom: 1px solid black;
  margin-bottom: 8px;
}
.signature-name {
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  font-size: 11px;
  order: 2;
}
.signature-title {
  text-align: center;
  font-size: 10px;
  text-transform: uppercase;
  order: 3;
}
.signature-line {
  order: 1;
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
