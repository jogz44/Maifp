<template>
  <q-page padding>
    <h6 class="text-2xl text-green-9 font-bold q-mb-md">Patient Monitoring</h6>

    <!-- Header Fund Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-xs-12 col-sm-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Total Funds</div>
            <div class="text-subtitle1">₱ {{ fundStore.totalFunds.toLocaleString() }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Released Funds</div>
            <div class="text-subtitle1">₱ {{ fundStore.releasedFunds.toLocaleString() }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Remaining Funds</div>
            <div class="text-subtitle1">₱ {{ fundStore.remainingFunds.toLocaleString() }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Horizontal steps container -->
    <div class="row q-col-gutter-md">
      <!-- Individual step boxes -->
      <div v-for="(step, index) in steps" :key="index" class="col-xs-12 col-sm-6 col-md">
        <q-card class="h-100">
          <!-- Step Header with Badge -->
          <q-card-section class="bg-green-9 text-white flex justify-between items-center">
            <div class="text-h7">Step {{ index + 1 }}: {{ step.name }}</div>
            <q-badge :color="step.patients.length > 0 ? 'red-9' : 'grey'" class="q-ml-sm">
              {{ step.patients.length }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <!-- Step Patients -->
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-sm">
              <div
                v-for="(patient, patientIndex) in step.patients"
                :key="patientIndex"
                class="col-12 q-mb-xs"
              >
                {{ patient.lastname }}, {{ patient.firstname }}
              </div>

              <div v-if="step.patients.length === 0" class="col-12 text-grey text-center">
                No patients
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'
import { useFundsStore } from '../stores/fundingStore'
import { ref, onMounted } from 'vue'

export default {
  name: 'PatientMonitoring',

  setup() {
    const patientStore = usePatientStore()
    const fundStore = useFundsStore()

    // Steps definition
    const steps = ref([
      { name: 'Assessment', patients: [] },
      { name: 'New Consultation', patients: [] },
      { name: 'Laboratory', patients: [] },
      { name: 'Returned Consultation', patients: [] },
      { name: 'Medicine', patients: [] },
      { name: 'Billing', patients: [] },
      { name: 'GL', patients: [] },
    ])

    // Fetch patients per step
    const loadStepPatients = async () => {
      try {
        steps.value[0].patients = await patientStore.fetchPatientsAssessment()
        steps.value[1].patients = await patientStore.fetchPatientsNew()
        steps.value[2].patients = await patientStore.fetchPatientsLaboratory()
        steps.value[3].patients = await patientStore.fetchPatientsReturned()
        steps.value[4].patients = await patientStore.fetchPatientsMedicine()
        steps.value[5].patients = await patientStore.fetchPatientsBilling()
        steps.value[6].patients = await patientStore.fetchPatientsGL()
      } catch (err) {
        console.error('Error fetching patients per step:', err)
      }
    }

    onMounted(() => {
      fundStore.fetchFundsDashboard() // fetch funds on mount
      
      loadStepPatients()
    })

    return {
      steps,
      fundStore,
    }
  },
}
</script>
