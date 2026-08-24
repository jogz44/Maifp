<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="isGenerating" persistent>
      <q-card class="loading-card" style="min-width: 300px">
        <q-card-section class="row items-center q-gutter-sm">
          <q-spinner-hourglass color="green-8" size="2em" />
          <div class="text-h6">{{ loadingMessage }}</div>
        </q-card-section>
        <q-card-section v-if="loadingSubMessage">
          <div class="text-body2 text-grey-7">{{ loadingSubMessage }}</div>
        </q-card-section>
        <q-linear-progress v-if="isGenerating" :value="progressValue" color="green-8" class="q-mt-md" />
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
              <q-select v-model="fundSource" :options="fundSourceOptions" label="Fund Source" outlined dense emit-value
                map-options color="green-8" />
            </div>

            <!-- Date Range Toggle -->
            <div class="col-12 col-md-auto">
              <!-- Forcibly only date range -->
              <q-banner dense class="q-mb-xs">
                Please select <span class="text-bold">From Date</span> and
                <span class="text-bold">To Date</span> to generate Annex B report.
              </q-banner>
            </div>

            <!-- From Date Picker -->
            <div class="col-12 col-md-auto">
              <q-input v-model="fromDate" label="From Date" outlined dense clearable readonly>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="fromPickerProxy" cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="fromDate" mask="YYYY-MM-DD" :options="fromDateOptions"
                        @update:model-value="() => $refs.fromPickerProxy.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- To Date Picker -->
            <div class="col-12 col-md-auto">
              <q-input v-model="toDate" label="To Date" outlined dense clearable readonly>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="toPickerProxy" cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="toDate" mask="YYYY-MM-DD" :options="toDateOptions"
                        @update:model-value="() => $refs.toPickerProxy.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Action Buttons -->
            <div class="col-12 col-md q-gutter-sm row justify-end">
              <q-btn label="Filter" type="submit" color="primary" icon="filter_list" :loading="loading" />
              <q-btn label="Clear" color="grey-6" icon="clear" @click="clearFilters" :disable="loading" />
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
            label="Generate Excel (Annex B)"
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
        <q-table :rows="displayedData" :columns="columns" row-key="row_id" :loading="loading"
          v-model:pagination="pagination" @request="onRequest" binary-state-sort
          :rows-per-page-options="[10, 25, 50, 100, 0]" class="maifip-table">
          <template v-slot:top>
            <div class="full-width row justify-between items-center">
              <div class="text-subtitle1">
                <q-chip color="green-1" text-color="green-10">
                  Total Amount: {{ formatCurrency(totalAmount) }}
                </q-chip>
              </div>
              <q-input v-model="searchText" placeholder="Search by patient name or GL number..." outlined dense
                debounce="300" style="width: 300px" clearable>
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
              <div class="text-weight-medium text-uppercase">{{ props.value || 'N/A' }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-gl_number="props">
            <q-td :props="props">
              <q-badge color="secondary" :label="props.value || 'N/A'" />
            </q-td>
          </template>

          <template v-slot:body-cell-fund_source="props">
            <q-td :props="props">
              <q-badge :color="props.value === 'MAIFIP-LGU'
                  ? 'blue'
                  : props.value === 'MAIFIP-Congressman'
                    ? 'purple'
                    : 'grey'
                " :label="props.value || 'N/A'" />
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
  </q-page>
</template>

<script>
import { usemaifipStore } from 'stores/maifipStore'

let pdfMakeInstance = null

// Pre-load pdfmake
const initPdfMake = async () => {
  if (pdfMakeInstance) return pdfMakeInstance
  const pdfmakeModule = await import('pdfmake/build/pdfmake')
  const pdfmakeFonts = await import('pdfmake/build/vfs_fonts')
  pdfMakeInstance = pdfmakeModule.default
  const fonts = pdfmakeFonts.default
  if (fonts.pdfMake) {
    pdfMakeInstance.vfs = fonts.pdfMake.vfs
  } else if (fonts.vfs) {
    pdfMakeInstance.vfs = fonts.vfs
  }
  pdfMakeInstance.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  }
  return pdfMakeInstance
}

