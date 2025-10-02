<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <q-card-section>
          <q-input filled v-model="search" label="Search Patients" class="text-h11">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section>
          <q-table
            flat
            bordered
            :filter="search"
            :rows="rows"
            :columns="columns"
            row-key="id"
            binary-state-sort
            no-data-label="No data available"
            title="Guaranteed Letter"
            title-class="text-bold text-subtitle1 text-green-9"
            square
            :rows-per-page-options="[0]"
            style="height: 600px"
          >
            <template #body="props">
              <q-tr :v-bind="props">
                <q-td key="lastname" style="font-size: 11px" align="left">
                  {{ props.row.patient.lastname }}
                </q-td>
                <q-td key="firstname" style="font-size: 11px" align="left">
                  {{ props.row.patient.firstname }}
                </q-td>
                <q-td key="middlename" style="font-size: 11px" align="left">
                  {{ props.row.patient.middlename }}
                </q-td>

                <q-td key="contact_number" style="font-size: 11px" align="left">
                  {{ props.row.patient.contact_number }}
                </q-td>
                <q-td key="barangay" style="font-size: 11px" align="left">
                  {{ props.row.patient.barangay }}
                </q-td>
                <q-td key="status" style="font-size: 11px" align="left">
                  {{ props.row.transaction_type || 'N/A' }}
                </q-td>
                <q-td key="actions" style="font-size: 11px" align="center">
                  <q-btn flat color="blue-9" @click="showClient(props.row)" icon="article" />
                  <q-btn flat color="green-9" @click="showBill(props.row)" icon="payment" />
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
import { ref, onMounted } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useRouter } from 'vue-router'

const store = usePatientStore()
const router = useRouter()
const search = ref('')
const rows = ref([])

const columns = [
  {
    name: 'lastname',
    label: 'Last Name',
    field: 'lastname',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },
  {
    name: 'firstname',
    label: 'First Name',
    field: 'firstname',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },
  {
    name: 'middlename',
    label: 'Middle Name',
    field: 'middlename',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },

  {
    name: 'contact_number',
    label: 'Contact Number',
    field: 'contact_number',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },
  {
    name: 'barangay',
    label: 'Barangay',
    field: 'barangay',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },
  {
    name: 'status',
    label: 'Transaction Type',
    field: (row) => row.transaction_type || 'N/A',
    sortable: true,
    align: 'left',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    headerClasses: 'bg-grey-7 text-white',
    headerStyle: 'font-size: .9em',
  },
]

async function getPatients() {
  await store.fetchPatientsGL()
  rows.value = store.patients
}

function showClient(row) {
  console.log('Navigating with IDs:', {
    patientId: row.id || row.patient_id,
    transactionId: row.transaction_id,
  })

  store.patient_id = row.id || row.patient_id
  store.transaction_id = row.transaction_id

  router.push({
    path: '/gl/detail',
    query: {
      patientId: row.id || row.patient_id,
      transactionId: row.transaction_id,
    },
  })
}

function showBill(row) {
  console.log('Navigating with IDs:', {
    patientId: row.id || row.patient_id,
    transactionId: row.transaction_id,
  })

  store.patient_id = row.id || row.patient_id
  store.transaction_id = row.transaction_id

  router.push({
    path: '/gl/report',
    query: {
      patientId: row.id || row.patient_id,
      transactionId: row.transaction_id,
    },
  })
}

onMounted(getPatients)
</script>
