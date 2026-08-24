<template>
  <!-- Template remains the same as before -->
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
            v-if="grandTotalAfterExistingAssistance > 0"
            color="orange-9"
            label="MAIFIP"
            icon="volunteer_activism"
            class="q-mr-sm"
            :loading="processing"
            :disable="processing"
            @click="openAssistanceDialog"
          />

          <q-btn color="secondary" label="Print PDF" icon="picture_as_pdf" @click="handlePrint" />

          <q-btn
            v-if="hasMAIFIPAssistance"
            color="primary"
            label="Submit"
            icon="save"
            class="q-mr-sm"
            @click="showConfirmDialog = true"
            :loading="submitting"
          />
        </div>
      </div>

      <!-- Rest of dialogs remain the same -->
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
              <strong>Amount:</strong> {{ formatAmount(grandTotalAfterExistingAssistance) }}
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn
              flat
              label="Cancel"
              @click="showConfirmDialog = false"
              color="dark"
              :disable="submitting"
            />
            <q-btn
              flat
              label="Confirm"
              @click="handleSubmit"
              color="green-9"
              :loading="submitting"
              :disable="submitting"
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
        <q-card style="min-width: 750px">
          <q-card-section class="row items-center">
            <q-avatar icon="volunteer_activism" color="orange-9" text-color="white" />
            <span class="q-ml-sm text-h6">Apply MAIFIP</span>
            <q-space />
            <q-linear-progress
              v-if="fetchingGLNumber"
              indeterminate
              color="orange-9"
              class="q-mt-none"
              style="width: 200px"
            />
          </q-card-section>
          <q-card-section>
            <div class="assistance-table-container">
              <q-table
                :rows="assistanceForm.assistanceItems"
                :columns="assistanceColumns"
                row-key="id"
                flat
                bordered
                hide-pagination
                :rows-per-page-options="[0]"
                class="assistance-table"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="fundSource" :props="props">
                      <q-select
                        v-model="props.row.fundSource"
                        :options="getAvailableFundSources(props.rowIndex)"
                        dense
                        outlined
                        readonly
                        :rules="[(val) => !!val || 'Fund source is required']"
                        @update:model-value="onFundSourceChange"
                      />
                    </q-td>
                    <q-td key="glNumber" :props="props">
                      <q-input
                        v-model="props.row.glNumber"
                        label="GL Number"
                        dense
                        outlined
                        readonly
                        :rules="[(val) => !!val || 'GL number is required']"
                      />
                    </q-td>
                    <q-td key="amount" :props="props">
                      <q-input
                        :model-value="formatAmountInput(props.row.amount)"
                        @update:model-value="(val) => updateAssistanceAmount(props.rowIndex, val)"
                        type="text"
                        inputmode="decimal"
                        dense
                        outlined
                        prefix="₱"
                        placeholder="0.00"
                        :rules="[(val) => validateAssistanceAmount(val, props.rowIndex)]"
                      />
                    </q-td>
                    <q-td key="actions" :props="props" class="text-center">
                      <q-btn
                        v-if="props.rowIndex > 0"
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="removeAssistanceRow(props.rowIndex)"
                      />
                      <span v-else class="text-grey-5">Fixed</span>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>

              <div class="row justify-between q-mt-md items-center">
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Add Fund Source"
                  @click="addAssistanceRow"
                  :disable="
                    assistanceForm.assistanceItems.length >= 2 || calculateRemainingBalance() === 0
                  "
                />
                <div class="text-h6 text-weight-bold">
                  Total: {{ formatAmount(totalNewAssistanceAmount) }}
                </div>
              </div>
            </div>

            <div class="q-mt-md">
              <q-input
                v-model="assistanceForm.remarks"
                label="Remarks (Optional)"
                outlined
                dense
                type="textarea"
                rows="3"
              />
            </div>

            <div class="billing-summary q-pa-md bg-grey-1 rounded-borders q-mt-md">
              <div class="row justify-between q-mb-sm">
                <span>Grand Total (After Existing Assistance):</span>
                <span class="text-weight-bold">{{
                  formatAmount(grandTotalAfterExistingAssistance)
                }}</span>
              </div>
              <div class="row justify-between q-mb-md">
                <span>Total New Assistance:</span>
                <span class="text-weight-bold text-orange-9"
                  >-{{ formatAmount(totalNewAssistanceAmount) }}</span
                >
              </div>
              <q-separator class="q-my-sm" />
              <div class="row justify-between text-h6 q-mb-sm">
                <span class="text-weight-bold">Final Amount Due:</span>
                <span class="text-weight-bold text-primary">{{
                  formatAmount(calculateRemainingBalance())
                }}</span>
              </div>
              <div
                v-if="totalNewAssistanceAmount > grandTotalAfterExistingAssistance"
                class="text-negative q-mt-sm"
              >
                <q-icon name="warning" size="sm" />
                Warning: Total assistance exceeds the remaining amount!
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="grey"
              @click="cancelAssistance"
              :disable="processing || fetchingGLNumber"
            />
            <q-btn
              flat
              label="Apply Assistance"
              color="orange-9"
              @click="applyAssistance"
              :loading="processing"
              :disable="processing || fetchingGLNumber || !isAssistanceFormValid"
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
                <p>
                  <strong>First Name:</strong>
                  {{ billingData.firstname }}
                  <span
                    v-if="
                      patient.ext && !['N/A', 'NA'].includes(billingData.ext.trim().toUpperCase())
                    "
                  >
                    {{ billingData.ext }}
                  </span>
                </p>
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
                <!-- Financial Assistance Rows - Show existing assistance (NO DUPLICATION) -->
                <template v-if="hasExistingAssistance">
                  <tr
                    v-for="(fund, index) in assistanceFunds"
                    :key="'assistance-' + (fund.id || fund.fund_source || index)"
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
                <!-- Grand Total (After Existing Assistance) -->
                <tr class="grand-total-row">
                  <td colspan="4" class="text-right"><strong>Grand Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(grandTotalAfterExistingAssistance) }}</strong>
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

