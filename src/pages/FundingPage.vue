<template>
  <q-page padding>
    <!-- Funds Table -->
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Funds</div>
        <q-space />
        <q-btn label="Add Funds" color="green-9" @click="showAddFundsDialog = true" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="rows" :columns="columns" row-key="id" flat>
          <template #body-cell-funds="props">
            <q-td :props="props">
              <span>
                {{ money(props.row.funds) }}
              </span>
            </q-td>
          </template>

          <!-- Current Balance -->
          <template #body-cell-current="props">
            <q-td :props="props">
              <span :class="props.row.remaining_funds <= 0 ? 'text-negative text-weight-bold' : ''">
                {{ money(props.row.remaining_funds) }}
              </span>
            </q-td>
          </template>

          <!-- Actions -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="add"
                class="q-ml-sm"
                @click="openAddDialog(props.row)"
              />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                class="q-ml-sm"
                @click="removeFund(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: Add Funds -->
    <q-dialog v-model="showAddFundsDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Yearly Funds</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="form.budget_start_date"
            label="Start Date"
            type="date"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input
            v-model="form.budget_end_date"
            label="End Date"
            type="date"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input v-model.number="form.funds" label="Funds" type="number" dense outlined>
            <template #prepend>₱</template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Save" color="primary" @click="saveNewFund" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Add Additional Funds -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Additional Fund</div>
          <div class="text-caption">Current balance: {{ money(selectedRow?.remaining_funds) }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model.number="additionalInput" type="number" dense outlined label="Amount">
            <template #prepend>₱</template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            label="Add"
            color="primary"
            :disable="!canAddAdditional"
            @click="confirmAddAdditional"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useFundsStore } from '../stores/fundingStore'

const fundsStore = useFundsStore()

// Dialog control
const showAddFundsDialog = ref(false)
const showAddDialog = ref(false)

// Form data for new fund
const form = reactive({
  budget_start_date: '',
  budget_end_date: '',
  funds: 0,
})

// Additional funds dialog
const selectedRow = ref(null)
const additionalInput = ref(0)

// Table columns
const columns = [
  { name: 'start', label: 'Start Date', field: 'budget_start_date', align: 'left' },
  { name: 'end', label: 'End Date', field: 'budget_end_date', align: 'left' },
  { name: 'funds', label: 'Initial Funds', field: 'funds', align: 'right' },
  { name: 'total_funds', label: 'Total Funds', field: 'total_funds', align: 'right' },
  { name: 'additional', label: 'Additional Funds', field: 'additional_funds', align: 'right' },
  { name: 'released', label: 'Released', field: 'released_funds', align: 'right' },
  { name: 'current', label: 'Current Balance', field: 'remaining_funds', align: 'right' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

// Format currency
const moneyFmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const money = (v) => moneyFmt.format(v || 0)

// Fetch initial data
onMounted(() => {
  fundsStore.fetchFunds()
})

// Use data from the store
const rows = computed(() => fundsStore.funds)

// Save new fund to backend
const saveNewFund = async () => {
  try {
    await fundsStore.addFund({
      budget_start_date: form.budget_start_date,
      budget_end_date: form.budget_end_date,
      funds: form.funds,
    })

    showAddFundsDialog.value = false

    // Reset form
    form.budget_start_date = ''
    form.budget_end_date = ''
    form.funds = 0
  } catch (e) {
    console.error('Add fund failed:', e)
  }
}

// Open dialog to add additional funds
const openAddDialog = (row) => {
  selectedRow.value = row
  additionalInput.value = 0
  showAddDialog.value = true
}

// Confirm additional fund add
const confirmAddAdditional = async () => {
  if (!selectedRow.value) return

  await fundsStore.addAdditional(selectedRow.value.id, additionalInput.value)

  showAddDialog.value = false
  additionalInput.value = 0
}

// Remove fund entry
const removeFund = async (id) => {
  await fundsStore.removeFund(id)
}

const canAddAdditional = computed(() => additionalInput.value > 0)
</script>
