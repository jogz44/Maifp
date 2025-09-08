<template>
  <q-page padding>
    <!-- Header Fund Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-xs-12 col-sm-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-green-9">Total Funds</div>
            <div class="text-subtitle1">₱ {{ fundStore.totalFunds.toLocaleString() }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-green-9">Released Funds</div>
            <div class="text-subtitle1">₱ {{ fundStore.releasedFunds.toLocaleString() }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-green-9">Remaining Funds</div>
            <div class="text-subtitle1">₱ {{ fundStore.remainingFunds.toLocaleString() }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Patient Monitoring Section -->
    <div class="text-h6 text-green-9 font-bold q-mt-none q-mb-md">Patient Monitoring</div>

    <!-- Steps -->
    <div class="row q-col-gutter-md">
      <div v-for="(step, index) in steps" :key="index" class="col-xs-12 col-sm-6 col-md">
        <router-link :to="step.route" class="no-decoration">
          <q-card class="h-100 cursor-pointer" hover>
            <!-- Header -->
            <q-card-section class="bg-green-9 text-white flex justify-between items-center">
              <div class="text-h7">Step {{ index + 1 }}: {{ step.name }}</div>
              <q-badge rounded :color="step.patients.length > 0 ? 'red-9' : 'grey'" class="q-ml-sm">
                {{ step.patients.length }}
              </q-badge>
            </q-card-section>

            <q-separator />

            <!-- Patients -->
            <q-card-section class="scroll-hidden">
              <div class="row q-col-gutter-sm">
                <div
                  v-for="(patient, pIndex) in step.patients"
                  :key="pIndex"
                  class="col-12 q-mb-xs"
                >
                  {{ patient.firstname }} {{ patient.lastname }}
                </div>

                <div v-if="step.patients.length === 0" class="col-12 text-grey text-center">
                  No patients
                </div>
              </div>
            </q-card-section>
          </q-card>
        </router-link>
      </div>
    </div>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'
import { useFundsStore } from 'src/stores/fundingStore'

export default {
  name: 'PatientMonitoring',

  data() {
    return {
      steps: [
        { name: 'Assessment', patients: [], route: '/assessment' },
        { name: 'GL', patients: [], route: '/gl' },
      ],
      intervalId: null,
      fundStore: null,
      patientStore: null,
    }
  },

  created() {
    this.fundStore = useFundsStore()
    this.patientStore = usePatientStore()
    this.loadAllData()
    this.intervalId = setInterval(this.loadAllData, 30000)
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId)
  },

  methods: {
    async loadStepPatients() {
      const results = await Promise.allSettled([
        this.patientStore.fetchPatientsAssessment(),
        this.patientStore.fetchPatientsGL(),
      ])

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.steps[index].patients = result.value
        } else {
          console.error(`Error loading ${this.steps[index].name}:`, result.reason)
          this.steps[index].patients = []
        }
      })
    },

    async loadAllData() {
      await Promise.allSettled([this.fundStore.fetchFundsDashboard(), this.loadStepPatients()])
    },
  },
}
</script>

<style>
.scroll-hidden {
  overflow-y: auto;
  scrollbar-width: none;
}
.scroll-hidden::-webkit-scrollbar {
  display: none;
}
.no-decoration {
  text-decoration: none;
  color: inherit;
}
</style>
