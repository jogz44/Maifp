<template>
  <q-page padding>
    <!-- Funds Table -->
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Funds</div>
        <q-space />
        <q-select
          v-model="selectedFundSource"
          :options="fundSourceOptions"
          label="Filter by Fund Source"
          outlined
          dense
          style="min-width: 200px"
          clearable
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="filteredFunds"
          :columns="columns"
          row-key="transaction_id"
          :loading="fundsStore.loading"
          flat
        >
          <template v-slot:body-cell-fund_amount="props">
            <q-td :props="props">
              ₱{{
                Number(props.value).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-transaction_date="props">
            <q-td :props="props">
              {{ new Date(props.value).toLocaleDateString() }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFundsStore } from '../stores/fundingStore'

const fundsStore = useFundsStore()
const selectedFundSource = ref('MAIFIP')

const columns = [
  { name: 'patient_name', label: 'Patient Name', field: 'patient_name', align: 'left' },
  { name: 'transaction_id', label: 'Transaction ID', field: 'transaction_id', align: 'left' },
  { name: 'transaction_date', label: 'Date', field: 'transaction_date', align: 'left' },
  { name: 'fund_source', label: 'Fund Source', field: 'fund_source', align: 'left' },
  { name: 'fund_amount', label: 'Fund Amount', field: 'fund_amount', align: 'right' },
]

const fundSourceOptions = computed(() => {
  const sources = [...new Set(fundsStore.funds.map((fund) => fund.fund_source))]
  return sources.sort()
})

const filteredFunds = computed(() => {
  if (!selectedFundSource.value) {
    return fundsStore.funds
  }
  return fundsStore.funds.filter((fund) => fund.fund_source === selectedFundSource.value)
})

onMounted(() => {
  fundsStore.assistanceList()
})
</script>
