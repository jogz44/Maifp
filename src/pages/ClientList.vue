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
                <q-td key="lastname" style="font-size: 11px">{{ props.row.lastname }}</q-td>
                <q-td key="firstname" style="font-size: 11px">{{ props.row.firstname }}</q-td>
                <q-td key="middlename" style="font-size: 11px">{{ props.row.middlename }}</q-td>
                <q-td key="ext" style="font-size: 11px">{{ props.row.ext }}</q-td>
                <q-td key="birthdate" style="font-size: 11px">{{ props.row.birthdate }}</q-td>
                <q-td key="age" style="font-size: 11px">{{ props.row.age }}</q-td>
                <q-td key="contact_number" style="font-size: 11px">{{
                  props.row.contact_number
                }}</q-td>
                <q-td key="barangay" style="font-size: 11px">{{ props.row.barangay }}</q-td>
                <q-td key="actions" align="center">
                  <q-btn
                    flat
                    color="primary"
                    @click="showClient(props.row.id)"
                    icon="description"
                    to="/customers/profile"
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

<script>
import { ref, computed, onMounted } from 'vue'
import { usePatientStore } from '../stores/patientStore'

export default {
  setup() {
    const Patients = usePatientStore()

    const search = ref('')
    const selectedDate = ref(new Date().toISOString().substring(0, 10)) // Default to today
    const rows = ref([])

    // Columns configuration
    const columns = [
      {
        name: 'lastname',
        label: 'Last Name',
        field: 'lastname',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'firstname',
        label: 'First Name',
        field: 'firstname',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'middlename',
        label: 'Middle Name',
        field: 'middlename',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'ext',
        label: 'Ext',
        field: 'ext',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'birthdate',
        label: 'Birthdate',
        field: 'birthdate',
        sortable: true,
        align: 'left',
        headerClasses: 'bg-grey-7 text-white',
      },
      {
        name: 'age',
        label: 'Age',
        field: 'age',
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
        name: 'barangay',
        label: 'Barangay',
        field: 'barangay',
        sortable: true,
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

    // Filtered rows (search + date)
    const filteredRows = computed(() => {
      return rows.value.filter((row) => {
        const matchesSearch =
          row.firstname?.toLowerCase().includes(search.value.toLowerCase()) ||
          row.lastname?.toLowerCase().includes(search.value.toLowerCase()) ||
          row.middlename?.toLowerCase().includes(search.value.toLowerCase())

        const rowDate = row.created_at?.substring(0, 10)
        const matchesDate = selectedDate.value === '' || rowDate === selectedDate.value

        return matchesSearch && matchesDate
      })
    })

    // Load data from store
    const getPatients = async () => {
      try {
        await Patients.fetchPatients()
        rows.value = Patients.patients
      } catch (err) {
        console.error('Failed to fetch patients:', err)
      }
    }

    const showClient = (id) => {
      Patients.isEdit = true
      Patients.isSave = false
      Patients.patient_id = id
    }

    onMounted(() => {
      getPatients()
    })

    return {
      search,
      selectedDate,
      rows,
      columns,
      filteredRows,
      showClient,
    }
  },
}
</script>
