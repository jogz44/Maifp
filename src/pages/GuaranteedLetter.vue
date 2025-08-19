<template>
  <q-page class="q-pa-md flex flex-center bg-grey-2">
    <div class="page-container">
      <!-- HEADER with Buttons -->
      <div class="header-section">
        <div class="header-actions">
          <q-btn color="primary" label="Submit" icon="save" class="q-mr-sm" @click="handleSubmit" />
          <q-btn color="secondary" label="Print" icon="print" @click="handlePrint" />
        </div>
      </div>

      <!-- REPORT CONTENT -->
      <div class="certification-report-container">
        <div class="report-content">
          <ReportHeader :officeName="officeName" />

          <!-- Title -->
          <div class="certification-title">
            <h1>GUARANTEED LETTER</h1>
          </div>

          <!-- Body -->
          <div class="certification-body">
            <p class="concern-text">TO WHOM IT MAY CONCERN:</p>
            <p class="main-text" :style="mainTextStyle">
              <slot name="main-text">
                This is to certify that
                <span class="bold">MR. JOGRAD M. MAHUSAY</span>
                is a beneficiary of the
                <span class="bold"
                  >Medical Assistance from the Indigenous and Farmers Program (MAIFIP)</span
                >. Pursuant to his request for assistance, the amount of
                <span class="bold">FIFTY THOUSAND PESOS (₱50,000.00)</span>
                has been allocated and guaranteed to cover his necessary medical expenses, subject
                to the rules and guidelines of the program.
              </slot>
            </p>

            <slot name="list">
              <ol class="certification-list">
                <li>
                  That the amount stated herein is guaranteed under the MAIFIP Medical Assistance
                  Program;
                </li>
                <li>
                  That the assistance shall be applied solely for the medical expenses of the
                  beneficiary;
                </li>
                <li>
                  That disbursement of said amount shall follow the existing financial and auditing
                  regulations;
                </li>
                <li>
                  That this certification is issued for the purpose of confirming the beneficiary’s
                  entitlement to the said assistance.
                </li>
              </ol>
            </slot>

            <p class="issuance-text" :style="issuanceTextStyle">
              <slot name="issuance-text">
                Issued this {{ formatDayWithSuffix(issueDate) }} day of
                {{ formatMonth(issueDate) }}, {{ formatYear(issueDate) }} at the City Government
                Center, JV Ayala Avenue, Apokon, Tagum City, Davao del Norte.
              </slot>
            </p>

            <!-- Signature -->
            <div class="signature-container">
              <div class="signature-section">
                <div class="signature-name">REY T. UY</div>
                <div class="signature-line"></div>
                <div class="signature-title">CITY MAYOR</div>
              </div>
            </div>
          </div>
        </div>

        <ReportFooter :phone="footerPhone" :email="footerEmail" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import ReportHeader from 'src/components/ReportHeader.vue'
import ReportFooter from 'src/components/ReportFooter.vue'

defineProps({
  officeName: String,
  footerPhone: String,
  footerEmail: String,
  issueDate: { type: Date, default: () => new Date() },
  mainTextStyle: [String, Object],
  issuanceTextStyle: [String, Object],
})

const formatDayWithSuffix = (date) => {
  const day = date.getDate()
  if (day > 3 && day < 21) return day + 'th'
  switch (day % 10) {
    case 1:
      return day + 'st'
    case 2:
      return day + 'nd'
    case 3:
      return day + 'rd'
    default:
      return day + 'th'
  }
}
const formatMonth = (date) => date.toLocaleString('en-US', { month: 'long' })
const formatYear = (date) => date.getFullYear()

const handleSubmit = () => console.log('Submit clicked')
const handlePrint = () => window.print()
</script>

<style scoped>
.page-container {
  width: 100%;
  max-width: 8.5in;
}

.header-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.certification-report-container {
  width: 8.5in;
  min-height: 11in;
  background-color: white;
  font-family: Arial, sans-serif;
  color: black;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.report-content {
  padding: 0.75in 1in 0 1in;
}

.certification-title {
  text-align: center;
  margin-bottom: 30px;
}
.certification-title h1 {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 4px;
}
.certification-body {
  text-align: justify;
}
.concern-text {
  margin-bottom: 20px;
}
.main-text {
  margin-bottom: 15px;
  line-height: 1.8;
}
.certification-list {
  padding-left: 40px;
  margin-bottom: 30px;
  line-height: 1.8;
}
.certification-list li {
  margin-bottom: 15px;
  text-align: justify;
}
.issuance-text {
  margin-top: 15px;
  margin-bottom: 60px;
  line-height: 1.8;
}
.bold {
  font-weight: bold;
}
.signature-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 60px;
  margin-bottom: 60px;
}
.signature-section {
  width: 3in;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
}
.signature-line {
  width: 100%;
  border-bottom: 1px solid black;
  margin-bottom: 5px;
}
.signature-name {
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
}
.signature-title {
  text-align: center;
}

@media print {
  .header-section {
    display: none;
  }
  @page {
    size: letter;
    margin: 0;
  }
}
</style>
