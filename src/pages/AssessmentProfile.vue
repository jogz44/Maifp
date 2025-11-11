<template>
  <q-page>
    <div class="q-pa-md">
      <div class="row q-col-gutter-md" style="min-height: calc(100vh - 100px)">
        <!-- Left Card - Patient Information -->
        <div class="col-12 col-lg-6">
          <q-card class="full-height">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-green text-weight-bolder">Patient Information</div>
                <!-- <div class="row q-gutter-sm">
                  <q-btn
                    v-if="!isEditMode"
                    color="orange"
                    label="Edit"
                    @click="toggleEditMode"
                    :loading="patientStore.loading"
                  />
                  <template v-else>
                    <q-btn
                      color="green"
                      label="Save"
                      @click="savePatientChanges"
                      :loading="patientStore.loading"
                    />
                    <q-btn color="grey" label="Cancel" @click="cancelEdit" />
                  </template>
</div> -->
              </div>

              <q-separator />

              <!-- Personal Details Section -->
              <div class="text-subtitle2 text-grey-8 q-mt-md q-mb-xs">Personal Details</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12">
                  <q-input outlined dense v-model="patient.philsys_id" label="Philsys ID" :readonly="!isEditMode" />
                </div>
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="patient.philhealth_id"
                    label="PhilHealth ID Number"
                    mask="##-#########-#"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Name Fields -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                  <q-input outlined dense v-model="patient.lastname" label="Last Name" :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-input outlined dense v-model="patient.firstname" label="First Name" :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-input outlined dense v-model="patient.middlename" label="Middle Name" :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-input outlined dense v-model="patient.ext" label="Extension" :readonly="!isEditMode" />
                </div>
              </div>

              <!-- Basic Info -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                  <q-select outlined dense v-model="patient.gender" label="Gender"
                    :options="isEditMode ? patientStore.genderOptions : undefined" :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-input outlined dense v-model="patient.age" label="Age" readonly />
                </div>
                <div class="col-6">
                  <q-input outlined dense type="date" v-model="patient.birthdate" label="Birthdate"
                    :readonly="!isEditMode" @update:model-value="updateAge" />
                </div>
                <div class="col-6">
                  <q-input outlined dense type="number" v-model="patient.contact_number" label="Contact Number"
                    :readonly="!isEditMode" />
                </div>

                <!-- Additional Basic Info -->
                <div class="col-12">
                  <q-input outlined dense v-model="patient.place_of_birth" label="Place of Birth"
                    :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-select outlined dense v-model="patient.civil_status"
                    :options="isEditMode ? patientStore.civilStatusOptions : undefined" label="Civil Status"
                    :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-select outlined dense v-model="patient.religion"
                    :options="isEditMode ? patientStore.religionOptions : undefined" label="Religion"
                    :readonly="!isEditMode" />
                </div>
                <div class="col-12">
                  <q-select outlined dense v-model="patient.education"
                    :options="isEditMode ? patientStore.educationOptions : undefined"
                    label="Highest Educational Attainment" :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-input outlined dense v-model="patient.occupation" label="Occupation" :readonly="!isEditMode" />
                </div>
                <div class="col-6">
                  <q-select outlined dense v-model="patient.income"
                    :options="isEditMode ? patientStore.incomeOptions : undefined" label="Monthly Income"
                    :readonly="!isEditMode" />
                </div>
              </div>

              <!-- View More Toggle Button -->
              <div class="text-center q-mb-xs">
                <q-btn flat :icon="showMoreDetails ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  :label="showMoreDetails ? 'View Less' : 'View More Details'" color="primary"
                  @click="showMoreDetails = !showMoreDetails" class="text-caption" />
              </div>

              <!-- Collapsible Additional Details -->
              <q-slide-transition>
                <div v-show="showMoreDetails">
                  <q-separator class="q-my-md" />

                  <!-- Address Section -->
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Present Address</div>
                  <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-4">
                      <q-input outlined dense v-model="patient.purok" label="Purok" :readonly="!isEditMode" />
                    </div>
                    <div class="col-8">
                      <q-input outlined dense v-model="patient.street" label="Street" :readonly="!isEditMode" />
                    </div>
                    <div class="col-6">
                      <q-select outlined dense v-model="patient.barangay"
                        :options="isEditMode ? TagumBarangay.barangay : undefined" label="Barangay"
                        :readonly="!isEditMode" />
                    </div>
                    <div class="col-6">
                      <q-input outlined dense v-model="patient.city" label="City" :readonly="!isEditMode" />
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <!-- Other Details -->
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Other Details</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input outlined dense v-model="patient.category" label="Category" :readonly="!isEditMode" />
                    </div>
                    <div class="col-6">
                      <q-checkbox
                        v-model="patient.is_pwd"
                        label="PWD"
                        :readonly="!isEditMode"
                        :disable="!isEditMode"
                        :true-value="1"
                        :false-value="0"
                      />
                    </div>
                    <div class="col-6">
                      <q-checkbox
                        v-model="patient.is_solo"
                        label="Solo Parent"
                        :readonly="!isEditMode"
                        :disable="!isEditMode"
                        :true-value="1"
                        :false-value="0"
                      />
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Card - Transaction Table -->
        <div class="col-12 col-lg-6">
          <q-card class="full-height">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-green text-weight-bolder">Patient Transaction History</div>
                <div class="row q-gutter-sm">
                  <q-input v-model="filterDate" label="Filter by Date" type="date" outlined dense style="width: 200px"
                    :max="today" />
                  <q-btn color="red" label="Close" @click="goBack" />
                </div>
              </div>

              <q-separator />

              <div class="q-mt-md" style="height: calc(100vh - 200px)">
                <q-table bordered dense :rows="filteredTransactions" :columns="transactionColumns" row-key="id"
                  no-data-label="No transaction history available" :pagination="{ rowsPerPage: 0 }" virtual-scroll
                  :virtual-scroll-sticky-size-start="48" style="height: 100%; box-shadow: none">
                  <template #body="props">
                    <q-tr :props="props">
                      <q-td key="transaction_date" style="font-size: 11px" align="left">
                        {{ formatDate(props.row.transaction_date || props.row.created_at) }}
                      </q-td>
                      <q-td key="transaction_type" style="font-size: 11px" align="left">
                        {{ props.row.transaction_type || 'N/A' }}
                      </q-td>

                      <q-td key="status" style="font-size: 11px" align="center">
                        <div
                          v-if="props.row.status !== 'Assessment'"
                          class="text-caption q-mt-xs"
                          :class="{
                            'text-green': props.row.status === 'qualified',
                            'text-orange': props.row.status === 'unqualified',
                            'text-purple': props.row.status === 'Funded',
                            'text-blue': props.row.status === 'Complete',
                            'text-grey':
                              props.row.status !== 'qualified' &&
                              props.row.status !== 'unqualified' &&
                              props.row.status !== 'Complete' &&
                              props.row.status !== 'Funded',
                          }"
                        >
                          {{ props.row.status || 'unqualified' }}
                        </div>

                        <div v-if="props.row.status === 'Assessment'" class="q-mt-xs">
                          <q-toggle
                            :model-value="props.row.status === 'qualified'"
                            color="green"
                            @update:model-value="
                              (isChecked) => {
                                confirmStatusChange(
                                  props.row,
                                  isChecked ? 'qualified' : 'unqualified',
                                )
                              }
                            "
                            :loading="props.row.statusUpdating"
                          />

                          <div class="text-caption text-orange q-mt-xs">
                            {{ props.row.status === 'qualified' ? 'Qualified' : 'Assessment' }}
                          </div>
                        </div>
                      </q-td>

                      <q-td key="actions" style="font-size: 11px" align="center">
                        <q-btn icon="visibility" flat class="text-blue" @click="viewTransactionDetails(props.row)" />
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Status Change Confirmation Modal -->
    <q-dialog v-model="showStatusConfirmModal" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center justify-between q-mb-md">
          <div class="row items-center">
            <q-avatar icon="help" color="primary" text-color="white" />
            <span class="q-ml-sm text-h6">Change Transaction Status</span>
          </div>
          <q-btn icon="close" flat round dense color="grey" @click="cancelStatusChange" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <p class="q-mb-md text-subtitle2">
            Select the status for transaction
            <strong class="text-primary">{{
              pendingStatusChange.transaction?.transaction_number
            }}</strong
            >:
          </p>

          <p class="text-caption text-grey-7 q-mb-lg">
            Current status:
            <strong class="text-capitalize">{{ pendingStatusChange.oldStatus }}</strong>
          </p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md q-gutter-md">
          <q-btn
            label="Qualified"
            color="green-9"
            text-color="white"
            @click="updateStatusAndClose('qualified')"
            :loading="updatingStatus"
            size="md"
          />
          <q-btn
            label="Unqualified"
            color="red"
            text-color="white"
            @click="updateStatusAndClose('unqualified')"
            :loading="updatingStatus"
            size="md"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'
