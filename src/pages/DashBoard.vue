<template>
  <q-page padding>
    <h6 class="text-2xl text-green-9 font-bold q-mb-md">Patient Monitoring</h6>

    <!-- Horizontal steps container -->
    <div class="row q-col-gutter-md">
      <!-- Individual step boxes -->
      <div v-for="(step, index) in steps" :key="index" class="col-xs-12 col-sm-6 col-md">
        <q-card class="h-100">
          <q-card-section class="bg-green-9 text-white">
            <div class="text-h7">Step {{ index + 1 }}: {{ step.name }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-sm">
              <div
                v-for="(patient, patientIndex) in step.patients"
                :key="patientIndex"
                class="col-12 q-mb-xs"
              >
                <!-- Patient name in colored chips -->
                <!-- <q-chip
                  :color="patientColors[patientIndex % patientColors.length]"
                  text-color="white"
                  size="md"
                >
                  {{ patient.firstName }}
                </q-chip> -->
                <div>{{ patient.firstName }}</div>
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
export default {
  name: 'PatientMonitoring',

  data() {
    return {
      // Colors for patient chips - will cycle through these
      patientColors: [
        'blue',
        'purple',
        'deep-orange',
        'teal',
        'pink',
        'indigo',
        'cyan',
        'amber',
        'red',
        'deep-purple',
      ],

      // Step data with patients
      steps: [
        {
          name: 'Assessment',
          patients: [{ firstName: 'John' }, { firstName: 'Jane' }, { firstName: 'Robert' }],
        },
        {
          name: 'Consultation',
          patients: [{ firstName: 'Emily' }, { firstName: 'Michael' }],
        },
        {
          name: 'Laboratory',
          patients: [{ firstName: 'Sarah' }, { firstName: 'David' }, { firstName: 'Lisa' }],
        },
        {
          name: 'Medicine',
          patients: [{ firstName: 'James' }],
        },
        {
          name: 'Billing',
          patients: [{ firstName: 'Patricia' }, { firstName: 'Richard' }],
        },
      ],
    }
  },
}
</script>

<style scoped>
/* Make chips take full width */
</style>
