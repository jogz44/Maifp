<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <!-- Sticky Toggle Header -->
      <div class="sticky-toggle-header">
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <div class="text-h6" :class="{ 'active-title': currentView === 'services' }">
                Service Management
              </div>
              <q-toggle
                v-model="currentView"
                true-value="phic"
                false-value="services"
                class="q-mx-md"
                color="green"
                dense
                @update:model-value="onViewToggle"
              />
              <div class="text-h6" :class="{ 'active-title': currentView === 'phic' }">
                PHIC Deductions
              </div>
            </div>

            <!-- Add button visible only to admin or role = 1 (for both views) -->
            <q-btn
              v-if="isAdmin"
              color="green"
              :label="currentView === 'services' ? 'Add Service' : 'Add Deduction'"
              icon="add"
              @click="openDialog()"
              dense
            />
          </div>
        </q-card-section>
        <br />
        <q-separator class="green-separator" />
      </div>

      <!-- Category dropdown - Only for Service Management -->
      <q-card-section v-if="currentView === 'services'" class="row q-col-gutter-md">
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
            color="green"
          />
        </div>
      </q-card-section>

      <q-separator v-if="currentView === 'services'" class="green-separator-light" />

      <!-- Search + Table -->
      <q-card-section>
        <!-- Search bar -->
        <div class="row items-center q-mb-md">
          <q-input
            v-model="filter"
            outlined
            dense
            debounce="300"
            :placeholder="
              currentView === 'services' ? 'Search...' : 'Search by Item ID or Description...'
            "
            clearable
            class="col-12 col-md-4"
            color="green"
          >
            <template v-slot:prepend>
              <q-icon name="search" class="q-mr-sm" />
            </template>
          </q-input>
        </div>

        <!-- PHIC Deductions Table -->
        <div v-if="currentView === 'phic'" style="max-height: 500px; overflow-y: auto">
          <q-card-section class="my-sticky-header q-pa-sm">
            <div class="text-h6 green-title">PHIC Deductions</div>
          </q-card-section>

          <q-table
            dense
            flat
            bordered
            :rows="phicRows"
            :columns="phicColumnsWithActions"
            row-key="id"
            :loading="phicLoading"
            :filter="filter"
            :pagination="pagination"
            class="q-mt-md"
            wrap-cells
            :table-header-class="'bg-grey-3 text-black'"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="green" />
            </template>

            <!-- Highlighted cells for regular columns -->
            <template
              v-for="col in phicColumns.filter((c) => c.name !== 'net_amount')"
              v-slot:[`body-cell-${col.name}`]="props"
              :key="col.name"
            >
              <q-td :props="props">
                <span v-html="highlightText(props.value, filter)" />
              </q-td>
            </template>

            <!-- Special template for Net Amount column -->
            <template v-slot:body-cell-net_amount="props">
              <q-td :props="props" class="text-right">
                <span class="text-weight-bold text-green">
                  ₱{{ formatCurrency(props.row.total - props.row.deduction) }}
                </span>
              </q-td>
            </template>

            <!-- Actions column (only for admin/role 1) -->
            <template v-slot:body-cell-actions="props">
              <q-td align="center">
                <div v-if="isAdmin">
                  <q-btn flat icon="edit" color="green" size="sm" @click="openDialog(props.row)" />
                  <q-btn
                    flat
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="deletePhicRow(props.row)"
                  />
                </div>
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="text-center q-pa-md">No PHIC deductions found.</div>
            </template>
          </q-table>
        </div>

        <!-- Services Table -->
        <div v-else style="max-height: 500px; overflow-y: auto">
          <q-card-section class="my-sticky-header q-pa-sm">
            <div class="text-h6 green-title">{{ selectedCategoryLabel }}</div>
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
              <q-inner-loading showing color="green" />
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

            <!-- Actions column (only for admin/role 1) -->
            <template v-slot:body-cell-actions="props">
              <q-td align="center">
                <div v-if="isAdmin">
                  <q-btn flat icon="edit" color="green" size="sm" @click="openDialog(props.row)" />
                  <q-btn
                    flat
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="deleteRow(props.row)"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog - Service Management -->
    <q-dialog v-model="dialogOpen" v-if="currentView === 'services'">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 green-title">
            {{ editingRow ? 'Edit Service' : 'Add Service' }}
          </div>
        </q-card-section>
        <q-separator class="green-separator-light" />
        <q-card-section>
          <div v-for="col in editableColumns" :key="col.name" class="q-mb-md">
            <q-input
              v-model="form[col.field]"
              :label="col.label"
              outlined
              dense
              :readonly="col.name === 'total_amount'"
              color="green"
            />
          </div>
        </q-card-section>
        <q-separator class="green-separator-light" />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn v-if="isAdmin" color="green" label="Save" @click="saveRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Dialog - PHIC Deductions -->
    <q-dialog v-model="phicDialogOpen" v-if="currentView === 'phic'">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 green-title">
            {{ editingPhicRow ? 'Edit PHIC Deduction' : 'Add PHIC Deduction' }}
          </div>
        </q-card-section>
        <q-separator class="green-separator-light" />
        <q-card-section>
          <!-- Search/Autocomplete for Laboratory Services -->
          <div class="q-mb-md" style="position: relative">
            <q-input
              v-model="serviceSearch"
              :label="editingPhicRow ? 'Item ID *' : 'Search Service *'"
              outlined
              dense
              color="green"
              :readonly="!!editingPhicRow"
              @update:model-value="onServiceSearch"
              @focus="onServiceSearchFocus"
            >
              <template v-slot:append v-if="!editingPhicRow">
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Search Results Dropdown -->
            <q-list
              v-if="showSearchResults && !editingPhicRow"
              bordered
              class="search-results-list"
              style="
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                z-index: 100;
                background: white;
                max-height: 200px;
                overflow-y: auto;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              "
            >
              <q-item
                v-for="service in searchResults"
                :key="service.item_id || service.id"
                clickable
                v-ripple
                @click="selectService(service)"
              >
                <q-item-section>
                  <q-item-label lines="1">
                    <strong>{{ service.item_id || service.id }}</strong> -
                    {{
                      service.item_description ||
                      service.description ||
                      service.procedure ||
                      service.body_parts
                    }}
                  </q-item-label>
                  <q-item-label caption lines="1">
                    Total: ₱{{
                      formatCurrency(service.total_amount || service.rate || service.selling_price)
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-if="searchResults.length === 0 && serviceSearch && serviceSearch.length >= 1"
              >
                <q-item-section>
                  <q-item-label class="text-grey">No matching services found</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Item ID (Auto-filled) -->
          <div class="q-mb-md">
            <q-input
              v-model="phicForm.item_id"
              label="Item ID *"
              outlined
              dense
              color="green"
              readonly
              hint="Auto-filled from selected service"
            />
          </div>

          <!-- Description (Auto-filled) -->
          <div class="q-mb-md">
            <q-input
              v-model="phicForm.description"
              label="Description *"
              outlined
              dense
              color="green"
              readonly
              hint="Auto-filled from selected service"
            />
          </div>

          <!-- Total Amount (Auto-filled) -->
          <div class="q-mb-md">
            <q-input
              v-model.number="phicForm.total"
              label="Total Amount *"
              outlined
              dense
              type="number"
              step="0.01"
              color="green"
              readonly
              hint="Auto-filled from selected service"
            >
              <template v-slot:prepend>
                <span>₱</span>
              </template>
            </q-input>
          </div>

          <!-- Deduction (User Input) -->
          <div class="q-mb-md">
            <q-input
              v-model.number="phicForm.deduction"
              label="Deduction Amount *"
              outlined
              dense
              type="number"
              step="0.01"
              color="green"
              :rules="[(val) => val > 0 || 'Please enter a valid deduction amount']"
              @focus="$event.target.select()"
              @click="$event.target.select()"
            >
              <template v-slot:prepend>
                <span>₱</span>
              </template>
            </q-input>
          </div>

          <!-- Calculated Net Amount -->
          <div class="q-mb-md q-pa-md bg-grey-2 rounded-borders">
            <div class="row justify-between">
              <div class="text-subtitle1 text-weight-bold">Net Amount after Deduction:</div>
              <div class="text-subtitle1 text-weight-bold text-green">
                ₱{{ formatCurrency(calculatedNetAmount) }}
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator class="green-separator-light" />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            v-if="isAdmin"
            color="green"
            label="Save"
            @click="savePhicRow"
            :disable="!phicForm.deduction || phicForm.deduction <= 0"
          />
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

// View toggle state
const currentView = ref('services') // 'services' or 'phic'

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
})

