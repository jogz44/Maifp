<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <q-card-section>
          <q-input filled v-model="search" label="Search Clients" class="text-h11">
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
            title="Client Logs/ History"
            title-class="text-bold text-subtitle1 text-primary"
            square
            :rows-per-page-options="[0]"
            style="height: 600px;"
          >

            <template v-slot:top-right>
              <q-btn
                color="primary"
                label="New Customer"
                to="/customer"
                icon="add"
                flat
              />
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
                <q-td key="ext" style="font-size: 11px" align="left">
                  {{ props.row.ext }}
                </q-td>
                <q-td key="birthdate" style="font-size: 11px" align="left">
                  {{ props.row.birthdate }}
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

                <q-td key="actions" style="font-size: 11px" align="center">
                  <q-btn
                    flat
                    color="primary"
                    @click="showClient(props.row.id)"
                    icon="description"
                    to="/customers/profile"
                  />

                  <q-btn
                    flat
                    color="amber"
                    @click="showClient(props.row.id)"
                    icon="edit"
                    to="/customer"
                  />

                  <q-btn
                    flat
                    color="negative"
                    @click="showDeletepage(props.row.id)"
                    icon="delete"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="DeleteClient" persistent>
      <q-card class="q-pa-sm" style="max-width: 400px; width: 100%">
        <q-card-section>
          <div class="text-h6 text-primary">Do you want to delete this client?</div>
        </q-card-section>
        <q-card-actions align="right">
          <!-- Button to close dialog -->
          <q-btn flat label="Yes" color="primary" @click="remove_client()" />
          <q-btn flat label="No" color="red" @click="DeleteClient = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { useCustomerStore } from '../stores/customersStore'
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
      Selected_ID:0,
      DeleteClient: false,
      search: '',
      rows: [],

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
  methods:{


    showDeletepage(id) {
      this.Customers.customer_id = id
      this.DeleteClient = !this.DeleteClient
    },

    showClient(id) {
      this.Customers.isEdit = true
      this.Customers.isSave = false
      this.Customers.customer_id = id
    },


    async get_clients() {
      try {
        await this.Customers.getCustomers()
        this.rows = this.Customers.customers //fetch all clients from array
        //console.log(this.rows)
      } catch (error) {
        console.log(error)
      }

    },

    async remove_client() {
      try {
        // await this.ClientStore.removeClient(this.Selected_ID)
        await this.Customers.removeCustomer( this.Customers.customer_id)
        this.$q.notify({ type: 'positive', message: 'Deleting record successful!', position: 'center', timeout:1200 });
        this.get_clients();
        this.DeleteClient = false
      } catch (error) {

        console.error(error)
      }
    }
  },
  computed:{
    Customers(){
      return useCustomerStore();
    }

  },
  mounted(){
    this.get_clients();
  }
}
</script>