// ==================== CONSTANTS ====================
const MAIFIP_FUND_SOURCES = ['MAIFIP-LGU', 'MAIFIP-Congressman']

// ==================== STORE & UTILITIES ====================
const store = usePatientStore()
const assistanceStore = useAssistanceStore()
const $q = useQuasar()
const router = useRouter()

// ==================== REACTIVE STATE ====================
const loading = ref(true)
const error = ref(null)
const processing = ref(false)
const submitting = ref(false)
const showConfirmDialog = ref(false)
const showAssistanceDialog = ref(false)
const showErrorDialog = ref(false)
const errorMessage = ref([])
const currentUser = ref(null)
const maxGLNumber = ref('00000')
const fetchingGLNumber = ref(false)

// ==================== BILLING DATA ====================
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
  radiologies_details: [],
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
})

// ==================== ASSISTANCE FORM ====================
const assistanceForm = ref({
  assistanceItems: [
    {
      id: 1,
      fundSource: 'MAIFIP-LGU',
      glNumber: '',
      amount: 0,
    },
  ],
  remarks: '',
})

// ==================== TABLE COLUMNS ====================
const assistanceColumns = [
  {
    name: 'fundSource',
    label: 'Fund Source',
    field: 'fundSource',
    align: 'left',
  },
  {
    name: 'glNumber',
    label: 'GL Number',
    field: 'glNumber',
    align: 'left',
  },
  {
    name: 'amount',
    label: 'Amount (₱)',
    field: 'amount',
    align: 'right',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
  },
]

// ==================== COMPUTED PROPERTIES ====================

/**
 * FIX: Extract assistance funds - deduplicate by fund_source + fund_amount
 * This prevents showing the same assistance multiple times
 */
