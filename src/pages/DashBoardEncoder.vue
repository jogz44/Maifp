<template>
  <q-page padding>
    <!-- Patient Monitoring Section -->
    <div class="text-h6 text-green-9 font-bold q-mt-none q-mb-md">Patient Monitoring</div>

    <!-- Header Fund Cards by Source -->
    <!-- <div class="row q-col-gutter-md q-mb-lg">
      <template v-if="fundLoading">
        <div v-for="i in 6" :key="`skeleton-${i}`" class="col-xs-12 col-sm-4 col-md-2">
          <q-card>
            <q-card-section>
              <q-skeleton type="text" width="60%" />
              <q-skeleton type="text" class="text-h6 q-mt-xs" width="80%" />
              <q-skeleton type="text" class="text-caption" width="50%" />
            </q-card-section>
          </q-card>
        </div>
      </template>


      <template v-else>
        <div
          v-for="(fundSource, index) in fundStore.releasedFundsBySource"
          :key="index"
          class="col-xs-12 col-sm-4 col-md-2"
        >
          <q-card>
            <q-card-section>
              <div class="text-h7 text-green-9 font-bold">{{ fundSource.fund_source }}</div>
              <div class="text-h6 text-green-7 q-mt-xs">
                ₱ {{ Number(fundSource.total_amount).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-7">
                {{ fundSource.patient_count }} patient{{
                  fundSource.patient_count !== 1 ? 's' : ''
                }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div> -->

    <!-- Steps -->
    <div class="row q-col-gutter-md">
      <div v-for="(step, index) in steps" :key="index" class="col-xs-12 col-sm-6 col-md">
        <router-link :to="step.route" class="no-decoration">
          <q-card class="h-100 cursor-pointer" hover>
            <!-- Header -->
            <q-card-section class="bg-green-9 text-white flex justify-between items-center">
              <div class="text-h7">{{ step.name }}</div>
              <q-badge rounded :color="step.patients.length > 0 ? 'red-9' : 'grey'" class="q-ml-sm">
                {{ step.patients.length }}
              </q-badge>
            </q-card-section>

            <q-separator />

            <!-- Patients -->
            <q-card-section class="scroll-hidden" style="min-height: 150px">
              <!-- Loading state for each step -->
              <div v-if="step.loading" class="flex flex-center q-pa-md">
                <q-spinner-dots size="40px" color="green-9" />
              </div>

              <!-- Patient list -->
              <div v-else class="row q-col-gutter-sm">
                <div
                  v-for="(patient, pIndex) in step.patients"
                  :key="pIndex"
                  class="col-12 q-mb-xs"
                >
                  {{ patient?.firstname || patient?.patient?.firstname || 'Unknown' }}
                  {{ patient.lastname || patient?.patient?.lastname || 'Unknown' }}
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
        { name: 'Services', patients: [], route: '#', loading: false },
        { name: 'PhilHealth', patients: [], route: '#', loading: false },
        { name: 'Billing', patients: [], route: '#', loading: false },
        { name: 'MAIFIP', patients: [], route: '#', loading: false },
        { name: 'GL', patients: [], route: '#', loading: false },
      ],
      intervalId: null,
      fundStore: null,
      patientStore: null,
      fundLoading: false,
    }
  },

  // data() {
  //   return {
  //     steps: [
  //       { name: 'Assessment', patients: [], route: '/assessment', loading: false },
  //       {
  //         name: 'New Consultation',
  //         patients: [],
  //         route: '/customers/newconsultation',
  //         loading: false,
  //       },
  //       { name: 'Laboratory', patients: [], route: '/customers/laboratory', loading: false },
  //       {
  //         name: 'Reconsultation',
  //         patients: [],
  //         route: '/customers/returnconsultation',
  //         loading: false,
  //       },
  //       { name: 'Medicine', patients: [], route: '#', loading: false },
  //       { name: 'PhilHealth', patients: [], route: '/philhealth', loading: false },
  //       { name: 'Billing', patients: [], route: '/billing', loading: false },
  //       { name: 'GL', patients: [], route: '/gl', loading: false },
  //     ],
  //     intervalId: null,
  //     fundStore: null,
  //     patientStore: null,
  //     fundLoading: false,
  //   }
  // },

  created() {
    this.fundStore = useFundsStore()
    this.patientStore = usePatientStore()
    this.loadAllData()
    this.intervalId = setInterval(this.loadAllData, 100000000)
  },

  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId)
  },

  methods: {
    async loadStepPatients() {
      // Set loading state for all steps
      this.steps.forEach((step) => (step.loading = true))

      const fetchMethods = [
        this.patientStore.fetchPatientsLaboratory(),
        this.patientStore.fetchPatientsPhilHealth(),
        this.patientStore.fetchPatientsBilling(),
        this.patientStore.fetchPatientsAssessment(),
        this.patientStore.fetchPatientsGL(),
      ]

      // const fetchMethods = [
      //   this.patientStore.fetchPatientsAssessment(),
      //   this.patientStore.fetchPatientsNew(),
      //   this.patientStore.fetchPatientsLaboratory(),
      //   this.patientStore.fetchPatientsReturned(),
      //   this.patientStore.fetchPatientsMedicine(),
      //   this.patientStore.fetchPatientsPhilHealth(),
      //   this.patientStore.fetchPatientsBilling(),
      //   this.patientStore.fetchPatientsGL(),
      // ]

      const results = await Promise.allSettled(fetchMethods)

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.steps[index].patients = result.value
        } else {
          console.error(`Error loading ${this.steps[index].name}:`, result.reason)
          this.steps[index].patients = []
        }
        // Set loading to false for each step
        this.steps[index].loading = false
      })
    },

    async loadAllData() {
      this.fundLoading = true

      await Promise.allSettled([this.fundStore.fetchFundsDashboard(), this.loadStepPatients()])

      this.fundLoading = false
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