const userRole = ref('admin')
const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 1)

// ==================== Service Management State ====================
const categories = [
  { label: 'Laboratory', value: 'laboratory' },
  { label: 'Radiology', value: 'radiology' },
  { label: 'Mammogram', value: 'mammogram' },
  { label: 'Ultrasound', value: 'ultrasound' },
]

const selectedCategory = ref('laboratory')
const filter = ref('')
const dialogOpen = ref(false)
const editingRow = ref(null)
const form = ref({})

// ==================== PHIC Deductions State ====================
const phicRows = ref([])
const phicLoading = ref(false)
const phicDialogOpen = ref(false)
const editingPhicRow = ref(null)
const phicForm = ref({
  item_id: '',
  description: '',
  total: 0,
  deduction: 0,
})

// Service search state
const serviceSearch = ref('')
const showSearchResults = ref(false)
const searchResults = ref([])
let searchDebounceTimer = null

// PHIC columns
const phicColumns = [
  { name: 'item_id', label: 'Item ID', field: 'item_id', align: 'center' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'total', label: 'Price/Rate', field: 'total', align: 'right' },
  { name: 'deduction', label: 'Deduction', field: 'deduction', align: 'right' },
  { name: 'net_amount', label: 'Net Amount', field: 'net_amount', align: 'right' },
]

