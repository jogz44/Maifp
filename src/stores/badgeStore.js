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
    echoInstance: null,
    channel: null,
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
        console.log('Badges fetched:', this.badges)
      } catch (err) {
        console.error('Error fetching badge counts:', err)
        this.error = err
      } finally {
        this.loading = false
      }
    },

    updateBadges(newBadges) {
      console.log('Received badge update via WebSocket:', newBadges)
      this.badges = { ...this.badges, ...newBadges }
    },

    initWebSocket(echo) {
      if (!echo) {
        console.error('Echo instance not provided')
        return
      }

      this.echoInstance = echo
      console.log('Connecting to badge-channel...')

      this.channel = echo
        .channel('badge-channel')
        .listen('.badge.updated', (event) => {   // ✅ dot prefix
          console.log('BadgeUpdated event received:', event)
          this.updateBadges(event.data)           // ✅ event.data not event.badges
        })
        .error((error) => {
          console.error('WebSocket channel error:', error)
        })

      // Initial fetch
      this.fetchBadges()
    },

    destroyWebSocket() {
      if (this.echoInstance && this.channel) {
        console.log('Disconnecting from badge-updates channel...')
        this.echoInstance.leave('badge-channel')
        this.channel = null
        this.echoInstance = null
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
