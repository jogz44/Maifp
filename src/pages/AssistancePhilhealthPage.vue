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
            v-if="!hasExistingAssistance"
            color="orange-9"
            label="Apply Assistance"
            icon="volunteer_activism"
            class="q-mr-sm"
            :loading="processing"
            :disable="processing"
            @click="showAssistanceDialog = true"
          />
          <q-btn
            class="q-mr-sm"
            color="secondary"
            label="Print PDF"
            icon="picture_as_pdf"
            @click="handlePrint"
          />

          <q-btn
            color="green-9"
            label="Bill"
            icon="save"
            class="q-mr-sm"
            :loading="completing"
            :disable="completing"
            @click="showGLConfirmDialog = true"
          />

          <!--
          <q-btn
            v-if="finalAmountDue === 0"
            color="blue-9"
            label="Complete"
            icon="check"
            class="q-mr-sm"
            :loading="completing"
            :disable="completing"
            @click="showCompleteConfirmDialog = true"
          />
          -->
        </div>
      </div>

      <!-- Billing Confirmation Dialog -->
      <q-dialog v-model="showGLConfirmDialog" persistent>
        <q-card style="min-width: 400px; position: relative">
          <q-btn
            dense
            flat
            icon="close"
            class="q-dialog__close absolute-top-right"
            @click="closeGLConfirmDialog"
            :disable="completing"
          />

          <q-card-section class="row items-center">
            <q-avatar icon="help" color="blue-9" text-color="white" />
            <span class="q-ml-sm text-h6">Billing Confirmation</span>
          </q-card-section>

          <q-card-section>
            <p>Do you want to proceed this in billing?</p>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="No"
              color="grey"
              @click="closeGLConfirmDialog"
              :disable="completing"
            />
            <q-btn
              flat
              label="Yes"
              color="blue-9"
              @click="proceedToBilling"
              :loading="completing"
              :disable="completing"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!--
      <q-dialog v-model="showCompleteConfirmDialog" persistent>
        <q-card style="min-width: 400px; position: relative">
          <q-btn
            dense
            flat
            icon="close"
            class="q-dialog__close absolute-top-right"
            @click="closeCompleteConfirmDialog"
            :disable="completing"
          />

          <q-card-section class="row items-center">
            <q-avatar icon="check_circle" color="blue-9" text-color="white" />
            <span class="q-ml-sm text-h6">Complete Transaction</span>
          </q-card-section>

          <q-card-section>
            <p>Are you sure you want to mark this transaction as funded?</p>
            <p class="text-caption text-grey-7">
              <strong>Note:</strong> This will mark the transaction as funded and completed.
            </p>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="grey"
              @click="closeCompleteConfirmDialog"
              :loading="completing"
              :disable="completing"
            />
            <q-btn
              flat
              label="Complete"
              color="blue-9"
              @click="markAsFunded"
              :loading="completing"
              :disable="completing"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      -->

      <!-- Assistance Application Dialog -->
      <q-dialog v-model="showAssistanceDialog" persistent>
        <q-card style="min-width: 500px">
          <q-card-section class="row items-center">
            <q-avatar icon="volunteer_activism" color="orange-9" text-color="white" />
            <span class="q-ml-sm text-h6">Apply Financial Assistance</span>
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
                        :options="fundSourceOptions"
                        dense
                        outlined
                        :rules="[(val) => !!val || 'Fund source is required']"
                        readonly
                      />
                    </q-td>
                    <q-td key="amount" :props="props">
                      <q-input
                        v-model.number="props.row.amount"
                        type="number"
                        dense
                        outlined
                        prefix="₱"
                        :rules="assistanceAmountRules"
                        min="0"
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

              <div class="row justify-between q-mt-md">
                <!-- <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Add Fund Source"
                  @click="addAssistanceRow"
                /> -->
                <div class="text-h6 text-weight-bold">
                  Total: {{ formatAmount(totalAssistanceAmount) }}
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
              <div class="row justify-between">
                <span>Original Total:</span>
                <span class="text-weight-bold">{{ formatAmount(patient.final_billing) }}</span>
              </div>
              <div class="row justify-between">
                <span>Total Assistance:</span>
                <span class="text-weight-bold text-orange-9"
                  >-{{ formatAmount(totalAssistanceAmount) }}</span
                >
              </div>
              <q-separator class="q-my-sm" />
              <div class="row justify-between text-h6">
                <span class="text-weight-bold">Final Amount Due:</span>
                <span class="text-weight-bold text-primary">{{
                  formatAmount(
                    Math.max(0, parseAmount(patient.final_billing) - totalAssistanceAmount),
                  )
                }}</span>
              </div>
              <div
                v-if="totalAssistanceAmount > parseAmount(patient.final_billing)"
                class="text-negative q-mt-sm"
              >
                <q-icon name="warning" />
                Warning: Total assistance exceeds the bill amount!
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
              @click="applyAssistance"
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
                      <img src="../assets/Doh.svg" alt="DOH" class="logo" />
                      <img src="../assets/BP.png" alt="BP" class="logo" />
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
                      <img src="../assets/CHO-logo.png" alt="CHO Logo" class="logo" />
                      <img src="../assets/logo.png" alt="City of Tagum Logo" class="logo" />
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
                <p v-if="patient.philhealth_id">
                  <strong>PhilHealth Number:</strong> {{ patient.philhealth_id }}
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
                <!-- Laboratories
                <tr v-for="lab in patient.laboratories_details" :key="'lab-' + lab.id">
                  <td>{{ lab.laboratory_type }}</td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-left"></td>
                  <td class="text-right">{{ formatAmount(lab.total_amount) }}</td>
                </tr> -->
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
                <!-- Total -->
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Total</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.total_billing) }}</strong>
                  </td>
                </tr>
                <tr class="total-row" v-if="patient.discount > 0">
                  <td colspan="4" class="text-right"><strong>PWD/Senior Discount (20%)</strong></td>
                  <td class="text-right">
                    <strong>-{{ formatAmount(patient.discount) }}</strong>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Subtotal</strong></td>
                  <td class="text-right">
                    <strong>{{ formatAmount(patient.final_billing) }}</strong>
                  </td>
                </tr>
                <!-- Financial Assistance Rows - Show existing assistance -->
                <template v-if="hasExistingAssistance">
                  <tr
                    v-for="(fund, index) in patient.assistance.funds"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from 'src/stores/patientStore'
