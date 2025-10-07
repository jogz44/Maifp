<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <!-- Patient Information Section -->
        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-sm" style="max-width: 1000px; width: 100%">
              <div class="row items-center justify-between">
                <!-- Left: Patient Information -->
                <div class="text-h6 text-green text-weight-bolder">Patient Information</div>
              </div>

              <q-separator></q-separator>

              <!-- Patient Personal Information -->
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.lastname"
                    label="Last name"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.firstname"
                    label="First name"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.middlename"
                    label="Middle name"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.ext"
                    label="Ext"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Additional Patient Information -->
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-select
                    v-if="isEditMode"
                    outlined
                    dense
                    v-model="patient.gender"
                    :options="patientStore.genderOptions"
                    label="Gender"
                    class="full-width text-caption"
                  />
                  <q-input
                    v-else
                    outlined
                    dense
                    v-model="patient.gender"
                    label="Gender"
                    class="full-width text-caption"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-1 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.age"
                    label="Age"
                    class="full-width text-caption"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.birthdate"
                    label="Birthdate"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                    type="date"
                    @update:model-value="updateAge"
                  />
                </div>
                <div class="col-12 col-md-4 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.contact_number"
                    label="Contact Number"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.category"
                    label="Category"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Address Information -->
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-2 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.purok"
                    label="Purok"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.street"
                    label="Street"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.barangay"
                    label="Barangay"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    outlined
                    dense
                    v-model="patient.city"
                    label="City"
                    class="full-width text-caption"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Status Indicators -->
              <div class="row q-gutter-sm q-mt-xs">
                <!-- PWD -->
                <div class="col-12 col-md-2 q-pa-sm" v-if="patient.is_pwd">
                  <q-checkbox
                    :model-value="true"
                    label="PWD"
                    color="positive"
                    readonly
                    checked-icon="check_box"
                    unchecked-icon="check_box_outline_blank"
                  />
                </div>

                <!-- Solo Parent -->
                <div class="col-12 col-md-2 q-pa-sm" v-if="patient.is_solo">
                  <q-checkbox
                    :model-value="true"
                    label="Solo Parent"
                    color="positive"
                    readonly
                    checked-icon="check_box"
                    unchecked-icon="check_box_outline_blank"
                  />
                </div>
              </div>

            </q-card>
          </div>
        </q-card-section>

        <!-- Patient Transactions Section -->
        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-sm" style="max-width: 1000px; width: 100%">
              <div class="text-h6 text-green text-weight-bolder">Patient Transaction History</div>
              <q-separator />

              <q-table
                bordered
                dense
                :rows="sortedTransactions"
                :columns="transactionColumns"
                row-key="id"
                no-data-label="No transaction history available"
                hide-bottom
              >
                <!-- Body slot -->
                <template #body="props">
                  <q-tr :props="props">
                    <q-td key="transaction_number" style="font-size: 11px" align="left">
                      {{ props.row.id }}
                    </q-td>
                    <q-td key="transaction_number" style="font-size: 11px" align="left">
                      {{ props.row.transaction_number }}
                    </q-td>
                    <q-td key="transaction_date" style="font-size: 11px" align="left">
                      {{ formatDate(props.row.transaction_date || props.row.created_at) }}
                    </q-td>
                    <q-td key="transaction_type" style="font-size: 11px" align="left">
                      {{ props.row.transaction_type || 'N/A' }}
                    </q-td>
                    <q-td key="transaction_mode" style="font-size: 11px" align="left">
                      {{ props.row.transaction_mode || 'N/A' }}
                    </q-td>
                    <q-td key="purpose" style="font-size: 11px" align="left">
                      {{ props.row.purpose || 'N/A' }}
                    </q-td>
                    <q-td key="actions" style="font-size: 11px" align="center">
                      <q-btn
                        icon="visibility"
                        flat
                        class="text-blue"
                        @click="viewTransactionDetails(props.row)"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>

              <div class="q-pa-sm flex justify-end">
                <q-btn color="red" label="Close" @click="goBack" />
              </div>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'
import { date } from 'quasar'

