<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="min-width: 350px; max-width: 800px; width: 100%">
      <q-card-section>
        <div class="text-h6 text-left" style="color: #4b4e6d">User Profile</div>
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
            (val) => !userStore.selected_id || !!val || 'Password is required',
            (val) => val.length >= 8 || 'Password must be at least 8 characters',
            (val) => val.length <= 16 || 'Password must be not more than 16 characters',
          ]"
          class="q-mb-md"
        />
        <q-input
          filled
          v-model="form.confirm_password"
          label="Confirm Password"
          type="password"
          :rules="[
            (val) => !userStore.selected_id || !!val || 'Confirm password is required',
            (val) => !val || val === (form?.password || '') || 'Passwords do not match',
          ]"
        />

        <div class="row q-mt-lg flex justify-end">
          <q-btn
            flat
            label="Cancel"
            type="submit"
            color="grey"
            class="q-mr-md"
            @click="oncancel()"
          />
          <q-btn label="Update" type="submit" color="primary" />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import { useUserStore } from 'src/stores/userStore'
export default {
  name: 'UserRegistrationForm',

  setup() {
    const userStore = useUserStore()
    return {
      userStore,
    }
  },
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        middle_name: '',
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
      const success = await this.$refs.registrationForm.validate()
      if (success) {
        // this.insertNewUser(this.form)
        // Handle successful registration here
        // console.log('Upda successful:', this.form)

        // this.$q.notify({
        //   type: 'positive',
        //   message: 'User registered successfully!',
        // })
        // Optionally clear form
        console.log(this.form)
        this.userStore.updateUser(this.userStore.selected_id, this.form)

        this.resetForm()
        this.$router.go(-1)
      } else {
        // Validation errors are shown automatically
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
        position: '',
        office: '',
        username: '',
        password: '',
        confirm_password: '',
      }

      this.$refs.registrationForm.resetValidation()
    },

    async getUser(id) {
      try {
        await this.userStore.getUser(id)
        Object.assign(this.form, this.userStore.user)
        // this.form = this.userStore.user
      } catch (error) {
        console.error('Error fetching user:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Unable to fetch user',
          position: 'center',
          timeout: 1000,
        })
      }
    },

    GetUserID() {
      const unsanitized_object = localStorage.getItem('user')
      const sanitized_object = unsanitized_object.replace('__q_objt|', '')
      const user = JSON.parse(sanitized_object)
      return user.id
    },
  },
  mounted() {
    if (this.userStore.selected_id) {
      console.log('Loading selected user:', this.userStore.selected_id)
      this.getUser(this.userStore.selected_id)
    } else {
      console.log('No selected user, loading authenticated user profile')
      this.getUser(this.GetUserID())
    }
  },
}
</script>