import { useAssistanceStore } from 'src/stores/assistanceStore'
import { useQuasar, LocalStorage } from 'quasar'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const store = usePatientStore()
const assistanceStore = useAssistanceStore()
const $q = useQuasar()
const currentUser = ref(null)

const loading = ref(true)
const error = ref(null)
const completing = ref(false)
const processing = ref(false)
const showAssistanceDialog = ref(false)
const showGLConfirmDialog = ref(false)
// COMMENTED OUT: showCompleteConfirmDialog ref
// const showCompleteConfirmDialog = ref(false)

const patient = ref({
  id: null,
  philhealth_id: null,
  firstname: '',
  middlename: '',
  lastname: '',
  age: '',
  gender: '',
  birthdate: '',
  address: {},
  contact_number: '',
  maifip: null,
  philhealth: null,
  transaction_date: '',
  representative: {},
  consultation_amount: 0,
  radiologies_details: [],
  examination_details: [],
  mammogram_details: [],
  ultrasound_details: [],
  // laboratories_details: [],
  medication: [],
  total_billing: 0,
  discount: 0,
  final_billing: 0,
  assistance: null,
})

const assistanceForm = ref({
  assistanceItems: [{ fundSource: 'PHIC - Case Rate', amount: 0, id: 1 }],
  remarks: '',
})

const fundSourceOptions = [
  'PHIC - Case Rate',
  'PCSO - MAP',
  'DSWD - AICS',
  'QFS',
  'Other Fund Source',
]

const assistanceColumns = [
  {
    name: 'fundSource',
    label: 'Fund Source',
    field: 'fundSource',
    align: 'left',
    style: 'width: 50%',
  },
  {
    name: 'amount',
    label: 'Assistance Amount (₱)',
    field: 'amount',
    align: 'left',
    style: 'width: 35%',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    style: 'width: 15%',
  },
]

try {
  currentUser.value = LocalStorage.getItem('user')
} catch (err) {
  console.error('Error retrieving user data:', err)
}

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

const hasExistingAssistance = computed(() => {
  return (
    patient.value.assistance &&
    patient.value.assistance.funds &&
    patient.value.assistance.funds.length > 0
  )
})

const totalExistingAssistance = computed(() => {
  if (!hasExistingAssistance.value) return 0
  return patient.value.assistance.funds.reduce((total, fund) => {
    return total + parseAmount(fund.fund_amount)
  }, 0)
})

const finalAmountDue = computed(() => {
  const originalAmount = parseAmount(patient.value.final_billing)
  const assistanceAmount = hasExistingAssistance.value ? totalExistingAssistance.value : 0
  return Math.max(0, originalAmount - assistanceAmount)
})

const totalAssistanceAmount = computed(() => {
  return assistanceForm.value.assistanceItems.reduce((total, item) => {
    return total + parseAmount(item.amount)
  }, 0)
})

const assistanceAmountRules = [
  (val) => val >= 0 || 'Assistance amount cannot be negative',
  () =>
    totalAssistanceAmount.value <= parseAmount(patient.value.final_billing) ||
    'Total assistance amount cannot exceed the total bill',
]