export default {
  name: 'PatientProfile',

  data() {
    return {
      patientId: null,
      isEditMode: false,
      originalPatientData: null, // Store original data for cancellation
      patient: {
        id: null,
        firstname: '',
        lastname: '',
        middlename: '',
        ext: '',
        birthdate: '',
        contact_number: '',
        age: 0,
        gender: '',
        is_not_tagum: false,
        street: '',
        purok: '',
        barangay: '',
        city: 'Tagum City',
        province: 'Davao del Norte',
        category: '',
        is_pwd: false,
        is_solo: false,
      },
      transactions: [],
      selectedTransaction: null,

      // New Transaction Modal
      showNewTransactionModal: false,
      creatingTransaction: false,
      newTransaction: {
        transaction_date: '',
        transaction_mode: '',
        transaction_type: '',
        purpose: '',
        patient_id: null,
        consultation_date: '',
        status: 'pending',
        height: '',
        weight: '',
        bmi: '',
        waist: '',
        heart_rate: '',
        blood_pressure: '',
        respiratory_rate: '',
        pulse_rate: '',
        temperature: '',
        sp02: '',
        LMP: '',
        medicine: '',
      },

      transactionColumns: [
        {
          name: 'id',
          label: 'id',
          field: 'id',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_number',
          label: 'Transaction Number',
          field: 'transaction_number',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_date',
          label: 'Transaction Date',
          field: (row) => this.formatDate(row.transaction_date || row.created_at),
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_type',
          label: 'Type',
          field: 'transaction_type',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'transaction_mode',
          label: 'Mode',
          field: 'transaction_mode',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'purpose',
          label: 'Purpose',
          field: 'purpose',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'center',
          headerClasses: 'bg-grey-7 text-white',
        },
      ],
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },
    sortedTransactions() {
      return [...this.transactions].sort((a, b) => {
        const dateA = new Date(a.transaction_date || a.created_at)
        const dateB = new Date(b.transaction_date || b.created_at)
        return dateB - dateA // newest first
      })
    },
  },

  watch: {
    showNewTransactionModal(newVal) {
      if (newVal) {
        // Set defaults when modal opens
        this.newTransaction.transaction_date = date.formatDate(new Date(), 'YYYY-MM-DD')
        this.newTransaction.consultation_date = date.formatDate(new Date(), 'YYYY-MM-DD') // added
        this.newTransaction.status = 'pending'
        this.newTransaction.patient_id = this.patient.id
      }
    },
  },

  mounted() {
    // Initialize patient ID from route params or store
    this.patientId = this.$route.query.patientId || this.patientStore.patient_id

    // Load patient data once component is mounted
    if (this.patientId) {
      this.loadPatientData()
    } else {
      this.$q.notify({
        type: 'negative',
        message: 'No patient selected',
        position: 'top',
        timeout: 2000,
      })
      this.goBack()
    }
  },

  methods: {
    async loadPatientData() {
      try {
        // Get patient ID from store or route params
        if (!this.patientId) {
          this.$q.notify({
            type: 'negative',
            message: 'No patient selected',
            position: 'top',
            timeout: 2000,
          })
          this.goBack()
          return
        }

        console.log(`Loading patient data for ID: ${this.patientId}`)

        // Fetch patient data
        const patientData = await this.patientStore.getPatient(this.patientId)
        if (patientData) {
          console.log('Patient data loaded:', patientData)
          this.patient = { ...patientData }

          // If transactions are included in the patient data
          if (patientData.transaction && Array.isArray(patientData.transaction)) {
            this.transactions = patientData.transaction
            console.log(`Loaded ${this.transactions.length} transactions from patient data`)
          } else {
            // If transactions are not included, fetch them separately
            console.log('Transactions not included in patient data, fetching separately')
            this.transactions =
              (await this.patientStore.getPatientTransactions(this.patientId)) || []
            console.log(`Loaded ${this.transactions.length} transactions`)
          }
        } else {
          console.error('No patient data returned from store')
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load patient data',
            position: 'top',
            timeout: 2000,
          })
        }
      } catch (error) {
        console.error('Error loading patient data:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error loading patient data: ${error.message}`,
          position: 'top',
          timeout: 2000,
        })
      }
    },

    viewTransactionDetails(transaction) {
      console.log('Viewing transaction:', transaction)
      this.$router.push({
        path: '/customers/laboratoryResults',
        query: { patientId: this.patient.id, transactionId: transaction.id },
      })
    },

    goBack() {
      this.$router.go(-1)
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return date.formatDate(dateString, 'YYYY-MM-DD')
    },
  },
}
</script>

<style scoped>
.q-item {
  transition: background-color 0.3s ease;
}

.q-item:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

.q-table th {
  font-size: 12px !important;
}
</style>