const phicColumnsWithActions = computed(() => [
  ...phicColumns,
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
])

// Calculate net amount after deduction
const calculatedNetAmount = computed(() => {
  const total = parseFloat(phicForm.value.total) || 0
  const deduction = parseFloat(phicForm.value.deduction) || 0
  return Math.max(0, total - deduction)
})

// ==================== Service Management Config ====================
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

// Service Management computed
const rows = computed(() => categoryConfig[selectedCategory.value]?.rows() || [])
const columns = computed(() => categoryConfig[selectedCategory.value]?.columns || [])
const columnsWithActions = computed(() => [
  ...columns.value,
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
])
const editableColumns = computed(() => columns.value.filter((c) => c.name !== 'actions'))
const selectedCategoryLabel = computed(
  () => categories.find((c) => c.value === selectedCategory.value)?.label || 'Services',
)

// Auto calculate total for services
watch(
  () => [form.value.selling_price, form.value.rate, form.value.service_fee],
  () => {
    const price = Number(form.value.selling_price ?? form.value.rate ?? 0)
    const fee = Number(form.value.service_fee ?? 0)
    form.value.total_amount = price + fee
  },
)

// ==================== Service Management Methods ====================
async function fetchData() {
  if (currentView.value === 'services' && categoryConfig[selectedCategory.value]) {
    await categoryConfig[selectedCategory.value].fetch()
  }
}

function openDialog(row = null) {
  if (currentView.value === 'services') {
    editingRow.value = row
    form.value = row ? { ...row } : {}
    dialogOpen.value = true
  } else {
    editingPhicRow.value = row
    if (row) {
      // Editing existing deduction - ensure values are proper types
      phicForm.value = {
        item_id: String(row.item_id || ''),
        description: String(row.description || ''),
        total: Number(row.total) || 0,
        deduction: Number(row.deduction) || 0,
      }
      serviceSearch.value = `${phicForm.value.item_id} - ${phicForm.value.description}`
      showSearchResults.value = false
    } else {
      // New deduction - reset form
      phicForm.value = { item_id: '', description: '', total: 0, deduction: 0 }
      serviceSearch.value = ''
      searchResults.value = []
      showSearchResults.value = false
    }
    phicDialogOpen.value = true
  }
}

