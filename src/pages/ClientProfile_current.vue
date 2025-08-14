<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1820px; width: 100%">
        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-sm" style="max-width: 1000px; width: 100%">
              <div class="text-h6 text-blue text-weight-bolder">Patient Name</div>
              <q-separator></q-separator>
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.lastname"
                    label="Last name"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.firstname"
                    label="First name"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-3 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.middlename"
                    label="Middle name"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-1 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.ext"
                    label="Ext"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
              </div>
              <div class="row q-gutter-sm">
                <div class="col-12 col-md-1 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.gender"
                    label="Gender"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-1 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.age"
                    label="Age"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-1 q-pa-sm">
                  <q-input
                    dense
                    v-model="costumer.category"
                    label="Category"
                    class="full-width text-caption text-uppercase"
                    readonly
                  />
                </div>
              </div>
            </q-card>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-pa-sm flex justify-center">
            <q-card class="q-pa-sm" style="max-width: 1000px; width: 100%">
              <div class="text-h6 text-blue text-weight-bolder">Orders</div>
              <!-- <div class="text-caption text-weight-regular" style="color:grey;">Transacation ID: {{ this.transaction_id }}</div> -->
              <q-separator />
              <q-table
                bordered
                dense
                :rows="rows"
                :columns="cols"
                row-key="id"
                no-data-label="No data available"
              >
                <template v-slot:top-left>
                  <!-- <q-btn color="primary" label="Add Order" icon="add" flat @click="getAvailableMedList()"/> -->
                  <!-- <q-select :options="transactionIDList" label="Transaction ID" v-model="selectedTransactionID" @click="getOrders(selectedTransactionID)" style="width: 200px;"></q-select> -->
                </template>
                <template #body="props">
                  <q-tr :v-bind="props">
                    <q-td key="brand_name" style="font-size: 11px" align="left">
                      {{ props.row.brand_name }}
                    </q-td>
                    <q-td key="generic_name" style="font-size: 11px" align="left">
                      {{ props.row.generic_name }}
                    </q-td>
                    <q-td key="dosage" style="font-size: 11px" align="left">
                      {{ props.row.dosage }}
                    </q-td>
                    <q-td key="quantity" style="font-size: 11px" align="left">
                      {{ props.row.quantity }}
                    </q-td>
                    <q-td key="unit" style="font-size: 11px" align="left">
                      <!-- {{ props.row.unit }} -->
                      pcs
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card>
          </div>
        </q-card-section>
        <div align="right">
          <q-btn color="grey" label="Back" @click="$router.go(-1)" />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { useCustomerStore } from 'src/stores/customersStore'
import { useItemStore } from 'src/stores/itemsStore'
import { useTransactionStore } from 'src/stores/transactionStore'
export default {
  setup() {
    return {
      cols: [
        {
          name: 'brand_name',
          label: 'Brandname',
          field: 'brand_name',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'generic_name',
          label: 'Generic Name',
          field: 'generic_name',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'dosage',
          label: 'Dosage',
          field: 'dosage',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
        {
          name: 'quantity',
          label: 'Quantity',
          field: 'quantity',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },

        {
          name: 'unit',
          label: 'Unit',
          field: 'unit',
          sortable: true,
          align: 'left',
          headerClasses: 'bg-grey-7 text-white',
          headerStyle: 'font-size: 1.2 em',
        },
      ],
    }
  },
  data() {
    return {
      selectedTransactionID: '',
      transactionIDList: [],
      rows: [],
      costumer: {
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

      transactionDetails: {
        transaction_id: '',
        customer_id: 0,
        transaction_date: 0,
        item_id: 0,
        quantity: 0,
        user_id: 0,
      },
    }
  },
  mounted() {
    console.log(this.customerStore.customer_id)
    this.get_client(this.customerStore.customer_id)
    //this.getTransactionIds(this.customerStore.customer_id)
    this.getOrders(this.customerStore.transactions_id)
  },
  methods: {
    async getTransactionIds(id) {
      await this.transactionStore.getTransactionID(id)
      // console.log( this.transactionStore.customerTransactionsIdList)

      this.transactionIDList = this.transactionStore.customerTransactionsIdList
    },

    async getOrders(transaction_id) {
      await this.transactionStore.getTransactionOrders(transaction_id)
      this.rows = this.transactionStore.customerTransactions
    },

    async get_client(id) {
      await this.customerStore.getCustomer(id)
      this.costumer = this.customerStore.customer
    },

    show_id(id) {
      this.$q.notify({
        type: 'positive',
        message: `user id: ${id} is selected`,
        position: 'center',
        timeout: 1200,
      })
      console.log(id)
      this.searchTerm = ''
    },
  },

  watch: {
    selectedTransactionID(newvalue) {
      this.getOrders(newvalue)
    },
  },
  computed: {
    customerStore() {
      return useCustomerStore()
    },
    itemStore() {
      return useItemStore()
    },
    transactionStore() {
      return useTransactionStore()
    },
  },
}
</script>

<style scoped>
.q-item {
  transition: background-color 0.3s ease;
}

.q-item:hover {
  background-color: #f0f0f0; /* Example hover color */
  cursor: pointer;
}

.q-item.active {
  background-color: #ccc; /* Example active color */
}

.q-item.active:hover {
  background-color: #aaa; /* Example active hover color */
}
</style>
