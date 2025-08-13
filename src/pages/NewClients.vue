<template>
  <q-page class="q-pa-md">
    <!-- Customer Information Card -->
    <q-card flat bordered>
      <q-card-section class="bg-green-9 text-white">
        <div class="text-subtitle1 q-my-none">Customer Information</div>
      </q-card-section>

      <q-form @submit.prevent="submitCustomerForm" ref="customerForm">
        <q-card-section>
          <!-- Personal Details Section -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="CustomerInfo.lastname"
                label="Lastname *"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Surname is required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="CustomerInfo.firstname"
                label="Firstname *"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Firstname is required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="CustomerInfo.middlename"
                label="Middlename"
                class="text-caption"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="CustomerInfo.ext"
                label="Ext."
                class="text-caption"
              />
            </div>
          </div>

          <!-- Personal Info Section -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-select
                outlined
                dense
                v-model="CustomerInfo.gender"
                :options="GenSelection"
                label="Gender *"
                class="text-caption"
                lazy-rules
                :rules="[(val) => !!val || 'Gender is required']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                type="date"
                v-model="CustomerInfo.birthdate"
                label="Birthdate *"
                class="text-caption"
                @change="calculateAge(CustomerInfo.birthdate)"
                lazy-rules
                :rules="[(val) => !!val || 'Birthdate is required']"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="CustomerInfo.age"
                label="Age"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="CustomerInfo.contact_number"
                label="Contact Number"
                class="text-caption"
                inputmode="numeric"
              />
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Address Section -->
          <div class="q-mb-md">
            <div class="row items-center">
              <div class="text-subtitle2 q-mb-sm">Address Information</div>
              <q-space />
              <q-checkbox
                v-model="isChecked"
                label="Not From This City"
                @change="toggledCheckbox"
                class="text-caption"
                @update:model-value="clearLocation"
              />
            </div>

            <div class="row q-col-gutter-md" v-if="!isChecked">
              <div class="col-12 col-md-4">
                <q-select
                  outlined
                  dense
                  v-model="CustomerInfo.barangay"
                  :options="TagumBarangay.barangay"
                  label="Barangay *"
                  class="text-caption"
                  lazy-rules
                  :rules="[(val) => !!val || 'Barangay is required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.purok"
                  label="Purok"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.street"
                  label="Street"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.city"
                  label="City"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.province"
                  label="Province"
                  class="text-caption"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md" v-else-if="isChecked">
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.barangay"
                  label="Barangay *"
                  class="text-caption"
                  lazy-rules
                  :rules="[(val) => !!val || 'Barangay is required']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.purok"
                  label="Purok"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.street"
                  label="Street"
                  class="text-caption"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.city"
                  label="City *"
                  class="text-caption"
                  lazy-rules
                  :rules="[(val) => !!val || 'City is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="CustomerInfo.province"
                  label="Province *"
                  class="text-caption"
                  lazy-rules
                  :rules="[(val) => !!val || 'Province is required']"
                />
              </div>
            </div>
          </div>

          <q-separator spaced inset />

          <!-- Category Section -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Customer Category</div>
            <div class="row q-gutter-md">
              <q-checkbox
                v-model="children"
                :val="'Children'"
                label="Children"
                class="text-caption"
                disable
              />
              <q-checkbox
                v-model="adult"
                :val="'Adult'"
                label="Adult"
                class="text-caption"
                disable
              />
              <q-checkbox
                v-model="senior"
                :val="'Senior'"
                label="Senior"
                class="text-caption"
                disable
              />
              <q-checkbox
                v-model="pwd"
                :val="'PWD'"
                label="PWD"
                class="text-caption"
                @change="toggled_pwd"
              />
              <q-checkbox
                v-model="solo"
                :val="'Solo'"
                label="Solo"
                class="text-caption"
                @change="toggled_solo"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Action Buttons -->
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" to="/customers" @click="clearInputs()" />
          <q-btn
            :label="Customer.isSave ? 'Save' : 'Update'"
            color="green-9"
            @click="submitCustomerForm()"
          />
        </q-card-actions>
      </q-form>
    </q-card>

    <!-- Transaction Table Section -->
    <q-card flat bordered class="q-mt-md">
      <q-card-section class="bg-green-9 text-white row items-center">
        <div class="text-subtitle1 q-my-none">Transaction History</div>
        <q-space />
        <q-btn
          color="white"
          outline
          icon="add"
          label="Add Transaction"
          dense
          @click="openAddTransactionDialog"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="transactions"
          :columns="transactionColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
          class="no-shadow"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.value)" text-color="white">
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="editTransaction(props.row)"
              />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDeleteTransaction(props.row.id)"
              />
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-6">
              <q-icon name="receipt_long" size="2em" class="q-mr-sm" />
              No transactions found for this customer
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Error Dialog -->
    <q-dialog v-model="showError" persistent>
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Error</div>
          <pre class="text-negative">{{ this.errorMsg[0] }}</pre>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Transaction Dialog -->
    <q-dialog v-model="transactionDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-subtitle1">
            {{ editingTransaction ? 'Edit Transaction' : 'New Transaction' }}
          </div>
        </q-card-section>

        <q-form @submit.prevent="saveTransaction" ref="transactionForm">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  outlined
                  v-model="currentTransaction.description"
                  label="Description *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Description is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  v-model.number="currentTransaction.amount"
                  label="Amount *"
                  type="number"
                  prefix="₱"
                  lazy-rules
                  :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  v-model="currentTransaction.transaction_date"
                  label="Transaction Date"
                  type="date"
                  :default-value="getCurrentDate()"
                />
              </div>
              <div class="col-12">
                <q-select
                  outlined
                  v-model="currentTransaction.status"
                  :options="[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Cancelled', value: 'Cancelled' },
                  ]"
                  option-label="label"
                  option-value="value"
                  map-options
                  emit-value
                  label="Status"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>
                          <q-badge
                            :color="getStatusColor(scope.opt.value)"
                            text-color="white"
                            class="q-mr-sm"
                          >
                            {{ scope.opt.label }}
                          </q-badge>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12">
                <q-input
                  outlined
                  v-model="currentTransaction.notes"
                  label="Notes"
                  type="textarea"
                  autogrow
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey" v-close-popup />
            <q-btn type="submit" flat label="Save" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Confirm Delete Dialog -->
    <q-dialog v-model="confirmDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this transaction?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteTransaction" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useTagumStore } from '../stores/TagumStore'
