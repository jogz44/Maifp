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
            <div class="col-12 col-md-auto">
              <q-toggle v-model="isRange" label="Select Date Range" color="green-8" />
            </div>

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
        <div class="row q-gutter-sm" v-if="filteredData.length > 0">
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
          :rows="filteredData"
          :columns="columns"
          row-key="transaction_id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          binary-state-sort
          :rows-per-page-options="[10, 25, 50, 100, 0]"
          class="maifip-table"
          :filter="searchText"
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

          <template v-slot:body-cell-Gl_number="props">
            <q-td :props="props">
              <q-badge color="secondary" :label="props.value || 'N/A'" />
            </q-td>
          </template>

          <template v-slot:body-cell-amount="props">
            <q-td :props="props" class="text-right">
              <q-chip color="green-1" text-color="green-10">
                {{ formatCurrency(calculatePatientTotal(props.row.maifip_funds)) }}
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

    <div id="pdfContent" style="display: none">
      <div class="pdf-container">
        <div class="header-container">
          <table class="header-table">
            <tbody>
              <tr>
                <td class="logo-cell" width="25%">
                  <div class="logo-container">
                    <img src="../assets/DOH.svg" alt="DOH" class="logo" />
                    <img src="../assets/BP.png" alt="BP" class="logo" />
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
                    <img src="../assets/CHO-logo.png" alt="CHO Logo" class="logo" />
                    <img src="../assets/logo.png" alt="City of Tagum Logo" class="logo" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="office-heading">
          <h3>MAIFIP REPORT</h3>
          <p class="date-range">{{ getDateRangeText() }}</p>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              <th>GL Control No</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(patient, index) in filteredData"
              :key="`patient-${patient.transaction_id}-${index}`"
            >
              <td>{{ formatReportDate(patient.transaction_date) }}</td>
              <td>{{ patient.patient_name || 'N/A' }}</td>
              <td>{{ patient.Gl_number || 'N/A' }}</td>
              <td>{{ formatCurrency(calculatePatientTotal(patient.maifip_funds)) }}</td>
            </tr>
            <tr v-if="filteredData.length > 0" class="total-row">
              <td colspan="3" style="text-align: right; font-weight: bold">Total Amount:</td>
              <td style="text-align: right; font-weight: bold">
                {{ formatCurrency(totalAmount) }}
              </td>
            </tr>
            <tr v-else>
              <td colspan="4" style="text-align: center; font-style: italic">
                No data available for the selected date(s)
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
      isRange: false,
      singleDate: null,
      fromDate: null,
      toDate: null,

      allData: [],
      filteredData: [],
      searchText: '',
      loading: false,
      isGenerating: false,
      loadingMessage: 'Processing...',
      loadingSubMessage: 'Please wait...',

      pagination: {
        sortBy: 'transaction_date',
        descending: true,
        page: 1,
        rowsPerPage: 5,
      },

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
          name: 'Gl_number',
          required: true,
          label: 'GL Control No',
          align: 'center',
          field: 'Gl_number',
          sortable: true,
          style: 'width: 150px',
        },
        {
          name: 'amount',
          required: true,
          label: 'Amount',
          align: 'right',
          field: (row) => this.calculatePatientTotal(row.maifip_funds),
          sortable: true,
          sort: (a, b) => parseFloat(a) - parseFloat(b),
          style: 'width: 120px',
        },
      ],
    }
  },

  computed: {
    totalAmount() {
      return this.filteredData.reduce((total, patient) => {
        return total + this.calculatePatientTotal(patient.maifip_funds)
      }, 0)
    },
  },

  async mounted() {
    await this.fetchAllData()
  },

  methods: {
    fromDateOptions(date) {
      return this.toDate ? date <= this.toDate : true
    },

    toDateOptions(date) {
      return this.fromDate ? date >= this.fromDate : true
    },

    async fetchAllData() {
      this.loading = true
      try {
        const result = await this.maifipStore.getDate()

        if (result.success && Array.isArray(result.data)) {
          this.allData = result.data
          this.filteredData = [...this.allData]
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

    async onFilter() {
      if (!this.isFilterValid()) {
        this.showErrorNotification('Please select valid date(s) for filtering')
        return
      }

      this.loading = true
      try {
        const payload = this.buildRequestPayload()
        const result = await this.maifipStore.getReport(payload)

        if (result.success && Array.isArray(result.data)) {
          this.filteredData = result.data
          this.showSuccessNotification(`Found ${result.data.length} filtered records`)
        } else {
          this.filteredData = []
          this.showErrorNotification('No data found for selected date range')
        }
      } catch (error) {
        console.error('Filter error:', error)
        this.filteredData = []
        this.showErrorNotification('Failed to filter data')
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      this.isRange = false
      this.singleDate = null
      this.fromDate = null
      this.toDate = null
      this.searchText = ''
      this.filteredData = [...this.allData]
      this.showSuccessNotification('Filters cleared')
    },

    isFilterValid() {
      if (this.isRange) {
        return this.fromDate && this.toDate
      }
      return this.singleDate
    },

    buildRequestPayload() {
      const payload = {}

      if (this.isRange) {
        if (this.fromDate) payload.fromDate = new Date(this.fromDate)
        if (this.toDate) payload.toDate = new Date(this.toDate)
      } else {
        if (this.singleDate) payload.singleDate = new Date(this.singleDate)
      }

      return payload
    },

    onRequest(props) {
      this.pagination = props.pagination
    },

    async generateReport(type) {
      if (this.filteredData.length === 0) {
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

    async generateExcel() {
      try {
        console.log('Starting Excel generation...')

        const excelData = this.filteredData.map((patient) => ({
          Date: this.formatReportDateForExcel(patient.transaction_date),
          'Patient Name': patient.patient_name || 'N/A',
          'GL Control No': patient.Gl_number || 'N/A',
          Amount: this.calculatePatientTotal(patient.maifip_funds),
        }))

        excelData.push({
          Date: '',
          'Patient Name': '',
          'GL Control No': 'Total Amount:',
          Amount: this.totalAmount,
        })

        console.log('Excel data prepared:', excelData.length, 'rows')

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(excelData)

        ws['!cols'] = [{ width: 15 }, { width: 30 }, { width: 20 }, { width: 15 }]

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

    generateFilename(extension) {
      const timestamp = new Date().toISOString().split('T')[0]

      if (!this.isRange && this.singleDate) {
        const formattedDate = this.singleDate.replace(/-/g, '')
        return `MAIFIPReport-${formattedDate}.${extension}`
      }
      if (this.isRange && this.fromDate && this.toDate) {
        const fromFormatted = this.fromDate.replace(/-/g, '')
        const toFormatted = this.toDate.replace(/-/g, '')
        return `MAIFIPReport-${fromFormatted}_to_${toFormatted}.${extension}`
      }
      return `MAIFIPReport-${timestamp.replace(/-/g, '')}.${extension}`
    },

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

    formatCurrency(amount) {
      const numAmount = Number(amount)
      if (isNaN(numAmount)) return '₱0.00'

      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(numAmount)
    },

    getDateRangeText() {
      if (!this.isRange && this.singleDate) {
        return `Date: ${this.formatDisplayDate(this.singleDate)}`
      }
      if (this.isRange && this.fromDate && this.toDate) {
        return `Date Range: ${this.formatDisplayDate(this.fromDate)} to ${this.formatDisplayDate(this.toDate)}`
      }
      return `All Records (${this.filteredData.length} entries)`
    },

    calculatePatientTotal(maifipFunds) {
      if (!Array.isArray(maifipFunds)) return 0

      return maifipFunds.reduce((total, fund) => {
        const amount = Number(fund?.fund_amount)
        return total + (isNaN(amount) ? 0 : amount)
      }, 0)
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    showSuccessNotification(message) {
      this.$q.notify({
        message,
        color: 'positive',
        position: 'top',
        timeout: 3000,
        actions: [{ icon: 'close', color: 'white' }],
      })
    },

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

.date-range {
  font-size: 10pt;
  margin: 0;
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
  width: 15%;
}

.data-table td:nth-child(2) {
  width: 40%;
}

.data-table td:nth-child(3) {
  text-align: center;
  width: 20%;
}

.data-table td:nth-child(4) {
  text-align: right;
  width: 25%;
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
