<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import * as api from '../api_config.json';
import * as parser from '../scripts/cookie_parser';

const emit = defineEmits(['on_login_trigger'])

const show = ref(false)

const schema = yup.object({
  email: yup.string().email('must be a valid email').required(),
  password: yup.string().required(),
});

const { handleSubmit } = useForm({
  validationSchema: schema,
});

const email = useField('email');
const password = useField('password');

const authenticate_submit = handleSubmit(values => {
  const url = api.host + '/auth/login/';

  const data = {
    "username": values.email,
    "password": values.password
  }

  const params = {
    timeout: api.timeout,
  }

  axios.post(url, data, params).then((response) => {
    console.log(response);
    parser.AddCookie("msu_book_token", response.data.token);
    emit('on_login_trigger');
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
          <v-card-text>
            <form @submit.prevent="authenticate_submit">

              <v-text-field v-model="email.value.value" :error-messages="email.errorMessage.value"
                label="e-mail"></v-text-field>

              <v-text-field class="mt-2" v-model="password.value.value" :error-messages="password.errorMessage.value"
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" :type="show ? 'text' : 'password'" hint=""
                label="пароль" name="input-10-1" @click:append="show = !show"></v-text-field>

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
