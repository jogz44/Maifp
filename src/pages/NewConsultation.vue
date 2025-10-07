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
            v-if="!loading"
            flat
            bordered
            :filter="search"
            :rows="rows"
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

            <template #body="props">
              <q-tr v-bind="props">
                <q-td key="lastname" align="left">{{ props.row.lastname }}</q-td>
                <q-td key="firstname" align="left">{{ props.row.firstname }}</q-td>
                <q-td key="middlename" align="left">{{ props.row.middlename }}</q-td>
                <q-td key="ext" align="left">{{ props.row.ext }}</q-td>
                <q-td key="birthdate" align="left">{{ props.row.birthdate }}</q-td>
                <q-td key="age" align="left">{{ props.row.age }}</q-td>
                <q-td key="contact_number" align="left">{{ props.row.contact_number }}</q-td>
                <q-td key="barangay" align="left">{{ props.row.barangay }}</q-td>

                <q-td key="actions" align="center">
                  <q-btn
                    flat
                    color="primary"
                    @click="showClient(props.row.id)"
                    icon="description"
                    to="/customers/newPatient"
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
import { usePatientStore } from '../stores/patientStore'
export default {
  setup() {
    return {
      columns: [
        {
          name: 'lastname',
          label: 'Last Name',
          field: 'lastname',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'firstname',
          label: 'First Name',
          field: 'firstname',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'middlename',
          label: 'Middle Name',
          field: 'middlename',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'ext',
          label: 'Ext',
          field: 'ext',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },

        {
          name: 'birthdate',
          label: 'Birthdate',
          field: 'birthdate',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },

        {
          name: 'age',
          label: 'Age',
          field: 'age',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },

        {
          name: 'contact_number',
          label: 'Contact Number',
          field: 'contact_number',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'barangay',
          label: 'Barangay',
          field: 'barangay',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },

        {
          name: 'Actions',
          label: 'Actions',
          field: 'actions',
          align: 'center',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
      ],
    }
  },

  data() {
    return {
      Selected_ID: 0,
      DeleteClient: false,
      search: '',
      rows: [
      ],
      loading: false,

      CustomerInfo: {
        firstname: '',
        lastname: '',
        middlename: '',
        ext: '',
        birthdate: '',
        contact_number: '',
        age: 0,
        gender: '',
        is_not_tagum: false,
        street: '',
        purok: '',
        barangay: '',
        city: 'Tagum City',
        province: 'Davao del Norte',
        category: '',
        is_pwd: false,
        is_solo: false,
        user_id: 0,
      },
    }
  },
  methods: {
    async getPatients() {
      this.loading = true
      try {
        const patients = await this.Patients.fetchQualifiedPatients()
        this.rows = Array.isArray(patients) ? patients.map(p => ({ ...p })) : []
        console.log('Fetched qualified patients:', this.rows)
      } catch (error) {
        console.error('Error fetching qualified patients:', error)
        this.rows = []
      } finally {
        this.loading = false 
      }
    },

    showClient(id) {
      this.Patients.isEdit = true
      this.Patients.isSave = false
      this.Patients.patient_id = id
    },
  },

  computed: {
    Patients() {
      return usePatientStore()
    },
  },

  mounted() {
    this.getPatients()
  },
}
</script>