const assistanceFunds = computed(() => {
  const funds = billingData.value.assistance?.funds || []

  // Deduplicate funds by creating a unique key from fund_source and fund_amount
  const uniqueFunds = []
  const seenKeys = new Set()

  funds.forEach((fund) => {
    // Create a unique key combining fund_source and fund_amount
    const key = `${fund.fund_source}_${parseAmount(fund.fund_amount)}`

    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      uniqueFunds.push(fund)
    }
  })

  return uniqueFunds
})

/**
 * Check if there are any existing assistance records
 */
const hasExistingAssistance = computed(() => {
  return assistanceFunds.value.length > 0
})

/**
 * Check if MAIFIP-LGU or MAIFIP-Congressman assistance exists
 */
const hasMAIFIPAssistance = computed(() => {
  return assistanceFunds.value.some((fund) => {
    const source = fund.fund_source?.toUpperCase() || ''
    return source.includes('MAIFIP-LGU') || source.includes('MAIFIP-CONGRESSMAN')
  })
})

/**
 * Calculate total existing assistance
 */
const totalExistingAssistance = computed(() => {
  return assistanceFunds.value.reduce((total, fund) => {
    return total + parseAmount(fund.fund_amount)
  }, 0)
})

/**
 * Get Grand Total After Existing Assistance
 */
const grandTotalAfterExistingAssistance = computed(() => {
  const subtotal = parseAmount(billingData.value.final_billing)
  return Math.max(0, subtotal - totalExistingAssistance.value)
})

/**
 * Calculate total amount from all NEW assistance items in the form
 */
const totalNewAssistanceAmount = computed(() => {
  return assistanceForm.value.assistanceItems.reduce((total, item) => {
    return total + parseAmount(item.amount)
  }, 0)
})

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
 * Get patient full name
 */
const patientFullName = computed(() => {
  const first = billingData.value.firstname || ''
  const last = billingData.value.lastname || ''
  return `${first} ${last}`.trim()
})

/**
 * Check if assistance form is valid
 */
const isAssistanceFormValid = computed(() => {
  const allHaveFundSource = assistanceForm.value.assistanceItems.every((item) => !!item.fundSource)
  const allHaveGLNumber = assistanceForm.value.assistanceItems.every(
    (item) => !!item.glNumber?.trim(),
  )
  const allHaveAmount = assistanceForm.value.assistanceItems.every((item) => item.amount > 0)
  const totalNotExceeded = totalNewAssistanceAmount.value <= grandTotalAfterExistingAssistance.value
  const noDuplicates =
    new Set(assistanceForm.value.assistanceItems.map((item) => item.fundSource)).size ===
    assistanceForm.value.assistanceItems.length

  return allHaveFundSource && allHaveGLNumber && allHaveAmount && totalNotExceeded && noDuplicates
})

/**
 * Get transaction ID
 */
const transactionId = computed(() => store.transaction_id || billingData.value.transaction_id)

// ==================== INITIALIZATION ====================

try {
  currentUser.value = LocalStorage.getItem('user')
} catch (err) {
  console.error('Error retrieving user data:', err)
}

// ==================== LIFECYCLE HOOKS ====================

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
      billingData.value = {
        ...data,
        radiologies_details: data.radiologies_details || [],
        examination_details: data.examination_details || [],
        mammogram_details: data.mammogram_details || [],
        ultrasound_details: data.ultrasound_details || [],
        medication: data.medication || [],
        address: data.address || { street: '', purok: '', barangay: '' },
        representative: data.representative || {
          id: null,
          rep_name: '',
          relationship: '',
          address: '',
        },
        // FIX: Keep original assistance data from server without modification
        assistance: data.assistance ? JSON.parse(JSON.stringify(data.assistance)) : { funds: [] },
      }
      console.log('✅ Initial assistance loaded:', billingData.value.assistance)
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

// ==================== WATCHERS ====================

watch(
  grandTotalAfterExistingAssistance,
  (newAmount) => {
    if (
      newAmount > 0 &&
      assistanceForm.value.assistanceItems[0] &&
      assistanceForm.value.assistanceItems[0].amount === 0
    ) {
      assistanceForm.value.assistanceItems[0].amount = newAmount
    }
  },
  { immediate: true },
)

