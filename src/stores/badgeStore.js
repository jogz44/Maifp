import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const usePatientBadgeStore = defineStore('patientBadge', {
  state: () => ({
    badges: {
      totalAssessedCount: 0,
      totalQualifiedCount: 0,
      totalLaboratoryCount: 0,
      totalMedicationCount: 0,
      totalReturnedCount: 0,
      totalBillingCount: 0,
      totalGLCount: 0,
      totalphilhealth_to_maifip: 0,
      totalphilhealth: 0,
    },
    loading: false,
    error: null,
  }),

  getters: {
    assessed: (state) => state.badges.totalAssessedCount,
    qualified: (state) => state.badges.totalQualifiedCount,
    laboratory: (state) => state.badges.totalLaboratoryCount,
    medication: (state) => state.badges.totalMedicationCount,
    returned: (state) => state.badges.totalReturnedCount,
    billing: (state) => state.badges.totalBillingCount,
    gl: (state) => state.badges.totalGLCount,
    p_assessment: (state) => state.badges.totalphilhealth_to_maifip,
    philhealth: (state) => state.badges.totalphilhealth,
  },

  actions: {
    async fetchBadges() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/patients/count/badge')
        this.badges = res.data
      } catch (err) {
        console.error('Error fetching badge counts:', err)
        this.error = err
      } finally {
        this.loading = false
      }
    },

    clearBadges() {
      this.badges = {
        totalAssessedCount: 0,
        totalQualifiedCount: 0,
        totalLaboratoryCount: 0,
        totalMedicationCount: 0,
        totalReturnedCount: 0,
        totalBillingCount: 0,
        totalGLCount: 0,
        totalphilhealth_to_maifip: 0,
        totalphilhealth: 0,
      }
    },
  },
})
