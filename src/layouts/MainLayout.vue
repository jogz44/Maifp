<template>
  <q-layout view="hHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
      <q-toolbar>
        <q-btn flat dense round @click="toggleLeftDrawer()" aria-label="Menu" icon="menu" />
        <q-btn flat no-caps no-wrap class="q-ml-xs">
          <img src="/CHO-logo.png" alt="CHO Logo" width="28" />
          <q-toolbar-title shrink class="text-weight-bold"> CHAMP </q-toolbar-title>
        </q-btn>

        <div class="q-ml-auto q-gutter-sm">
          <q-btn-dropdown flat dense dropdown-icon="arrow_drop_down">
            <template v-slot:label>
              <q-avatar size="26px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
              </q-avatar>
            </template>

            <q-tooltip>Account</q-tooltip>

            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup @click="$router.push('/users/user/')">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="account_circle" size="20px"></q-icon>
                    Account
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout()">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="logout" size="20px"></q-icon>
                    Logout
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-green-10 text-white">
      <q-list>
        <q-item></q-item>

        <!-- Dashboard - Available to all roles -->
        <q-item clickable v-ripple :to="dashboardRoute">
          <div class="row items-center">
            <q-icon name="dashboard" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Dashboard</span>
          </div>
        </q-item>

        <!-- Patient Info - Available to admin and coder -->
        <q-item v-if="canAccessPatientInfo" clickable v-ripple to="/customers">
          <div class="row items-center">
            <q-icon name="person" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Patient Info</span>
          </div>
        </q-item>

        <!-- MAIFIP MENU - Available to admin and social -->
        <q-expansion-item
          v-if="canAccessMAIFIP"
          label="MAIFIP"
          icon="volunteer_activism"
          icon-class="q-mr-xs"
          header-class="row items-center"
          v-model="expanded"
        >
          <q-item clickable v-ripple to="/assessment">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="assignment" class="q-ml-md q-mr-lg" size="24px" />
                Assessment
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                v-if="badgeStore.assessed > 0"
                :label="badgeStore.assessed"
                color="red-9"
                rounded
                class="q-ml-sm"
              />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/gl">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="insert_drive_file" class="q-ml-md q-mr-lg" size="24px" />
                GL
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                v-if="badgeStore.gl > 0"
                :label="badgeStore.gl"
                color="red-9"
                rounded
                class="q-ml-sm"
              />
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- CONSULTATION MENU - Available to admin and doctor -->
        <q-expansion-item
          v-if="canAccessConsultation"
          label="Consultation"
          icon="forum"
          icon-class="q-mr-xs"
          header-class="row items-center"
          v-model="expandedConsultation"
        >
          <q-item clickable v-ripple to="/customers/newconsultation">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="person_add_alt" class="q-ml-md q-mr-lg" size="24px" />
                New Consultation
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                v-if="badgeStore.qualified > 0"
                :label="badgeStore.qualified"
                color="red-9"
                rounded
                class="q-ml-sm"
              />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/customers/returnconsultation">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="assignment_return" class="q-ml-md q-mr-lg" size="24px" />
                Return Consultation
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                v-if="badgeStore.returned > 0"
                :label="badgeStore.returned"
                color="red-9"
                rounded
                class="q-ml-sm"
              />
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item v-if="canAccessLaboratory" clickable v-ripple to="/customers/laboratory">
          <div class="row items-center">
            <q-icon name="science" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Laboratory</span>
            <q-badge
              v-if="badgeStore.laboratory > 0"
              :label="badgeStore.laboratory"
              color="red-9"
              rounded
              class="q-ml-sm"
            />
          </div>
        </q-item>

        <!-- PhilHealth MENU - Available to admin and assessor -->
        <q-item v-if="canAccessPhilHealth" clickable v-ripple to="/philhealth">
          <div class="row items-center">
            <q-icon name="diversity_1" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">PhilHealth</span>
            <q-badge
              v-if="badgeStore.philhealth > 0"
              :label="badgeStore.philhealth"
              color="red-9"
              rounded
              class="q-ml-sm"
            />
          </div>
        </q-item>

        <q-item v-if="canAccessBilling" clickable v-ripple to="/billing">
          <div class="row items-center">
            <q-icon name="receipt_long" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Billing</span>
            <q-badge
              v-if="badgeStore.billing > 0"
              :label="badgeStore.billing"
              color="red-9"
              rounded
              class="q-ml-sm"
            />
          </div>
        </q-item>

        <q-item v-if="canAccessBilling" clickable v-ripple to="/billinglog">
          <div class="row items-center">
            <q-icon name="description" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Billing Record</span>
          </div>
        </q-item>

        <!-- Master List - Available to admin only -->
        <q-item v-if="canAccessMasterList" clickable v-ripple to="/masterlist">
          <div class="row items-center">
            <q-icon name="list" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Master List</span>
          </div>
        </q-item>

        <q-item v-if="canAccessMasterList" clickable v-ripple to="/reports">
          <div class="row items-center">
            <q-icon name="bar_chart" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Reports</span>
          </div>
        </q-item>

        <q-item v-if="canAccessMasterList" clickable v-ripple to="/activity">
          <div class="row items-center">
            <q-icon name="history" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Activity Log</span>
          </div>
        </q-item>

        <!-- User Management - Available to admin only -->
        <q-item v-if="canAccessUserManagement" clickable v-ripple to="/users/list">
          <div class="row items-center">
            <q-icon name="supervisor_account" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">User Management</span>
          </div>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-sm">
        <div class="text-caption text-white-7 text-center">
          <q-icon name="info" size="14px" class="q-mr-xs" />
          v{{ appVersion }}
        </div>
      </div>
    </q-drawer>

    <!-- PAGE CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import auth from 'src/services/auth'