// ==================== UTILITY FUNCTIONS ====================

function parseAmount(amount) {
  if (typeof amount === 'number') return amount
  if (!amount) return 0
  return parseFloat(amount) || 0
}

function formatAmount(amount) {
  const num = parseAmount(amount)
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format amount input to always show 2 decimal places
 */
function formatAmountInput(amount) {
  const num = parseAmount(amount)
  return num.toFixed(2)
}

/**
 * Update assistance amount with validation
 */
function updateAssistanceAmount(rowIndex, value) {
  const cleanValue = value.replace(/[^\d.]/g, '')
  let numValue = parseFloat(cleanValue) || 0
  numValue = Math.round(numValue * 100) / 100
  assistanceForm.value.assistanceItems[rowIndex].amount = numValue
}

/**
 * Validate assistance amount
 */
function validateAssistanceAmount(val, rowIndex) {
  const numVal = parseAmount(val)

  if (numVal < 0) return 'Amount cannot be negative'
  if (numVal === 0) return 'Amount must be greater than 0'

  const currentRowAmount = assistanceForm.value.assistanceItems[rowIndex].amount
  const otherAmount = totalNewAssistanceAmount.value - currentRowAmount

  if (numVal + otherAmount > grandTotalAfterExistingAssistance.value) {
    return 'Total assistance exceeds remaining amount'
  }

  return true
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatAddress(address) {
  if (!address) return 'N/A'
  if (typeof address === 'string') return address

  const parts = []
  if (address.street) parts.push(address.street)
  if (address.purok) parts.push(`Purok ${address.purok}`)
  if (address.barangay) parts.push(`Brgy. ${address.barangay}`)

  return parts.length > 0 ? parts.join(', ') : 'N/A'
}

function calculateRemainingBalance() {
  const grandTotal = grandTotalAfterExistingAssistance.value
  const newAssistance = totalNewAssistanceAmount.value
  return Math.max(0, grandTotal - newAssistance)
}

function incrementGLNumber(glNumber) {
  const num = parseInt(glNumber, 10) + 1
  return String(num).padStart(glNumber.length, '0')
}

async function fetchGLNumbers() {
  if (fetchingGLNumber.value) return

  fetchingGLNumber.value = true
  try {
    console.log('🔄 Fetching max GL number...')

    const response = await store.getMaxNumber()

    console.log('✅ Response received:', response)

    if (response && response.max_gl_number) {
      maxGLNumber.value = response.max_gl_number
      console.log('✅ Max GL Number set to:', maxGLNumber.value)

      assistanceForm.value.assistanceItems.forEach((item, index) => {
        if (!item.glNumber) {
          const nextNum = parseInt(maxGLNumber.value, 10) + index
          const nextGLNum = String(nextNum).padStart(maxGLNumber.value.length, '0')
          item.glNumber = nextGLNum
          console.log(`✅ Row ${index} GL Number set to: ${nextGLNum}`)
        }
      })

      $q.notify({
        type: 'positive',
        message: 'GL numbers loaded successfully!',
        position: 'top',
      })
    } else {
      throw new Error('No max_gl_number in response')
    }
  } catch (err) {
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    })

    $q.notify({
      type: 'negative',
      message: `Failed to load GL numbers: ${err.message}`,
      position: 'top',
    })
  } finally {
    fetchingGLNumber.value = false
  }
}

async function openAssistanceDialog() {
  showAssistanceDialog.value = true
  setTimeout(() => {
    fetchGLNumbers()
  }, 300)
}

function getAvailableFundSources(rowIndex) {
  const selectedSources = assistanceForm.value.assistanceItems
    .filter(
      (_, index) => index !== rowIndex && assistanceForm.value.assistanceItems[index].fundSource,
    )
    .map((item) => item.fundSource)

  return MAIFIP_FUND_SOURCES.filter((source) => !selectedSources.includes(source))
}

