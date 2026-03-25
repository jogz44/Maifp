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
                <div class="row q-gutter-sm">
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
                </div>
              </div>

              <q-separator />

              <!-- Personal Details Section -->
              <div class="text-subtitle2 text-grey-8 q-mt-md q-mb-xs">Personal Details</div>
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12">
                  <q-input
                    outlined
                    dense
                    v-model="patient.philsys_id"
                    label="Philsys ID"
                    :readonly="!isEditMode"
                    mask="####-####-####-####"
                  />
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
                  <q-input
                    outlined
                    dense
                    v-model="patient.lastname"
                    label="Last Name"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="patient.firstname"
                    label="First Name"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="patient.middlename"
                    label="Middle Name"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="patient.ext"
                    label="Extension"
                    :readonly="!isEditMode"
                  />
                </div>
              </div>

              <!-- Basic Info -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                  <q-select
                    outlined
                    dense
                    v-model="patient.gender"
                    label="Gender"
                    :options="isEditMode ? patientStore.genderOptions : undefined"
                    :readonly="!isEditMode"
                  />
                </div>
                <div class="col-6">
                  <q-input outlined dense v-model="patient.age" label="Age" readonly />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="patient.birthdate"
                    label="Birthdate"
                    :readonly="!isEditMode"
                    @update:model-value="updateAge"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model="patient.contact_number"
                    label="Contact Number"
                    :readonly="!isEditMode"
                  />
                </div>

                <!-- Additional Info -->
                <div class="row q-col-gutter-md q-mb-xs">
                  <div class="col-12">
                    <q-input
                      outlined
                      dense
                      v-model="patient.place_of_birth"
                      label="Place of Birth"
                      :readonly="!isEditMode"
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      outlined
                      dense
                      v-model="patient.civil_status"
                      :options="isEditMode ? patientStore.civilStatusOptions : undefined"
                      label="Civil Status"
                      :readonly="!isEditMode"
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      outlined
                      dense
                      v-model="patient.religion"
                      :options="isEditMode ? patientStore.religionOptions : undefined"
                      label="Religion"
                      :readonly="!isEditMode"
                    />
                  </div>
                  <div class="col-12">
                    <q-select
                      outlined
                      dense
                      v-model="patient.education"
                      :options="isEditMode ? patientStore.educationOptions : undefined"
                      label="Highest Educational Attainment"
                      :readonly="!isEditMode"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      outlined
                      dense
                      v-model="patient.occupation"
                      label="Occupation"
                      :readonly="!isEditMode"
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      outlined
                      dense
                      v-model="patient.income"
                      :options="isEditMode ? patientStore.incomeOptions : undefined"
                      label="Monthly Income"
                      :readonly="!isEditMode"
                    />
                  </div>
                </div>
              </div>

              <!-- View More Toggle Button -->
              <div class="text-center q-mb-xs">
                <q-btn
                  flat
                  :icon="showMoreDetails ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  :label="showMoreDetails ? 'View Less' : 'View More Details'"
                  color="primary"
                  @click="showMoreDetails = !showMoreDetails"
                  class="text-caption"
                />
              </div>

              <!-- Collapsible Additional Details -->
              <q-slide-transition>
                <div v-show="showMoreDetails">
                  <q-separator class="q-my-md" />

                  <!-- Address Section -->
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Present Address</div>
                  <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-4">
                      <q-input
                        outlined
                        dense
                        v-model="patient.purok"
                        label="Purok"
                        :readonly="!isEditMode"
                      />
                    </div>
                    <div class="col-8">
                      <q-input
                        outlined
                        dense
                        v-model="patient.street"
                        label="Street"
                        :readonly="!isEditMode"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        outlined
                        dense
                        v-model="patient.barangay"
                        :options="isEditMode ? TagumBarangay.barangay : undefined"
                        label="Barangay"
                        :readonly="!isEditMode"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        outlined
                        dense
                        v-model="patient.city"
                        label="City"
                        :readonly="!isEditMode"
                      />
                    </div>
                  </div>

                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Permanent Address</div>
                  <div class="row q-col-gutter-md q-mb-md">
                    <div class="col-4">
                      <q-input
                        outlined
                        dense
                        v-model="patient.permanent_purok"
                        label="Purok"
                        :readonly="!isEditMode"
                      />
                    </div>
                    <div class="col-8">
                      <q-input
                        outlined
                        dense
                        v-model="patient.permanent_street"
                        label="Street"
                        :readonly="!isEditMode"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        outlined
                        dense
                        v-model="patient.permanent_barangay"
                        :options="isEditMode ? TagumBarangay.barangay : undefined"
                        label="Barangay"
                        :readonly="!isEditMode"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        outlined
                        dense
                        v-model="patient.permanent_city"
                        label="City"
                        :readonly="!isEditMode"
                      />
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <!-- Other Details -->
                  <div class="text-subtitle2 text-grey-8 q-mb-sm">Other Details</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        outlined
                        dense
                        v-model="patient.category"
                        label="Category"
                        :readonly="!isEditMode"
                      />
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
                <div class="text-h6 text-green text-weight-bolder">Transaction History</div>
                <div class="row q-gutter-sm">
                  <q-btn
                    color="green-9"
                    label="New Transaction"
                    @click="showNewTransactionModal = true"
                  />
                  <q-btn color="red" label="Close" @click="goBack" />
                </div>
              </div>

              <q-separator />

              <div class="q-mt-md" style="height: calc(100vh - 200px)">
                <q-table
                  :loading="patientStore.loading"
                  bordered
                  dense
                  :rows="transactions"
                  :columns="transactionColumns"
                  row-key="id"
                  no-data-label="No transaction history available"
                  :pagination="{ rowsPerPage: 0 }"
                  virtual-scroll
                  :virtual-scroll-sticky-size-start="48"
                  style="height: 100%; box-shadow: none"
                >
                  <template #body="props">
                    <q-tr :props="props">
                      <q-td key="id" style="font-size: 11px" align="left">
                        {{ props.row.id }}
                      </q-td>

                      <q-td key="transaction_date" style="font-size: 11px" align="left">
                        {{ formatDate(props.row.transaction_date || props.row.created_at) }}
                      </q-td>
                      <q-td key="transaction_type" style="font-size: 11px" align="left">
                        {{ props.row.transaction_type || 'N/A' }}
                      </q-td>
                      <q-td key="transaction_type" style="font-size: 14px" align="center">
                        <q-badge
                          :label="props.row.status ? props.row.status.toUpperCase() : 'N/A'"
                          :color="
                            props.row.status === 'Funded'
                              ? 'purple'
                              : props.row.status === 'Complete'
                                ? 'green'
                                : props.row.status === 'qualified'
                                  ? 'blue'
                                  : props.row.status === 'unqualified'
                                    ? 'red'
                                    : props.row.status === 'Assessment'
                                      ? 'orange'
                                      : 'grey'
                          "
                          align="center"
                          style="text-transform: uppercase"
                        />
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
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- New Transaction Modal -->
    <q-dialog v-model="showNewTransactionModal" persistent>
      <q-card style="width: 900px; max-width: 90vw; min-height: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-green-9 text-weight-bold">New Transaction</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetNewTransaction" />
        </q-card-section>

        <q-separator />

        <q-card-section style="max-height: 70vh; overflow-y: auto">
          <div class="text-subtitle2 q-mb-sm text-weight-bold">Transaction Information</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="newTransaction.transaction_date"
                type="date"
                label="Date *"
                class="text-caption"
                :rules="[(val) => !!val || 'Transaction date is required']"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="newTransaction.transaction_type"
                :options="patientStore.transaction_type"
                label="Type of Transaction *"
                class="text-caption"
                :rules="[(val) => !!val || 'Transaction type is required']"
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model="newTransaction.purpose"
                label="Purpose"
                type="textarea"
                class="text-caption"
                autogrow
                rows="3"
              />
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div style="min-height: 100px">
            <div class="row items-center">
              <div class="text-subtitle2 text-weight-bold">Patient Representative</div>
              <q-space />
              <q-checkbox
                v-model="hasRepresentativeInfo"
                label="Has Patient Representative?"
                class="text-caption"
              />
            </div>

            <div v-if="hasRepresentativeInfo" class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_name"
                  label="Representative Name *"
                  class="text-caption"
                  lazy-rules
                  :rules="[
                    (val) => !hasRepresentativeInfo || !!val || 'Representative name is required',
                  ]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_relationship"
                  label="Relationship to Patient *"
                  class="text-caption"
                  lazy-rules
                  :rules="[(val) => !hasRepresentativeInfo || !!val || 'Relationship is required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_contact"
                  label="Contact Number"
                  class="text-caption"
                  type="text"
                  maxlength="11"
                  mask="###########"
                  :rules="[
                    (val) => !val || val.length === 11 || 'Contact number must be 11 digits',
                  ]"
                />
              </div>

              <div class="col-12">
                <div class="row items-center">
                  <div class="text-subtitle2 q-mb-sm">Representative Address</div>
                  <q-space />
                  <q-checkbox
                    v-model="sameAsPatientAddress"
                    label="Same as Patient's Address"
                    class="text-caption"
                    @update:model-value="handleSameAddressChange"
                  />
                </div>
              </div>

              <div class="col-12 col-md-4" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_barangay"
                  label="Barangay"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_purok"
                  label="Purok"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_street"
                  label="Street"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_city"
                  label="City"
                  class="text-caption"
                  readonly
                />
              </div>
              <div class="col-12 col-md-6" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="newTransaction.rep_province"
                  label="Province"
                  class="text-caption"
                  readonly
                />
              </div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div class="text-subtitle2 q-mb-sm text-weight-bold">Vital Signs</div>

          <div class="text-caption text-grey-7 q-mb-sm">Basic Measurements</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.height"
                label="Height (cm)"
                class="text-caption"
                type="number"
                @update:model-value="updateNewTransactionBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.weight"
                label="Weight (kg)"
                class="text-caption"
                type="number"
                @update:model-value="updateNewTransactionBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.bmi"
                label="BMI"
                class="text-caption"
                readonly
              >
                <template v-slot:append v-if="newTransaction.bmi">
                  <q-badge color="primary" text-color="white">
                    {{ getBmiCategory(newTransaction.bmi) }}
                  </q-badge>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="newTransaction.waist"
                label="Waist Circumference (cm)"
                class="text-caption"
                type="number"
              />
            </div>
          </div>

          <div class="text-caption text-grey-7 q-mb-sm">Vital Signs</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.heart_rate"
                label="Heart Rate (bpm)"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.blood_pressure"
                label="Blood Pressure"
                class="text-caption"
                placeholder="120/80"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.respiratory_rate"
                label="Respiratory Rate"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.pulse_rate"
                label="Pulse Rate"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.temperature"
                label="Temperature (°C)"
                class="text-caption"
                type="number"
                step="0.1"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="newTransaction.sp02"
                label="SpO2 (%)"
                class="text-caption"
                type="number"
              />
            </div>
          </div>

          <div class="text-caption text-grey-7 q-mb-sm">Additional Information</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6" v-if="isFemalePatient">
              <q-input
                outlined
                dense
                v-model="newTransaction.LMP"
                label="Last Menstrual Period (LMP)"
                type="date"
                class="text-caption"
              />
            </div>
            <div :class="isFemalePatient ? 'col-12 col-md-6' : 'col-12'">
              <q-input
                outlined
                dense
                v-model="newTransaction.medicine"
                label="Maintenance Medicine"
                class="text-caption"
                type="textarea"
                autogrow
                rows="2"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey" v-close-popup @click="resetNewTransaction" />
          <q-btn
            label="Create Transaction"
            color="green-9"
            :loading="creatingTransaction"
            @click="createNewTransaction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MAIFIP Confirmation Dialog -->
    <q-dialog v-model="showMAIFIPConfirmation" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">MAIFIP Confirmation</div>
          <q-space />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1">Do you want this patient to proceed in MAIFIP?</div>
        </q-card-section>

        <!-- <q-card-actions align="right">
          <q-btn flat label="No" color="negative" @click="confirmMAIFIPChoice('pending')" />
          <q-btn
            unelevated
            label="Yes"
            color="positive"
            @click="confirmMAIFIPChoice('assessment')"
          />
        </q-card-actions> -->

        <q-card-actions align="right">
          <q-btn unelevated label="Yes" color="positive" @click="confirmMAIFIPChoice('pending')" />
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
        philhealth_id: null,
        philsys_id: null,
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
      },
      transactions: [],
      selectedTransaction: null,
      hasRepresentativeInfo: false,
      sameAsPatientAddress: false,
      showNewTransactionModal: false,
      showMAIFIPConfirmation: false,
      creatingTransaction: false,
      pendingTransactionPayload: null,
      newTransaction: {
        transaction_date: '',
        transaction_mode: 'Walk-in',
        transaction_type: '',
        status: '',
        purpose: '',
        patient_id: null,
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
        rep_name: '',
        rep_relationship: '',
        rep_contact: '',
        rep_purok: '',
        rep_street: '',
        rep_barangay: '',
        rep_city: 'Tagum City',
        rep_province: 'Davao del Norte',
      },
      transactionColumns: [
        {
          name: 'id',
          label: 'No',
          field: 'id',
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
    isFemalePatient() {
      return this.patient.gender && this.patient.gender.toLowerCase() === 'female'
    },
  },

  watch: {
    showNewTransactionModal(newVal) {
      if (newVal) {
        this.newTransaction.transaction_date = date.formatDate(new Date(), 'YYYY-MM-DD')
        this.newTransaction.transaction_mode = 'Walk-in'
        this.newTransaction.patient_id = this.patient.id
        this.newTransaction.rep_city = 'Tagum City'
        this.newTransaction.rep_province = 'Davao del Norte'
        this.newTransaction.status = ''
        this.sameAsPatientAddress = false
      }
    },

    sameAsPatientAddress(newVal) {
      if (newVal) {
        this.handleSameAddressChange(true)
      }
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
            this.transactions = patientData.transaction
            console.log(`Loaded ${this.transactions.length} transactions from patient data`)
          } else {
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

    handleSameAddressChange(checked) {
      if (checked) {
        this.newTransaction.rep_barangay = this.patient.barangay || ''
        this.newTransaction.rep_purok = this.patient.purok || ''
        this.newTransaction.rep_street = this.patient.street || ''
        this.newTransaction.rep_city = this.patient.city || 'Tagum City'
        this.newTransaction.rep_province = this.patient.province || 'Davao del Norte'
      } else {
        this.newTransaction.rep_barangay = ''
        this.newTransaction.rep_purok = ''
        this.newTransaction.rep_street = ''
        this.newTransaction.rep_city = 'Tagum City'
        this.newTransaction.rep_province = 'Davao del Norte'
      }
    },

    updateAge() {
      if (this.patient.birthdate) {
        this.patient.age = this.patientStore.calculateAge(this.patient.birthdate)
      }
    },

    viewTransactionDetails(transaction) {
      console.log('Viewing transaction:', transaction)
      this.$router.push({
        path: '/customers/profile/transaction',
        query: { patientId: this.patient.id, transactionId: transaction.id },
      })
    },

    resetNewTransaction() {
      this.newTransaction = {
        transaction_date: '',
        transaction_mode: 'Walk-in',
        transaction_type: '',
        purpose: '',
        patient_id: this.patient.id,
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
        rep_name: '',
        rep_relationship: '',
        rep_contact: '',
        rep_purok: '',
        rep_street: '',
        rep_barangay: '',
        rep_city: 'Tagum City',
        rep_province: 'Davao del Norte',
        status: '',
      }

      this.hasRepresentativeInfo = false
      this.sameAsPatientAddress = false
      this.pendingTransactionPayload = null
    },

    updateNewTransactionBMI() {
      const height = parseFloat(this.newTransaction.height)
      const weight = parseFloat(this.newTransaction.weight)

      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100
        const bmi = weight / (heightInMeters * heightInMeters)
        this.newTransaction.bmi = bmi.toFixed(1)
      } else {
        this.newTransaction.bmi = ''
      }
    },

    getBmiCategory(bmi) {
      const bmiValue = parseFloat(bmi)
      if (isNaN(bmiValue)) return ''
      if (bmiValue < 18.5) return 'Underweight'
      if (bmiValue < 25) return 'Normal'
      if (bmiValue < 30) return 'Overweight'
      return 'Obese'
    },

    getUserId() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const sanitizedStr = userStr.includes('__q_objt|')
            ? userStr.replace('__q_objt|', '')
            : userStr

          const user = JSON.parse(sanitizedStr)
          return user.id
        }
      } catch (error) {
        console.error('Error getting user ID:', error)
      }
      return 1
    },

    async createNewTransaction() {
      try {
        if (!this.newTransaction.transaction_date) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction date is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        if (!this.newTransaction.transaction_type) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction type is required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        if (this.hasRepresentativeInfo) {
          if (!this.newTransaction.rep_name) {
            this.$q.notify({
              type: 'negative',
              message: 'Representative name is required',
              position: 'top',
              timeout: 2000,
            })
            return
          }

          if (!this.newTransaction.rep_relationship) {
            this.$q.notify({
              type: 'negative',
              message: 'Representative relationship is required',
              position: 'top',
              timeout: 2000,
            })
            return
          }
        }

        // Build the payload
        const payload = {
          patient_id: this.patient.id,
          user_id: this.getUserId(),
          transaction_date: this.newTransaction.transaction_date,
          transaction_type: this.newTransaction.transaction_type,
          transaction_mode: this.newTransaction.transaction_mode || 'Walk-in',
          status: this.newTransaction.status || '',
          purpose: this.newTransaction.purpose || '',
          height: this.newTransaction.height || '',
          weight: this.newTransaction.weight || '',
          bmi: this.newTransaction.bmi || '',
          waist: this.newTransaction.waist || '',
          heart_rate: this.newTransaction.heart_rate || '',
          blood_pressure: this.newTransaction.blood_pressure || '',
          respiratory_rate: this.newTransaction.respiratory_rate || '',
          pulse_rate: this.newTransaction.pulse_rate || '',
          temperature: this.newTransaction.temperature || '',
          sp02: this.newTransaction.sp02 || '',
          medicine: this.newTransaction.medicine || '',
        }

        if (this.isFemalePatient) {
          payload.LMP = this.newTransaction.LMP || ''
        }

        if (this.hasRepresentativeInfo) {
          if (this.sameAsPatientAddress) {
            Object.assign(payload, {
              rep_name: this.newTransaction.rep_name,
              rep_relationship: this.newTransaction.rep_relationship,
              rep_contact: this.newTransaction.rep_contact || '',
              rep_barangay: this.patient.barangay || '',
              rep_purok: this.patient.purok || '',
              rep_street: this.patient.street || '',
              rep_city: this.patient.city || 'Tagum City',
              rep_province: this.patient.province || 'Davao del Norte',
            })
          } else {
            Object.assign(payload, {
              rep_name: this.newTransaction.rep_name,
              rep_relationship: this.newTransaction.rep_relationship,
              rep_contact: this.newTransaction.rep_contact || '',
              rep_barangay: this.newTransaction.rep_barangay || '',
              rep_purok: this.newTransaction.rep_purok || '',
              rep_street: this.newTransaction.rep_street || '',
              rep_city: this.newTransaction.rep_city || 'Tagum City',
              rep_province: this.newTransaction.rep_province || 'Davao del Norte',
            })
          }
        }

        // Store the payload and show MAIFIP confirmation dialog
        this.pendingTransactionPayload = payload
        this.showNewTransactionModal = false
        this.showMAIFIPConfirmation = true
      } catch (error) {
        console.error('Error validating transaction:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error: ${error.message || 'Unknown error'}`,
          position: 'top',
          timeout: 2000,
        })
      }
    },

    async confirmMAIFIPChoice(status) {
      try {
        this.showMAIFIPConfirmation = false

        if (!this.pendingTransactionPayload) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction data not found',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        // Add status to payload
        this.pendingTransactionPayload.status = status

        console.log('Creating transaction with data:', this.pendingTransactionPayload)

        this.creatingTransaction = true
        const createdTransaction = await this.patientStore.createNewTransaction(
          this.pendingTransactionPayload,
        )

        if (createdTransaction) {
          this.$q.notify({
            type: 'positive',
            message: 'Transaction created successfully',
            position: 'top',
            timeout: 2000,
          })
          await this.loadPatientData()
          this.resetNewTransaction()
        }
      } catch (error) {
        console.error('Error creating transaction:', error)
        this.$q.notify({
          type: 'negative',
          message: `Failed to create transaction: ${error.message || 'Unknown error'}`,
          position: 'top',
          timeout: 2000,
        })
      } finally {
        this.creatingTransaction = false
      }
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
</style>
