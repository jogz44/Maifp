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
            :loading="isLoading"
            row-key="id"
            binary-state-sort
            no-data-label="No data available"
            title="PhilHealth"
            title-class="text-bold text-subtitle1 text-green-9"
            square
            :rows-per-page-options="[0]"
            style="height: 600px"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="green-9">
                <q-spinner-gears size="50px" color="green-9" />
                <div class="q-mt-md text-green-9">Loading patients...</div>
              </q-inner-loading>
            </template>
            <template #body="props">
              <q-tr :v-bind="props">
                <q-td key="lastname" style="font-size: 11px" align="left">
                  {{ props.row.lastname }}
                </q-td>
                <q-td key="firstname" style="font-size: 11px" align="left">
                  {{ props.row.firstname }}
                </q-td>
                <q-td key="middle_name" style="font-size: 11px" align="left">
                  {{ props.row.middlename }}
                </q-td>

                <q-td key="age" style="font-size: 11px" align="left">
                  {{ props.row.age }}
                </q-td>
                <q-td key="contact_number" style="font-size: 11px" align="left">
                  {{ props.row.contact_number }}
                </q-td>
                <q-td key="barangay" style="font-size: 11px" align="left">
                  {{ props.row.barangay }}
                </q-td>

                <!-- <q-td key="status" style="font-size: 11px" align="left">
                  {{ props.row.transaction[0]?.transaction_type || 'N/A' }}
                </q-td> -->

                <q-td key="actions" style="font-size: 11px" align="center">
                  <q-btn flat color="primary" @click="showClient(props.row)" icon="request_quote" />
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
import { ref, onMounted, computed } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useRouter } from 'vue-router'

const store = usePatientStore()
const router = useRouter()
const search = ref('')
const rows = ref([])
const isLoading = computed(() => store.isLoading)

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
    name: 'age',
    label: 'Age',
    field: 'age',
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
  // {
  //   name: 'status',
  //   label: 'Transaction Type',
  //   field: (row) => row.transaction[0]?.transaction_type || 'N/A',
  //   sortable: true,
  //   align: 'left',
  //   headerClasses: 'bg-grey-7 text-white',
  //   headerStyle: 'font-size: .9em',
  // },
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
  await store.fetchPatientsPhilHealth()
  rows.value = store.patients
}

function showClient(row) {
  store.patient_id = row.id
  store.transaction_id = row.transaction_id
  router.push('/philhealth/report')
}

onMounted(getPatients)
</script>
