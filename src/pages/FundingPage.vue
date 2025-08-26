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
          <template #body-cell-date="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at) }}
            </q-td>
          </template>
          <template #body-cell-time="props">
            <q-td :props="props">
              {{ formatTime(props.row.created_at) }}
            </q-td>
          </template>
          <template #body-cell-funds="props">
            <q-td :props="props">
              {{ money(props.row.funds) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add Funds Dialog -->
    <q-dialog v-model="showAddFundsDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 text-green-9">Add Funds</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model.number="form.funds"
            label="Funds"
            type="number"
            dense
            outlined
            class="q-mb-sm"
          >
            <template #prepend>₱</template>
          </q-input>
          <q-input v-model="form.remarks" label="Remarks" dense outlined autogrow />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Save" color="primary" @click="saveNewFund" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useFundsStore } from '../stores/fundingStore'

const fundsStore = useFundsStore()
const showAddFundsDialog = ref(false)
const form = reactive({ remarks: '', funds: 0 })

const columns = [
  { name: 'funds', label: 'Funds', field: 'funds', align: 'left' },
  { name: 'remarks', label: 'Remarks', field: 'remarks', align: 'left' },
  { name: 'date', label: 'Date', field: 'created_at', align: 'left' },
  // { name: 'time', label: 'Time', field: 'created_at', align: 'left' },
]

const money = (v) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v || 0)
const formatDate = (dt) => (dt ? dt.split('T')[0] : '')
const formatTime = (dt) => (dt ? dt.split('T')[1]?.slice(0, 8) : '')

const rows = computed(() => fundsStore.funds)

const refreshFunds = () => fundsStore.fetchFunds()
refreshFunds()

const saveNewFund = async () => {
  try {
    await fundsStore.addFund({ remarks: form.remarks, funds: form.funds })
    showAddFundsDialog.value = false
    form.remarks = ''
    form.funds = 0
    refreshFunds() // refresh table after adding
  } catch {
    // Optionally handle error here
  }
}
</script>