function onFundSourceChange() {
  // Triggers reactivity for computed properties
}

// ==================== ASSISTANCE TABLE FUNCTIONS ====================

function addAssistanceRow() {
  if (assistanceForm.value.assistanceItems.length >= 2) {
    $q.notify({
      type: 'warning',
      message: 'Maximum 2 fund sources allowed (MAIFIP-LGU and MAIFIP-Congressman)',
      position: 'top',
    })
    return
  }

  const newId = Math.max(...assistanceForm.value.assistanceItems.map((item) => item.id), 0) + 1

  let newGLNumber = maxGLNumber.value
  if (assistanceForm.value.assistanceItems.length > 0) {
    const lastItem =
      assistanceForm.value.assistanceItems[assistanceForm.value.assistanceItems.length - 1]
    if (lastItem.glNumber) {
      newGLNumber = incrementGLNumber(lastItem.glNumber)
    }
  }

  assistanceForm.value.assistanceItems.push({
    id: newId,
    fundSource: null,
    glNumber: newGLNumber,
    amount: 0,
  })
}

function removeAssistanceRow(rowIndex) {
  if (rowIndex === 0) {
    $q.notify({
      type: 'warning',
      message: 'Cannot remove the first row',
      position: 'top',
    })
    return
  }

  assistanceForm.value.assistanceItems.splice(rowIndex, 1)
}

function cancelAssistance() {
  assistanceForm.value = {
    assistanceItems: [
      {
        id: 1,
        fundSource: 'MAIFIP-LGU',
        glNumber: '',
        amount: 0,
      },
    ],
    remarks: '',
  }
  maxGLNumber.value = '00000'
  fetchingGLNumber.value = false
  showAssistanceDialog.value = false
}

/**
 * Build payload with gl_lgu and gl_cong as strings
 */
function buildAssistancePayload() {
  let glLgu = ''
  let glCong = ''
  const funds = []

  // Build GL numbers and funds array from assistance items
  assistanceForm.value.assistanceItems.forEach((item) => {
    if (item.fundSource === 'MAIFIP-LGU') {
      glLgu = item.glNumber.trim()
      funds.push({
        fund_source: item.fundSource,
        fund_amount: parseFloat(item.amount),
      })
    } else if (item.fundSource === 'MAIFIP-Congressman') {
      glCong = item.glNumber.trim()
      funds.push({
        fund_source: item.fundSource,
        fund_amount: parseFloat(item.amount),
      })
    }
  })

  const basePayload = {
    transaction_id: billingData.value.transaction_id,
    gl_lgu: glLgu,
    gl_cong: glCong,
    remarks: assistanceForm.value.remarks,
    funds: funds,

    // Required billing fields
    consultation_amount: parseFloat(billingData.value.consultation_amount) || 0,
    total_billing: parseFloat(billingData.value.total_billing) || 0,
    discount: parseFloat(billingData.value.discount) || 0,
    final_billing: parseFloat(billingData.value.final_billing) || 0,
    radiology_total: parseFloat(billingData.value.radiology_total) || 0,
    examination_total: parseFloat(billingData.value.examination_total) || 0,
    ultrasound_total: parseFloat(billingData.value.ultrasound_total) || 0,
    mammogram_total: parseFloat(billingData.value.mammogram_total) || 0,
    medication_total: parseFloat(billingData.value.medication_total) || 0,

    // Required details arrays
    ultrasound_details: billingData.value.ultrasound_details || [],
    mammogram_details: billingData.value.mammogram_details || [],
    radiology_details: billingData.value.radiologies_details || [],
    examination_details: billingData.value.examination_details || [],
    medication: billingData.value.medication || [],

    // Patient information
    patient_id: billingData.value.patient_id,
    firstname: billingData.value.firstname || '',
    lastname: billingData.value.lastname || '',
    middlename: billingData.value.middlename || '',
    birthdate: billingData.value.birthdate || '',
    age: billingData.value.age || 0,
    gender: billingData.value.gender || '',
    category: billingData.value.category || '',
    is_pwd: billingData.value.is_pwd || 0,
    is_solo: billingData.value.is_solo || 0,
    contact_number: billingData.value.contact_number || '',
    maifip: billingData.value.maifip || 0,
    transaction_status: billingData.value.transaction_status || '',
    philhealth: billingData.value.philhealth || 0,
    address: billingData.value.address || {
      street: '',
      purok: '',
      barangay: '',
    },
    transaction_date: billingData.value.transaction_date || '',
    transaction_type: billingData.value.transaction_type || '',
    representative: billingData.value.representative || {
      id: null,
      rep_name: '',
      relationship: '',
      address: '',
    },
  }

  return basePayload
}

