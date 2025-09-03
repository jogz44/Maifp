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

        <!-- LABORATORY RESULTS -->
        <q-card-section v-if="!loading">
          <div class="row items-center justify-between">
            <div class="text-subtitle2 q-mb-sm">Availed Laboratory Services</div>
            <q-btn color="green" dense icon="add" label="Add Services" @click="openLabModal" />
          </div>

          <!-- Table to display saved results -->
          <q-table
            v-if="results.length"
            :rows="results"
            :columns="labColumns"
            row-key="id"
            flat
            dense
            class="q-mt-md"
          >
            <template v-slot:body-cell-amount="props">
              <q-td :props="props"> ₱{{ props.row.amount }} </q-td>
            </template>
          </q-table>
        </q-card-section>

        <!-- Add/Edit Laboratory Modal -->
        <q-dialog v-model="labModalOpen" persistent>
          <q-card style="min-width: 900px">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h6">Add Laboratory Results</div>
                <div class="relative-position">
                  <!-- Info button -->
                  <q-btn
                    round
                    dense
                    flat
                    icon="info"
                    color="primary"
                    @click="serviceModalOpen = true"
                  />

                  <!-- Floating toast -->
                  <transition name="fade-slide">
                    <div
                      v-if="showServiceHint"
                      class="q-pa-sm text-white text-caption shadow-4 absolute-top-right"
                      style="
                        margin-right: 35px; /* push it left of the info button */
                        border-radius: 10px;
                        background: rgba(33, 150, 243, 0.75);
                        backdrop-filter: blur(6px);
                        white-space: nowrap;"
                      >
                      Manage Laboratory Services
                    </div>
                  </transition>
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div
                v-for="(result, index) in resultsForm"
                :key="index"
                class="row q-col-gutter-md q-mt-sm text-caption"
              >
                <div class="col-12 col-md-2">
                  <q-input dense v-model="result.time" label="Time" type="time" />
                </div>
                <div class="col-12 col-md-2">
                  <q-input dense v-model="result.date" label="Date" type="date" />
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    dense
                    v-model="result.laboratory_type"
                    :options="laboratoryOptions"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    label="Type of Laboratory"
                    @update:model-value="onLabChange(result)"
                  >
                  </q-select>
                </div>
                <div class="col-12 col-md-3 row">
                  <q-input dense v-model="result.amount" label="Amount" type="number" class="col" />
                  <q-btn
                    round
                    dense
                    flat
                    color="red"
                    icon="delete"
                    @click="removeResultRow(index)"
                  />
                </div>
              </div>

              <!-- Add Row Button -->
              <q-btn
                flat
                color="blue"
                icon="add"
                label="Add Another Service"
                class="q-mt-md"
                @click="addResultRow"
              />
            </q-card-section>

            <!-- Manage Laboratory Services -->
              <q-dialog v-model="serviceModalOpen" persistent>
                <q-card style="min-width: 600px">
                  <q-card-section>
                    <div class="text-h6">Manage Laboratory Services</div>
                  </q-card-section>

                  <q-card-section>
                    <!-- Table of Services -->
                    <q-table
                      :rows="laboratoryOptions"
                      :columns="[
                        { name: 'label', label: 'Service', field: 'label', align: 'left'},
                        { name: 'fee', label: 'Fee', field: 'fee', align: 'right' },
                        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
                      ]"
                      row-key="value"
                      flat
                      dense
                    >
                      <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                          <q-btn
                            flat
                            dense
                            round
                            size="sm"
                            icon="edit"
                            color="blue"
                            @click="editService(props.row)"
                          />
                          <q-btn
                            flat
                            dense
                            round
                            size="sm"
                            icon="delete"
                            color="red"
                            @click="confirmDelete(props.row)"
                          />
                        </q-td>
                      </template>
                    </q-table>

                    <!-- Add New Service -->
                    <div class="row items-end q-col-gutter-md q-mt-md">
                      <div class="col">
                        <q-input
                          v-model="newServiceName"
                          label="Service Name"
                          outlined
                          dense
                          clearable
                        />
                      </div>

                      <!-- Service Fee -->
                      <div class="col-3">
                        <q-input
                          v-model="newServiceFee"
                          label="Fee"
                          type="number"
                          outlined
                          dense
                          clearable
                          prefix="₱"
                        />
                      </div>

                      <!-- Add Button -->
                      <div class="col-auto">
                        <q-btn
                          color="green"
                          icon="add"
                          label="Add"
                          unelevated
                          @click="addService"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <!-- Edit Service Dialog -->
                  <q-dialog v-model="editDialogOpen" persistent>
                    <q-card style="min-width: 500px">
                      <q-card-section>
                        <div class="text-h6">Update Service</div>
                      </q-card-section>

                      <q-card-section>
                        <q-input
                          v-model="editServiceName"
                          label="Service Name"
                          outlined
                          dense
                          clearable
                        />
                        <q-input
                          v-model="editServiceFee"
                          label="Fee"
                          type="number"
                          outlined
                          dense
                          clearable
                          prefix="₱"
                          class="q-mt-md"
                        />
                      </q-card-section>

                      <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="grey" @click="editDialogOpen = false" />
                        <q-btn color="primary" label="Save" @click="updateService" />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>

                  <q-card-actions align="right">
                    <q-btn flat label="Close" color="grey" @click="serviceModalOpen = false" />
                  </q-card-actions>
                </q-card>
              </q-dialog>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="grey" @click="labModalOpen = false" />
              <q-btn color="green" icon="save" label="Save" @click="saveLaboratoryResults" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- ACTION BUTTONS -->
        <div class="q-mt-md flex justify-end q-gutter-sm">
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

      // UI states
      isTransactionEditMode: false,
      isVitalSignsEditMode: false,
      isResultsEditMode: false,
      labModalOpen: false, // ADD THIS

      // Backup data
      originalTransactionData: null,
      originalVitalSigns: null,
      originalResults: null,

      //New Services
      serviceModalOpen: false,
      showServiceHint: false,
      newServiceName: '',
      newServiceFee: '',

      //Update Services
      editDialogOpen: false,
      editServiceId: null,
      editServiceName: '',
      editServiceFee: '',

      // Results
      laboratoryOptions: [],
      results: [],
      resultsForm: [{ laboratory_type: '', time: '', date: '', amount: '' }],
      labColumns: [
        { name: 'laboratory_type', label: 'Laboratory', field: 'laboratory_type', align: 'left' },
        { name: 'amount', label: 'Amount', field: 'amount', align: 'right' },
        { name: 'status', label: 'Status', field: 'status', align: 'center' },
        { name: 'date', label: 'Date', field: 'date', align: 'center' },
        { name: 'time', label: 'Time', field: 'time', align: 'center' },
        { name: 'actions', label: '', field: 'actions', align: 'center' },
      ],
    }
  },

  computed: {
    patientStore() {
      return usePatientStore()
    },
  },

  mounted() {
    this.patientId = this.$route.query.patientId
    this.transactionId = this.$route.query.transactionId

    console.log(
      `Mounted TransactionDetails. Patient ID: ${this.patientId}, Transaction ID: ${this.transactionId}`,
    )

    this.loadLaboratoryOptions()

    if (this.transactionId) {
      this.loadTransactionData()
      this.loadLaboratoryResults(this.transactionId) // fetch saved labs
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
      try {
        const payload = { lab_name: this.newServiceName, lab_amount: this.newServiceFee }
        await this.patientStore.addLaboratoryService(payload)
        this.$q.notify({ type: 'positive', message: 'Service added!' })
        this.loadLaboratoryOptions()
        this.newServiceName = ''
        this.newServiceFee = ''
      } catch {
        this.$q.notify({ type: 'negative', message: 'Failed to add service' })
      }
    },

    editService(service) {
      this.editServiceId = service.value
      this.editServiceName = service.label
      this.editServiceFee = service.fee
      this.editDialogOpen = true
    },

    async updateService() {
      try {
        const payload = {
          id: this.editServiceId,
          lab_name: this.editServiceName,
          lab_amount: this.editServiceFee
        }
        await this.patientStore.updateLaboratoryService(payload)
        this.$q.notify({ type: 'positive', message: 'Service updated!' })
        this.loadLaboratoryOptions()
        this.editDialogOpen = false
      } catch {
        this.$q.notify({ type: 'negative', message: 'Failed to update service' })
      }
    },

    // THIS PART DELETION WITHOUT WARNING MSSG
    // async deleteService(service) {
    //   try {
    //     await this.patientStore.deleteLaboratoryService(service.value)
    //     this.$q.notify({ type: 'positive', message: 'Service deleted!' })
    //     this.loadLaboratoryOptions()
    //   } catch {
    //     this.$q.notify({ type: 'negative', message: 'Failed to delete service' })
    //   }
    // },
    confirmDelete(service) {
      this.$q.dialog({
        title: 'Delete Service ',
        message: `
          <div class="text-black text-semibold">
            Are you sure you want to delete <br>
            <span class="text-primary">"${service.label}"</span>?
          </div>
        `,
        html: true,
        cancel: {
          label: 'Cancel',
          color: 'grey'
        },
        ok: {
          label: 'Yes',
          color: 'red'
        },
        persistent: true
      }).onOk(async () => {
        try {
          await this.patientStore.deleteLaboratoryService(service.value)
          this.$q.notify({ type: 'positive', message: 'Service deleted!' })
          this.loadLaboratoryOptions()
        } catch {
          this.$q.notify({ type: 'negative', message: 'Failed to delete service' })
        }
      })
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
        await patientStore.laboratoryReturn(this.transactionId, payload)

        this.$q.notify({
          type: 'positive',
          message: 'Laboratory returned successfully',
        })

        // Redirect to new consultation page
        this.$router.push({ path: '/customers/laboratory' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to store consultation: ${error.message}`,
        })
      }
    },

    async markDone() {
      const patientStore = usePatientStore()

      const now = new Date()
      const consultationDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const consultationTime = now.toTimeString().split(' ')[0] // HH:MM:SS

      const payload = {
        patient_id: this.patientId,
        transaction_id: this.transactionId,
        consultation_date: consultationDate,
        consultation_time: consultationTime,
        status: 'Done',
      }

      try {
        await patientStore.laboratoryReturn(this.transactionId, payload)

        this.$q.notify({
          type: 'positive',
          message: 'Laboratory done successfully',
        })

        // Redirect to new consultation page
        this.$router.push({ path: '/customers/laboratory' })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: `Failed to store Laboratory: ${error.message}`,
        })
      }
    },

    openLabModal() {
      const now = new Date()
      const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM

      this.resultsForm = [
        {
          laboratory_type: '',
          time: currentTime,
          date: currentDate,
          amount: '',
        },
      ]
      this.labModalOpen = true
      this.showServiceHint = true
      setTimeout(() => {
        this.showServiceHint = false
      }, 2000)
    },

    addNewLabType(val) {
      if (val && !this.laboratoryOptions.includes(val)) {
        this.laboratoryOptions.push(val)
      }
    },

    addResultRow() {
      const now = new Date()
      const currentDate = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().slice(0, 5)

      this.resultsForm.push({
        laboratory_type: '',
        time: currentTime,
        date: currentDate,
        amount: '',
      })
    },

    removeResultRow(index) {
      this.resultsForm.splice(index, 1)
    },

    async saveLaboratoryResults() {
      try {
        const payload = {
          transaction_id: this.transactionId,
          laboratories: this.resultsForm.map((result) => {
            const service = this.laboratoryOptions.find((s) => s.value === result.laboratory_type)
            return {
              laboratory_type: service?.label || '', // ensure string name
              amount: parseFloat(result.amount) || 0,
              status: 'Pending',
            }
          }),
        }

        await this.patientStore.storeLaboratoryResult(payload)

        this.$q.notify({
          type: 'positive',
          message: 'Laboratory Services saved successfully',
        })

        this.labModalOpen = false
        this.results = [...this.results, ...this.resultsForm]
      } catch (error) {
        console.error('Save Error:', error)
        this.$q.notify({
          type: 'negative',
          message: `Failed to save Services: ${error.message}`,
        })
      }
    },

    async loadLaboratoryResults(transactionId) {
      try {
        const res = await this.patientStore.fetchLaboratoryResults(transactionId)

        // format created_at into date & time
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
        fee: s.lab_amount,
      }))
    },

    onLabChange(result) {
      const service = this.laboratoryOptions.find((s) => s.value === result.laboratory_type)
      if (service) {
        result.amount = service.fee
      }
    },

    async loadTransactionData() {
      this.loading = true
      console.log(`Loading transaction data for ID: ${this.transactionId}`)

      try {
        // Use getTransactionDetails from patientStore
        const transactionData = await this.patientStore.getTransactionDetails(this.transactionId)

        if (transactionData) {
          console.log('Transaction data loaded:', transactionData)
          this.transaction = transactionData

          // Extract vital signs data from the vital property
          this.vitalSigns = transactionData.vital || {}
          console.log('Vital signs data:', this.vitalSigns)

          // Load patient data if not already loaded and if patientId is available
          if (this.patientId && (!this.patient || !this.patient.id)) {
            console.log(`Loading patient data for ID: ${this.patientId}`)
            const patientData = await this.patientStore.getPatient(this.patientId)
            if (patientData) {
              console.log('Patient data loaded:', patientData)
              this.patient = patientData
            } else {
              console.error('Failed to load patient data')
            }
          }
        } else {
          console.error('No transaction data returned from store')
          this.$q.notify({
            type: 'negative',
            message: 'Failed to load transaction data',
            position: 'top',
            timeout: 2000,
          })
        }
      } catch (error) {
        console.error('Error loading transaction data:', error)
        this.$q.notify({
          type: 'negative',
          message: `Error loading transaction data: ${error.message}`,
          position: 'top',
          timeout: 2000,
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
