<template>
  <q-page class="q-pa-md flex flex-center bg-grey-2">
    <div v-if="loading" class="text-center">
      <q-spinner size="3em" color="primary" />
      <div class="q-mt-sm">Loading patient data...</div>
    </div>
    <div v-else-if="error" class="text-center text-negative">
      <q-icon name="error" size="3em" />
      <div class="q-mt-sm">{{ error }}</div>
      <q-btn color="primary" class="q-mt-md" label="Back" @click="handleBack" />
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
          <q-btn color="secondary" label="Print" icon="print" @click="handlePrint" />
        </div>
      </div>
      <!-- REPORT CONTENT -->
      <div class="certification-report-container">
        <div class="report-content">
          <ReportHeader :officeName="officeName" />
          <div class="certification-title">
            <h1>GUARANTEED LETTER</h1>
          </div>
          <div class="certification-body">
            <p class="concern-text">TO WHOM IT MAY CONCERN:</p>
            <p class="main-text">
              This is to certify that
              <span class="bold"
                >{{ gender === 'male' ? 'MR.' : 'MS.' }} {{ firstname }} {{ lastname }}</span
              >
              is a beneficiary of the
              <span class="bold"
                >Medical Assistance from the Indigenous and Farmers Program (MAIFIP)</span
              >. Pursuant to {{ gender === 'male' ? 'his' : 'her' }} request for assistance, the
              amount of
              <span class="bold"
                >{{ formatAmountInWords(total_billing) }} (₱{{ formatAmount(total_billing) }})</span
              >
              has been allocated and guaranteed to cover
              {{ gender === 'male' ? 'his' : 'her' }} necessary medical expenses, subject to the
              rules and guidelines of the program.
            </p>
            <ol class="certification-list">
              <li>
                That the amount stated herein is guaranteed under the MAIFIP Medical Assistance
                Program;
              </li>
              <li>
                That the assistance shall be applied solely for the medical expenses of the
                beneficiary;
              </li>
              <li>
                That disbursement of said amount shall follow the existing financial and auditing
                regulations;
              </li>
              <li>
                That this certification is issued for the purpose of confirming the beneficiary's
                entitlement to the said assistance.
              </li>
            </ol>
            <p class="issuance-text">
              Issued this {{ formatDayWithSuffix(issueDate) }} day of {{ formatMonth(issueDate) }},
              {{ formatYear(issueDate) }} at the City Government Center, JV Ayala Avenue, Apokon,
              Tagum City, Davao del Norte.
            </p>
            <div class="signature-container">
              <div class="signature-section">
                <div class="signature-name">REY T. UY</div>
                <div class="signature-line"></div>
                <div class="signature-title">CITY MAYOR</div>
              </div>
            </div>
          </div>
        </div>
        <ReportFooter :phone="footerPhone" :email="footerEmail" />
      </div>
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useRouter } from 'vue-router'
import ReportHeader from 'src/components/ReportHeader.vue'
import ReportFooter from 'src/components/ReportFooter.vue'

const store = usePatientStore()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const submitting = ref(false)
const showConfirmDialog = ref(false)

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

const total_billing = ref(0)
const laboratories = ref([])
const issueDate = ref(new Date())

const officeName = 'CITY HEALTH OFFICE'
const footerPhone = '(084) 217-3710'
const footerEmail = 'tagumcho@gmail.com'

onMounted(async () => {
  if (!store.transaction_id) {
    error.value = 'No transaction selected. Please select a patient from the billing list.'
    loading.value = false
    return
  }
  try {
    const data = await store.getBillingDetails(store.transaction_id)
    if (!data) {
      error.value = 'No billing data found'
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
    total_billing.value = data.total_billing
    laboratories.value = data.laboratories || []
    issueDate.value = new Date()
  } catch {
    error.value = 'Failed to load billing data'
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
      total_billing: total_billing.value,
      consultation_amount: consultation_amount.value,
    }
    const result = await store.addGL(payload)
    if (result) {
      showConfirmDialog.value = false
      window.$q.notify({
        type: 'positive',
        message: 'Guaranteed Letter successfully funded!',
        position: 'top',
        timeout: 3000,
      })
      router.push('/gl')
    } else {
      window.$q.notify({
        type: 'negative',
        message: 'Failed to fund guaranteed letter. Please try again.',
        position: 'top',
        timeout: 3000,
      })
    }
  } catch {
    window.$q.notify({
      type: 'negative',
      message: 'An error occurred while funding the guaranteed letter.',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    submitting.value = false
  }
}

function handleBack() {
  router.back()
}
function handlePrint() {
  window.print()
}

function formatDayWithSuffix(date) {
  const day = date.getDate()
  if (day > 3 && day < 21) return day + 'th'
  switch (day % 10) {
    case 1:
      return day + 'st'
    case 2:
      return day + 'nd'
    case 3:
      return day + 'rd'
    default:
      return day + 'th'
  }
}
function formatMonth(date) {
  return date.toLocaleString('en-US', { month: 'long' })
}
function formatYear(date) {
  return date.getFullYear()
}
function formatAmount(amount) {
  return parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}
function formatAmountInWords(amount) {
  const num = parseFloat(amount)
  if (num === 0) return 'ZERO PESOS'
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE']
  const teens = [
    'TEN',
    'ELEVEN',
    'TWELVE',
    'THIRTEEN',
    'FOURTEEN',
    'FIFTEEN',
    'SIXTEEN',
    'SEVENTEEN',
    'EIGHTEEN',
    'NINETEEN',
  ]
  const tens = [
    '',
    '',
    'TWENTY',
    'THIRTY',
    'FORTY',
    'FIFTY',
    'SIXTY',
    'SEVENTY',
    'EIGHTY',
    'NINETY',
  ]
  const convertHundreds = (n) => {
    let result = ''
    const hundreds = Math.floor(n / 100)
    const remainder = n % 100
    if (hundreds > 0) {
      result += ones[hundreds] + ' HUNDRED'
      if (remainder > 0) result += ' '
    }
    if (remainder >= 20) {
      const tensDigit = Math.floor(remainder / 10)
      const onesDigit = remainder % 10
      result += tens[tensDigit]
      if (onesDigit > 0) result += '-' + ones[onesDigit]
    } else if (remainder >= 10) {
      result += teens[remainder - 10]
    } else if (remainder > 0) {
      result += ones[remainder]
    }
    return result
  }
  let result = ''
  const millions = Math.floor(num / 1000000)
  if (millions > 0) {
    result += convertHundreds(millions) + ' MILLION'
    if (num % 1000000 > 0) result += ' '
  }
  const thousands = Math.floor((num % 1000000) / 1000)
  if (thousands > 0) {
    result += convertHundreds(thousands) + ' THOUSAND'
    if (num % 1000 > 0) result += ' '
  }
  const hundreds = num % 1000
  if (hundreds > 0) {
    result += convertHundreds(hundreds)
  }
  return result.trim() + ' PESOS'
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
.certification-list {
  padding-left: 40px;
  margin-bottom: 30px;
  line-height: 1.8;
}
.certification-list li {
  margin-bottom: 15px;
  text-align: justify;
}
.issuance-text {
  margin-top: 15px;
  margin-bottom: 60px;
  line-height: 1.8;
}
.bold {
  font-weight: bold;
}
.signature-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 60px;
  margin-bottom: 60px;
}
.signature-section {
  width: 3in;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
}
.signature-line {
  width: 100%;
  border-bottom: 1px solid black;
  margin-bottom: 5px;
}
.signature-name {
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}
.signature-title {
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
}
</style>
