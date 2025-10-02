<template>
  <q-page>
    <div class="q-pa-md flex justify-center">
      <q-card class="q-pa-sm" style="max-width: 1200px; width: 100%">
        <!-- Header with back button and title -->
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col-auto">
              <q-btn icon="arrow_back" flat round dense @click="goBack" />
            </div>
            <div class="col">
              <div class="text-h6 text-green-9 q-ml-md">Transaction Details</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-inner-loading :showing="loading">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>

        <!-- Transaction Information Section -->
        <q-card-section v-if="!loading">
          <div class="row items-center justify-between">
            <div class="text-subtitle2 q-mb-sm">Transaction Information</div>
          </div>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="transaction.transaction_date"
                type="date"
                label="Date"
                class="text-caption"
                :readonly="!isTransactionEditMode"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-if="isTransactionEditMode"
                outlined
                dense
                v-model="transaction.transaction_mode"
                :options="patientStore.transactionModes"
                label="Mode of Transaction"
                class="text-caption"
              />
              <q-input
                v-else
                outlined
                dense
                v-model="transaction.transaction_mode"
                label="Mode of Transaction"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-if="isTransactionEditMode"
                outlined
                dense
                v-model="transaction.transaction_type"
                :options="patientStore.transaction_type"
                label="Type of Transaction"
                class="text-caption"
              />
              <q-input
                v-else
                outlined
                dense
                v-model="transaction.transaction_type"
                label="Type of Transaction"
                class="text-caption"
                readonly
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model="transaction.purpose"
                label="Purpose"
                type="textarea"
                class="text-caption"
                :readonly="!isTransactionEditMode"
                autogrow
              />
            </div>
          </div>
        </q-card-section>

        <q-separator spaced inset v-if="!loading" />

        <!-- Vital Signs Section -->
        <q-card-section v-if="!loading && vitalSigns">
          <div class="row items-center justify-between">
            <div class="text-subtitle2 q-mb-sm">Vital Signs</div>
          </div>

          <!-- Basic measurements -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.height"
                label="Height (cm)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
                @update:model-value="updateBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.weight"
                label="Weight (kg)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
                @update:model-value="updateBMI"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.bmi"
                label="BMI"
                class="text-caption"
                readonly
              >
                <template v-slot:append v-if="vitalSigns.bmi">
                  <q-badge color="primary" text-color="white">
                    {{ getBmiCategory(vitalSigns.bmi) }}
                  </q-badge>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input
                outlined
                dense
                v-model="vitalSigns.waist"
                label="Waist Circumference (cm)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>

            <!-- Vital signs -->
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.heart_rate"
                label="Heart Rate (bpm)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.blood_pressure"
                label="Blood Pressure (mmHg)"
                class="text-caption"
                :readonly="!isVitalSignsEditMode"
                placeholder="120/80"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.respiratory_rate"
                label="Respiratory Rate"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.pulse_rate"
                label="Pulse Rate"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.temperature"
                label="Temperature (°C)"
                class="text-caption"
                type="number"
                step="0.1"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                outlined
                dense
                v-model="vitalSigns.sp02"
                label="SpO2 (%)"
                class="text-caption"
                type="number"
                :readonly="!isVitalSignsEditMode"
              />
            </div>

            <!-- Additional information -->
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="vitalSigns.LMP"
                label="Last Menstrual Period (LMP)"
                type="date"
                class="text-caption"
                :readonly="!isVitalSignsEditMode"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                outlined
                dense
                v-model="vitalSigns.medicine"
                label="Maintenance Medicine"
                class="text-caption"
                type="textarea"
                :readonly="!isVitalSignsEditMode"
                autogrow
              />
            </div>
          </div>
        </q-card-section>

        <q-separator spaced inset v-if="!loading" />

        <!-- MORE LABORATORY TABS -->
        <div>
          <q-splitter
            v-model="splitterModel"
            style="height: 290px"
            class="text-green border rounded-borders"
          >
            <template v-slot:before>
              <q-tabs v-model="tab" vertical class="text-gray border-right q-pa-xxs">
                <q-tab name="lab_exam" icon="troubleshoot" label="Lab Exam" />
                <q-tab name="radiology" icon="emergency" label="Radiology" />
                <q-tab name="mammogram" icon="biotech" label="Mammogram" />
                <q-tab name="ultrasound" icon="blur_circular" label="Ultrasound" />
              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels
                v-model="tab"
                animated
                swipeable
                vertical
                transition-prev="jump-up"
                transition-next="jump-up"
                class="q-pa-md"
              >
                <!-- Lab Exam Tab -->
                <q-tab-panel name="lab_exam" class="border-left q-pa-md">
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <q-btn
                        color="green"
                        label="Add Laboratory Exam"
                        icon="add"
                        @click="labExamModalOpen = true"
                      />
                    </div>
                  </div>

                  <q-table
                    :rows="labExamRows"
                    :columns="labExamColumns"
                    row-key="item_id"
                    flat
                    bordered
                    dense
                    class="q-mt-md"
                    :table-header-class="'bg-grey-3 text-black'"
                  >
                    <template v-slot:body-cell-actions="props">
                      <q-td align="center">
                        <q-btn
                          dense
                          flat
                          icon="delete"
                          color="negative"
                          @click="confirmDelete(props.row.item_id, 'examination')"
                        />
                      </q-td>
                    </template>
                  </q-table>

                  <!-- Modal Dialog -->
                  <q-dialog v-model="labExamModalOpen" persistent>
                    <q-card style="min-width: 900px; max-width: 95vw">
                      <q-card-section>
                        <div class="text-h6 text-bold">Laboratory Exam</div>
                      </q-card-section>

                      <!-- Select Exam with Search -->
                      <q-card-section>
                        <q-select
                          v-model="selectedLabExam"
                          :options="filteredLabExamOptions"
                          option-label="item_description"
                          option-value="id"
                          emit-value
                          map-options
                          label="Choose a Laboratory Exam"
                          outlined
                          dense
                          use-input
                          :fill-input="false"
                          input-debounce="300"
                          @filter="onFilterLabExam"
                        />
                        <q-btn
                          class="q-mt-md"
                          color="primary"
                          icon="add"
                          label="Select"
                          @click="addSelectedLabExam"
                          :disable="!selectedLabExam"
                        />
                      </q-card-section>

                      <!-- Review Section -->
                      <q-card-section>
                        <div class="text-xxs text-bold q-mb-sm">Review Selected Exams</div>
                        <q-table
                          :rows="reviewLabExams"
                          :columns="labExamColumns"
                          row-key="id"
                          flat
                          bordered
                          dense
                        >
                          <template v-slot:body-cell-actions="props">
                            <q-td align="center">
                              <q-btn
                                dense
                                flat
                                icon="delete"
                                color="negative"
                                @click="removeReviewExam(props.row.id)"
                              />
                            </q-td>
                          </template>
                        </q-table>
                      </q-card-section>

                      <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="negative" v-close-popup />
                        <q-btn flat label="Save" color="positive" @click="saveLaboratoryExams" />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </q-tab-panel>

                <!-- Radiology Tab -->
                <q-tab-panel name="radiology" class="border-left q-pa-md">
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <q-btn
                        color="green"
                        label="Add Radiology Exam"
                        icon="add"
                        @click="radiologyModalOpen = true"
                      />
                    </div>
                  </div>

                  <q-table
                    :rows="radiologyRows"
                    :columns="radiologyColumns"
                    row-key="id"
                    flat
                    bordered
                    dense
                    class="q-mt-md"
                    :table-header-class="'bg-grey-3 text-black'"
                  >
                    <template v-slot:body-cell-actions="props">
                      <q-td align="center">
                        <q-btn
                          dense
                          flat
                          icon="delete"
                          color="negative"
                          @click="confirmDelete(props.row.id, 'radiology')"
                        />
                      </q-td>
                    </template>
                  </q-table>

                  <!-- Radiology Modal -->
                  <q-dialog v-model="radiologyModalOpen" persistent>
                    <q-card style="min-width: 900px; max-width: 95vw">
                      <q-card-section>
                        <div class="text-h6 text-bold">Radiology Exam</div>
                      </q-card-section>

                      <!-- Select Radiology -->
                      <q-card-section>
                        <q-select
                          v-model="selectedRadiology"
                          :options="filteredRadiologyOptions"
                          option-label="item_description"
                          option-value="id"
                          emit-value
                          map-options
                          label="Choose a Radiology Exam"
                          outlined
                          dense
                          use-input
                          :fill-input="false"
                          input-debounce="300"
                          @filter="onFilterRadiology"
                        />

                        <q-btn
                          class="q-mt-md"
                          color="primary"
                          icon="add"
                          label="Select"
                          @click="addSelectedRadiology"
                          :disable="!selectedRadiology"
                        />
                      </q-card-section>

                      <!-- Review Section -->
                      <q-card-section>
                        <div class="text-xxs text-bold q-mb-sm">Review Selected Radiologies</div>
                        <q-table
                          :rows="reviewRadiologies"
                          :columns="radiologyColumns"
                          row-key="id"
                          flat
                          bordered
                          dense
                        >
                          <template v-slot:body-cell-actions="props">
                            <q-td align="center">
                              <q-btn
                                dense
                                flat
                                icon="delete"
                                color="negative"
                                @click="removeReviewRadiology(props.row.id)"
                              />
                            </q-td>
                          </template>
                        </q-table>
                      </q-card-section>

                      <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="negative" v-close-popup />
                        <q-btn flat label="Save" color="positive" @click="saveRadiologies" />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </q-tab-panel>

                <!-- Mammogram Tab -->
                <q-tab-panel name="mammogram" class="border-left q-pa-md">
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <q-btn
                        color="green"
                        label="Add Mammogram Exam"
                        icon="add"
                        @click="mammogramModalOpen = true"
                      />
                    </div>
                  </div>

                  <q-table
                    :rows="mammogramRows"
                    :columns="mammogramColumns"
                    row-key="id"
                    flat
                    bordered
                    dense
                    class="q-mt-md"
                    :table-header-class="'bg-grey-3 text-black'"
                  >
                    <template v-slot:body-cell-actions="props">
                      <q-td align="center">
                        <q-btn
                          dense
                          flat
                          icon="delete"
                          color="negative"
                          @click="confirmDelete(props.row.id, 'mammogram')"
                        />
                      </q-td>
                    </template>
                  </q-table>

                  <!-- Mammogram Modal -->
                  <q-dialog v-model="mammogramModalOpen" persistent>
                    <q-card style="min-width: 900px; max-width: 95vw">
                      <q-card-section>
                        <div class="text-h6 text-bold">Mammogram Exam</div>
                      </q-card-section>

                      <!-- Select Mammogram -->
                      <q-card-section>
                        <q-select
                          v-model="selectedMammogram"
                          :options="filteredMammogramOptions"
                          option-label="procedure"
                          option-value="id"
                          emit-value
                          map-options
                          label="Choose a Mammogram Exam"
                          outlined
                          dense
                          use-input
                          :fill-input="false"
                          input-debounce="300"
                          @filter="onFilterMammogram"
                        />

                        <q-btn
                          class="q-mt-md"
                          color="primary"
                          icon="add"
                          label="Select"
                          @click="addSelectedMammogram"
                          :disable="!selectedMammogram"
                        />
                      </q-card-section>

                      <!-- Review Section -->
                      <q-card-section>
                        <div class="text-xxs text-bold q-mb-sm">Review Selected Mammograms</div>
                        <q-table
                          :rows="reviewMammograms"
                          :columns="mammogramColumns"
                          row-key="id"
                          flat
                          bordered
                          dense
                        >
                          <template v-slot:body-cell-actions="props">
                            <q-td align="center">
                              <q-btn
                                dense
                                flat
                                icon="delete"
                                color="negative"
                                @click="removeReviewMammogram(props.row.id)"
                              />
                            </q-td>
                          </template>
                        </q-table>
                      </q-card-section>

                      <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="negative" v-close-popup />
                        <q-btn flat label="Save" color="positive" @click="saveMammograms" />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </q-tab-panel>

                <!-- Ultrasound Tab -->
                <q-tab-panel name="ultrasound" class="border-left q-pa-md">
                  <div class="row items-center q-mb-md">
                    <div class="col">
                      <q-btn
                        color="green"
                        label="Add Ultrasound Exam"
                        icon="add"
                        @click="ultrasoundModalOpen = true"
                      />
                    </div>
                  </div>

                  <q-table
                    :rows="ultrasoundRows"
                    :columns="ultrasoundColumns"
                    row-key="id"
                    flat
                    bordered
                    dense
                    class="q-mt-md"
                    :table-header-class="'bg-grey-3 text-black'"
                  >
                    <template v-slot:body-cell-actions="props">
                      <q-td align="center">
                        <q-btn
                          dense
                          flat
                          icon="delete"
                          color="negative"
                          @click="confirmDelete(props.row.id, 'ultrasound')"
                        />
                      </q-td>
                    </template>
                  </q-table>

                  <!-- Ultrasound Modal -->
                  <q-dialog v-model="ultrasoundModalOpen" persistent>
                    <q-card style="min-width: 900px; max-width: 95vw">
                      <q-card-section>
                        <div class="text-h6 text-bold">Ultrasound Exam</div>
                      </q-card-section>

                      <!-- Select Ultrasound -->
                      <q-card-section>
                        <q-select
                          v-model="selectedUltrasound"
                          :options="filteredUltrasoundOptions"
                          option-label="body_parts"
                          option-value="id"
                          emit-value
                          map-options
                          label="Choose an Ultrasound Exam"
                          outlined
                          dense
                          use-input
                          :fill-input="false"
                          input-debounce="300"
                          @filter="onFilterUltrasound"
                        />

                        <q-btn
                          class="q-mt-md"
                          color="primary"
                          icon="add"
                          label="Select"
                          @click="addSelectedUltrasound"
                          :disable="!selectedUltrasound"
                        />
                      </q-card-section>

                      <!-- Review Section -->
                      <q-card-section>
                        <div class="text-xxs text-bold q-mb-sm">
                          Review Selected Ultrasound Exams
                        </div>
                        <q-table
                          :rows="reviewUltrasounds"
                          :columns="ultrasoundColumns"
                          row-key="id"
                          flat
                          bordered
                          dense
                        >
                          <template v-slot:body-cell-actions="props">
                            <q-td align="center">
                              <q-btn
                                dense
                                flat
                                icon="delete"
                                color="negative"
                                @click="removeReviewUltrasound(props.row.id)"
                              />
                            </q-td>
                          </template>
                        </q-table>
                      </q-card-section>

                      <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="negative" v-close-popup />
                        <q-btn flat label="Save" color="positive" @click="saveUltrasounds" />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </div>
        <q-separator spaced inset v-if="!loading" />

        <!-- ACTION BUTTONS -->
        <div class="q-mt-md flex justify-end q-gutter-sm" v-if="isLatest">
          <q-btn
            v-if="transaction.transaction_type === 'Consultation'"
            color="blue"
            label="Return"
            icon="ios_share"
            @click="markReturn"
          />
          <q-btn
            v-if="transaction.transaction_type === 'Laboratory'"
            color="green"
            label="Done"
            icon="check_circle"
            @click="markDone"
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { usePatientStore } from 'src/stores/patientStore'

