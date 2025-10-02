<template>
  <q-page class="q-pa-md">
    <!-- Patient Information Card -->
    <q-card flat bordered>
      <q-card-section class="bg-green-9 text-white">
        <div class="text-subtitle1 q-my-none">Patients Information</div>
      </q-card-section>

      <q-form @submit.prevent="submitPatientForm" ref="patientForm">
        <q-card-section>
          <!-- ID Numbers Section -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="patientData.philsys_id"
                label="PhilSys ID"
                class="text-caption"
                mask="####-####-####-####"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="patientData.philhealth_id"
                label="PhilHealth ID"
                class="text-caption"
                mask="##-#########-#"
              />
            </div>
          </div>
          <!-- Personal Details Section -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.lastname"
                label="Lastname *"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Surname is required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.firstname"
                label="Firstname *"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Firstname is required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.middlename"
                label="Middlename"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input outlined dense v-model="patientData.ext" label="Ext." class="text-caption" />
            </div>
          </div>

          <!-- Personal Info Section -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-select
                outlined
                dense
                v-model="patientData.gender"
                :options="patientStore.genderOptions"
                label="Gender *"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Gender is required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                type="date"
                v-model="patientData.birthdate"
                label="Birthdate *"
                class="text-caption"
                @change="handleBirthdateChange"
                lazy-rules
                :rules="[(val) => !!val || 'Birthdate is required']"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="patientData.age"
                label="Age"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="patientData.contact_number"
                label="Contact Number"
                class="text-caption"
                type="text"
                maxlength="11"
                :rules="[(val) => !val || val.length === 11 || 'Contact number must be 11 digits']"
                mask="###########"
              />
            </div>
          </div>

          <!-- Additional Personal Information -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="patientData.place_of_birth"
                label="Place of Birth"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="patientData.civil_status"
                :options="civilStatusOptions"
                label="Civil Status"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="patientData.religion"
                :options="religionOptions"
                label="Religion"
                class="text-caption"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="patientData.education_attainment"
                :options="educationOptions"
                label="Highest Education Attainment"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="patientData.occupation"
                label="Occupation"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                outlined
                dense
                v-model="patientData.income"
                :options="incomeOptions"
                label="Monthly Income"
                class="text-caption"
              />
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Permanent Address Section -->
          <div class="q-mb-md">
            <div class="row items-center">
              <div class="text-subtitle2 q-mb-sm">Permanent Address</div>
              <q-space />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  outlined
                  dense
                  v-model="patientData.perm_barangay"
                  :options="TagumBarangay.barangay"
                  label="Barangay *"
                  class="text-caption"
                  :input-debounce="0"
                  use-input
                  hide-selected
                  fill-input
                  lazy-rules
                  :rules="[(val) => !!val || 'Barangay is required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.perm_purok"
                  label="Purok"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.perm_street"
                  label="Street"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="patientData.perm_city"
                  label="City"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="patientData.perm_province"
                  label="Province"
                  class="text-caption"
                />
              </div>
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Present Address Section -->
          <div class="q-mb-md">
            <div class="row items-center">
              <div class="text-subtitle2 q-mb-sm">Present Address</div>
              <q-space />
              <q-checkbox
                v-model="sameAsPermanentAddress"
                label="Same as Permanent Address"
                class="text-caption"
                @update:model-value="handleSamePermAddressChange"
              />
            </div>

            <div class="row q-col-gutter-md" v-if="!sameAsPermanentAddress">
              <div class="col-12 col-md-4">
                <q-select
                  outlined
                  dense
                  v-model="patientData.barangay"
                  :options="TagumBarangay.barangay"
                  label="Barangay *"
                  class="text-caption"
                  :input-debounce="0"
                  use-input
                  hide-selected
                  fill-input
                  lazy-rules
                  :rules="[(val) => !!val || 'Barangay is required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.purok"
                  label="Purok"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.street"
                  label="Street"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="patientData.city"
                  label="City"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="patientData.province"
                  label="Province"
                  class="text-caption"
                />
              </div>
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Representative Section -->
          <div>
            <div class="row items-center">
              <div class="text-subtitle2 q-mb-sm">Patient Representative</div>
              <q-space />
              <q-checkbox
                v-model="hasRepresentative"
                label="Has Patient Representative?"
                class="text-caption"
              />
            </div>

            <div v-if="hasRepresentative" class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_name"
                  label="Representative Name *"
                  class="text-caption"
                  lazy-rules
                  :rules="[
                    (val) => !hasRepresentative || !!val || 'Representative name is required',
                  ]"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_relationship"
                  label="Relationship to Patient *"
                  class="text-caption"
                  lazy-rules
                  :rules="[(val) => !hasRepresentative || !!val || 'Relationship is required']"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_contact"
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

              <!-- Fix for address section header -->
              <div class="col-12">
                <div class="row items-center">
                  <div class="text-subtitle2 q-mb-sm">Representative Address</div>
                  <q-space />
                  <q-checkbox
                    v-model="sameAsPatientAddress"
                    label="Same as Patient's Present Address"
                    class="text-caption"
                    @update:model-value="handleSameAddressChange"
                  />
                </div>
              </div>

              <div class="col-12 col-md-4" v-if="!sameAsPatientAddress">
                <q-select
                  outlined
                  dense
                  v-model="patientData.rep_barangay"
                  :options="TagumBarangay.barangay"
                  label="Barangay"
                  class="text-caption"
                  :input-debounce="0"
                  use-input
                  hide-selected
                  fill-input
                />
              </div>
              <div class="col-12 col-md-4" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_purok"
                  label="Purok"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_street"
                  label="Street"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_city"
                  label="City"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6" v-if="!sameAsPatientAddress">
                <q-input
                  outlined
                  dense
                  v-model="patientData.rep_province"
                  label="Province"
                  class="text-caption"
                />
              </div>
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Category Section -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Patients Category</div>
            <div class="row q-gutter-md">
              <q-checkbox
                v-model="isChild"
                :val="'Children'"
                label="Children"
                class="text-caption"
                disable
              />
              <q-checkbox
                v-model="isAdult"
                :val="'Adult'"
                label="Adult"
                class="text-caption"
                disable
              />
              <q-checkbox
                v-model="isSenior"
                :val="'Senior'"
                label="Senior"
                class="text-caption"
                disable
              />
              <q-checkbox
                v-model="patientData.is_pwd"
                :val="'PWD'"
                label="PWD"
                class="text-caption"
              />
              <q-checkbox
                v-model="patientData.is_solo"
                :val="'Solo'"
                label="Solo"
                class="text-caption"
              />
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Vital Signs Section -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Vital Signs</div>
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.height"
                label="Height (cm)"
                class="text-caption"
                type="number"
                @update:model-value="calculateBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.weight"
                label="Weight (kg)"
                class="text-caption"
                type="number"
                @update:model-value="calculateBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.bmi"
                label="BMI"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="patientData.waist"
                label="Waist Circumference (cm)"
                class="text-caption"
                type="number"
              />
            </div>

            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="patientData.heart_rate"
                label="Heart Rate (bpm)"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="patientData.blood_pressure"
                label="Blood Pressure (mmHg)"
                class="text-caption"
                placeholder="120/80"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="patientData.respiratory_rate"
                label="Respiratory Rate"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="patientData.pulse_rate"
                label="Pulse Rate"
                class="text-caption"
                type="number"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="patientData.temperature"
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
                v-model="patientData.sp02"
                label="SpO2 (%)"
                class="text-caption"
                type="number"
              />
            </div>

            <div class="col-12 col-md-6" v-if="isFemale">
              <q-input
                outlined
                dense
                v-model="patientData.LMP"
                label="Last Menstrual Period (LMP)"
                type="date"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="patientData.medicine"
                label="Maintenance Medicine"
                class="text-caption"
                type="textarea"
                autogrow
              />
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Transaction Information Section -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Transaction Information</div>
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="patientData.transaction_date"
                type="date"
                label="Date"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Date is required']"
              />
            </div>
            <div class="col-12">
              <q-select
                outlined
                dense
                v-model="patientData.transaction_type"
                :options="patientStore.transaction_type"
                label="Type of Transaction"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Type is required']"
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model="patientData.purpose"
                label="Purpose"
                type="textarea"
                class="text-caption"
                autogrow
              />
            </div>
          </div>
        </q-card-section>

        <!-- Action Buttons -->
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" to="/customers" @click="clearInputs" />
          <q-btn
            label="Save"
            color="green-9"
            @click="submitPatientForm"
            :loading="patientStore.loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>

    <!-- Error Dialog -->
    <q-dialog v-model="showError" persistent>
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Error</div>
          <pre class="text-negative">{{ errorMessage }}</pre>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTagumStore } from '../stores/TagumStore'
