<template>
  <div class="q-pa-lg bg-grey-1 flex flex-center">
    <q-card flat bordered class="q-pa-md shadow-2 rounded-borders full-width" style="max-width: 1300px">

      <!-- Responsive Wrapper -->
      <div class="responsive-table-wrapper">
        <q-table
          dense
          flat
          bordered
          :title="selectedCategoryLabel"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="store.isLoading"
          :filter="filter"
          class="my-service-table"
          :table-header-class="'bg-grey-3 text-black'"
        >
          <!-- Sticky Custom top bar -->
          <template v-slot:top>
            <div class="row items-center q-col-gutter-md bg-white q-px-md q-pt-xs q-pb-md sticky-top-bar full-width q-mt-sm" >
              <!-- Left: Title -->
              <div class="col-12 col-md-auto">
                <span class="text-h6 text-primary">{{ selectedCategoryLabel }}</span>
              </div>

              <!-- Category Select -->
              <div class="col-12 col-md-auto">
                <q-select
                  v-model="selectedCategory"
                  :options="categories"
                  outlined
                  dense
                  color="primary"
                  @update:model-value="fetchData"
                />
              </div>

              <!-- Search / Filter -->
              <div class="col-12 col-md-auto">
                <q-input
                  outlined
                  dense
                  debounce="300"
                  v-model="filter"
                  placeholder="Search..."
                  clearable
                  class="full-width"
                  style="min-width: 500px"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Add Service Button -->
              <div class="col-12 col-md-auto text-right">
                <q-btn
                  color="primary"
                  icon="add_circle"
                  label="Add Service"
                  unelevated
                  @click="openAddDialog"
                />
              </div>
            </div>
          </template>

          <!-- Loading -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <!-- Action Buttons -->
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn
                dense flat round
                icon="edit"
                color="primary"
                size="sm"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                dense flat round
                icon="delete"
                color="negative"
                size="sm"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- Add/Edit Dialog -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width: 500px" class="rounded-borders">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ editMode ? 'Edit Service' : 'Add Service' }}</div>
          </q-card-section>

          <q-card-section>
            <!-- Conditional inputs -->
            <q-input v-model="form.item_description" label="Description" outlined dense class="q-mt-md"
                     v-if="['examination','radiologies'].includes(selectedCategory)" />
            <q-input v-model="form.body_parts" label="Body Parts" outlined dense class="q-mt-md"
                     v-if="selectedCategory === 'ultrasound'" />
            <q-input v-model="form.procedure" label="Procedure" outlined dense class="q-mt-md"
                     v-if="selectedCategory === 'mammogram'" />

            <q-input v-model="form.selling_price" type="number" label="Selling Price" outlined dense class="q-mt-md"
                     v-if="['examination','radiologies'].includes(selectedCategory)" />
            <q-input v-model="form.rate" type="number" label="Rate" outlined dense class="q-mt-md"
                     v-if="['ultrasound','mammogram'].includes(selectedCategory)" />

            <q-input v-model="form.service_fee" type="number" label="Service Fee" outlined dense class="q-mt-md" />
            <q-input v-model="form.total_amount" type="number" label="Total Amount" outlined dense class="q-mt-md" />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn color="primary" label="Save" @click="saveService" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useServicesLibraryStore } from 'stores/servicesLibraryStore'

const $q = useQuasar()
const store = useServicesLibraryStore()

const filter = ref('')   // search filter

// Categories dropdown
const categories = [
  { label: 'Examination', value: 'examination' },
  { label: 'Radiology', value: 'radiologies' },
  { label: 'Ultrasound', value: 'ultrasound' },
  { label: 'Mammogram', value: 'mammogram' }
]

const selectedCategory = ref('examination')
const dialog = ref(false)
const editMode = ref(false)
const form = ref({})

// ---------------- COMPUTED ----------------

