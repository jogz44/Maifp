<!-- <template>
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
</style> -->

<template>
  <div class="flex flex-center bg-grey-2" style="min-height: 100vh">
    <q-card class="shadow-3 login-card">
      <div class="desktop-layout row no-wrap">
        <!-- Left Side (Logos and Department Info) -->
        <div
          class="col-7 flex flex-center column bg-white text-white q-pa-xl"
          style="border-top-left-radius: 24px; border-bottom-left-radius: 24px"
        >
          <q-avatar size="160px" class="q-mb-md bg-white">
            <img src="../assets/CHO-logo.png" alt="City Health Logo" />
          </q-avatar>

          <div class="text-h5 text-weight-bold text-green q-mb-sm">CHAMP</div>
          <q-separator class="text-black"></q-separator>

          <div class="text-subtitle1 text-center text-black text-weight-bold text-primary">
            City Health Assistance Management Platform
          </div>
          <div class="text-subtitle2 text-weight-light text-black text-center q-mb-lg">
            Mabini Street, Tagum City, Davao del Norte
          </div>

          <q-separator dark inset style="width: 60%" class="q-mb-lg" />
          <div class="flex flex-between q-gutter-lg">
            <q-avatar size="100px" class="q-mb-sm">
              <img src="../assets/logo.png" alt="LGU Logo" />
            </q-avatar>
            <div
              class="q-mt-md q-pa-sm bg-white flex flex-center"
              style="border-radius: 12px; width: 120px"
            >
              <img
                src="../assets/BP.png"
                alt="Tagum Logo"
                style="width: 100%; height: auto; object-fit: contain"
              />
            </div>
          </div>
        </div>

        <!-- Right Side (Login Form) -->
        <div class="col-5 q-pa-xl flex flex-center column rightside">
          <div class="text-subtitle1 text-weight-bolder text-grey-8 q-mb-lg">
            Login to your account
          </div>

          <q-form
            @submit.prevent="handleLogin"
            ref="loginForm"
            class="full-width"
            style="max-width: 350px"
          >
            <q-input
              dense
              outlined
              v-model.trim="userLogin.username"
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
              dense
              v-model="userLogin.password"
              label="Password"
              :type="isPasswordVisible ? 'text' : 'password'"
              lazy-rules
              :rules="[(val) => !!val || 'Password is required']"
              class="q-mb-lg"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
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

            <div class="text-caption text-white text-center q-mt-md">
              Powered by CICTMO - SPM Section
            </div>

            <div class="text-caption text-white text-center q-mt-sm">
              <q-icon name="info" size="14px" class="q-mr-xs" />
              v{{ appVersion }}
            </div>
          </q-form>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="mobile-layout">
        <div class="mobile-header bg-white q-pa-md">
          <div class="flex items-center justify-center q-gutter-sm q-mb-sm q-mt-sm">
            <q-avatar size="40px">
              <img src="../assets/logo.png" alt="LGU Tagum Logo" />
            </q-avatar>
            <q-avatar size="40px" class="bg-white">
              <img src="../assets/CHO-logo.png" alt="City Health Logo" />
            </q-avatar>
            <q-avatar square size="40px" class="bg-white">
              <img src="../assets/BP.png" alt="Bagong Pilipinas Logo" />
            </q-avatar>
          </div>
          <div class="text-h6 text-weight-bold text-green text-center q-mb-xs">CHAMP</div>
          <div class="text-caption text-center text-black text-weight-bold text-primary">
            City Health Assistance Monitoring Platform
          </div>
          <div class="text-caption text-center text-black q-mb-sm" style="font-size: 10px">
            Mabini Street, Tagum City, Davao del Norte
          </div>
        </div>

        <div class="q-pa-lg flex flex-center column rightside mobile-form-section">
          <div class="text-subtitle2 text-weight-bolder text-grey-8 q-mb-md">
            Login to your account
          </div>

          <q-form
            @submit.prevent="handleLogin"
            ref="loginFormMobile"
            class="full-width"
            style="max-width: 350px"
          >
            <q-input
              dense
              outlined
              v-model.trim="userLogin.username"
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
              dense
              v-model="userLogin.password"
              label="Password"
              :type="isPasswordVisible ? 'text' : 'password'"
              lazy-rules
              :rules="[(val) => !!val || 'Password is required']"
              class="q-mb-lg"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
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

            <div class="text-caption text-white text-center q-mt-md">
              Powered by CICTMO - BPM Section
            </div>

            <div class="text-caption text-white text-center q-mt-sm">
              <q-icon name="info" size="14px" class="q-mr-xs" />
              v{{ appVersion }}
            </div>
          </q-form>
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
      isPasswordVisible: false,
      appVersion: packageInfo.version,
    }
  },
  methods: {
    async handleLogin() {
      const isValid =
        (await this.$refs.loginForm?.validate()) || (await this.$refs.loginFormMobile?.validate())
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
.login-card {
  max-width: 900px;
  width: 90%;
  border-radius: 24px;
  overflow: hidden;
}

.rightside {
  background: linear-gradient(135deg, #abe39b 25%, #38c14aed 75%);
  color: #ffffff;
}

/* Desktop Layout */
.desktop-layout {
  display: flex;
}

.mobile-layout {
  display: none;
}

/* Mobile Layout */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .login-card {
    width: 95%;
  }

  .mobile-header {
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    padding: 12px 16px;
  }

  .mobile-form-section {
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
    min-height: 400px;
  }
}
</style>
