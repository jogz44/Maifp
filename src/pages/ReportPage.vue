<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="isGenerating" persistent full-width full-height>
      <q-card class="loading-card">
        <q-card-section class="row items-center q-gutter-sm">
          <q-spinner-hourglass color="green-8" size="2em" />
          <div class="text-h6">{{ loadingMessage }}</div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2 text-grey-7">{{ loadingSubMessage }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-card class="filter-card q-mb-md">
      <q-card-section>
        <div class="text-h6">MAIFIP Report Filters</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onFilter">
          <div class="row q-col-gutter-md items-end">
            <!-- Fund Source Filter -->
            <div class="col-12 col-md-auto">
              <q-select
                v-model="fundSource"
                :options="fundSourceOptions"
                label="Fund Source"
                outlined
                dense
                emit-value
                map-options
                color="green-8"
              />
            </div>

            <!-- Date Range Toggle -->
            <div class="col-12 col-md-auto">
              <q-toggle v-model="isRange" label="Select Date Range" color="green-8" />
            </div>

            <!-- Single Date Picker -->
            <div v-if="!isRange" class="col-12 col-md-auto">
              <q-input v-model="singleDate" label="Select Date" outlined dense clearable readonly>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="singlePickerProxy"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="singleDate"
                        mask="YYYY-MM-DD"
                        @update:model-value="() => $refs.singlePickerProxy.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- From Date Picker -->
            <div v-else class="col-12 col-md-auto">
              <q-input v-model="fromDate" label="From Date" outlined dense clearable readonly>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="fromPickerProxy"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="fromDate"
                        mask="YYYY-MM-DD"
                        :options="fromDateOptions"
                        @update:model-value="() => $refs.fromPickerProxy.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- To Date Picker -->
            <div v-if="isRange" class="col-12 col-md-auto">
              <q-input v-model="toDate" label="To Date" outlined dense clearable readonly>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="toPickerProxy"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="toDate"
                        mask="YYYY-MM-DD"
                        :options="toDateOptions"
                        @update:model-value="() => $refs.toPickerProxy.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Action Buttons -->
            <div class="col-12 col-md q-gutter-sm row justify-end">
              <q-btn
                label="Filter"
                type="submit"
                color="primary"
                icon="filter_list"
                :loading="loading"
              />
              <q-btn
                label="Clear"
                color="grey-6"
                icon="clear"
                @click="clearFilters"
                :disable="loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-card class="data-card">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">MAIFIP Data</div>
        <div class="row q-gutter-sm" v-if="displayedData.length > 0">
          <q-btn
            label="Generate PDF"
            color="red-8"
            icon="picture_as_pdf"
            @click="generateReport('pdf')"
            :loading="isGenerating"
            :disable="isGenerating"
          />
          <q-btn
            label="Generate Excel"
            color="green-8"
            icon="table_chart"
            @click="generateReport('excel')"
            :loading="isGenerating"
            :disable="isGenerating"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          :rows="displayedData"
          :columns="columns"
          row-key="row_id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="[10, 25, 50, 100, 0]"
          class="maifip-table"
        >
          <template v-slot:top>
            <div class="full-width row justify-between items-center">
              <div class="text-subtitle1">
                <q-chip color="green-1" text-color="green-10">
                  Total Amount: {{ formatCurrency(totalAmount) }}
                </q-chip>
              </div>
              <q-input
                v-model="searchText"
                placeholder="Search by patient name or GL number..."
                outlined
                dense
                debounce="300"
                style="width: 300px"
                clearable
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>

          <template v-slot:body-cell-transaction_date="props">
            <q-td :props="props">
              <q-chip color="blue-1" text-color="blue-10" size="sm">
                {{ formatReportDate(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-patient_name="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.value || 'N/A' }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-gl_number="props">
            <q-td :props="props">
              <q-badge color="secondary" :label="props.value || 'N/A'" />
            </q-td>
          </template>

          <template v-slot:body-cell-fund_source="props">
            <q-td :props="props">
              <q-badge
                :color="
                  props.value === 'MAIFIP-LGU'
                    ? 'blue'
                    : props.value === 'MAIFIP-Congressman'
                      ? 'purple'
                      : 'grey'
                "
                :label="props.value || 'N/A'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-amount="props">
            <q-td :props="props" class="text-right">
              <q-chip color="green-1" text-color="green-10">
                {{ formatCurrency(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm text-grey-7 q-py-lg">
              <q-icon size="2em" name="inbox" />
              <span class="text-h6">{{ loading ? 'Loading data...' : 'No data available' }}</span>
            </div>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- PDF Content (Hidden) -->
    <div id="pdfContent" style="display: none">
      <div class="pdf-container">
        <div class="header-container">
          <table class="header-table">
            <tbody>
              <tr>
                <td class="logo-cell" width="25%">
                  <div class="logo-container">
                    <img src="/Doh.svg" alt="DOH" class="logo" />
                    <img src="/BP.png" alt="BP" class="logo" />
                  </div>
                </td>
                <td class="header-text" width="50%">
                  <div>Republic of the Philippines</div>
                  <div>Province of Davao Del Norte</div>
                  <div>City Government of Tagum</div>
                  <div class="header-office">City Health Office</div>
                </td>
                <td class="logo-cell" width="25%">
                  <div class="logo-container right">
                    <img src="/CHO-logo.png" alt="CHO Logo" class="logo" />
                    <img src="/logo.png" alt="City of Tagum Logo" class="logo" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="office-heading">
          <h3>MAIFIP REPORT</h3>
          <p class="date-range">{{ getDateRangeText() }}</p>
          <p class="fund-source-range">{{ getFundSourceText() }}</p>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              <th>GL Number</th>
              <th>Fund Source</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in displayedData" :key="`pdf-${row.row_id}-${index}`">
              <td>{{ formatReportDate(row.transaction_date) }}</td>
              <td>{{ row.patient_name || 'N/A' }}</td>
              <td>{{ row.gl_number || 'N/A' }}</td>
              <td>{{ row.fund_source || 'N/A' }}</td>
              <td>{{ formatCurrency(row.amount) }}</td>
            </tr>
            <tr v-if="displayedData.length > 0" class="total-row">
              <td colspan="4" style="text-align: right; font-weight: bold">Total Amount:</td>
              <td style="text-align: right; font-weight: bold">
                {{ formatCurrency(totalAmount) }}
              </td>
            </tr>
            <tr v-else>
              <td colspan="5" style="text-align: center; font-style: italic">
                No data available for the selected filters
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { usemaifipStore } from 'stores/maifipStore'
import * as XLSX from 'xlsx'

const PDF_CONFIG = {
  margin: [10, 10, 10, 10],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 5,
    useCORS: true,
    allowTaint: true,
    letterRendering: true,
    logging: false,
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'landscape',
    compress: true,
  },
  pagebreak: {
    mode: ['css', 'legacy'],
    before: '.page-break-before',
    after: '.page-break-after',
  },
}

export default {
  name: 'ReportsPage',
  setup() {
    const maifipStore = usemaifipStore()
    return { maifipStore }
  },

  data() {
    return {
      // Fund Source Filter
      fundSource: 'all',
      fundSourceOptions: [
        { label: 'All Sources', value: 'all' },
        { label: 'MAIFIP-LGU', value: 'MAIFIP-LGU' },
        { label: 'MAIFIP-Congressman', value: 'MAIFIP-Congressman' },
      ],

      // Date Filters
      isRange: false,
      singleDate: null,
      fromDate: null,
      toDate: null,

      // Data Management
      allData: [],
      filteredData: [],
      searchText: '',
      loading: false,
      isGenerating: false,
      loadingMessage: 'Processing...',
      loadingSubMessage: 'Please wait...',

      // Pagination
      pagination: {
        sortBy: 'transaction_date',
        descending: true,
        page: 1,
        rowsPerPage: 10,
      },

      // Table Columns
      columns: [
        {
          name: 'transaction_date',
          required: true,
          label: 'Date',
          align: 'center',
          field: 'transaction_date',
          sortable: true,
          style: 'width: 120px',
        },
        {
          name: 'patient_name',
          required: true,
          label: 'Patient Name',
          align: 'left',
          field: 'patient_name',
          sortable: true,
          style: 'min-width: 200px',
        },
        {
          name: 'gl_number',
          required: true,
          label: 'GL Number',
          align: 'center',
          field: 'gl_number',
          sortable: true,
          style: 'width: 150px',
        },
        {
          name: 'fund_source',
          required: true,
          label: 'Fund Source',
          align: 'center',
          field: 'fund_source',
          sortable: true,
          style: 'width: 150px',
        },
        {
          name: 'amount',
          required: true,
          label: 'Amount',
          align: 'right',
          field: 'amount',
          sortable: true,
          sort: (a, b) => parseFloat(a) - parseFloat(b),
          style: 'width: 120px',
        },
      ],
    }
  },

  computed: {
    /**
     * Display data with search filter applied
     */
    displayedData() {
      let data = [...this.filteredData]

      if (this.searchText && this.searchText.trim() !== '') {
        const searchLower = this.searchText.toLowerCase().trim()
        data = data.filter((row) => {
          const patientMatch =
            row.patient_name && row.patient_name.toLowerCase().includes(searchLower)
          const glMatch = row.gl_number && row.gl_number.toLowerCase().includes(searchLower)
          return patientMatch || glMatch
        })
      }

      return data
    },

    /**
     * Calculate total amount from displayed data
     */
    totalAmount() {
      return this.displayedData.reduce((total, row) => {
        return total + (parseFloat(row.amount) || 0)
      }, 0)
    },
  },

  async mounted() {
    await this.fetchAllData()
  },

  methods: {
    /**
     * Date Option Validators
     */
    fromDateOptions(date) {
      return this.toDate ? date <= this.toDate : true
    },

    toDateOptions(date) {
      return this.fromDate ? date >= this.fromDate : true
    },

    /**
     * Fetch all data from store
     */
    async fetchAllData() {
      this.loading = true
      try {
        const result = await this.maifipStore.getDate()

        if (result.success && Array.isArray(result.data)) {
          this.allData = this.transformData(result.data)
          this.filteredData = [...this.allData]
          console.log('Data loaded:', this.allData.length, 'records')
        } else {
          this.allData = []
          this.filteredData = []
          this.showErrorNotification('Failed to load data')
        }
      } catch (error) {
        console.error('Fetch error:', error)
        this.allData = []
        this.filteredData = []
        this.showErrorNotification('Failed to load data')
      } finally {
        this.loading = false
      }
    },

    /**
     * Transform raw data into display format
     * Each fund record becomes a separate row
     */
    transformData(data) {
      const transformedRows = []
      let rowCounter = 0

      data.forEach((transaction) => {
        // Process MAIFIP-LGU funds
        if (Array.isArray(transaction.maifip_LGU) && transaction.maifip_LGU.length > 0) {
          transaction.maifip_LGU.forEach((fund) => {
            transformedRows.push({
              row_id: `${transaction.transaction_id}-lgu-${rowCounter}`,
              transaction_id: transaction.transaction_id,
              transaction_date: transaction.transaction_date,
              patient_name: transaction.patient_name,
              gl_number: transaction.gl_lgu || 'N/A',
              fund_source: 'MAIFIP-LGU',
              amount: parseFloat(fund.fund_amount) || 0,
              fund_id: fund.id,
            })
            rowCounter++
          })
        }

        // Process MAIFIP-Congressman funds
        if (
          Array.isArray(transaction.maifip_Congressman) &&
          transaction.maifip_Congressman.length > 0
        ) {
          transaction.maifip_Congressman.forEach((fund) => {
            transformedRows.push({
              row_id: `${transaction.transaction_id}-cong-${rowCounter}`,
              transaction_id: transaction.transaction_id,
              transaction_date: transaction.transaction_date,
              patient_name: transaction.patient_name,
              gl_number: transaction.gl_cong || 'N/A',
              fund_source: 'MAIFIP-Congressman',
              amount: parseFloat(fund.fund_amount) || 0,
              fund_id: fund.id,
            })
            rowCounter++
          })
        }

        // Handle records with no funds
        if (
          (!Array.isArray(transaction.maifip_LGU) || transaction.maifip_LGU.length === 0) &&
          (!Array.isArray(transaction.maifip_Congressman) ||
            transaction.maifip_Congressman.length === 0)
        ) {
          transformedRows.push({
            row_id: `${transaction.transaction_id}-none-${rowCounter}`,
            transaction_id: transaction.transaction_id,
            transaction_date: transaction.transaction_date,
            patient_name: transaction.patient_name,
            gl_number: transaction.gl_lgu || transaction.gl_cong || 'N/A',
            fund_source: 'No Fund',
            amount: 0,
            fund_id: null,
          })
          rowCounter++
        }
      })

      return transformedRows
    },

    /**
     * Parse date string to Date object
     */
    parseDate(dateString) {
      if (!dateString) return null
      try {
        const date = new Date(dateString)
        return date
      } catch {
        return null
      }
    },

    /**
     * Get date string without time (YYYY-MM-DD)
     */
    getDateOnly(date) {
      if (!date) return null
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    /**
     * Check if date falls within range
     */
    isDateInRange(transactionDate, fromDate, toDate) {
      const txDate = this.getDateOnly(transactionDate)
      const from = this.getDateOnly(fromDate)
      const to = this.getDateOnly(toDate)

      if (!txDate || !from || !to) return false

      return txDate >= from && txDate <= to
    },

    /**
     * Check if date matches single date
     */
    isDateMatch(transactionDate, singleDate) {
      const txDate = this.getDateOnly(transactionDate)
      const single = this.getDateOnly(singleDate)

      if (!txDate || !single) return false

      return txDate === single
    },

    /**
     * Apply date filter to data
     */
    applyDateFilter(data) {
      if (!this.isRange && !this.singleDate) {
        return data
      }

      if (this.isRange && this.fromDate && this.toDate) {
        return data.filter((row) =>
          this.isDateInRange(row.transaction_date, this.fromDate, this.toDate),
        )
      }

      if (!this.isRange && this.singleDate) {
        return data.filter((row) => this.isDateMatch(row.transaction_date, this.singleDate))
      }

      return data
    },

    /**
     * Apply fund source filter to data
     */
    applyFundSourceFilter(data) {
      if (this.fundSource === 'all') {
        return data
      }

      return data.filter((row) => row.fund_source === this.fundSource)
    },

    /**
     * Apply all filters to data
     */
    applyAllFilters(data) {
      let result = data

      // Apply date filter
      result = this.applyDateFilter(result)

      // Apply fund source filter
      result = this.applyFundSourceFilter(result)

      return result
    },

    /**
     * Apply filters and fetch data
     */
    async onFilter() {
      if (!this.isFilterValid()) {
        this.showErrorNotification('Please select valid date(s) for filtering')
        return
      }

      this.loading = true
      try {
        // Apply filters to all data (client-side filtering)
        const filtered = this.applyAllFilters(this.allData)

        this.filteredData = filtered
        this.pagination.page = 1
        this.searchText = ''

        if (filtered.length > 0) {
          this.showSuccessNotification(`Found ${filtered.length} filtered records`)
        } else {
          this.showErrorNotification('No data found for selected filters')
        }

        console.log('Filtered data:', {
          dateRange: this.isRange ? `${this.fromDate} to ${this.toDate}` : this.singleDate,
          fundSource: this.fundSource,
          resultCount: filtered.length,
        })
      } catch (error) {
        console.error('Filter error:', error)
        this.filteredData = []
        this.showErrorNotification('Failed to filter data')
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.isRange = false
      this.singleDate = null
      this.fromDate = null
      this.toDate = null
      this.searchText = ''
      this.fundSource = 'all'
      this.filteredData = [...this.allData]
      this.pagination.page = 1
      this.showSuccessNotification('Filters cleared')
    },

    /**
     * Validate filter inputs
     */
    isFilterValid() {
      if (this.isRange) {
        return this.fromDate && this.toDate
      }
      return this.singleDate
    },

    /**
     * Handle table request (pagination, sorting)
     */
    onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination

      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage
      this.pagination.sortBy = sortBy
      this.pagination.descending = descending
    },

    /**
     * Generate report (PDF or Excel)
     */
    async generateReport(type) {
      if (this.displayedData.length === 0) {
        this.showErrorNotification('No data to generate report')
        return
      }

      this.isGenerating = true

      try {
        if (type === 'pdf') {
          this.loadingMessage = 'Generating PDF Report...'
          this.loadingSubMessage = 'Please wait while we prepare your PDF report.'
          await this.generatePDF()
        } else if (type === 'excel') {
          this.loadingMessage = 'Generating Excel Report...'
          this.loadingSubMessage = 'Please wait while we prepare your Excel report.'
          await this.generateExcel()
        }
      } catch (error) {
        console.error('Report generation error:', error)
        this.showErrorNotification(`Failed to generate ${type.toUpperCase()} report`)
      } finally {
        this.isGenerating = false
      }
    },

    /**
     * Generate PDF report
     */
    async generatePDF() {
      let element = null

      try {
        const html2pdf = (await import('html2pdf.js')).default
        element = document.getElementById('pdfContent')

        const config = {
          ...PDF_CONFIG,
          filename: this.generateFilename('pdf'),
        }

        element.style.display = 'block'
        await this.delay(100)

        const pdf = await html2pdf().set(config).from(element).toPdf().get('pdf')
        const blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)

        window.open(url, '_blank')
        this.showSuccessNotification('PDF generated successfully!')
      } catch (error) {
        console.error('PDF generation error:', error)
        throw error
      } finally {
        if (element) element.style.display = 'none'
      }
    },

    /**
     * Generate Excel report
     */
    async generateExcel() {
      try {
        console.log('Starting Excel generation...')

        const excelData = this.displayedData.map((row) => ({
          Date: this.formatReportDateForExcel(row.transaction_date),
          'Patient Name': row.patient_name || 'N/A',
          'GL Number': row.gl_number || 'N/A',
          'Fund Source': row.fund_source || 'N/A',
          Amount: row.amount,
        }))

        excelData.push({
          Date: '',
          'Patient Name': '',
          'GL Number': '',
          'Fund Source': 'Total Amount:',
          Amount: this.totalAmount,
        })

        console.log('Excel data prepared:', excelData.length, 'rows')

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(excelData)

        ws['!cols'] = [{ width: 15 }, { width: 30 }, { width: 15 }, { width: 18 }, { width: 15 }]

        XLSX.utils.book_append_sheet(wb, ws, 'MAIFIP Report')

        const filename = this.generateFilename('xlsx')
        console.log('Saving Excel file as:', filename)

        XLSX.writeFile(wb, filename)

        this.showSuccessNotification('Excel file generated successfully!')
        console.log('Excel generation completed successfully')
      } catch (error) {
        console.error('Excel generation error:', error)
        this.showErrorNotification('Failed to generate Excel file. Please try again.')
        throw error
      }
    },

    /**
     * Generate filename with timestamp and fund source
     */
    generateFilename(extension) {
      const timestamp = new Date().toISOString().split('T')[0]
      let fundSourceSuffix = ''

      if (this.fundSource !== 'all') {
        fundSourceSuffix = `-${this.fundSource.replace('-', '')}`
      }

      if (!this.isRange && this.singleDate) {
        const formattedDate = this.singleDate.replace(/-/g, '')
        return `MAIFIPReport-${formattedDate}${fundSourceSuffix}.${extension}`
      }
      if (this.isRange && this.fromDate && this.toDate) {
        const fromFormatted = this.fromDate.replace(/-/g, '')
        const toFormatted = this.toDate.replace(/-/g, '')
        return `MAIFIPReport-${fromFormatted}_to_${toFormatted}${fundSourceSuffix}.${extension}`
      }
      return `MAIFIPReport-${timestamp.replace(/-/g, '')}${fundSourceSuffix}.${extension}`
    },

    /**
     * Format date for display in reports
     */
    formatReportDate(dateString) {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return 'Invalid Date'
      }
    },

    /**
     * Format date for Excel export
     */
    formatReportDateForExcel(dateString) {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      } catch {
        return 'Invalid Date'
      }
    },

    /**
     * Format date for display with full month name
     */
    formatDisplayDate(dateString) {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } catch {
        return 'Invalid Date'
      }
    },

    /**
     * Format amount as Philippine Peso currency
     */
    formatCurrency(amount) {
      const numAmount = Number(amount)
      if (isNaN(numAmount)) return '₱0.00'

      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(numAmount)
    },

    /**
     * Get date range text for display
     */
    getDateRangeText() {
      if (!this.isRange && this.singleDate) {
        return `Date: ${this.formatDisplayDate(this.singleDate)}`
      }
      if (this.isRange && this.fromDate && this.toDate) {
        return `Date Range: ${this.formatDisplayDate(this.fromDate)} to ${this.formatDisplayDate(this.toDate)}`
      }
      return `All Records (${this.displayedData.length} entries)`
    },

    /**
     * Get fund source text for display
     */
    getFundSourceText() {
      if (this.fundSource === 'all') {
        return 'Fund Source: All Sources'
      }
      return `Fund Source: ${this.fundSource}`
    },

    /**
     * Delay helper for async operations
     */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /**
     * Show success notification
     */
    showSuccessNotification(message) {
      this.$q.notify({
        message,
        color: 'positive',
        position: 'top',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    },

    /**
     * Show error notification
     */
    showErrorNotification(message) {
      this.$q.notify({
        message,
        color: 'negative',
        position: 'top',
        timeout: 5000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    },
  },
}
</script>

<style scoped>
.filter-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-card {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.maifip-table {
  .q-table__top {
    padding: 16px;
    background-color: #f5f5f5;
  }

  .q-table__bottom {
    background-color: #f5f5f5;
  }
}

/* PDF Styles */
.pdf-container {
  width: 100%;
  font-family: Arial, sans-serif;
  font-size: 10pt;
  color: #000;
  background: white;
  padding: 20px;
  letter-spacing: 1px;
}

.header-container {
  border: 1px solid #000;
  padding: 10px;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.header-table {
  width: 100%;
  border-collapse: collapse;
  letter-spacing: 0.5px;
}

.logo-cell {
  vertical-align: middle;
  padding: 5px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-container.right {
  justify-content: flex-end;
}

.logo {
  width: 60px;
  height: auto;
  margin-right: 10px;
  vertical-align: middle;
}

.logo-container.right .logo {
  margin-right: 0;
  margin-left: 10px;
}

.header-text {
  text-align: center;
  vertical-align: middle;
  font-size: 9pt;
  line-height: 1.3;
  padding: 5px;
  letter-spacing: 0.5px;
}

.header-office {
  font-size: 11pt;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.office-heading {
  text-align: center;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.office-heading h3 {
  font-size: 15pt;
  font-weight: bold;
  letter-spacing: 2px;
  margin: 10px 0 5px 0;
}

.office-heading .date-range {
  font-size: 10pt;
  margin: 5px 0;
  font-weight: normal;
}

.office-heading .fund-source-range {
  font-size: 10pt;
  margin: 5px 0;
  font-weight: normal;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 9pt;
}

.data-table th,
.data-table td {
  border: 1px solid #000;
  padding: 6px 8px;
  text-align: left;
  vertical-align: middle;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: center;
}

.data-table td:nth-child(1) {
  text-align: center;
  width: 12%;
}

.data-table td:nth-child(2) {
  width: 28%;
}

.data-table td:nth-child(3) {
  text-align: center;
  width: 15%;
}

.data-table td:nth-child(4) {
  text-align: center;
  width: 18%;
}

.data-table td:nth-child(5) {
  text-align: right;
  width: 27%;
}

.total-row {
  background-color: #f8f9fa;
  font-weight: bold;
}

@media print {
  .pdf-container {
    margin: 0;
    padding: 0;
  }

  .header-container,
  .office-heading {
    page-break-inside: avoid;
  }

  .data-table thead {
    display: table-header-group;
  }

  .data-table tbody tr {
    page-break-inside: avoid;
  }
}

.page-break-before {
  page-break-before: always;
}

.page-break-after {
  page-break-after: always;
}
</style>
