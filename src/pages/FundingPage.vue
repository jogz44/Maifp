<template>
  <q-page padding>
    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-primary text-white q-pa-md">
          <div class="text-subtitle2">Total Funds</div>
          <div class="text-h5 text-weight-bold">{{ money(totalFunds) }}</div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-positive text-white q-pa-md">
          <div class="text-subtitle2">Current Funds</div>
          <div class="text-h5 text-weight-bold">{{ money(currentFunds) }}</div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-negative text-white q-pa-md">
          <div class="text-subtitle2">Released Funds</div>
          <div class="text-h5 text-weight-bold">{{ money(releasedFunds) }}</div>
        </q-card>
      </div>
    </div>

    <!-- Yearly Funds Table -->
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Funds</div>
        <q-space />
        <q-btn label="Add Year" color="primary" @click="showAddYearDialog = true" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="rows" :columns="columns" row-key="year" flat>
          <!-- Released Funds -->
          <template #body-cell-released="props">
            <q-td :props="props">
              <q-input
                v-model.number="props.row.released"
                type="number"
                dense
                outlined
                style="width: 140px"
                @update:model-value="recalc"
              >
                <template #prepend>₱</template>
              </q-input>
            </q-td>
          </template>

          <!-- Current -->
          <template #body-cell-current="props">
            <q-td :props="props">
              <span :class="props.row.current <= 0 ? 'text-negative text-weight-bold' : ''">
                {{ money(props.row.current) }}
              </span>
            </q-td>
          </template>

          <!-- Actions -->
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                dense
                outline
                icon="add"
                label="Add Additional Funds"
                color="primary"
                @click="openAddDialog(props.row)"
                :disable="props.row.current > 0"
              />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                class="q-ml-sm"
                @click="removeYear(props.row.year)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog: Add Year -->
    <q-dialog v-model="showAddYearDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Year & Initial Funds</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model.number="newYear"
            label="Year"
            type="number"
            dense
            outlined
            class="q-mb-sm"
          />
          <q-input
            v-model.number="newInitialFunds"
            label="Initial Funds"
            type="number"
            dense
            outlined
          >
            <template #prepend>₱</template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Save" color="primary" @click="saveNewYear" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Add Additional Funds -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Add Additional Funds - {{ activeRow?.year }}</div>
          <div class="text-caption">Current balance: {{ money(activeRow?.current || 0) }}</div>
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
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Table data
const rows = reactive([])

const columns = [
  { name: 'year', label: 'Year', field: 'year', align: 'left' },
  { name: 'initial', label: 'Funds', field: (row) => money(row.initial), align: 'left' },
  {
    name: 'additional',
    label: 'Additional Funds',
    field: (row) => money(row.additional),
    align: 'left',
  },
  { name: 'released', label: 'Released', field: 'released', align: 'left' },
  { name: 'current', label: 'Current Balance', field: 'current', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'left' },
]

const moneyFmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const money = (v) => moneyFmt.format(v || 0)

function recalc() {
  rows.forEach((r) => {
    r.current = Number(r.initial) + Number(r.additional) - Number(r.released)
  })
}

// Add Year dialog state
const showAddYearDialog = ref(false)
const newYear = ref(null)
const newInitialFunds = ref(null)

function saveNewYear() {
  if (rows.some((r) => r.year === newYear.value)) {
    $q.notify({ type: 'warning', message: `Year ${newYear.value} already exists` })
    return
  }
  rows.push({
    year: newYear.value,
    initial: newInitialFunds.value || 0,
    additional: 0,
    released: 0,
    current: newInitialFunds.value || 0,
  })
  newYear.value = null
  newInitialFunds.value = null
  showAddYearDialog.value = false
  $q.notify({ type: 'positive', message: 'Year added successfully' })
}

// Remove year
function removeYear(year) {
  const idx = rows.findIndex((r) => r.year === year)
  if (idx !== -1) rows.splice(idx, 1)
}

// Additional funds dialog state
const showAddDialog = ref(false)
const activeRow = ref(null)
const additionalInput = ref(null)

function openAddDialog(row) {
  activeRow.value = row
  additionalInput.value = null
  showAddDialog.value = true
}

const canAddAdditional = computed(
  () => activeRow.value && activeRow.value.current <= 0 && Number(additionalInput.value) > 0,
)

function confirmAddAdditional() {
  activeRow.value.additional += Number(additionalInput.value)
  recalc()
  $q.notify({ type: 'positive', message: `Added funds to ${activeRow.value.year}` })
  showAddDialog.value = false
}

// Summary cards
const totalFunds = computed(() => rows.reduce((sum, r) => sum + r.initial + r.additional, 0))
const releasedFunds = computed(() => rows.reduce((sum, r) => sum + r.released, 0))
const currentFunds = computed(() => rows.reduce((sum, r) => sum + r.current, 0))
</script>