import { useUserStore } from 'src/stores/userStore'
import { usePatientBadgeStore } from 'src/stores/badgeStore'
import { LocalStorage } from 'quasar'
import packageInfo from '../../package.json'

export default {
  name: 'MyLayout',

  setup() {
    const ausSrvc = auth
    const userStore = useUserStore()
    const badgeStore = usePatientBadgeStore()

    return {
      ausSrvc,
      userStore,
      badgeStore,
    }
  },

  data() {
    return {
      leftDrawerOpen: false,
      expanded: true,
      expandedConsultation: false,
      userRole: null,
      appVersion: packageInfo.version,
      rolePermissions: {
        admin: [
          'dashboard',
          'patient-info',
          'maifip',
          'consultation',
          'laboratory',
          'billing',
          'masterlist',
          'user-management',
          'philhealth',
        ],
        social: ['dashboard', 'maifip'],
        coder: ['dashboard', 'patient-info'],
        doctor: ['dashboard', 'consultation'],
        laboratory: ['dashboard', 'laboratory'],
        billing: ['dashboard', 'billing'],
        assessor: ['dashboard', 'philhealth'],
      },
    }
  },

  computed: {
    currentUserRole() {
      return this.userRole || LocalStorage.getItem('role_name') || 'guest'
    },

    allowedModules() {
      return this.rolePermissions[this.currentUserRole] || ['dashboard']
    },

    canAccessPatientInfo() {
      return this.allowedModules.includes('patient-info')
    },

    canAccessMAIFIP() {
      return this.allowedModules.includes('maifip')
    },

    canAccessConsultation() {
      return this.allowedModules.includes('consultation')
    },

    canAccessLaboratory() {
      return this.allowedModules.includes('laboratory')
    },

    canAccessBilling() {
      return this.allowedModules.includes('billing')
    },

    canAccessMasterList() {
      return this.allowedModules.includes('masterlist')
    },

    canAccessUserManagement() {
      return this.allowedModules.includes('user-management')
    },

    canAccessPhilHealth() {
      return this.allowedModules.includes('philhealth')
    },

    dashboardRoute() {
      switch (this.currentUserRole) {
        case 'admin':
          return '/dashboard'
        case 'coder':
          return '/dashboard-encoder'
        case 'social':
          return '/dashboard-social'
        case 'doctor':
          return '/dashboard-doctor'
        case 'laboratory':
          return '/dashboard-lab'
        case 'billing':
          return '/dashboard-billing'
        case 'assessor':
          return '/dashboard-assessor'
        default:
          return '/:catchAll(.*)*'
      }
    },
  },

  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },

    async logout() {
      try {
        // Disconnect WebSocket
        this.badgeStore.destroyWebSocket()

        await this.ausSrvc.logout()
        this.$router.push('/')
      } catch (error) {
        console.log(error)
      }
    },

    GetUserID() {
      const unsanitized_object = localStorage.getItem('user')
      const sanitized_object = unsanitized_object.replace('__q_objt|', '')
      const user = JSON.parse(sanitized_object)
      this.userStore.authenticatedUser = user.id
    },

    canAccess(allowedRoles) {
      return allowedRoles.includes(this.currentUserRole)
    },

    hasModuleAccess(moduleName) {
      return this.allowedModules.includes(moduleName)
    },

    setUserRole() {
      this.userRole = LocalStorage.getItem('role_name')
    },
  },

  async mounted() {
    if (this.ausSrvc.isAuthenticated()) {
      this.ausSrvc.initializeAuth()
      this.GetUserID()
      this.setUserRole()

      // Initialize WebSocket connection
      this.badgeStore.initWebSocket(this.$echo)
    }
  },

  beforeUnmount() {
    // Clean up WebSocket connection
    this.badgeStore.destroyWebSocket()
  },
  
}
</script>
