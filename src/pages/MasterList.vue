<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <!-- Top Filters Section -->
        <q-card-section>
          <div class="row items-center q-col-gutter-md justify-space-between">
            <!-- Search Input -->
            <div class="col-12 col-md-6">
              <q-input filled dense v-model="search" label="Search Patients" class="q-mb-none">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <!-- Date Filter -->
            <div class="col-12 col-md-6">
              <q-input
                filled
                dense
                v-model="selectedDate"
                label="Filter by Date"
                type="date"
                class="q-mb-none"
              />
            </div>
          </div>
        </q-card-section>
        <!-- Table Section -->
        <q-card-section>
          <q-table
            flat
            bordered
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            binary-state-sort
            no-data-label="No data available"
            title="Patient Logs"
            title-class="text-bold text-subtitle1 text-green-9"
            square
            :rows-per-page-options="[0]"
            style="height: 600px"
          >
            <template v-slot:top-right>
              <q-btn color="green-9" label="New Patient" to="/customer" icon="add" flat />
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="fullName" style="font-size: 11px">{{ props.row.fullName }}</q-td>
                <q-td key="contact_number" style="font-size: 11px">{{
                  props.row.contact_number
                }}</q-td>
                <q-td key="status" style="font-size: 11px">{{
                  getPatientStepStatus(props.row)
                }}</q-td>
                <q-td key="actions" align="center">
                  <q-btn
                    flat
                    color="primary"
                    icon="description"
                    @click="showPatientDetail(props.row.id)"
                    :to="'/customers/profile'"
                    class="q-mr-sm"
                  />
                  <q-btn
                    v-if="getPatientStepStatus(props.row) === 'Billing'"
                    flat
                    color="positive"
                    icon="receipt_long"
                    @click="showClient(props.row, '/billing/report')"
                    class="q-mr-sm"
                  />
                  <q-btn
                    v-if="getPatientStepStatus(props.row) === 'GL'"
                    flat
                    color="secondary"
                    icon="list_alt"
                    @click="showClient(props.row, '/gl/report')"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '../stores/patientStore'

const router = useRouter()
const Patients = usePatientStore()
const search = ref('')
const selectedDate = ref(new Date().toISOString().substring(0, 10))

const columns = [
  {
    name: 'fullName',
    label: 'Full Name',
    field: 'fullName',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
  },
  {
    name: 'contact_number',
    label: 'Contact Number',
    field: 'contact_number',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    headerClasses: 'bg-grey-7 text-white',
  },
]

const rows = computed(() => Patients.patientsWithFullName)

function getPatientStepStatus(patient) {
  const tx = patient.latest_transaction
  if (!tx) return ''

  if (tx.status === 'for assessment') return 'Assessment'
  if (tx.guarantee_letter && tx.guarantee_letter.status === 'Funded') {
    return 'Completed'
  }
  if (tx.status === 'qualified') {
    const hasLaboratories = Array.isArray(tx.laboratories) && tx.laboratories.length > 0
    if (hasLaboratories) {
      const labStatus = tx.laboratories[0]?.status
      if (labStatus === 'Pending') return 'Laboratory'
      if (labStatus === 'Done') return 'Billing'
      if (labStatus === 'Returned') return 'Returned Consultation'
    }
    const hasConsultation = !!tx.consultation
    const hasMedication = !!tx.medication
    if (hasMedication && tx.medication.status === 'Done') {
      return 'Billing'
    }

    if (!hasConsultation && !hasLaboratories && !hasMedication) {
      if (tx.transaction_type === 'Consultation') return 'New Consultation'
      return tx.transaction_type || 'Qualified'
    }

    if (hasConsultation && tx.consultation.status) {
      if (tx.consultation.status === 'Processing') return 'Laboratory'
      if (tx.consultation.status === 'Returned') return 'Returned Consultation'
      if (tx.consultation.status === 'Medication') return 'Medication'
      if (tx.consultation.status === 'Done') return 'Billing'
    }
  }

  if (tx.status === 'Done') return 'Billing'
  if (tx.status === 'Funded') return 'Completed'
  if (tx.status === 'Complete') return 'GL'

  return tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : ''
}

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    const statusText = getPatientStepStatus(row)
    const matchesSearch =
      row.fullName.toLowerCase().includes(search.value.toLowerCase()) ||
      row.contact_number?.toLowerCase().includes(search.value.toLowerCase()) ||
      statusText.toLowerCase().includes(search.value.toLowerCase())

    const rowDate = row.latest_transaction?.transaction_date?.substring(0, 10)
    const matchesDate = selectedDate.value === '' || rowDate === selectedDate.value

    return matchesSearch && matchesDate
  })
})

function showClient(row, route) {
  Patients.patient_id = row.id
  Patients.transaction_id = row.latest_transaction?.id || (row.transaction?.[0]?.id ?? null)
  router.push(route)
}

function showPatientDetail(id) {
  Patients.isEdit = true
  Patients.isSave = false
  Patients.patient_id = id
}

const getPatients = async () => {
  try {
    await Patients.fetchMasterListPatients()
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  }
}

onMounted(() => {
  getPatients()
})
</script>
