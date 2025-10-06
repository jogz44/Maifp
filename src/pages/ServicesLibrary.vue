<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h6">Service Management</div>
          <q-btn color="primary" label="Add Service" icon="add" @click="openDialog()" dense />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Category dropdown -->
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedCategory"
            :options="categories"
            label="Select Category"
            outlined
            dense
            emit-value
            map-options
            @update:model-value="fetchData"
          />
        </div>
      </q-card-section>

      <q-separator />

      <!-- Search + Table -->
      <q-card-section>
        <!-- Search bar -->
        <div class="row items-center q-mb-md">
          <q-input
            v-model="filter"
            outlined
            dense
            debounce="300"
            placeholder="Search..."
            clearable
            class="col-12 col-md-4"
          >
            <template v-slot:prepend>
              <q-icon name="search" class="q-mr-sm" />
            </template>
          </q-input>
        </div>

        <!-- Services Table -->
        <div style="max-height: 500px; overflow-y: auto">
          <q-card-section class="my-sticky-header q-pa-sm">
            <div class="text-h6">{{ selectedCategoryLabel }}</div>
          </q-card-section>
          <q-table
            dense
            flat
            bordered
            :rows="rows"
            :columns="columnsWithActions"
            row-key="id"
            :loading="patientStore.isLoading"
            :filter="filter"
            :pagination="pagination"
            class="q-mt-md"
            wrap-cells
            :table-header-class="'bg-grey-3 text-black'"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <!-- Highlighted cells -->
            <template
              v-for="col in columns"
              v-slot:[`body-cell-${col.name}`]="props"
              :key="col.name"
            >
              <q-td :props="props">
                <span v-html="highlightText(props.value, filter)" />
              </q-td>
            </template>

            <!-- Actions column -->
            <template v-slot:body-cell-actions="props">
              <q-td align="center">
                <q-btn flat icon="edit" color="primary" size="sm" @click="openDialog(props.row)" />
                <q-btn
                  flat
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="deleteRow(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialogOpen">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editingRow ? 'Edit Service' : 'Add Service' }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div v-for="col in editableColumns" :key="col.name" class="q-mb-md">
            <q-input
              v-model="form[col.field]"
              :label="col.label"
              outlined
              dense
              :readonly="col.name === 'total_amount'"
            />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Save" @click="saveRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePatientStore } from 'src/stores/patientStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const patientStore = usePatientStore()

const pagination = ref({
  page: 1,
  rowsPerPage: 10, // default rows per page
})

// categories
const categories = [
  { label: 'Laboratory', value: 'laboratory' },
  { label: 'Radiology', value: 'radiology' },
  { label: 'Mammogram', value: 'mammogram' },
  { label: 'Ultrasound', value: 'ultrasound' },
]

const selectedCategory = ref('laboratory')
const filter = ref('') // search filter

// dialog state
const dialogOpen = ref(false)
const editingRow = ref(null)
const form = ref({})

// config per category
const categoryConfig = {
  laboratory: {
    fetch: () => patientStore.fetchLaboratoryExams(),
    rows: () => patientStore.laboratoryExams,
    columns: [
      { name: 'item_id', label: 'Item ID', field: 'item_id', align: 'center' },
      { name: 'item_description', label: 'Description', field: 'item_description', align: 'left' },
      { name: 'selling_price', label: 'Price', field: 'selling_price' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' },
    ],
    create: (payload) => patientStore.storeNewLaboratoryExam(payload),
    update: (id, payload) => patientStore.updateLaboratoryExam(id, payload),
    delete: (id) => patientStore.deleteExistingLaboratoryExam(id),
  },
  radiology: {
    fetch: () => patientStore.fetchRadiologyExams(),
    rows: () => patientStore.radiologyExams,
    columns: [
      { name: 'item_description', label: 'Description', field: 'item_description', align: 'left' },
      { name: 'selling_price', label: 'Price', field: 'selling_price' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' },
    ],
    create: (payload) => patientStore.storeNewRadiologyExam(payload),
    update: (id, payload) => patientStore.updateRadiologyExam(id, payload),
    delete: (id) => patientStore.deleteExistingRadiologyExam(id),
  },
  mammogram: {
    fetch: () => patientStore.fetchMammogramExams(),
    rows: () => patientStore.mammogramExams,
    columns: [
      { name: 'procedure', label: 'Procedure', field: 'procedure', align: 'left' },
      { name: 'rate', label: 'Rate', field: 'rate' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' },
    ],
    create: (payload) => patientStore.storeNewMammogramExam(payload),
    update: (id, payload) => patientStore.updateMammogramExam(id, payload),
    delete: (id) => patientStore.deleteExistingMammogramExam(id),
  },
  ultrasound: {
    fetch: () => patientStore.fetchUltrasoundExams(),
    rows: () => patientStore.ultrasoundExams,
    columns: [
      { name: 'body_parts', label: 'Body Parts', field: 'body_parts', align: 'left' },
      { name: 'rate', label: 'Rate', field: 'rate' },
      { name: 'service_fee', label: 'Service Fee', field: 'service_fee' },
      { name: 'total_amount', label: 'Total', field: 'total_amount' },
    ],
    create: (payload) => patientStore.storeNewUltrasoundExam(payload),
    update: (id, payload) => patientStore.updateUltrasoundExam(id, payload),
    delete: (id) => patientStore.deleteExistingUltrasoundExam(id),
  },
}

// computed
const rows = computed(() => categoryConfig[selectedCategory.value].rows())
const columns = computed(() => categoryConfig[selectedCategory.value].columns)
const columnsWithActions = computed(() => [
  ...columns.value,
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
])
const editableColumns = computed(() => columns.value.filter((c) => c.name !== 'actions'))
const selectedCategoryLabel = computed(
  () => categories.find((c) => c.value === selectedCategory.value)?.label || 'Services',
)

// auto calculate total
watch(
  () => [form.value.selling_price, form.value.rate, form.value.service_fee],
  () => {
    const price = Number(form.value.selling_price ?? form.value.rate ?? 0)
    const fee = Number(form.value.service_fee ?? 0)
    form.value.total_amount = price + fee
  },
)

// actions
async function fetchData() {
  await categoryConfig[selectedCategory.value].fetch()
}

function openDialog(row = null) {
  editingRow.value = row
  form.value = row ? { ...row } : {}
  dialogOpen.value = true
}

async function saveRow() {
  const cfg = categoryConfig[selectedCategory.value]
  try {
    if (editingRow.value) {
      await cfg.update(editingRow.value.id, form.value)
    } else {
      await cfg.create(form.value)
    }
    dialogOpen.value = false
    form.value = {} // reset form
    await fetchData()
  } catch (err) {
    console.error('Save failed:', err)
  }
}

async function deleteRow(row) {
  const cfg = categoryConfig[selectedCategory.value]
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this item?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await cfg.delete(row.id)
    await fetchData()
  })
}

//  Highlight helper
function highlightText(text, search) {
  if (!search) return text
  const regex = new RegExp(`(${search})`, 'gi')
  return String(text).replace(regex, '<span class="text-primary bg-blue-2">$1</span>')
}

// initial load
onMounted(fetchData)
</script>

<style>
.my-sticky-table {
  max-height: 500px; /* makes rows scrollable */
}

.my-sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white; /* prevent text overlap */
}
</style>
