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
          <!-- Table shown only after loading -->
          <q-table
            flat
            bordered
            :filter="search"
            :filter-method="customFilter"
            :rows="rows"
            :columns="columns"
            row-key="id"
            binary-state-sort
            no-data-label="No data available"
            title="CONSULTATION PATIENT LOG"
            title-class="text-bold text-subtitle1 text-green-9"
            square
            :rows-per-page-options="[0]"
            style="height: 600px"
            :loading="loading"
          >
            <template #loading>
              <q-inner-loading showing>
                <q-spinner size="50px" color="primary" />
              </q-inner-loading>
            </template>

            <template #body="props">
              <q-tr v-bind="props">
                <q-td key="fullname">
                  {{
                    `${props.row.firstname || ''} ${
                      props.row.middlename && props.row.middlename !== 'NA'
                        ? props.row.middlename + ' '
                        : ''
                    }${props.row.lastname || ''}${
                      props.row.ext && props.row.ext !== 'NA' ? ' ' + props.row.ext : ''
                    }`
                  }}
                </q-td>
                <q-td key="birthdate">{{ props.row.birthdate }}</q-td>
                <q-td key="age">{{ props.row.age }}</q-td>
                <q-td key="barangay">{{ props.row.barangay }}</q-td>
                <q-td key="contact_number">{{ props.row.contact_number }}</q-td>
                <q-td key="status">
                  <span class="text-black">
                    {{ props.row.transaction?.[0]?.status || 'not started' }}
                  </span>
                </q-td>
                <q-td key="actions" align="center">
                  <q-btn
                    flat
                    color="primary"
                    icon="description"
                    @click="showClient(props.row.id)"
                    to="/customers/viewPatientLog"
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
          name: 'fullname',
          label: 'Fullname',
          field: (row) => {
            const mid = row.middlename ? `${row.middlename[0]}. ` : ''
            const ext = row.ext && row.ext !== 'NA' ? ` ${row.ext}` : ''
            return `${row.firstname} ${mid}${row.lastname}${ext}`.toUpperCase()
          },
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'birthdate',
          label: 'Birthdate',
          field: 'birthdate',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'age',
          label: 'Age',
          field: 'age',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'barangay',
          label: 'Barangay',
          field: 'barangay',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'contact_number',
          label: 'Contact No.',
          field: 'contact_number',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'status',
          label: 'Status',
          field: (row) => row.transaction?.[0]?.status ?? 'not started',
          align: 'left',
          sortable: true,
          headerClasses: 'bg-grey-7 text-white',
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'center',
          headerClasses: 'bg-grey-7 text-white',
        },
      ],
    }
  },

  data() {
    return {
      search: '',
      rows: [],
      loading: false,
    }
  },

  computed: {
    Patients() {
      return usePatientStore()
    },
  },

  methods: {
    async getPatients() {
      this.loading = true
      try {
        const consultations = await this.Patients.getConsultationList()
        const detailedPatients = await Promise.all(
          consultations.map(async (c) => {
            try {
              const fullData = await this.Patients.getPatient(c.id)
              return { ...c, transaction: fullData?.transaction || [] }
            } catch {
              return { ...c, transaction: [] }
            }
          }),
        )

        this.rows = detailedPatients

        // Added: clean console log to see actual data
        console.log(
          'Patient data with status:',
          detailedPatients.map((p) => ({
            id: p.id,
            fullname: `${p.firstname} ${p.middlename || ''} ${p.lastname} ${p.ext || ''}`.trim(),
            status: p.transaction?.[0]?.status ?? 'not started',
          })),
        )
      } catch (error) {
        console.error('Error fetching patient logs:', error)
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

    customFilter(rows, terms) {
      if (!terms) return rows

      const searchTerms = terms
        .toLowerCase()
        .split(' ')
        .filter(word => word.trim() !== '')

      return rows.filter(row => {
        // Combine all searchable fields into one string
        const rowString = `
          ${row.lastname}
          ${row.firstname}
          ${row.middlename}
          ${row.ext}
          ${row.birthdate}
          ${row.age}
          ${row.contact_number}
          ${row.barangay}
        `.toLowerCase()

        // Every word typed must exist somewhere in the row
        return searchTerms.every(word => rowString.includes(word))
      })
    },
  },

  mounted() {
    this.getPatients()
  },
}
</script>