const rows = computed(() => {
  switch (selectedCategory.value) {
    case 'examination':
      return store.laboratoryExams || []

    case 'radiologies':
      return (store.radiologiesExams || []).map((row, idx) => ({
        ...row,
        id: idx + 1
      }))

    case 'ultrasound':
      return store.ultrasoundExams || []

    case 'mammogram':
      return store.mammogramExams || []

    default:
      return []
  }
})


// Dynamic table title
const selectedCategoryLabel = computed(() => {
  return categories.find(c => c.value === selectedCategory.value)?.label || 'Library'
})

// Dynamic columns
const columns = computed(() => {
  const baseCols = {
    examination: [
      { name: 'item_id', label: 'Item ID', field: 'item_id', align: 'center' },
      { name: 'item_description', label: 'Description', field: 'item_description', align: 'left' },
      { name: 'selling_price', label: 'Price', field: 'selling_price' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' }
    ],
    radiologies: [
      { name: 'id', label: 'ID', field: 'id', align: 'center' }, // generated
      { name: 'item_description', label: 'Description', field: 'item_description', align: 'left' },
      { name: 'selling_price', label: 'Price', field: 'selling_price' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' }
    ],
    ultrasound: [
      { name: 'id', label: 'ID', field: 'id', align: 'center' },
      { name: 'body_parts', label: 'Body Parts', field: 'body_parts' },
      { name: 'rate', label: 'Rate', field: 'rate' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' }
    ],
    mammogram: [
      { name: 'id', label: 'ID', field: 'id', align: 'center' },
      { name: 'procedure', label: 'Procedure', field: 'procedure' },
      { name: 'rate', label: 'Rate', field: 'rate' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' }
    ]
  }

  return [
    ...(baseCols[selectedCategory.value] || []), // safe fallback
    { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
  ]
})

// ---------------- ACTIONS ----------------

async function fetchData () {
  if (selectedCategory.value === 'examination') await store.fetchExaminations()
  if (selectedCategory.value === 'radiologies') await store.fetchRadiologies()
  if (selectedCategory.value === 'ultrasound') await store.fetchUltrasounds()
  if (selectedCategory.value === 'mammogram') await store.fetchMammograms()
}

function openAddDialog () {
  editMode.value = false
  form.value = {}
  dialog.value = true
}

function openEditDialog (row) {
  editMode.value = true
  form.value = { ...row }
  dialog.value = true
}

async function saveService () {
  try {
    if (editMode.value) {
      if (selectedCategory.value === 'examination') await store.updateExamination(form.value.id, form.value)
      if (selectedCategory.value === 'radiologies') await store.updateRadiology(form.value.id, form.value)
      if (selectedCategory.value === 'ultrasound') await store.updateUltrasound(form.value.id, form.value)
      if (selectedCategory.value === 'mammogram') await store.updateMammogram(form.value.id, form.value)
    } else {
      if (selectedCategory.value === 'examination') await store.storeExamination(form.value)
      if (selectedCategory.value === 'radiologies') await store.storeRadiology(form.value)
      if (selectedCategory.value === 'ultrasound') await store.storeUltrasound(form.value)
      if (selectedCategory.value === 'mammogram') await store.storeMammogram(form.value)
    }
    dialog.value = false
    fetchData()
  } catch (err) {
    console.error('Save failed:', err)
  }
}

function confirmDelete (row) {
  $q.dialog({
    title: 'Confirm',
    message: 'Delete this service?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      if (selectedCategory.value === 'examination') await store.deleteExamination(row.id)
      if (selectedCategory.value === 'radiologies') await store.deleteRadiology(row.id)
      if (selectedCategory.value === 'ultrasound') await store.deleteUltrasound(row.id)
      if (selectedCategory.value === 'mammogram') await store.deleteMammogram(row.id)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  })
}

// Initial load
fetchData()
</script>

<style scoped>
.my-service-table tbody tr:hover {
  background: #f5f9ff; /* soft blue hover */
  transition: background 0.2s;
}

.sticky-top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.q-table__top {
  padding: 0 !important;
}

/* Responsive wrapper for horizontal scroll on small screens */
.responsive-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
</style>