import { usePatientStore } from '../stores/patientStore'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'PatientRegistration',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const TagumBarangay = useTagumStore()
    const patientStore = usePatientStore()
    const patientForm = ref(null)

    // Form data
    const patientData = ref({
      ...patientStore.patientInfoDefault,
      // Add new fields with default values
      philsys_id: '',
      philhealth_id: '',
      place_of_birth: '',
      civil_status: '',
      religion: '',
      education_attainment: '',
      occupation: '',
      income: '',
      // Permanent address fields
      perm_barangay: '',
      perm_purok: '',
      perm_street: '',
      perm_city: 'Tagum City',
      perm_province: 'Davao del Norte',
    })
    const hasRepresentative = ref(false)
    const sameAsPatientAddress = ref(true)
    const sameAsPermanentAddress = ref(true)

    // UI state
    const showError = ref(false)
    const isChild = ref(false)
    const isAdult = ref(false)
    const isSenior = ref(false)

    // Options for new dropdown fields
    const civilStatusOptions = ['Single', 'Married', 'Widow/er', 'Separated']

    const religionOptions = [
      'Islam',
      'Roman Catholic',
      'Iglesia ni Cristo',
      'Born Again Christian',
      'Protestant Christian',
      'Baptist',
      'Evangelical',
      "Jehovah's Witnesses",
      'Other Christian',
      'No Religion',
      'Indigenous Beliefs',
      'Other',
    ]

    const educationOptions = [
      'Elementary Education',
      'Highschool Education',
      'College',
      'Postgraduate Program',
      'No Formal Education',
    ]

    const incomeOptions = [
      'At least ₱190,400',
      'Between ₱114,240 - ₱190,400',
      'Between ₱66,640 - ₱114,240',
      'Between ₱38,080 - ₱66,640',
      'Between ₱9,520 - ₱38,080',
      'Less than ₱9,520',
    ]

    // Computed properties
    const errorMessage = computed(() => {
      if (Array.isArray(patientStore.error)) {
        return patientStore.error.join('\n')
      }
      return patientStore.error
    })

    const isFemale = computed(() => {
      return patientData.value.gender === 'Female'
    })

    // Initialize component
    onMounted(() => {
      // Set default values
      patientData.value.transaction_date = date.formatDate(new Date(), 'YYYY-MM-DD')
      patientStore.patient_id = null
      patientStore.isSave = true

      // Set fixed city and province for all addresses
      patientData.value.city = 'Tagum City'
      patientData.value.province = 'Davao del Norte'
      patientData.value.perm_city = 'Tagum City'
      patientData.value.perm_province = 'Davao del Norte'
      patientData.value.rep_city = 'Tagum City'
      patientData.value.rep_province = 'Davao del Norte'

      // Reset representative values
      resetRepresentativeData()

      // Initialize present address same as permanent
      updatePresentAddressFromPermanent()
    })

    onUnmounted(() => {
      patientStore.resetStore()
    })

    // Set patient category based on age
    watch(
      () => patientData.value.age,
      (newAge) => {
        if (newAge < 18) {
          patientData.value.category = 'Child'
          isChild.value = true
          isAdult.value = false
          isSenior.value = false
        } else if (newAge >= 18 && newAge < 60) {
          patientData.value.category = 'Adult'
          isAdult.value = true
          isChild.value = false
          isSenior.value = false
        } else if (newAge >= 60) {
          patientData.value.category = 'Senior'
          isSenior.value = true
          isChild.value = false
          isAdult.value = false
        }
      },
    )

    // Watch representative checkbox
    watch(
      () => hasRepresentative.value,
      (hasRep) => {
        if (!hasRep) {
          resetRepresentativeData()
        } else {
          sameAsPatientAddress.value = true
          updateRepAddressFromPatient()
        }
      },
    )

    // Methods
    const resetRepresentativeData = () => {
      patientData.value.rep_name = ''
      patientData.value.rep_relationship = ''
      patientData.value.rep_barangay = ''
      patientData.value.rep_purok = ''
      patientData.value.rep_street = ''
      patientData.value.rep_contact = ''
      patientData.value.rep_city = 'Tagum City'
      patientData.value.rep_province = 'Davao del Norte'
      sameAsPatientAddress.value = true
    }

    const updatePresentAddressFromPermanent = () => {
      if (sameAsPermanentAddress.value) {
        patientData.value.barangay = patientData.value.perm_barangay
        patientData.value.purok = patientData.value.perm_purok
        patientData.value.street = patientData.value.perm_street
        patientData.value.city = patientData.value.perm_city
        patientData.value.province = patientData.value.perm_province
      }
    }

    const handleSamePermAddressChange = () => {
      if (sameAsPermanentAddress.value) {
        updatePresentAddressFromPermanent()
      } else {
        // Clear present address fields when unchecked
        patientData.value.barangay = ''
        patientData.value.purok = ''
        patientData.value.street = ''
        patientData.value.city = 'Tagum City'
        patientData.value.province = 'Davao del Norte'
      }
    }

    const updateRepAddressFromPatient = () => {
      if (sameAsPatientAddress.value) {
        patientData.value.rep_barangay = patientData.value.barangay
        patientData.value.rep_purok = patientData.value.purok
        patientData.value.rep_street = patientData.value.street
        patientData.value.rep_city = patientData.value.city
        patientData.value.rep_province = patientData.value.province
      }
    }

    const handleSameAddressChange = () => {
      if (sameAsPatientAddress.value) {
        updateRepAddressFromPatient()
      } else {
        patientData.value.rep_barangay = ''
        patientData.value.rep_purok = ''
        patientData.value.rep_street = ''
        patientData.value.rep_city = 'Tagum City'
        patientData.value.rep_province = 'Davao del Norte'
      }
    }

    const handleBirthdateChange = () => {
      if (patientData.value.birthdate) {
        patientData.value.age = patientStore.calculateAge(patientData.value.birthdate)
      }
    }

    const calculateBMI = () => {
      const height = parseFloat(patientData.value.height)
      const weight = parseFloat(patientData.value.weight)

      if (!height || !weight || height <= 0 || weight <= 0) {
        patientData.value.bmi = ''
        return
      }

      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      patientData.value.bmi = (Math.round(bmi * 100) / 100).toString()
    }

    const getCurrentDate = () => {
      return date.formatDate(new Date(), 'YYYY-MM-DD')
    }

    const clearInputs = () => {
      if (patientForm.value) {
        patientForm.value.resetValidation()
      }

      patientData.value = {
        ...patientStore.patientInfoDefault,
        // Reset new fields
        philsys_id: '',
        philhealth_id: '',
        place_of_birth: '',
        civil_status: '',
        religion: '',
        education_attainment: '',
        occupation: '',
        income: '',
        // Reset permanent address fields
        perm_barangay: '',
        perm_purok: '',
        perm_street: '',
        perm_city: 'Tagum City',
        perm_province: 'Davao del Norte',
      }
      patientData.value.transaction_date = getCurrentDate()
      patientData.value.city = 'Tagum City'
      patientData.value.province = 'Davao del Norte'
      patientData.value.rep_city = 'Tagum City'
      patientData.value.rep_province = 'Davao del Norte'

      hasRepresentative.value = false
      sameAsPatientAddress.value = true
      sameAsPermanentAddress.value = true
      isChild.value = false
      isAdult.value = false
      isSenior.value = false
    }

    const submitPatientForm = async () => {
      const isValid = await patientForm.value.validate()

      if (!isValid) {
        $q.notify({
          type: 'negative',
          message: 'Please complete all required fields',
          position: 'top',
        })
        return
      }

      // Calculate BMI again to ensure latest value
      calculateBMI()

      // Update addresses if needed
      if (sameAsPermanentAddress.value) {
        updatePresentAddressFromPermanent()
      }

      if (hasRepresentative.value && sameAsPatientAddress.value) {
        updateRepAddressFromPatient()
      }

      // Format data for submission
      const formattedData = formatDataForSubmission()

      try {
        await patientStore.newPatient(formattedData)
        $q.notify({
          type: 'positive',
          message: 'Patient registration successful!',
          position: 'top',
          timeout: 1200,
        })
        clearInputs()

        router.push('/customers')
      } catch {
        showError.value = true
      }
    }

    // Format data before submission
    const formatDataForSubmission = () => {
      const formattedData = { ...patientData.value }

      // Ensure address data is properly set
      if (sameAsPermanentAddress.value) {
        formattedData.barangay = formattedData.perm_barangay
        formattedData.purok = formattedData.perm_purok
        formattedData.street = formattedData.perm_street
        formattedData.city = formattedData.perm_city
        formattedData.province = formattedData.perm_province
      }

      if (hasRepresentative.value && sameAsPatientAddress.value) {
        formattedData.rep_barangay = formattedData.barangay
        formattedData.rep_purok = formattedData.purok
        formattedData.rep_street = formattedData.street
        formattedData.rep_city = formattedData.city
        formattedData.rep_province = formattedData.province
      }

      // Convert numeric values to strings
      const numericFields = [
        'height',
        'weight',
        'age',
        'heart_rate',
        'respiratory_rate',
        'pulse_rate',
        'temperature',
        'sp02',
        'waist',
      ]

      numericFields.forEach((field) => {
        if (formattedData[field]) {
          formattedData[field] = formattedData[field].toString()
        }
      })

      return formattedData
    }

    // Watch permanent address fields to update present address if same
    watch(
      [
        () => patientData.value.perm_barangay,
        () => patientData.value.perm_purok,
        () => patientData.value.perm_street,
        () => patientData.value.perm_city,
        () => patientData.value.perm_province,
      ],
      () => {
        if (sameAsPermanentAddress.value) {
          updatePresentAddressFromPermanent()
        }
      },
    )

    // Watch present address fields to update rep address if same
    watch(
      [
        () => patientData.value.barangay,
        () => patientData.value.purok,
        () => patientData.value.street,
        () => patientData.value.city,
        () => patientData.value.province,
      ],
      () => {
        if (sameAsPatientAddress.value && hasRepresentative.value) {
          updateRepAddressFromPatient()
        }
      },
    )

    return {
      TagumBarangay,
      patientStore,
      patientForm,
      patientData,
      showError,
      errorMessage,
      isChild,
      isAdult,
      isSenior,
      isFemale,
      hasRepresentative,
      sameAsPatientAddress,
      sameAsPermanentAddress,
      civilStatusOptions,
      religionOptions,
      educationOptions,
      incomeOptions,

      handleBirthdateChange,
      calculateBMI,
      clearInputs,
      submitPatientForm,
      handleSameAddressChange,
      handleSamePermAddressChange,
      updateRepAddressFromPatient,
      updatePresentAddressFromPermanent,
    }
  },
})
</script>