export default {
  name: 'ReportsPage',

  setup() {
    const maifipStore = usemaifipStore()
    return { maifipStore }
  },

  data() {
    return {
      fundSource: 'all',
      fundSourceOptions: [
        { label: 'All Sources', value: 'all' },
        { label: 'MAIFIP-LGU', value: 'MAIFIP-LGU' },
        { label: 'MAIFIP-Congressman', value: 'MAIFIP-Congressman' },
      ],

      // ONLY date range used (Annex B logic)
      fromDate: null,
      toDate: null,

      allData: [],
      filteredData: [],
      searchText: '',
      loading: false,
      isGenerating: false,
      loadingMessage: 'Processing...',
      loadingSubMessage: 'Please wait...',
      progressValue: 0,

      // Images
      logoImages: {
        doh: null,
        bp: null,
        cho: null,
        city: null,
      },

      imagesReady: false,

      pagination: {
        sortBy: 'transaction_date',
        descending: true,
        page: 1,
        rowsPerPage: 10,
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
    displayedData() {
      let data = [...this.filteredData]
      if (this.searchText?.trim()) {
        const s = this.searchText.toLowerCase().trim()
        data = data.filter(
          (row) =>
            (row.patient_name && row.patient_name.toLowerCase().includes(s)) ||
            (row.gl_number && row.gl_number.toLowerCase().includes(s)),
        )
      }
      return data
    },
    totalAmount() {
      return this.displayedData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
    },
  },

  async mounted() {
    await initPdfMake()
    await Promise.all([this.loadImages(), this.fetchAllData()])
  },

  methods: {
    toUpperCase(text) {
      if (!text || text === 'N/A') return 'N/A'
      return text.toUpperCase()
    },
    async loadImageAsDataUrl(url) {
      try {
        const response = await fetch(url, { cache: 'force-cache' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = () => {
            console.warn(`Failed to convert image: ${url}`)
            resolve(null)
          }
          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.warn(`Failed to load image: ${url}`, error)
        return null
      }
    },
    async loadImages() {
      const [doh, bp, cho, city] = await Promise.all([
        this.loadImageAsDataUrl('/champ/doh.png'),
        this.loadImageAsDataUrl('/champ/BP.png'),
        this.loadImageAsDataUrl('/champ/CHO-logo.png'),
        this.loadImageAsDataUrl('/champ/logo.png'),
      ])
      this.logoImages = { doh, bp, cho, city }
      this.imagesReady = true
    },

    getCurrentDateTime() {
      return new Date().toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

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
          this.allData = this.transformData(result.data)
          this.filteredData = [...this.allData]
        } else {
          this.allData = this.filteredData = []
          this.showErrorNotification('Failed to load data')
        }
      } catch {
        this.allData = this.filteredData = []
        this.showErrorNotification('Failed to load data')
      } finally {
        this.loading = false
      }
    },

    cleanPatientName(name) {
      if (!name || name === 'N/A') return 'N/A'
      const cleaned = name
        .replace(/\s+n\s*\/?\s*a\s+/gi, ' ')
        .replace(/^n\s*\/?\s*a\s+/gi, '')
        .replace(/\s+n\s*\/?\s*a$/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
      return cleaned === '' ? 'N/A' : this.toUpperCase(cleaned)
    },

    transformData(data) {
      const rows = []
      let c = 0
      data.forEach((tx) => {
        const name = this.cleanPatientName(tx.patient_name)
        if (Array.isArray(tx.maifip_LGU) && tx.maifip_LGU.length) {
          tx.maifip_LGU.forEach((fund) =>
            rows.push({
              row_id: `${tx.transaction_id}-lgu-${c++}`,
              transaction_id: tx.transaction_id,
              transaction_date: tx.transaction_date,
              patient_name: name,
              gl_number: tx.gl_lgu || 'N/A',
              fund_source: 'MAIFIP-LGU',
              amount: parseFloat(fund.fund_amount) || 0,
              fund_id: fund.id,
            }),
          )
        }
        if (Array.isArray(tx.maifip_Congressman) && tx.maifip_Congressman.length) {
          tx.maifip_Congressman.forEach((fund) =>
            rows.push({
              row_id: `${tx.transaction_id}-cong-${c++}`,
              transaction_id: tx.transaction_id,
              transaction_date: tx.transaction_date,
              patient_name: name,
              gl_number: tx.gl_cong || 'N/A',
              fund_source: 'MAIFIP-Congressman',
              amount: parseFloat(fund.fund_amount) || 0,
              fund_id: fund.id,
            }),
          )
        }
        if (
          (!Array.isArray(tx.maifip_LGU) || !tx.maifip_LGU.length) &&
          (!Array.isArray(tx.maifip_Congressman) || !tx.maifip_Congressman.length)
        ) {
          rows.push({
            row_id: `${tx.transaction_id}-none-${c++}`,
            transaction_id: tx.transaction_id,
            transaction_date: tx.transaction_date,
            patient_name: name,
            gl_number: tx.gl_lgu || tx.gl_cong || 'N/A',
            fund_source: 'No Fund',
            amount: 0,
            fund_id: null,
          })
        }
      })
      return rows
    },

    applyDateFilter(data) {
      if (this.fromDate && this.toDate) {
        const from = this.getDateOnly(this.fromDate)
        const to = this.getDateOnly(this.toDate)
        return data.filter((r) => {
          const d = this.getDateOnly(r.transaction_date)
          return d >= from && d <= to
        })
      }
      return data
    },

    applyFundSourceFilter(data) {
      return this.fundSource === 'all'
        ? data
        : data.filter((r) => r.fund_source === this.fundSource)
    },

    applyAllFilters(data) {
      return this.applyFundSourceFilter(this.applyDateFilter(data))
    },

    getDateOnly(date) {
      if (!date) return null
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
    },

    async onFilter() {
      if (!this.isFilterValid()) {
        this.showErrorNotification('Please select both From Date and To Date to filter.')
        return
      }
      this.loading = true
      try {
        const filtered = this.applyAllFilters(this.allData)
        this.filteredData = filtered
        this.pagination.page = 1
        this.searchText = ''
        filtered.length
          ? this.showSuccessNotification(`Found ${filtered.length} filtered records`)
          : this.showErrorNotification('No data found for selected filters')
      } catch {
        this.filteredData = []
        this.showErrorNotification('Failed to filter data')
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      this.fromDate = this.toDate = null
      this.searchText = ''
      this.fundSource = 'all'
      this.filteredData = [...this.allData]
      this.pagination.page = 1
      this.showSuccessNotification('Filters cleared')
    },

    isFilterValid() {
      return !!(this.fromDate && this.toDate)
    },

    onRequest({ pagination: { page, rowsPerPage, sortBy, descending } }) {
      Object.assign(this.pagination, { page, rowsPerPage, sortBy, descending })
    },

    async generateReport(type) {
      if (!this.displayedData.length) {
        this.showErrorNotification('No data to generate report')
        return
      }
      this.isGenerating = true
      try {
        if (type === 'pdf') {
          this.loadingMessage = 'Generating PDF Report...'
          this.loadingSubMessage = 'Building document...'
          this.progressValue = 0.2
          await this.generatePDF()
        } else if (type === 'excel') {
          this.loadingMessage = 'Generating Annex B Excel Report...'
          this.loadingSubMessage = 'Preparing and requesting Annex B report...'
          this.progressValue = 0.5
          await this.generateAnnexBExcel()
        }
      } catch {
        this.showErrorNotification(`Failed to generate ${type.toUpperCase()} report`)
      } finally {
        this.isGenerating = false
        this.progressValue = 0
      }
    },

    /**
     * Generate the Annex B Excel report using backend/service.
     * Requires valid date range filter
     */
    async generateAnnexBExcel() {
      // Must have a valid date range for the Annex B report
      if (!(this.fromDate && this.toDate)) {
        this.showErrorNotification(
          'Annex B Report requires a range of date (from/to) to generate report.',
        )
        throw new Error('No valid date range filter')
      }

      const payload = {
        fromDate: this.fromDate,
        toDate: this.toDate,
        fund_source: this.fundSource === 'all' ? undefined : this.fundSource,
      }
      const fileDesc = `${this.fromDate.replace(/-/g, '')}_to_${this.toDate.replace(/-/g, '')}`

      this.loadingSubMessage = 'Requesting Annex B report...'
      const result = await this.maifipStore.generateAnnexB(payload)
      if (result && result.success && result.data) {
        // Download the Excel (blob)
        const blob = new Blob([result.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `AnnexBReport-${fileDesc}.xlsx`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
        this.showSuccessNotification('Annex B Excel report generated and downloaded successfully!')
      } else {
        this.showErrorNotification('Failed to generate Annex B report from the server')
      }
    },

    async generatePDF() {
      this.progressValue = 0.4
      this.loadingSubMessage = 'Building document structure...'
      const docDefinition = this.buildPDFDocument()
      this.progressValue = 0.7
      this.loadingSubMessage = 'Generating PDF...'
      const pdf = pdfMakeInstance.createPdf(docDefinition)
      pdf.download(this.generateFilename('pdf'))
      this.progressValue = 1
      this.showSuccessNotification('PDF generated successfully!')
    },

    buildPDFDocument() {
      const tableBody = []
      tableBody.push([
        { text: 'DATE', style: 'tableHeader', alignment: 'center' },
        { text: 'PATIENT NAME', style: 'tableHeader', alignment: 'left' },
        { text: 'GL NUMBER', style: 'tableHeader', alignment: 'center' },
        { text: 'FUND SOURCE', style: 'tableHeader', alignment: 'center' },
        { text: 'AMOUNT', style: 'tableHeader', alignment: 'right' },
      ])
      this.displayedData.forEach((row) => {
        tableBody.push([
          { text: this.formatReportDate(row.transaction_date), alignment: 'center' },
          { text: this.toUpperCase(row.patient_name || 'N/A'), alignment: 'left' },
          { text: row.gl_number || 'N/A', alignment: 'center' },
          { text: row.fund_source || 'N/A', alignment: 'center' },
          { text: this.formatCurrencyForPDF(row.amount), alignment: 'right' },
        ])
      })
      tableBody.push([
        { text: 'TOTAL', colSpan: 4, alignment: 'right', style: 'totalRow' },
        {},
        {},
        {},
        {
          text: this.formatCurrencyForPDF(this.totalAmount),
          alignment: 'right',
          style: 'totalRow',
        },
      ])
      return {
        pageOrientation: 'landscape',
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 40],
        defaultStyle: { fontSize: 9 },
        header: () => this.buildPDFHeader(),
        footer: (currentPage, pageCount) => this.buildPDFFooter(currentPage, pageCount),
        content: [
          { text: 'MAIFIP REPORT', style: 'title', alignment: 'center', margin: [0, 0, 0, 6] },
          {
            text: this.getDateRangeText(),
            style: 'reportInfo',
            alignment: 'center',
            margin: [0, 0, 0, 4],
          },
          {
            text: this.getFundSourceText(),
            style: 'reportInfo',
            alignment: 'center',
            margin: [0, 0, 0, 4],
          },
          {
            table: {
              headerRows: 0,
              widths: ['12%', '38%', '15%', '15%', '20%'],
              body: tableBody,
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#aaaaaa',
              vLineColor: () => '#aaaaaa',
              paddingLeft: () => 4,
              paddingRight: () => 4,
              paddingTop: () => 4,
              paddingBottom: () => 4,
            },
          },
        ],
        styles: {
          title: { fontSize: 12, bold: true, margin: [0, 0, 0, 5] },
          reportInfo: { fontSize: 9, color: '#666666' },
          tableHeader: { bold: true, fontSize: 10, fillColor: '#f5f5f5' },
          totalRow: { bold: true, fillColor: '#e8f5e9', color: '#1b5e20' },
        },
      }
    },
    buildPDFHeader() {
      const leftImages = []
      if (this.logoImages.doh) {
        leftImages.push({ image: this.logoImages.doh, width: 45 })
      }
      if (this.logoImages.bp) {
        leftImages.push({ image: this.logoImages.bp, width: 45 })
      }
      if (leftImages.length === 0) {
        leftImages.push({ text: '' })
      }
      const rightImages = []
      if (this.logoImages.cho) {
        rightImages.push({ image: this.logoImages.cho, width: 45 })
      }
      if (this.logoImages.city) {
        rightImages.push({ image: this.logoImages.city, width: 45 })
      }
      if (rightImages.length === 0) {
        rightImages.push({ text: '' })
      }
      return {
        margin: [40, 20, 40, 10],
        columns: [
          {
            width: 100,
            columns: leftImages,
            alignment: 'center',
            columnGap: 5,
          },
          {
            width: '*',
            stack: [
              {
                text: 'REPUBLIC OF THE PHILIPPINES',
                fontSize: 9,
                color: '#00703c',
                alignment: 'center',
                margin: [0, 5, 0, 2],
              },
              {
                text: 'PROVINCE OF DAVAO DEL NORTE',
                fontSize: 9,
                color: '#00703c',
                alignment: 'center',
                margin: [0, 0, 0, 2],
              },
              {
                text: 'CITY OF TAGUM',
                fontSize: 11,
                color: '#00703c',
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 8],
              },
              {
                text: 'CITY HEALTH OFFICE',
                fontSize: 12,
                color: '#ffffff',
                bold: true,
                alignment: 'center',
                fillColor: '#008000',
                margin: [0, 2, 0, 0],
              },
            ],
          },
          {
            width: 100,
            columns: rightImages,
            alignment: 'center',
            columnGap: 5,
          },
        ],
      }
    },
    buildPDFFooter(currentPage, pageCount) {
      return {
        columns: [
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            fontSize: 7,
            color: '#999999',
          },
        ],
        margin: [40, 10, 40, 20],
      }
    },

    generateFilename(ext) {
      const ts = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const fs = this.fundSource !== 'all' ? `-${this.fundSource.replace('-', '')}` : ''
      if (this.fromDate && this.toDate)
        return `MAIFIPReport-${this.fromDate.replace(/-/g, '')}_to_${this.toDate.replace(/-/g, '')}${fs}.${ext}`
      return `MAIFIPReport-${ts}${fs}.${ext}`
    },

    formatReportDate(d) {
      if (!d) return 'N/A'
      try {
        return new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return 'Invalid Date'
      }
    },
    formatCurrency(amount) {
      const n = Number(amount)
      return isNaN(n)
        ? '₱0.00'
        : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n)
    },
    formatCurrencyForPDF(amount) {
      return this.formatCurrency(amount)
    },
    getDateRangeText() {
      if (this.fromDate && this.toDate)
        return `Date Range: ${this.formatDisplayDate(this.fromDate)} to ${this.formatDisplayDate(this.toDate)}`
      return `All Records (${this.displayedData.length} entries)`
    },
    getFundSourceText() {
      return this.fundSource === 'all'
        ? 'Fund Source: All Sources'
        : `Fund Source: ${this.fundSource}`
    },
    formatDisplayDate(d) {
      if (!d) return 'N/A'
      try {
        return new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } catch {
        return 'Invalid Date'
      }
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
.filter-card,
.data-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.loading-card {
  min-width: 300px;
}
.maifip-table :deep(.q-table__top) {
  padding: 16px;
  background-color: #f5f5f5;
}
.maifip-table :deep(.q-table__bottom) {
  background-color: #f5f5f5;
}
.text-uppercase {
  text-transform: uppercase;
}
</style>