async function saveRow() {
  const cfg = categoryConfig[selectedCategory.value]
  if (!cfg) return
  try {
    if (editingRow.value) {
      await cfg.update(editingRow.value.id, form.value)
    } else {
      await cfg.create(form.value)
    }
    dialogOpen.value = false
    form.value = {}
    await fetchData()
    $q.notify({ type: 'positive', message: 'Service saved successfully!' })
  } catch (err) {
    console.error('Save failed:', err)
    $q.notify({ type: 'negative', message: 'Failed to save service.' })
  }
}

async function deleteRow(row) {
  const cfg = categoryConfig[selectedCategory.value]
  if (!cfg) return
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this service?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await cfg.delete(row.id)
      await fetchData()
      $q.notify({ type: 'positive', message: 'Service deleted successfully!' })
    } catch (err) {
      console.error('Delete failed:', err)
      $q.notify({ type: 'negative', message: 'Failed to delete service.' })
    }
  })
}

// ==================== Service Search for PHIC Deductions ====================
// Get all available services from all categories
function getAllServices() {
  const allServices = []

  // Get Laboratory services
  if (patientStore.laboratoryExams && patientStore.laboratoryExams.length) {
    patientStore.laboratoryExams.forEach((service) => {
      allServices.push({
        ...service,
        source: 'laboratory',
        displayName: `${service.item_id} - ${service.item_description}`,
        total_amount:
          service.total_amount || (service.selling_price || 0) + (service.service_fee || 0),
      })
    })
  }

  // Get Radiology services
  if (patientStore.radiologyExams && patientStore.radiologyExams.length) {
    patientStore.radiologyExams.forEach((service) => {
      allServices.push({
        ...service,
        source: 'radiology',
        item_id: service.id || service.item_description,
        description: service.item_description,
        displayName: service.item_description,
        total_amount:
          service.total_amount || (service.selling_price || 0) + (service.service_fee || 0),
      })
    })
  }

  // Get Mammogram services
  if (patientStore.mammogramExams && patientStore.mammogramExams.length) {
    patientStore.mammogramExams.forEach((service) => {
      allServices.push({
        ...service,
        source: 'mammogram',
        item_id: service.id || service.procedure,
        description: service.procedure,
        displayName: service.procedure,
        total_amount: service.total_amount || (service.rate || 0) + (service.service_fee || 0),
      })
    })
  }

  // Get Ultrasound services
  if (patientStore.ultrasoundExams && patientStore.ultrasoundExams.length) {
    patientStore.ultrasoundExams.forEach((service) => {
      allServices.push({
        ...service,
        source: 'ultrasound',
        item_id: service.id || service.body_parts,
        description: service.body_parts,
        displayName: service.body_parts,
        total_amount: service.total_amount || (service.rate || 0) + (service.service_fee || 0),
      })
    })
  }

  return allServices
}

// Search for services
function onServiceSearch(searchText) {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)

  searchDebounceTimer = setTimeout(() => {
    if (!searchText || searchText.length < 1) {
      searchResults.value = []
      showSearchResults.value = false
      return
    }

    const allServices = getAllServices()
    const searchLower = searchText.toLowerCase()

    searchResults.value = allServices
      .filter((service) => {
        const itemId = (service.item_id || service.id || '').toString().toLowerCase()
        const description = (
          service.item_description ||
          service.description ||
          service.procedure ||
          service.body_parts ||
          ''
        ).toLowerCase()
        return itemId.includes(searchLower) || description.includes(searchLower)
      })
      .slice(0, 10) // Limit to 10 results

    showSearchResults.value = searchResults.value.length > 0
  }, 300)
}

function onServiceSearchFocus() {
  if (serviceSearch.value && serviceSearch.value.length >= 1) {
    onServiceSearch(serviceSearch.value)
  }
}

