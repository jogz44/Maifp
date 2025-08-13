<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="min-width: 350px; max-width: 800px; width: 100%">
      <q-card-section>
        <div class="text-h6 text-left" style="color: #4b4e6d">User Registration</div>
      </q-card-section>

      <q-form ref="registrationForm" @submit.prevent="onSubmit">
        <div class="row flex">
          <div class="col-12 col-md-4 q-mx-sm">
            <q-input
              filled
              v-model="form.first_name"
              label="First Name"
              :rules="[(val) => !!val || 'First name is required']"
              class="q-mb-md text-uppercase"
            />
          </div>
          <div class="col-12 col-md-4 q-mx-sm">
            <q-input
              filled
              v-model="form.last_name"
              label="Last Name"
              :rules="[(val) => !!val || 'Last name is required']"
              class="q-mb-md text-uppercase"
            />
          </div>
          <div class="col-12 col-md-3 q-mx-sm">
            <q-input
              filled
              v-model="form.middle_name"
              label="Middle Name"
              class="q-mb-md text-uppercase"
            />
          </div>
        </div>

        <q-select
          filled
          label="Role"
          v-model="form.role_id"
          :options="roleStore.roles"
          option-label="label"
          option-value="value"
          :rules="[(val) => !!val || 'Role is required']"
          class="q-mb-md text-uppercase"
        />

        <q-input
          filled
          v-model="form.position"
          label="Position"
          :rules="[(val) => !!val || 'Position is required']"
          class="q-mb-md text-uppercase"
        />
        <q-input
          filled
          v-model="form.office"
          label="Office"
          :rules="[(val) => !!val || 'Office is required']"
          class="q-mb-md text-uppercase"
        />
        <q-input
          filled
          v-model="form.username"
          label="Username"
          :rules="[(val) => !!val || 'Username is required']"
          class="q-mb-md"
        />
        <q-input
          filled
          v-model="form.password"
          label="Password"
          type="password"
          :rules="[
            (val) => !!val || 'Password is required',
            (val) => val.length >= 8 || 'Password must be at least 8 characters',
            (val) => val.length <= 16 || 'Password must be at most 16 characters',
          ]"
          class="q-mb-md"
        />
        <q-input
          filled
          v-model="form.confirm_password"
          label="Confirm Password"
          type="password"
          :rules="[
            (val) => !!val || 'Confirm password is required',
            (val) => val === form.password || 'Passwords do not match',
          ]"
        />

        <div class="row q-mt-lg flex justify-end">
          <q-btn flat label="Cancel" type="button" color="grey" class="q-mr-md" @click="oncancel" />
          <q-btn label="Register" type="submit" color="primary" />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import { useUserStore } from 'src/stores/userStore'
import { useRoleStore } from 'src/stores/roleStore'

export default {
  name: 'UserRegistrationForm',
  setup() {
    const userStore = useUserStore()
    const roleStore = useRoleStore()
    return {
      userStore,
      roleStore,
    }
  },
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        middle_name: '',
        role_id: null,
        position: '',
        office: '',
        username: '',
        password: '',
        confirm_password: '',
      },
    }
  },
  methods: {
    oncancel() {
      this.resetForm()
      this.$router.go(-1)
    },
    async onSubmit() {
      const valid = await this.$refs.registrationForm.validate()
      if (valid) {
        if (typeof this.form.role_id === 'object' && this.form.role_id !== null) {
          this.form.role_id = this.form.role_id.value
        }

        try {
          await this.insertNewUser(this.form)
          console.log('Registration successful:', this.form)
          this.resetForm()
          this.$router.go(-1)
        } catch (error) {
          this.$q.notify({
            type: 'negative',
            message: error.message || 'Failed to register user.',
          })
        }
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'Please fill in all required fields.',
        })
      }
    },
    resetForm() {
      this.form = {
        first_name: '',
        last_name: '',
        middle_name: '',
        role_id: null,
        position: '',
        office: '',
        username: '',
        password: '',
        confirm_password: '',
      }
      this.$refs.registrationForm.resetValidation()
    },
    async insertNewUser(payload) {
      return await this.userStore.newUser(payload)
    },
  },
  mounted() {
    this.roleStore.fetchRoles()
  },
}
</script>