async function applyAssistance() {
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
    const payload = buildAssistancePayload()

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2))

    // Send all assistance items in one request
    const result = await assistanceStore.applyMAIFIP(transactionId.value, payload)

    const isSuccess =
      result?.message?.includes('Successfully') ||
      result?.message?.includes('success') ||
      result?.assistance ||
      (result && !result.error)

    if (isSuccess) {
      // FIX: Replace the entire assistance object with fresh data from server
      // This prevents duplication of existing assistance
      if (result.assistance && result.assistance.funds) {
        billingData.value.assistance = JSON.parse(JSON.stringify(result.assistance))
        console.log('✅ Assistance updated with server response:', billingData.value.assistance)
      }

      showAssistanceDialog.value = false
      assistanceForm.value = {
        assistanceItems: [
          {
            id: 1,
            fundSource: 'MAIFIP-LGU',
            glNumber: '',
            amount: 0,
          },
        ],
        remarks: '',
      }

      $q.notify({
        type: 'positive',
        message: 'Financial assistance has been applied successfully!',
        position: 'top',
      })
    } else {
      throw new Error(result?.error || result?.message || 'Failed to apply assistance')
    }
  } catch (error) {
    console.error('Error applying assistance:', error)
    let errorMessage = 'Failed to apply financial assistance. Please try again.'

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorMessages = []

      Object.keys(errors).forEach((field) => {
        if (Array.isArray(errors[field])) {
          errorMessages.push(...errors[field])
        } else {
          errorMessages.push(errors[field])
        }
      })

      errorMessage = errorMessages.length > 0 ? errorMessages.join(' ') : errorMessage
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
    })
  } finally {
    processing.value = false
  }
}

/**
 * Handle transaction submission - mark as Funded
 */
async function handleSubmit() {
  if (!transactionId.value) {
    $q.notify({ type: 'negative', message: 'Transaction ID not found', position: 'top' })
    return
  }

  submitting.value = true
  try {
    const result = await store.updateTransactionStatus(transactionId.value, 'Funded')

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Transaction marked as funded successfully!',
        position: 'top',
      })
      showConfirmDialog.value = false
      setTimeout(() => router.push('/gl'), 1500)
    } else {
      throw new Error('Failed to update transaction status')
    }
  } catch (err) {
    console.error('Error marking transaction as funded:', err)

    let errorMsg = 'Failed to mark transaction as funded. Please try again.'
    if (err.response?.data?.message) {
      errorMsg = err.response.data.message
    } else if (err.message) {
      errorMsg = err.message
    }

    $q.notify({
      type: 'negative',
      message: errorMsg,
      position: 'top',
      timeout: 5000,
    })
  } finally {
    submitting.value = false
  }
}

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

.header-actions {
  display: flex;
  gap: 10px;
}

.preparer-name {
  text-transform: uppercase;
}

.assistance-table-container {
  margin-bottom: 15px;
}

.assistance-table {
  margin-bottom: 10px;
}

.assistance-table :deep(.q-table__card) {
  box-shadow: none;
}

.fund-source-display {
  border-left: 4px solid #ff9800;
  padding-left: 15px;
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

.med-row td {
  background-color: #f7f7f7;
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