// Select a service from search results
function selectService(service) {
  phicForm.value.item_id = String(service.item_id || service.id || '')
  phicForm.value.description = String(
    service.item_description ||
      service.description ||
      service.procedure ||
      service.body_parts ||
      '',
  )
  phicForm.value.total = parseFloat(
    service.total_amount || service.rate || service.selling_price || 0,
  )

  serviceSearch.value = `${phicForm.value.item_id} - ${phicForm.value.description}`
  showSearchResults.value = false

  $q.notify({
    type: 'info',
    message: 'Service selected. Please enter the deduction amount.',
    position: 'top',
    timeout: 2000,
  })
}

// Format currency
function formatCurrency(value) {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ==================== PHIC Deductions CRUD Methods ====================
// Local storage key for PHIC deductions
const PHIC_STORAGE_KEY = 'phic_deductions'

// Load PHIC deductions from localStorage
function loadPhicDeductions() {
  phicLoading.value = true
  try {
    const stored = localStorage.getItem(PHIC_STORAGE_KEY)
    if (stored) {
      phicRows.value = JSON.parse(stored)
    } else {
      // Initialize with sample data including net_amount
      phicRows.value = [
        {
          id: 1,
          item_id: 'LAB001',
          description: 'Complete Blood Count',
          total: 500.0,
          deduction: 150.0,
          net_amount: 350.0,
        },
        {
          id: 2,
          item_id: 'LAB002',
          description: 'Blood Glucose Test',
          total: 200.0,
          deduction: 60.0,
          net_amount: 140.0,
        },
        {
          id: 3,
          item_id: 'LAB003',
          description: 'Urinalysis',
          total: 150.0,
          deduction: 45.0,
          net_amount: 105.0,
        },
      ]
      savePhicToLocalStorage()
    }
  } catch (err) {
    console.error('Failed to load PHIC deductions:', err)
    $q.notify({ type: 'negative', message: 'Failed to load PHIC deductions.' })
  } finally {
    phicLoading.value = false
  }
}

// Save PHIC deductions to localStorage
function savePhicToLocalStorage() {
  try {
    localStorage.setItem(PHIC_STORAGE_KEY, JSON.stringify(phicRows.value))
  } catch (err) {
    console.error('Failed to save PHIC deductions:', err)
  }
}

// Generate new ID for PHIC deduction
function generateNewPhicId() {
  if (phicRows.value.length === 0) return 1
  const maxId = Math.max(...phicRows.value.map((row) => row.id))
  return maxId + 1
}

// Save PHIC deduction (Create/Update)
async function savePhicRow() {
  // Validation with proper type checking
  const itemId = String(phicForm.value.item_id || '').trim()
  const description = String(phicForm.value.description || '').trim()
  const total = Number(phicForm.value.total)
  const deduction = Number(phicForm.value.deduction)

  if (!itemId) {
    $q.notify({ type: 'warning', message: 'Item ID is required.' })
    return
  }
  if (!description) {
    $q.notify({ type: 'warning', message: 'Description is required.' })
    return
  }
  if (isNaN(total) || total < 0) {
    $q.notify({ type: 'warning', message: 'Valid Total amount is required.' })
    return
  }
  if (isNaN(deduction) || deduction < 0) {
    $q.notify({ type: 'warning', message: 'Valid Deduction amount is required.' })
    return
  }

  phicLoading.value = true
  try {
    // Calculate net amount
    const netAmount = total - deduction

    if (editingPhicRow.value) {
      // Update existing
      const index = phicRows.value.findIndex((row) => row.id === editingPhicRow.value.id)
      if (index !== -1) {
        phicRows.value[index] = {
          ...editingPhicRow.value,
          item_id: itemId,
          description: description,
          total: total,
          deduction: deduction,
          net_amount: netAmount,
        }
        $q.notify({ type: 'positive', message: 'PHIC Deduction updated successfully!' })
      }
    } else {
      // Check for duplicate item_id (only for new entries)
      const existing = phicRows.value.find((row) => String(row.item_id) === itemId)
      if (existing) {
        $q.notify({ type: 'warning', message: 'Item ID already exists. Please use a unique ID.' })
        phicLoading.value = false
        return
      }
      // Create new with net_amount
      const newDeduction = {
        id: generateNewPhicId(),
        item_id: itemId,
        description: description,
        total: total,
        deduction: deduction,
        net_amount: netAmount,
      }
      phicRows.value.push(newDeduction)
      $q.notify({ type: 'positive', message: 'PHIC Deduction added successfully!' })
    }
    savePhicToLocalStorage()
    phicDialogOpen.value = false
    phicForm.value = { item_id: '', description: '', total: 0, deduction: 0 }
    serviceSearch.value = ''
    searchResults.value = []
    editingPhicRow.value = null
  } catch (err) {
    console.error('Save PHIC deduction failed:', err)
    $q.notify({ type: 'negative', message: 'Failed to save PHIC deduction.' })
  } finally {
    phicLoading.value = false
  }
}

// Delete PHIC deduction
async function deletePhicRow(row) {
  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to delete deduction for "${row.description}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    phicLoading.value = true
    try {
      const index = phicRows.value.findIndex((r) => r.id === row.id)
      if (index !== -1) {
        phicRows.value.splice(index, 1)
        savePhicToLocalStorage()
        $q.notify({ type: 'positive', message: 'PHIC Deduction deleted successfully!' })
      }
    } catch (err) {
      console.error('Delete PHIC deduction failed:', err)
      $q.notify({ type: 'negative', message: 'Failed to delete PHIC deduction.' })
    } finally {
      phicLoading.value = false
    }
  })
}