import { useTagumStore } from '../stores/TagumStore'
import { date } from 'quasar'

export default {
  name: 'PatientProfile',

  setup() {
    const TagumBarangay = useTagumStore()
    return {
      TagumBarangay,
    }
  },

  data() {
    return {
      patientId: null,
      isEditMode: false,
      originalPatientData: null,
      showMoreDetails: false,
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
        is_pwd: null,
        is_solo: null,
        philsys_id: '',
        philhealth_id: '',
        place_of_birth: '',
        civil_status: '',
        religion: '',
        education: '',
        occupation: '',
        income: '',
      },
      transactions: [],
      selectedTransaction: null,

      filterDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
      today: date.formatDate(new Date(), 'YYYY-MM-DD'),

      // Status change confirmation
      showStatusConfirmModal: false,
      updatingStatus: false,
      pendingStatusChange: {
        transaction: null,
        newStatus: '',
        oldStatus: '',
      },

      transactionColumns: [
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
          name: 'status',
          label: 'Status',
          field: 'status',
          sortable: true,
          align: 'center',
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
    filteredTransactions() {
      if (!this.filterDate) return this.transactions

      return this.transactions.filter((t) => {
        const transactionDate = date.formatDate(t.transaction_date || t.created_at, 'YYYY-MM-DD')
        return transactionDate === this.filterDate
      })
    },
  },

  mounted() {
    this.patientId = this.$route.query.patientId || this.patientStore.patient_id

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

        const patientData = await this.patientStore.getPatient(this.patientId)
        if (patientData) {
          console.log('Patient data loaded:', patientData)
          this.patient = { ...patientData }

          if (patientData.transaction && Array.isArray(patientData.transaction)) {
            this.transactions = patientData.transaction.map((transaction) => ({
              ...transaction,
              status: transaction.status || 'unqualified',
              statusUpdating: false,
            }))
            console.log(`Loaded ${this.transactions.length} transactions from patient data`)
          } else {
            console.log('Transactions not included in patient data, fetching separately')
            const transactionsData =
              (await this.patientStore.getPatientTransactions(this.patientId)) || []
            this.transactions = transactionsData.map((transaction) => ({
              ...transaction,
              status: transaction.status || 'unqualified',
              statusUpdating: false,
            }))
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

    confirmStatusChange(transaction, newStatus) {
      const oldStatus = transaction.status || 'unqualified'

      console.log('Status change requested:', { oldStatus, newStatus, transaction: transaction.id })

      if (oldStatus === newStatus) {
        console.log('Status is the same, no change needed')
        return
      }

      this.pendingStatusChange = {
        transaction: transaction,
        newStatus: newStatus,
        oldStatus: oldStatus,
      }

      console.log('Showing confirmation modal for:', this.pendingStatusChange)
      this.showStatusConfirmModal = true
    },

    async updateStatusAndClose(newStatus) {
      try {
        this.updatingStatus = true
        const transaction = this.pendingStatusChange.transaction

        transaction.statusUpdating = true

        const updatedTransaction = await this.patientStore.updateTransactionStatus(
          transaction.id,
          newStatus
        )

        if (updatedTransaction) {
          transaction.status = newStatus

          this.$q.notify({
            type: 'positive',
            message: `Transaction status updated to ${newStatus}`,
            position: 'top',
            timeout: 2000,
          })

          // ✅ Check if it qualifies for consultation
          if (newStatus === 'qualified' && transaction.transaction_type === 'consultation') {
            await this.addToConsultations(transaction.patient_id)
          }
        }

        this.showStatusConfirmModal = false
        this.resetPendingStatusChange()
      } catch (error) {
        console.error('Error updating transaction status:', error)
        this.$q.notify({
          type: 'negative',
          message: `Failed to update status: ${error.message}`,
          position: 'top',
          timeout: 2000,
        })
      } finally {
        this.updatingStatus = false
        if (this.pendingStatusChange.transaction) {
          this.pendingStatusChange.transaction.statusUpdating = false
        }
      }
    },

    cancelStatusChange() {
      this.showStatusConfirmModal = false
      this.resetPendingStatusChange()
    },

    resetPendingStatusChange() {
      this.pendingStatusChange = {
        transaction: null,
        newStatus: '',
        oldStatus: '',
      }
    },

    toggleEditMode() {
      this.isEditMode = true
      this.originalPatientData = { ...this.patient }
    },

    async savePatientChanges() {
      try {
        if (!this.patient.firstname || !this.patient.lastname) {
          this.$q.notify({
            type: 'negative',
            message: 'First name and last name are required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        const updatedPatient = await this.patientStore.updatePatient(this.patient.id, this.patient)

        if (updatedPatient) {
          this.$q.notify({
            type: 'positive',
            message: 'Patient information updated successfully',
            position: 'top',
            timeout: 2000,
          })

          this.isEditMode = false
          this.originalPatientData = null
        }
      } catch (error) {
        console.error('Error updating patient:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update patient information',
          position: 'top',
          timeout: 2000,
        })
      }
    },

    cancelEdit() {
      if (this.originalPatientData) {
        this.patient = { ...this.originalPatientData }
      }
      this.isEditMode = false
      this.originalPatientData = null
    },

    updateAge() {
      if (this.patient.birthdate) {
        this.patient.age = this.patientStore.calculateAge(this.patient.birthdate)
      }
    },

    viewTransactionDetails(transaction) {
      console.log('Viewing transaction:', transaction)
      this.$router.push({
        path: '/assessment/profile/transaction',
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
.full-height {
  height: 100%;
}

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

.q-toggle .q-toggle__inner {
  font-size: 11px;
}
</style>
