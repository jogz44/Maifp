<template>
  <q-page class="q-pa-md">
    <!-- Patient Information Card -->
    <q-card flat bordered>
      <q-card-section class="bg-green-9 text-white">
        <div class="text-subtitle1 q-my-none">Patients Information</div>
      </q-card-section>

      <q-form @submit.prevent="submitPatientForm" ref="patientForm">
        <q-card-section>
          <!-- Personal Details Section -->
          <div class="row q-col-gutter-md">
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
                type="number"
              />
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Address Section -->
          <div class="q-mb-md">
            <div class="row items-center">
              <div class="text-subtitle2 q-mb-sm">Address Information</div>
              <q-space />
              <q-checkbox
                v-model="isNotFromCity"
                label="Not From This City"
                @change="handleLocationToggle"
                class="text-caption"
              />
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  outlined
                  dense
                  v-model="patientData.barangay"
                  :options="isNotFromCity ? [] : TagumBarangay.barangay"
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
                  :readonly="!isNotFromCity"
                  lazy-rules
                  :rules="[
                    (val) => !isNotFromCity || !!val || 'City is required when not from Tagum City',
                  ]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="patientData.province"
                  label="Province"
                  class="text-caption"
                  :readonly="!isNotFromCity"
                  lazy-rules
                  :rules="[
                    (val) =>
                      !isNotFromCity || !!val || 'Province is required when not from Tagum City',
                  ]"
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

            <div class="col-12 col-md-6">
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
            <!-- <div class="col-12 col-md-6">
              <q-select
                outlined
                dense
                v-model="patientData.transaction_mode"
                :options="patientStore.transactionModes"
                label="Mode of Transaction"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Mode is required']"
              />
            </div> -->
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

    // Form data - use a single patientData object
    const patientData = ref({ ...patientStore.patientInfoDefault })

    // UI state
    const showError = ref(false)
    const isNotFromCity = ref(false)
    const isChild = ref(false)
    const isAdult = ref(false)
    const isSenior = ref(false)

    // Computed properties
    const errorMessage = computed(() => {
      if (Array.isArray(patientStore.error)) {
        return patientStore.error.join('\n')
      }
      return patientStore.error
    })

    // Initialize component
    onMounted(() => {
      // Set default date for transaction
      patientData.value.transaction_date = date.formatDate(new Date(), 'YYYY-MM-DD')

      // Reset any patient ID that might be stored
      patientStore.patient_id = null
      patientStore.isSave = true

      // Set default city and province
      patientData.value.city = 'Tagum City'
      patientData.value.province = 'Davao del Norte'
    })

    // Clean up when component is destroyed
    onUnmounted(() => {
      patientStore.resetStore()
    })

    // Watch for age changes to update category
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

    // Methods
    const handleBirthdateChange = () => {
      if (patientData.value.birthdate) {
        patientData.value.age = patientStore.calculateAge(patientData.value.birthdate)
      }
    }

    const handleLocationToggle = () => {
      patientData.value.is_not_tagum = isNotFromCity.value

      if (!isNotFromCity.value) {
        patientData.value.city = 'Tagum City'
        patientData.value.province = 'Davao del Norte'
      } else {
        patientData.value.city = ''
        patientData.value.province = ''
      }
    }

    // Fixed BMI calculation function
    const calculateBMI = () => {
      const height = parseFloat(patientData.value.height)
      const weight = parseFloat(patientData.value.weight)

      if (!height || !weight || height <= 0 || weight <= 0) {
        patientData.value.bmi = ''
        return
      }

      // Convert height from cm to meters
      const heightInMeters = height / 100

      // Calculate BMI: weight (kg) / (height (m) * height (m))
      const bmi = weight / (heightInMeters * heightInMeters)

      // Round to 2 decimal places AND convert to string
      patientData.value.bmi = (Math.round(bmi * 100) / 100).toString()
    }

    const getCurrentDate = () => {
      return date.formatDate(new Date(), 'YYYY-MM-DD')
    }

    const clearInputs = () => {
      if (patientForm.value) {
        patientForm.value.resetValidation()
      }

      patientData.value = { ...patientStore.patientInfoDefault }
      patientData.value.transaction_date = getCurrentDate()
      patientData.value.city = 'Tagum City'
      patientData.value.province = 'Davao del Norte'

      isNotFromCity.value = false
      isChild.value = false
      isAdult.value = false
      isSenior.value = false
    }

    const submitPatientForm = async () => {
      // Validate form
      const isValid = await patientForm.value.validate()

      if (!isValid) {
        $q.notify({
          type: 'negative',
          message: 'Please complete all required fields',
          position: 'top',
        })
        return
      }

      // Make sure BMI is calculated and stored as string
      calculateBMI()

      // Ensure numeric fields are properly formatted for API
      const formattedData = { ...patientData.value }

      // Convert numeric values to strings for the backend
      if (formattedData.height) formattedData.height = formattedData.height.toString()
      if (formattedData.weight) formattedData.weight = formattedData.weight.toString()
      if (formattedData.age) formattedData.age = formattedData.age.toString()
      if (formattedData.heart_rate) formattedData.heart_rate = formattedData.heart_rate.toString()
      if (formattedData.respiratory_rate)
        formattedData.respiratory_rate = formattedData.respiratory_rate.toString()
      if (formattedData.pulse_rate) formattedData.pulse_rate = formattedData.pulse_rate.toString()
      if (formattedData.temperature)
        formattedData.temperature = formattedData.temperature.toString()
      if (formattedData.sp02) formattedData.sp02 = formattedData.sp02.toString()
      if (formattedData.waist) formattedData.waist = formattedData.waist.toString()

      try {
        // Create new patient
        await patientStore.newPatient(formattedData)
        $q.notify({
          type: 'positive',
          message: 'Patient registration successful!',
          position: 'top',
          timeout: 1200,
        })
        clearInputs()

        // Navigate back to patient list
        router.push('/customers')
      } catch {
        showError.value = true
      }
    }

    return {
      TagumBarangay,
      patientStore,
      patientForm,
      patientData,
      showError,
      errorMessage,
      isNotFromCity,
      isChild,
      isAdult,
      isSenior,

      // Methods
      handleBirthdateChange,
      handleLocationToggle,
      calculateBMI,
      getCurrentDate,
      clearInputs,
      submitPatientForm,
    }
  },
})
</script>