import { useCustomerStore } from '../stores/customersStore'
import { useLoginStore } from '../stores/loginSessionStore'
import { date } from 'quasar'

export default {
  setup() {
    const UserStore = useLoginStore()
    const TagumBarangay = useTagumStore()
    const Customer = useCustomerStore()

    return {
      UserStore,
      Customer,
      TagumBarangay,
      GenSelection: ['Male', 'Female', 'LGBTQ'],

      CustomerInfoDefault: {
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
  data() {
    return {
      user_id: 0,
      showError: false,
      errorMsg: [],
      isChecked: false,
      children: false,
      adult: false,
      senior: false,
      pwd: false,
      solo: false,
      customer_id: 0,
      selected_id: 0,

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

      // Transaction related data
      transactionDialog: false,
      confirmDeleteDialog: false,
      editingTransaction: false,
      transactionToDeleteId: null,
      currentTransaction: {
        id: null,
        customer_id: 0,
        description: '',
        amount: 0,
        transaction_date: '',
        status: 'Pending',
        notes: '',
      },
      transactions: [],
      transactionColumns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
        {
          name: 'description',
          label: 'Description',
          field: 'description',
          align: 'left',
          sortable: true,
        },
        {
          name: 'amount',
          label: 'Amount',
          field: 'amount',
          align: 'right',
          sortable: true,
          format: (val) => `₱${parseFloat(val).toFixed(2)}`,
        },
        {
          name: 'transaction_date',
          label: 'Date',
          field: 'transaction_date',
          align: 'left',
          sortable: true,
          format: (val) => this.formatDate(val),
        },
        { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],
    }
  },
  methods: {
    GetUserID() {
      const unsanitized_object = localStorage.getItem('user')
      const sanitized_object = unsanitized_object.replace('__q_objt|', '')
      const user = JSON.parse(sanitized_object)
      return user.id
    },

    async submitCustomerForm() {
      const isValid = await this.$refs.customerForm.validate()

      if (!isValid) {
        this.$q.notify({
          type: 'negative',
          message: 'Please complete all required fields',
          position: 'top',
        })
        return
      }

      if (this.Customer.isSave) {
        this.Insert_Customer(this.CustomerInfo)
      } else if (this.Customer.isEdit) {
        this.updateCustomer(this.Customer.customer_id, this.CustomerInfo)
      }
    },

    clearInputs() {
      this.$refs.customerForm.resetValidation()
      this.Customer.customer_id = 0
      this.CustomerInfo = JSON.parse(JSON.stringify(this.CustomerInfoDefault))
      this.Customer.closeNewCustomer = false
    },

    calculateAge(birthdate) {
      if (!birthdate) return 0

      const today = new Date()
      const birthDate = new Date(birthdate)

      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDifference = today.getMonth() - birthDate.getMonth()

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      this.CustomerInfo.age = age
      return age
    },

    clearLocation() {
      if (this.isChecked) {
        this.CustomerInfo.city = ''
        this.CustomerInfo.province = ''
      } else {
        this.CustomerInfo.city = 'Tagum City'
        this.CustomerInfo.province = 'Davao del Norte'
      }
    },

    toggledCheckbox() {
      this.isChecked = !this.isChecked
      this.CustomerInfo.is_not_tagum = this.isChecked
    },

    toggled_pwd() {
      this.pwd = !this.pwd
      this.CustomerInfo.is_pwd = this.pwd
    },

    toggled_solo() {
      this.solo = !this.solo
      this.CustomerInfo.is_solo = this.solo
    },

    async Insert_Customer(payload) {
      payload.user_id = this.GetUserID()
      try {
        this.errorMsg = []
        await this.Customer.newCustomer(payload)
        this.$q.notify({
          type: 'positive',
          message: 'Customer registration successful!',
          position: 'top',
          timeout: 1200,
        })
        this.CustomerInfo = { ...this.CustomerInfoDefault }
        this.Customer.closeNewCustomer = false

        // Load the customer's transactions if any
        if (this.Customer.customer_id) {
          this.fetchTransactions(this.Customer.customer_id)
        }
      } catch (error) {
        if (error.response) {
          const { data } = error.response
          if (data.errors) {
            this.errorMsg.push(data.errors)
          } else {
            this.errorMsg.push(data.message)
          }
        } else {
          this.errorMsg.push(error.message)
        }
        this.showError = true
        console.error(this.errorMsg[0])
      }
    },

    async Select_Customer(id) {
      try {
        await this.Customer.getCustomer(id)
        this.CustomerInfo = { ...this.Customer.customer }
        this.isChecked = this.CustomerInfo.is_not_tagum
        this.pwd = this.CustomerInfo.is_pwd
        this.solo = this.CustomerInfo.is_solo

        // Load the customer's transactions
        this.fetchTransactions(id)
      } catch (error) {
        if (error.response) {
          const { data } = error.response
          if (data.errors) {
            this.errorMsg.push(data.errors)
          } else {
            this.errorMsg.push(data.message)
          }
        } else {
          this.errorMsg.push(error.message)
        }
        this.showError = true
        console.log(error)
      }
    },

    async updateCustomer(id, payload) {
      try {
        await this.Customer.updateCustomer(id, payload)
        this.$q.notify({
          type: 'positive',
          message: 'Customer updated successfully!',
          position: 'top',
          timeout: 1200,
        })

        // Refresh transactions
        this.fetchTransactions(id)
      } catch (error) {
        if (error.response) {
          const { data } = error.response
          if (data.errors) {
            this.errorMsg.push(data.errors)
          } else {
            this.errorMsg.push(data.message)
          }
        } else {
          this.errorMsg.push(error.message)
        }
        this.showError = true
        console.log(error)
      }
    },

    // Transaction related methods
    getCurrentDate() {
      return date.formatDate(new Date(), 'YYYY-MM-DD')
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      return date.formatDate(dateStr, 'MMM D, YYYY')
    },

    getStatusColor(status) {
      switch (status) {
        case 'Completed':
          return 'positive'
        case 'Pending':
          return 'warning'
        case 'Cancelled':
          return 'negative'
        default:
          return 'grey'
      }
    },

    openAddTransactionDialog() {
      this.editingTransaction = false
      this.currentTransaction = {
        id: null,
        customer_id: this.Customer.customer_id,
        description: '',
        amount: 0,
        transaction_date: this.getCurrentDate(),
        status: 'Pending',
        notes: '',
      }
      this.transactionDialog = true
    },

    editTransaction(transaction) {
      this.editingTransaction = true
      this.currentTransaction = { ...transaction }
      this.transactionDialog = true
    },

    async saveTransaction() {
      try {
        const isValid = await this.$refs.transactionForm.validate()
        if (!isValid) {
          return
        }

        if (this.editingTransaction) {
          // Update existing transaction
          // Implementation would go here - API call to update transaction
          const index = this.transactions.findIndex((t) => t.id === this.currentTransaction.id)
          if (index !== -1) {
            this.transactions.splice(index, 1, { ...this.currentTransaction })
          }
          this.$q.notify({
            type: 'positive',
            message: 'Transaction updated successfully',
            position: 'top',
            timeout: 1200,
          })
        } else {
          // Add new transaction
          // Implementation would go here - API call to add transaction
          const newId = Math.max(0, ...this.transactions.map((t) => t.id)) + 1
          const newTransaction = {
            ...this.currentTransaction,
            id: newId,
          }
          this.transactions.unshift(newTransaction)
          this.$q.notify({
            type: 'positive',
            message: 'Transaction added successfully',
            position: 'top',
            timeout: 1200,
          })
        }

        this.transactionDialog = false
      } catch (error) {
        console.error('Error saving transaction:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error saving transaction',
          position: 'top',
          timeout: 1200,
        })
      }
    },

    confirmDeleteTransaction(id) {
      this.transactionToDeleteId = id
      this.confirmDeleteDialog = true
    },

    deleteTransaction() {
      // Implementation would go here - API call to delete transaction
      this.transactions = this.transactions.filter((t) => t.id !== this.transactionToDeleteId)
      this.transactionToDeleteId = null

      this.$q.notify({
        type: 'positive',
        message: 'Transaction deleted successfully',
        position: 'top',
        timeout: 1200,
      })
    },

    fetchTransactions(customerId) {
      // Here you would normally make an API call to get transactions
      // Using mock data for demonstration
      this.transactions = [
        {
          id: 1,
          customer_id: customerId,
          description: 'Initial purchase',
          amount: 1500.0,
          transaction_date: '2025-08-01',
          status: 'Completed',
          notes: 'First transaction',
        },
        {
          id: 2,
          customer_id: customerId,
          description: 'Service payment',
          amount: 750.5,
          transaction_date: '2025-08-10',
          status: 'Pending',
          notes: 'Awaiting confirmation',
        },
        {
          id: 3,
          customer_id: customerId,
          description: 'Monthly subscription',
          amount: 250.0,
          transaction_date: '2025-08-13',
          status: 'Completed',
          notes: 'Automatic payment',
        },
      ]
    },
  },

  mounted() {
    this.CustomerInfo = JSON.parse(JSON.stringify(this.CustomerInfoDefault))
    this.user_id = this.GetUserID()
    this.selected_id = this.Customer.customer_id

    if (this.selected_id) {
      this.Select_Customer(this.selected_id)
    }
  },

  unmounted() {
    this.Customer.customer_id = 0
    this.Customer.isEdit = false
    this.Customer.isSave = true
    this.CustomerInfo = JSON.parse(JSON.stringify(this.CustomerInfoDefault))
  },

  watch: {
    selected_id(has_id) {
      if (has_id) {
        this.Select_Customer(has_id)
      }
    },
    'CustomerInfo.birthdate'(newBirthdate) {
      this.CustomerInfo.age = this.calculateAge(newBirthdate)
    },

    'CustomerInfo.age'(age) {
      if (age < 18) {
        this.CustomerInfo.category = 'Child'
        this.children = true
        this.adult = false
        this.senior = false
      } else if (age >= 18 && age < 60) {
        this.CustomerInfo.category = 'Adult'
        this.adult = true
        this.children = false
        this.senior = false
      } else if (age >= 60) {
        this.CustomerInfo.category = 'Senior'
        this.senior = true
        this.children = false
        this.adult = false
      }
    },
  },
}
</script>