// ==================== Common Methods ====================
// Handle view toggle
function onViewToggle() {
  filter.value = ''
  if (currentView.value === 'phic') {
    loadPhicDeductions()
  }
}

// Highlight helper
function highlightText(text, search) {
  if (!search || text === undefined || text === null) return text
  const regex = new RegExp(`(${search})`, 'gi')
  return String(text).replace(regex, '<span class="text-green bg-green-1">$1</span>')
}

// Initial load - fetch ALL services for PHIC deductions
onMounted(async () => {
  // Fetch all service categories for PHIC deductions
  await Promise.all([
    patientStore.fetchLaboratoryExams(),
    patientStore.fetchRadiologyExams(),
    patientStore.fetchMammogramExams(),
    patientStore.fetchUltrasoundExams(),
  ])
  fetchData() // This will fetch the currently selected category for service management
  loadPhicDeductions()
})

// Watch for category changes
watch(selectedCategory, () => {
  if (currentView.value === 'services') {
    fetchData()
  }
})

// Watch for PHIC dialog to open and ensure ALL services are loaded
watch(phicDialogOpen, async (isOpen) => {
  if (isOpen && currentView.value === 'phic' && !editingPhicRow.value) {
    // Fetch ALL service categories to ensure we have complete data for searching
    phicLoading.value = true
    try {
      // Fetch all service types
      await Promise.all([
        patientStore.fetchLaboratoryExams(),
        patientStore.fetchRadiologyExams(),
        patientStore.fetchMammogramExams(),
        patientStore.fetchUltrasoundExams(),
      ])
    } catch (err) {
      console.error('Failed to load services:', err)
    } finally {
      phicLoading.value = false
    }
  }
})
</script>

<style scoped>
.sticky-toggle-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border-radius: 4px 4px 0 0;
}

.active-title {
  font-weight: bold;
  color: #2e7d32;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.green-title {
  font-weight: bold;
  color: #2e7d32;
}

.green-separator {
  background-color: #4caf50;
  height: 2px;
}

.green-separator-light {
  background-color: #a5d6a7;
  height: 1px;
}

.my-sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}

/* Green highlight for search matches */
:deep(.text-green) {
  color: #2e7d32 !important;
}

:deep(.bg-green-1) {
  background-color: #e8f5e9 !important;
}

/* Search results dropdown styling */
.search-results-list {
  position: absolute;
  z-index: 100;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: calc(100% - 32px);
}

.search-results-list .q-item:hover {
  background-color: #e8f5e9;
  cursor: pointer;
}

/* Style the Net Amount column header */
:deep(.q-table th:contains('Net Amount')) {
  background-color: #e8f5e9;
  color: #2e7d32;
  font-weight: bold;
}
</style>
