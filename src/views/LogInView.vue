<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import api from '../api_config.json';
import { AddCookie } from '../scripts/cookie_parser';

const emit = defineEmits(['onLoginTrigger'])

const showPassword = ref(false)

const schema = yup.object({
  email: yup.string().email('must be a valid email').required(),
  password: yup.string().required(),
});

const { handleSubmit } = useForm({
  validationSchema: schema,
});

const email = useField<string>('email');
const password = useField<string>('password');

const authenticate = handleSubmit((values) => {

  axios.post(
    api.host + '/auth/login/',
    {
      "username": values.email,
      "password": values.password
    },
    {
      timeout: api.timeout
    }).then((response) => {
      console.log(response);
      AddCookie("msu_book_token", response.data.token);
      console.log("success");
      emit('onLoginTrigger');
    }).catch((error) => {
      const error_message = {
        "message": error.message,
        "status": error.status
      }
      console.log(error_message);
    })
})

</script>

<template>
  <v-container class="container_params">
    <v-row class="row_container">
      <v-col :cols="10">
        <v-card elevation="5" class="pa-5">
          <v-card-title class="text-h5 mb-4">
            Авторизация
          </v-card-title>

          <v-card-text>
            <form @submit.prevent="authenticate">

              <v-text-field v-model="email.value.value" :error-messages="email.errorMessage.value"
                label="e-mail"></v-text-field>

              <v-text-field class="mt-2" v-model="password.value.value" :error-messages="password.errorMessage.value"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
                hint="" label="пароль" name="input-10-1" @click:append="showPassword = !showPassword"></v-text-field>

              <v-btn class="ma-2 button" type="submit" color="#00014c"> Авторизация </v-btn>
            </form>

            <v-btn class="ma-2 button" type="submit" variant="outlined" href="https://app.profcomff.com/auth"
              color="#00014c">
              Регистрация </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.container_params {
  height: 85dvh;
  max-width: 1200px;
}

.row_container {
  height: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.button {
  width: 100%;
  height: 50px;
}
</style>
