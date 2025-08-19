<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
      <q-toolbar>
        <q-btn flat dense round @click="toggleLeftDrawer()" aria-label="Menu" icon="menu" />
        <q-btn flat no-caps no-wrap class="q-ml-xs">
          <q-icon name="local_pharmacy" color="red" size="28px" />
          <q-toolbar-title shrink class="text-weight-bold">
            Medical Assistance for Indigent and Financial Incapacitated Patients System
          </q-toolbar-title>
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
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-green-10 text-white">
      <q-list>
        <q-item></q-item>
        <q-item clickable v-ripple to="/dashboard">
          <div class="row items-center">
            <q-icon name="dashboard" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Dashboard</span>
          </div>
        </q-item>

        <q-item clickable v-ripple to="/customers">
          <div class="row items-center">
            <q-icon name="person" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Patient Info</span>
          </div>
        </q-item>

        <q-expansion-item
          label="MAIFIP"
          icon="volunteer_activism"
          icon-class="q-mr-xs"
          header-class="row items-center"
          v-model="expanded"
        >
          <q-item clickable v-ripple to="/assessment">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="assignment" class="q-ml-md q-mr-lg" size="24px" />Assessment
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/gl">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="category" class="q-ml-md q-mr-lg" size="24px" />Guaranteed Letter
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/fundings">
            <q-item-section class="q-ml-sm">
              <q-item-label class="text-caption">
                <q-icon name="wallet" class="q-ml-md q-mr-lg" size="24px" />Fundings
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item clickable v-ripple to="">
          <div class="row items-center">
            <q-icon name="forum" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Consultation</span>
          </div>
        </q-item>

        <q-item clickable v-ripple to="">
          <div class="row items-center">
            <q-icon name="science" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Laboratory</span>
          </div>
        </q-item>

        <q-item clickable v-ripple to="">
          <div class="row items-center">
            <q-icon name="receipt_long" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">Billing</span>
          </div>
        </q-item>

        <q-item clickable v-ripple to="/users/list">
          <div class="row items-center">
            <q-icon name="supervisor_account" size="24px" class="q-mr-md" />
            <span class="text-sm" style="padding-left: 16px">User Management</span>
          </div>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import auth from 'src/services/auth'
import { useUserStore } from 'src/stores/userStore'
export default {
  name: 'MyLayout',
  components: {},

  setup() {
    const ausSrvc = auth
    const userStore = useUserStore()
    return {
      ausSrvc,
      userStore,
    }
  },
  data() {
    return {
      leftDrawerOpen: false,
      expanded: true,
    }
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },

    async logout() {
      try {
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
      // console.log(user.id)
    },
  },

  watch: {},
  mounted() {
    // This is where you can perform any actions when the component is mounted

    if (this.ausSrvc.isAuthenticated()) {
      this.ausSrvc.initializeAuth()
      this.GetUserID()
    }
  },
}
</script>
<style scoped></style>
