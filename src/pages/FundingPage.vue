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
          <!-- <template #body-cell-actions="props">
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
          </template> -->
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: Add Funds -->
    <q-dialog v-model="showAddFundsDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 text-color-green-9">Add Funds</div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useFundsStore } from '../stores/fundingStore'

const fundsStore = useFundsStore()

const showAddFundsDialog = ref(false)

const form = reactive({
  remarks: '',
  funds: 0,
})

const columns = [
  { name: 'date', label: 'Date', field: 'created_at', align: 'left' },
  { name: 'funds', label: 'Funds', field: 'funds', align: 'left' },
  { name: 'remarks', label: 'Remarks', field: 'remarks', align: 'left' },
  // { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const moneyFmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const money = (v) => moneyFmt.format(v || 0)

onMounted(() => {
  fundsStore.fetchFunds()
})

const rows = computed(() => fundsStore.funds)

const saveNewFund = async () => {
  try {
    await fundsStore.addFund({
      remarks: form.remarks,
      funds: form.funds,
    })

    showAddFundsDialog.value = false

    form.remarks = ''
    form.funds = 0
  } catch (e) {
    console.error('Add fund failed:', e)
  }
}

// const openAddDialog = (row) => {
//   selectedRow.value = row
//   additionalInput.value = 0
//   showAddDialog.value = true
// }

// const removeFund = async (id) => {
//   await fundsStore.removeFund(id)
// }
</script>
