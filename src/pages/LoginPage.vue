<template>
  <div class="flex flex-center bg-grey-2" style="min-height: 100vh">
    <q-card class="q-pa-lg shadow-3" style="width: 420px; border-radius: 24px">
      <q-card-section class="text-center">
        <q-avatar size="200px" class="q-mb-md">
          <img src="../assets/tagumlogo.png" alt="App Logo" />
        </q-avatar>
        <div class="text-h5 text-weight-bold text-primary">MAIFIP System</div>
        <div class="text-subtitle1 text-grey-7">Login to your account</div>
      </q-card-section>

      <q-form @submit.prevent="handleLogin" ref="loginForm">
        <q-card-section>
          <q-input
            outlined
            v-model="userLogin.username"
            label="Username"
            type="text"
            lazy-rules
            :rules="[(val) => !!val || 'Username is required']"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            outlined
            v-model="userLogin.password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[(val) => !!val || 'Password is required']"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Sign In"
            class="full-width"
            :loading="loading"
            rounded
            unelevated
          />
        </q-card-section>
      </q-form>

      <q-card-section class="text-center">
        <span class="text-caption" style="color: gray">
          Powered by City Information and Communications Technology Management Office - BPM Division
        </span>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useUserStore } from 'src/stores/userStore'
import { LocalStorage } from 'quasar'

export default {
  setup() {
    const loginStore = useUserStore()
    return { loginStore }
  },
  data() {
    return {
      userLogin: {
        username: '',
        password: '',
      },
      loading: false,
    }
  },
  methods: {
    async handleLogin() {
      if (!this.userLogin.username || !this.userLogin.password) return
      this.loading = true

      try {
        const result = await this.loginStore.loginUser(this.userLogin)

        if (result.success) {
          LocalStorage.set('role_name', result.data.user.role_name)

          const role = result.data.user.role_name

          const roleRoutes = {
            admin: '/dashboard',
            doctor: '/dashboard-doctor',
            laboratory: '/dashboard-lab',
            social: '/dashboard-social',
            coder: '/dashboard-encoder',
            billing: '/dashboard-billing',
          }

          this.$router.push(roleRoutes[role] || '/:catchAll(.*)*')
        }
      } catch (error) {
        this.$q.notify({ type: 'negative', message: error.message })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.q-card {
  max-width: 420px;
  border-radius: 24px;
}
</style>
