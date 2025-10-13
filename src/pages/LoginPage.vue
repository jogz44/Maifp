<template>
  <div class="flex flex-center bg-grey-2" style="min-height: 100vh">
    <q-card class="q-pa-lg shadow-3" style="width: 420px; border-radius: 24px">
      <q-card-section class="text-center">
        <q-avatar size="200px" class="q-mb-md">
          <img src="../assets/tagumlogo.png" alt="App Logo" />
        </q-avatar>
        <div class="text-h5 text-weight-bold text-primary">CHAMP</div>
        <div class="text-subtitle1 text-grey-7">City Health Assistance Monitoring Platform</div>
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

      <div class="absolute-bottom q-pa-sm">
        <div class="text-caption text-grey-7 text-center">
          <q-icon name="info" size="14px" class="q-mr-xs" />
          v{{ appVersion }}
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>
import { useUserStore } from 'src/stores/userStore'
import { Notify } from 'quasar'
import packageInfo from '../../package.json'

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
      appVersion: packageInfo.version,
    }
  },
  methods: {
    async handleLogin() {
      const isValid = await this.$refs.loginForm.validate()
      if (!isValid) return

      this.loading = true

      try {
        const result = await this.loginStore.loginUser(this.userLogin)

        if (result.success) {
          Notify.create({
            type: 'positive',
            message: 'Login successful!',
            position: 'top',
            timeout: 2000,
          })

          const role = result.data.user.role_name

          const roleRoutes = {
            admin: '/dashboard',
            doctor: '/dashboard-doctor',
            laboratory: '/dashboard-lab',
            social: '/dashboard-social',
            coder: '/dashboard-encoder',
            billing: '/dashboard-billing',
            assessor: '/dashboard-assessor',
          }

          const redirectPath = roleRoutes[role] || '/'
          this.$router.push(redirectPath)
        } else {
          Notify.create({
            type: 'negative',
            message: result.error || 'Invalid username or password',
            position: 'top',
            timeout: 3000,
          })
        }
      } catch (error) {
        console.error('Unexpected login error:', error)
        Notify.create({
          type: 'negative',
          message: 'An unexpected error occurred. Please try again.',
          position: 'center',
          timeout: 3000,
        })
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