const isAssistanceFormValid = computed(() => {
  const hasValidItems = assistanceForm.value.assistanceItems.some(
    (item) => item.fundSource && parseAmount(item.amount) > 0,
  )
  const totalNotExceeded = totalAssistanceAmount.value <= parseAmount(patient.value.final_billing)
  const totalGreaterThanZero = totalAssistanceAmount.value > 0

  return hasValidItems && totalNotExceeded && totalGreaterThanZero
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

function closeGLConfirmDialog() {
  showGLConfirmDialog.value = false
}

/*
function closeCompleteConfirmDialog() {
  showCompleteConfirmDialog.value = false
}
*/

function cancelAssistance() {
  assistanceForm.value = {
    assistanceItems: [{ fundSource: 'Select Funds Source', amount: 0, id: 1 }],
    remarks: '',
  }
  showAssistanceDialog.value = false
}

function removeAssistanceRow(index) {
  if (index > 0) {
    assistanceForm.value.assistanceItems.splice(index, 1)
  }
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

  processing.value = true
  try {
    const validAssistanceItems = assistanceForm.value.assistanceItems
      .filter((item) => item.fundSource && parseAmount(item.amount) > 0)
      .map((item) => ({
        fund_source: item.fundSource,
        fund_amount: parseAmount(item.amount),
        id: item.id,
      }))

    const payload = {
      patient_id: patient.value.patient_id,
      transaction_id: patient.value.transaction_id,
      laboratories_details: patient.value.laboratories_details,
      radiology_details: patient.value.radiologies_details,
      examination_details: patient.value.examination_details,
      mammogram_details: patient.value.mammogram_details,
      ultrasound_details: patient.value.ultrasound_details,
      medication: patient.value.medication,
      consultation_amount: parseAmount(patient.value.consultation_amount),
      radiology_total: patient.value.radiologies_details.reduce(
        (total, rad) => total + parseAmount(rad.total_amount),
        0,
      ),
      examination_total: patient.value.examination_details.reduce(
        (total, exam) => total + parseAmount(exam.total_amount),
        0,
      ),
      mammogram_total: patient.value.mammogram_details.reduce(
        (total, mammo) => total + parseAmount(mammo.total_amount),
        0,
      ),
      ultrasound_total: patient.value.ultrasound_details.reduce(
        (total, ultra) => total + parseAmount(ultra.total_amount),
        0,
      ),
      medication_total: patient.value.medication.reduce(
        (total, med) => total + parseAmount(med.total),
        0,
      ),
      total_billing: parseAmount(patient.value.total_billing),
      discount: parseAmount(patient.value.discount),
      final_billing: parseAmount(patient.value.final_billing),
      assistances: validAssistanceItems,
      total_assistance: totalAssistanceAmount.value,
    }

    const result = await assistanceStore.applyAssistance(payload)

    const isSuccess =
      result?.message?.includes('Successfully') || result?.assistance || (result && !result.error)

    if (isSuccess) {
      patient.value.assistance = {
        id: result.assistance?.id || Date.now(),
        funds: validAssistanceItems.map((item) => ({
          fund_source: item.fund_source,
          fund_amount: item.fund_amount.toString(),
        })),
      }

      // Close dialog and reset form
      showAssistanceDialog.value = false
      assistanceForm.value = {
        assistanceItems: [{ fundSource: 'Select Funds Source', amount: null, id: 1 }],
        remarks: '',
      }

      $q.notify({
        type: 'positive',
        message: `Financial assistance has been applied successfully!`,
        position: 'top',
      })
    } else {
      throw new Error(result?.error || result?.message || 'Failed to apply assistance')
    }
  } catch (error) {
    console.error('Error applying assistance:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to apply financial assistance. Please try again.',
      position: 'top',
    })
  } finally {
    processing.value = false
  }
}

// Proceed to Billing (simplified billing confirmation)
async function proceedToBilling() {
  if (!store.transaction_id) {
    $q.notify({ type: 'negative', message: 'Transaction ID not found', position: 'top' })
    return
  }
  completing.value = true
  try {
    const result = await store.updateTransactionStatus(store.transaction_id, 'Billing')
    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Transaction completed successfully and sent to Billing!',
        position: 'top',
      })
      setTimeout(() => router.push('/philhealth'), 1500)
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
    showGLConfirmDialog.value = false
  }
}

/*
async function markAsFunded() {
  if (!store.transaction_id) {
    $q.notify({ type: 'negative', message: 'Transaction ID not found', position: 'top' })
    return
  }
  completing.value = true
  try {
    const result = await store.updateTransactionStatus(store.transaction_id, 'Funded')
    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Transaction marked as funded successfully!',
        position: 'top',
      })
      setTimeout(() => router.push('/billing'), 1500)
    } else {
      throw new Error('Failed to update transaction status')
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to mark transaction as funded. Please try again.',
      position: 'top',
    })
  } finally {
    completing.value = false
    showCompleteConfirmDialog.value = false
  }
}
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

.assistance-table-container {
  margin-bottom: 15px;
}

.assistance-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.assistance-table .q-table__top,
.assistance-table .q-table__bottom {
  padding: 12px 16px;
}

.assistance-table td {
  padding: 8px;
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

/* Patient info styles */
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

/* Dialog close button positioning */
.q-dialog__close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
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