export default {
  name: 'TransactionDetails',

  data() {
    return {
      patientId: null,
      transactionId: null,
      transaction: {},
      patient: {},
      vitalSigns: {},
      loading: true,

      isLatest: false,

      // UI states
      isTransactionEditMode: false,
      isVitalSignsEditMode: false,
      isResultsEditMode: false,
      labModalOpen: false, // ADD THIS

      // Tabs
      tab: 'lab_exam', //  default active tab

      // Modal for lab exam selection
      labExamModalOpen: false,
      selectedLabExam: null,

      // Backup data
      originalTransactionData: null,
      originalVitalSigns: null,
      originalResults: null,

      //New Services
      serviceModalOpen: false,
      showServiceHint: false,
      newServiceName: '',
      newServiceFee: null,
      newServiceAdditionalFee: null,

      //Update Services
      editDialogOpen: false,
      editServiceId: null,
      editServiceName: '',
      editServiceFee: '',
      editServiceAdditionalFee: '',

      //SEARCH DATA
      searchLabExam: '',
      searchRadiology: '',
      searchMammogram: '',
      searchUltrasound: '',

      //EXAMINATION DATA
      labExamOptions: [],
      reviewLabExams: [], // for staging before finalizing
      labExamRows: [],
      labExamColumns: [
        { name: 'item_id', label: 'Item ID', field: 'item_id', align: 'left' },
        {
          name: 'item_description',
          label: 'Item Description',
          field: 'item_description',
          align: 'left',
        },
        { name: 'selling_price', label: 'Fee', field: 'selling_price', align: 'right' },
        { name: 'service_fee', label: 'ESPF', field: 'service_fee', align: 'right' },
        { name: 'total_amount', label: 'Total Amount', field: 'total_amount', align: 'right' },
        { name: 'date', label: 'Date', field: 'date', align: 'center' },
        { name: 'time', label: 'Time', field: 'time', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],
      //RADIOLOGY DATA
      radiologyModalOpen: false,
      selectedRadiology: null,
      radiologyOptions: [],
      reviewRadiologies: [],
      radiologyRows: [],
      radiologyColumns: [
        { name: 'id', label: 'Item ID', field: 'id', align: 'left' },
        {
          name: 'item_description',
          label: 'Item Description',
          field: 'item_description',
          align: 'left',
        },
        { name: 'selling_price', label: 'Selling Price', field: 'selling_price', align: 'right' },
        { name: 'service_fee', label: 'ESPF', field: 'service_fee', align: 'right' },
        { name: 'total_amount', label: 'Total Amount', field: 'total_amount', align: 'right' },
        { name: 'date', label: 'Date', field: 'date', align: 'center' },
        { name: 'time', label: 'Time', field: 'time', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],
      //MAMMOGRAM DATA
      mammogramModalOpen: false,
      selectedMammogram: null,
      mammogramOptions: [],
      reviewMammograms: [],
      mammogramRows: [],
      mammogramColumns: [
        { name: 'id', label: 'Item ID', field: 'id', align: 'left' },
        { name: 'procedure', label: 'Procedure', field: 'procedure', align: 'left' },
        { name: 'rate', label: 'Rate (Php)', field: 'rate', align: 'right' },
        { name: 'service_fee', label: 'ESPF', field: 'service_fee', align: 'right' },
        { name: 'total_amount', label: 'Total Amount', field: 'total_amount', align: 'right' },
        { name: 'date', label: 'Date', field: 'date', align: 'center' },
        { name: 'time', label: 'Time', field: 'time', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }, // for delete button
      ],
      // ULTRASOUND DATA
      ultrasoundModalOpen: false,
      selectedUltrasound: null,
      ultrasoundOptions: [],
      reviewUltrasounds: [],
      ultrasoundRows: [],
      ultrasoundColumns: [
        { name: 'id', label: 'Item ID', field: 'id', align: 'left' },
        { name: 'body_parts', label: 'Body Parts', field: 'body_parts', align: 'left' },
        { name: 'rate', label: 'Rate (Php)', field: 'rate', align: 'right' },
        { name: 'service_fee', label: 'ESPF', field: 'service_fee', align: 'right' },
        { name: 'total_amount', label: 'Total Amount', field: 'total_amount', align: 'right' },
        { name: 'date', label: 'Date', field: 'date', align: 'center' },
        { name: 'time', label: 'Time', field: 'time', align: 'center' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },
    newServiceTotal() {
      const amount = parseFloat(this.newServiceFee) || 0
      const serviceFee = parseFloat(this.newServiceAdditionalFee) || 0
      return amount + serviceFee
    },

    editServiceTotal() {
      const amount = parseFloat(this.editServiceFee) || 0
      const serviceFee = parseFloat(this.editServiceAdditionalFee) || 0
      return amount + serviceFee
    },

    // Lab Exam filtered options
    filteredLabExamOptions() {
      if (!this.searchLabExam) {
        return this.labExamOptions
      }
      const term = this.searchLabExam.toLowerCase()
      return this.labExamOptions.filter((opt) => opt.item_description.toLowerCase().includes(term))
    },

    // Radiology filtered options
    filteredRadiologyOptions() {
      if (!this.searchRadiology) {
        return this.radiologyOptions
      }
      const term = this.searchRadiology.toLowerCase()
      return this.radiologyOptions.filter((opt) =>
        opt.item_description.toLowerCase().includes(term),
      )
    },

    // Mammogram filtered options
    filteredMammogramOptions() {
      if (!this.searchMammogram) {
        return this.mammogramOptions
      }
      const term = this.searchMammogram.toLowerCase()
      return this.mammogramOptions.filter((opt) => opt.procedure.toLowerCase().includes(term))
    },

    // Ultrasound filtered options
    filteredUltrasoundOptions() {
      if (!this.searchUltrasound) {
        return this.ultrasoundOptions
      }
      const term = this.searchUltrasound.toLowerCase()
      return this.ultrasoundOptions.filter((opt) => opt.body_parts.toLowerCase().includes(term))
    },
  },

  mounted() {
    this.patientId = this.$route.query.patientId
    this.transactionId = this.$route.query.transactionId

    console.log(
      `Mounted TransactionDetails. Patient ID: ${this.patientId}, Transaction ID: ${this.transactionId}`,
    )

    // Generic labs
    this.loadLaboratoryOptions()
    this.loadLaboratoryExamsOptions()
    this.fetchRadiologies()
    this.loadRadiologyOptions()
    this.fetchLaboratoryExams() // correct fetch for saved labs

    // Mammogram options
    this.loadMammogramOptions()

    // Ultrasound options
    this.loadUltrasoundOptions()

    if (this.transactionId) {
      this.loadTransactionData()
      this.loadLaboratoryResults(this.transactionId) // fetch saved labs

      // Fetch mammogram + ultrasound data by transaction
      this.fetchMammograms()
      this.fetchUltrasounds()
    } else {
      this.$q.notify({
        type: 'negative',
        message: 'No transaction selected',
        position: 'top',
        timeout: 2000,
      })
      this.loading = false
    }
  },

  methods: {
    //SERVICE LIBRARY
    async addService() {
      const payload = {
        lab_name: this.newServiceName,
        lab_amount: parseFloat(this.newServiceFee) || 0,
        service_fee: parseFloat(this.newServiceAdditionalFee) || 0,
        total_amount: this.newServiceTotal, // computed total
      }

      try {
        await this.patientStore.addLaboratoryService(payload)
        this.$q.notify({ type: 'positive', message: 'Service added!' })
        this.loadLaboratoryOptions()
        this.newServiceName = ''
        this.newServiceFee = null
        this.newServiceAdditionalFee = null
        this.newServiceDialogOpen = false
      } catch (error) {
        console.error('Add Service Error:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to add service' })
      }
    },

    editService(service) {
      this.editServiceId = service.value
      this.editServiceName = service.label
      this.editServiceFee = service.amount
      this.editServiceAdditionalFee = service.service_fee || 0
      this.editDialogOpen = true
    },

    async updateService() {
      try {
        const amount = parseFloat(this.editServiceFee) || 0
        const service_fee = parseFloat(this.editServiceAdditionalFee) || 0

        const payload = {
          id: this.editServiceId,
          lab_name: this.editServiceName,
          lab_amount: amount,
          service_fee: service_fee,
          total_amount: amount + service_fee,
        }

        await this.patientStore.updateLaboratoryService(payload)
        this.$q.notify({ type: 'positive', message: 'Service updated!' })
        this.loadLaboratoryOptions()
        this.editDialogOpen = false
      } catch (error) {
        console.error('Update Service Error:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to update service' })
      }
    },

    // Fetch lab exams from Pinia store
    async loadLaboratoryExamsOptions() {
      try {
        await this.patientStore.fetchLaboratoryExams()
        this.labExamOptions = this.patientStore.laboratoryExams
        console.log('Laboratory Options (global):', this.labExamOptions)
      } catch (err) {
        console.error(err)
      }
    },

    addSelectedLabExam() {
      if (!this.selectedLabExam) return

      const exam = this.labExamOptions.find((e) => e.id === this.selectedLabExam)
      if (!exam) return

      const now = new Date()
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })

      // prevent duplicate add
      if (!this.reviewLabExams.some((e) => e.id === exam.id)) {
        this.reviewLabExams.push({
          id: exam.id,
          item_id: exam.id,
          item_description: exam.item_description,
          selling_price: exam.selling_price || 0,
          service_fee: exam.service_fee || 0,
          total_amount: exam.total_amount || (exam.selling_price || 0) + (exam.service_fee || 0),
          date: formattedDate,
          time: formattedTime,
        })
      }

      // Clear both search and selection
      this.selectedLabExam = null
      this.searchLabExam = ''
    },

    removeReviewExam(id) {
      this.reviewLabExams = this.reviewLabExams.filter((e) => e.id !== id)
    },

    async saveLaboratoryExams() {
      try {
        const payload = {
          transaction_id: this.transactionId,
          examination: this.reviewLabExams.map((exam) => ({
            item_id: exam.item_id,
            item_description: exam.item_description,
            selling_price: parseFloat(exam.selling_price),
            service_fee: parseFloat(exam.service_fee),
            total_amount: parseFloat(exam.total_amount),
            date: this.formatDate(new Date()),
            time: this.formatTime(new Date()),
          })),
        }

        const response = await this.patientStore.storeLaboratoryExam(payload)

        this.$q.notify({ type: 'positive', message: 'All lab exams saved successfully!' })

        const savedExams = (response?.data?.examination || response?.examination || []).map(
          (exam) => ({
            ...exam,
            date: exam.date || this.formatDate(new Date()),
            time: exam.time || this.formatTime(new Date()),
          }),
        )

        // Update table rows
        this.labExamRows = [...this.labExamRows, ...savedExams]

        // Persist per-transaction
        localStorage.setItem(`labExamRows_${this.transactionId}`, JSON.stringify(this.labExamRows))

        this.labExamModalOpen = false
        this.reviewLabExams = []
      } catch (error) {
        console.error('Save Error:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to save lab exams' })
      }
    },

    async fetchLaboratoryExams() {
      try {
        const saved = localStorage.getItem(`labExamRows_${this.transactionId}`)
        if (saved) {
          this.labExamRows = JSON.parse(saved)
          return
        }

        const response = await this.patientStore.fetchLaboratoryExamsByTransaction(
          this.transactionId,
        )
        this.labExamRows = (response?.examination ?? []).map((exam) => ({
          ...exam,
          date: exam.date || this.formatDate(new Date()),
          time: exam.time || this.formatTime(new Date()),
        }))

        console.log('Loaded Lab Exams from API:', this.labExamRows)

        // Save per-transaction
        localStorage.setItem(`labExamRows_${this.transactionId}`, JSON.stringify(this.labExamRows))
      } catch (error) {
        console.error('API Fetch Error, falling back to localStorage:', error)
      }
    },

    // Load available radiology options (from API via Pinia)
    async loadRadiologyOptions() {
      try {
        await this.patientStore.fetchRadiologyExams() // global list
        this.radiologyOptions = this.patientStore.radiologyExams
        console.log('Radiology Options (global):', this.radiologyOptions)
      } catch (err) {
        console.error(err)
      }
    },

    addSelectedRadiology() {
      if (!this.selectedRadiology) return

      const exam = this.radiologyOptions.find((e) => e.id === this.selectedRadiology)
      if (!exam) return

      const now = new Date()
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })

      // prevent duplicate add
      if (!this.reviewRadiologies.some((e) => e.id === exam.id)) {
        this.reviewRadiologies.push({
          id: exam.id,
          item_id: exam.id,
          item_description: exam.item_description,
          selling_price: parseFloat(exam.selling_price) || 0,
          service_fee: parseFloat(exam.service_fee) || 0,
          total_amount: (parseFloat(exam.selling_price) || 0) + (parseFloat(exam.service_fee) || 0),
          date: formattedDate,
          time: formattedTime,
        })
      }

      this.selectedRadiology = null
      this.searchRadiology = ''
    },

    removeReviewRadiology(id) {
      this.reviewRadiologies = this.reviewRadiologies.filter((e) => e.id !== id)
    },

    async saveRadiologies() {
      try {
        const payload = {
          transaction_id: this.transactionId,
          radiologies: this.reviewRadiologies.map((exam) => ({
            id: exam.item_id,
            item_description: exam.item_description,
            selling_price: parseFloat(exam.selling_price).toFixed(2),
            service_fee: parseFloat(exam.service_fee).toFixed(2),
            total_amount: parseFloat(exam.total_amount).toFixed(2),
            created_at: null,
            updated_at: null,
          })),
        }

        const response = await this.patientStore.storeRadiologyExam(payload)

        this.$q.notify({ type: 'positive', message: 'Radiology exams saved successfully!' })

        const savedExams = (response?.data?.radiologies || response?.radiologies || []).map(
          (exam) => ({
            ...exam,
            date: exam.date || this.formatDate(new Date()),
            time: exam.time || this.formatTime(new Date()),
          }),
        )

        this.radiologyRows = [...this.radiologyRows, ...savedExams]

        // Persist per-transaction
        localStorage.setItem(
          `radiologyRows_${this.transactionId}`,
          JSON.stringify(this.radiologyRows),
        )

        this.radiologyModalOpen = false
        this.reviewRadiologies = []
      } catch (error) {
        console.error('Save Error:', error.response?.data || error)
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to save radiology exams',
        })
      }
    },

    async fetchRadiologies() {
      try {
        const saved = localStorage.getItem(`radiologyRows_${this.transactionId}`)
        if (saved) {
          this.radiologyRows = JSON.parse(saved)
          return
        }

        const response = await this.patientStore.fetchRadiologiesByTransaction(this.transactionId)
        this.radiologyRows = (response?.radiologies ?? []).map((exam) => ({
          ...exam,
          date: exam.date || this.formatDate(new Date()),
          time: exam.time || this.formatTime(new Date()),
        }))

        // Save to localStorage for persistence
        localStorage.setItem(
          `radiologyRows_${this.transactionId}`,
          JSON.stringify(this.radiologyRows),
        )
      } catch (error) {
        console.error('Fetch Radiology Error:', error)
      }
    },

    // Load available mammogram options (from API via Pinia)
    async loadMammogramOptions() {
      try {
        await this.patientStore.fetchMammogramExams() // new Pinia action
        this.mammogramOptions = this.patientStore.mammogramExams
        console.log('Mammogram Options Loaded:', this.mammogramOptions)
      } catch (err) {
        console.error(err)
      }
    },

    addSelectedMammogram() {
      if (!this.selectedMammogram) return

      const exam = this.mammogramOptions.find((e) => e.id === this.selectedMammogram)
      if (!exam) return

      const now = new Date()
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })

      // prevent duplicate add
      if (!this.reviewMammograms.some((e) => e.id === exam.id)) {
        this.reviewMammograms.push({
          id: exam.id,
          procedure: exam.procedure,
          rate: parseFloat(exam.rate) || 0,
          service_fee: parseFloat(exam.service_fee) || 0,
          total_amount: parseFloat(exam.total_amount) || 0,
          date: formattedDate,
          time: formattedTime,
        })
      }

      this.selectedMammogram = null
      this.searchMammogram = ''
    },

    removeReviewMammogram(id) {
      this.reviewMammograms = this.reviewMammograms.filter((e) => e.id !== id)
    },

    async saveMammograms() {
      try {
        const payload = {
          transaction_id: this.transactionId,
          mammogram: this.reviewMammograms.map((exam) => ({
            id: exam.id,
            procedure: exam.procedure,
            rate: parseFloat(exam.rate),
            service_fee: parseFloat(exam.service_fee),
            total_amount: parseFloat(exam.total_amount),
            date: exam.date,
            time: exam.time,
          })),
        }

        const response = await this.patientStore.storeMammogramExam(payload)

        this.$q.notify({ type: 'positive', message: 'Mammogram exams saved successfully!' })

        const savedExams = (response?.data?.mammogram || response?.mammogram || []).map((exam) => ({
          ...exam,
          date: exam.date || this.formatDate(new Date()),
          time: exam.time || this.formatTime(new Date()),
        }))

        this.mammogramRows = [...this.mammogramRows, ...savedExams]

        localStorage.setItem(
          `mammogramRows_${this.transactionId}`,
          JSON.stringify(this.mammogramRows),
        )

        this.mammogramModalOpen = false
        this.reviewMammograms = []
      } catch (error) {
        console.error('Save Error:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to save mammogram exams' })
      }
    },

    async fetchMammograms() {
      try {
        const saved = localStorage.getItem(`mammogramRows_${this.transactionId}`)
        if (saved) {
          this.mammogramRows = JSON.parse(saved)
          return
        }

        const response = await this.patientStore.fetchMammogramsByTransaction(this.transactionId)
        this.mammogramRows = (response ?? []).map((exam) => ({
          ...exam,
          date: exam.date || this.formatDate(new Date()),
          time: exam.time || this.formatTime(new Date()),
        }))

        localStorage.setItem(
          `mammogramRows_${this.transactionId}`,
          JSON.stringify(this.mammogramRows),
        )
      } catch (error) {
        console.error('Fetch Mammogram Error:', error)
      }
    },

    //ULTRASOUND
    async loadUltrasoundOptions() {
      try {
        await this.patientStore.fetchUltrasoundExams() // new Pinia action
        this.ultrasoundOptions = this.patientStore.ultrasoundExams
        console.log('Ultrasound Options Loaded:', this.ultrasoundOptions)
      } catch (err) {
        console.error(err)
      }
    },

    addSelectedUltrasound() {
      if (!this.selectedUltrasound) return

      const exam = this.ultrasoundOptions.find((e) => e.id === this.selectedUltrasound)
      if (!exam) return

      const now = new Date()
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })

      // prevent duplicate add
      if (!this.reviewUltrasounds.some((e) => e.id === exam.id)) {
        this.reviewUltrasounds.push({
          id: exam.id,
          body_parts: exam.body_parts,
          rate: parseFloat(exam.rate) || 0,
          service_fee: parseFloat(exam.service_fee) || 0,
          total_amount: parseFloat(exam.total_amount) || 0,
          date: formattedDate,
          time: formattedTime,
        })
      }

      this.selectedUltrasound = null
      this.searchUltrasound = ''
    },

    removeReviewUltrasound(id) {
      this.reviewUltrasounds = this.reviewUltrasounds.filter((e) => e.id !== id)
    },

    async saveUltrasounds() {
      try {
        const payload = {
          transaction_id: this.transactionId,
          ultrasound: this.reviewUltrasounds.map((exam) => ({
            id: exam.id,
            body_parts: exam.body_parts,
            rate: parseFloat(exam.rate),
            service_fee: parseFloat(exam.service_fee),
            total_amount: parseFloat(exam.total_amount),
            date: exam.date,
            time: exam.time,
          })),
        }

        const response = await this.patientStore.storeUltrasoundExam(payload)

        this.$q.notify({ type: 'positive', message: 'Ultrasound exams saved successfully!' })

        const savedExams = (response?.data?.ultrasound || response?.ultrasound || []).map(
          (exam) => ({
            ...exam,
            date: exam.date || this.formatDate(new Date()),
            time: exam.time || this.formatTime(new Date()),
          }),
        )

        this.ultrasoundRows = [...this.ultrasoundRows, ...savedExams]

        localStorage.setItem(
          `ultrasoundRows_${this.transactionId}`,
          JSON.stringify(this.ultrasoundRows),
        )

        this.ultrasoundModalOpen = false
        this.reviewUltrasounds = []
      } catch (error) {
        console.error('Save Ultrasound Error:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to save ultrasound exams' })
      }
    },

    async fetchUltrasounds() {
      try {
        const saved = localStorage.getItem(`ultrasoundRows_${this.transactionId}`)
        if (saved) {
          this.ultrasoundRows = JSON.parse(saved)
          return
        }

        const response = await this.patientStore.fetchUltrasoundsByTransaction(this.transactionId)

        this.ultrasoundRows = (response ?? []).map((exam) => ({
          ...exam,
          date: exam.date || this.formatDate(new Date()),
          time: exam.time || this.formatTime(new Date()),
        }))

        localStorage.setItem(
          `ultrasoundRows_${this.transactionId}`,
          JSON.stringify(this.ultrasoundRows),
        )
      } catch (error) {
        console.error('Fetch Ultrasound Error:', error)
      }
    },

    confirmDelete(id, type) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this record?',
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            const res = await this.patientStore.deleteLaboratoryExam(this.transactionId, id, type)

            if (res.deleted === 1) {
              this.$q.notify({
                type: 'positive',
                message: `${type} record deleted successfully`,
                position: 'top',
                timeout: 2000,
              })

              // 🔥 Update local state and storage
              if (type === 'examination') {
                this.labExamRows = this.labExamRows.filter((e) => e.item_id !== id)
                localStorage.setItem(
                  `labExamRows_${this.transactionId}`,
                  JSON.stringify(this.labExamRows),
                )
              } else if (type === 'radiology') {
                this.radiologyRows = this.radiologyRows.filter((e) => e.id !== id)
                localStorage.setItem(
                  `radiologyRows_${this.transactionId}`,
                  JSON.stringify(this.radiologyRows),
                )
              } else if (type === 'mammogram') {
                this.mammogramRows = this.mammogramRows.filter((e) => e.id !== id)
                localStorage.setItem(
                  `mammogramRows_${this.transactionId}`,
                  JSON.stringify(this.mammogramRows),
                )
              } else if (type === 'ultrasound') {
                this.ultrasoundRows = this.ultrasoundRows.filter((e) => e.id !== id)
                localStorage.setItem(
                  `ultrasoundRows_${this.transactionId}`,
                  JSON.stringify(this.ultrasoundRows),
                )
              }
            } else {
              this.$q.notify({
                type: 'negative',
                message: res.message || `No ${type} record found to delete`,
                position: 'top',
                timeout: 2000,
              })
            }
          } catch (err) {
            console.error(err)
            this.$q.notify({
              type: 'negative',
              message: `Failed to delete ${type}`,
              position: 'top',
              timeout: 2000,
            })
          }
        })
    },

    formatDate(date = new Date()) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(date)
    },

    formatTime(date = new Date()) {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(date)
    },

    async markReturn() {
      const patientStore = usePatientStore()

      const now = new Date()
      const consultationDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const consultationTime = now.toTimeString().split(' ')[0] // HH:MM:SS

      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        status: 'Returned',
      }

      try {
        await patientStore.laboratoryStatus(payload)

        this.$q.notify({
          type: 'positive',
          message: 'Laboratory returned successfully',
        })

        this.$router.push({ path: '/customers/laboratory' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update status: ${error.message}`,
        })
      }
    },

    async markDone() {
      const patientStore = usePatientStore()

      const now = new Date()
      const consultationDate = now.toISOString().split('T')[0]
      const consultationTime = now.toTimeString().split(' ')[0]

      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        status: 'Done',
      }

      try {
        await patientStore.laboratoryStatus(payload)

        this.$q.notify({
          type: 'positive',
          message: 'Laboratory marked as done successfully',
        })

        this.$router.push({ path: '/customers/laboratory' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to update status: ${error.message}`,
        })
      }
    },

    async loadLaboratoryResults(transactionId) {
      try {
        const res = await this.patientStore.fetchLaboratoryResults(transactionId)

        this.results = (res || []).map((r) => {
          const createdAt = new Date(r.created_at)
          return {
            ...r,
            date: createdAt.toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            time: createdAt.toLocaleTimeString('en-PH', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          }
        })

        console.log('Loaded lab results:', this.results)
      } catch (error) {
        console.error('Error loading Laboratory Services:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load Laboratory Services',
        })
      }
    },

    async loadLaboratoryOptions() {
      await this.patientStore.fetchLaboratoryServices()

      // Mapping API response into dropdown options
      this.laboratoryOptions = this.patientStore.laboratoryServices.map((s) => ({
        label: s.lab_name,
        value: s.id,
        amount: s.lab_amount,
        service_fee: s.service_fee,
        total_amount: s.total_amount,
      }))
    },

    // Filter handlers for q-select
    onFilterLabExam(val, update) {
      this.searchLabExam = val
      update(() => {})
    },
    onFilterRadiology(val, update) {
      this.searchRadiology = val
      update(() => {})
    },
    onFilterMammogram(val, update) {
      this.searchMammogram = val
      update(() => {})
    },
    onFilterUltrasound(val, update) {
      this.searchUltrasound = val
      update(() => {})
    },

    //NOT IN USE AS OF THE MOMENT SO IS BELOW ...
    onLabChange(result) {
      const service = this.laboratoryOptions.find((s) => s.value === result.laboratory_type)
      if (service) {
        result.amount = service.amount || 0
        result.service_fee = service.service_fee || 0
        result.total_amount = result.amount + result.service_fee
      }
    },

    async loadTransactionData() {
      this.loading = true
      console.log(`Loading transaction data for ID: ${this.transactionId}`)

      try {
        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          this.transaction = transactionData
          this.vitalSigns = transactionData.vital || {}

          // fetch patient and all transactions
          const patientData = await this.patientStore.getPatient(this.patientId)
          if (patientData) {
            this.patient = patientData

            if (patientData.transaction && Array.isArray(patientData.transaction)) {
              const sorted = [...patientData.transaction].sort(
                (a, b) =>
                  new Date(b.transaction_date || b.created_at) -
                  new Date(a.transaction_date || a.created_at),
              )

              const latest = sorted[0]
              this.isLatest = Number(latest.id) === Number(this.transactionId)

              console.log('Latest check:', {
                latestId: latest.id,
                currentId: this.transactionId,
                isLatest: this.isLatest,
              })
            }
          }
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load transaction data',
          })
        }
      } catch (error) {
        console.error('Error loading transaction data:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error loading transaction data: ${error.message}`,
        })
      } finally {
        this.loading = false
      }
    },

    // Transaction Edit Methods
    toggleTransactionEditMode() {
      this.isTransactionEditMode = true
      // Store original data for potential cancellation
      this.originalTransactionData = { ...this.transaction }
    },

    async saveTransactionChanges() {
      try {
        // Validate required fields
        if (!this.transaction.transaction_date || !this.transaction.transaction_type) {
          this.$q.notify({
            type: 'negative',
            message: 'Transaction date and type are required',
            position: 'top',
            timeout: 2000,
          })
          return
        }

        // Prepare the transaction data (exclude vital signs)
        const transactionDataToUpdate = {
          id: this.transaction.id,
          transaction_date: this.transaction.transaction_date,
          transaction_type: this.transaction.transaction_type,
          transaction_mode: this.transaction.transaction_mode,
          purpose: this.transaction.purpose,
          patient_id: this.transaction.patient_id,
          // Include any other transaction-specific fields but exclude vital
        }

        console.log('Updating transaction with data:', transactionDataToUpdate)

        // Update the transaction using the store action
        const updatedTransaction = await this.patientStore.updateTransaction(
          this.transaction.id,
          transactionDataToUpdate,
        )

        if (updatedTransaction) {
          this.$q.notify({
            type: 'positive',
            message: 'Transaction updated successfully',
            position: 'top',
            timeout: 2000,
          })

          // Update local transaction data with the response
          this.transaction = { ...this.transaction, ...updatedTransaction }

          // Exit edit mode
          this.isTransactionEditMode = false
          this.originalTransactionData = null
        }
      } catch (error) {
        console.error('Error updating transaction:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update transaction',
          position: 'top',
          timeout: 3000,
        })
      }
    },

    cancelTransactionEdit() {
      // Restore original transaction data
      if (this.originalTransactionData) {
        this.transaction = { ...this.originalTransactionData }
      }

      this.isTransactionEditMode = false
      this.originalTransactionData = null
    },

    // Vital Signs Edit Methods
    toggleVitalSignsEditMode() {
      this.isVitalSignsEditMode = true
      // Store original data for potential cancellation
      this.originalVitalSigns = { ...this.vitalSigns }
    },

    async saveVitalSignsChanges() {
      try {
        // Validate vital signs if needed
        // You can add validation here for specific vital sign requirements

        // Prepare the vital signs data
        const vitalDataToUpdate = {
          ...this.vitalSigns,
          transaction_id: this.transactionId, // Ensure transaction_id is included
        }

        console.log('Updating vital signs with data:', vitalDataToUpdate)
        console.log('Current vital signs before update:', this.vitalSigns)

        // Check if vital signs already exist (has an ID) or need to be created
        let updatedVital
        if (this.vitalSigns.id) {
          // Update existing vital signs using the updateVital action
          updatedVital = await this.patientStore.updateVital(this.vitalSigns.id, vitalDataToUpdate)
        } else {
          // If no vital signs exist, you might need to create new ones
          // This depends on your API structure - you may need to add a createVital method
          console.log('No vital signs ID found, may need to create new vital record')
          // For now, we'll assume updateVital can handle both cases
          updatedVital = await this.patientStore.updateVital(
            this.transactionId, // Use transaction ID if no vital ID exists
            vitalDataToUpdate,
          )
        }

        console.log('Updated vital signs response:', updatedVital)

        if (updatedVital) {
          this.$q.notify({
            type: 'positive',
            message: 'Vital signs updated successfully',
            position: 'top',
            timeout: 2000,
          })

          // Update local vital signs data with the response
          // Make sure to preserve the structure
          this.vitalSigns = { ...this.vitalSigns, ...updatedVital }

          // Also update the transaction's vital property to keep data in sync
          if (this.transaction && this.transaction.vital) {
            this.transaction.vital = { ...this.vitalSigns }
          }

          console.log('Local vital signs after update:', this.vitalSigns)

          // Exit edit mode
          this.isVitalSignsEditMode = false
          this.originalVitalSigns = null

          // Optional: Refresh the entire transaction data to ensure consistency
          // Uncomment the line below if the vital signs still don't display properly
          // await this.refreshTransactionData()
        }
      } catch (error) {
        console.error('Error updating vital signs:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update vital signs',
          position: 'top',
          timeout: 2000,
        })
      }
    },

    cancelVitalSignsEdit() {
      // Restore original vital signs data
      if (this.originalVitalSigns) {
        this.vitalSigns = { ...this.originalVitalSigns }
      }

      this.isVitalSignsEditMode = false
      this.originalVitalSigns = null
    },

    // Method to refresh transaction data after updates
    async refreshTransactionData() {
      try {
        console.log('Refreshing transaction data...')
        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          console.log('Refreshed transaction data:', transactionData)
          this.transaction = transactionData
          this.vitalSigns = transactionData.vital || {}
          console.log('Refreshed vital signs:', this.vitalSigns)
        }
      } catch (error) {
        console.error('Error refreshing transaction data:', error)
      }
    },

    updateBMI() {
      if (this.vitalSigns.height && this.vitalSigns.weight) {
        this.vitalSigns.bmi = this.patientStore.calculateBMI(
          parseFloat(this.vitalSigns.height),
          parseFloat(this.vitalSigns.weight),
        )
      } else {
        this.vitalSigns.bmi = ''
      }
    },

    getBmiCategory(bmi) {
      const numBmi = parseFloat(bmi)

      if (isNaN(numBmi)) return ''

      if (numBmi < 18.5) return 'Underweight'
      if (numBmi < 25) return 'Normal'
      if (numBmi < 30) return 'Overweight'
      return 'Obese'
    },

    printRecord() {
      window.print()
    },

    goBack() {
      this.$router.go(-1)
    },
  },
}
</script>

<style scoped>
/* Print-specific styles */
@media print {
  .q-page {
    padding: 0 !important;
  }

  .q-card {
    box-shadow: none !important;
  }

  .q-btn {
    display: none !important;
  }
}

/* Transition classes */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px); /* slides in/out horizontally */
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 0.2;
  transform: translateX(0);
}
</style>
