<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue';
import * as parser from './scripts/cookie_parser'

const link = ref("booking")

const page_title: Map<string, string> = new Map([
  ['notifications', 'Уведомления'],
  ['booking', "Бронирование аудитории"],
  ['account', "Профиль"],
  ['login', 'Авторизация']
])

const router = useRouter();
const isRegistered = ref(false);

function onLoginTrigger() {
  isRegistered.value = true;
  router.push('booking');
}

function Redirect(link_: string) {
  link.value = link_;
  router.push(link_);
}

function LogOut() {
  isRegistered.value = false;
  parser.SetCookie('msu_book_token', '')
}

onMounted(() => {
  if (parser.GetCookie('msu_book_token') != undefined && parser.GetCookie('msu_book_token') != "") {
    isRegistered.value = true;
  }
})

</script>

<template>
  <v-app>
    <header>
      <v-app-bar :elevation="1" class="app_bar_container">
        <v-app-bar-title>
          {{ page_title.get(link) }}
        </v-app-bar-title>

        <template v-slot:append v-if="isRegistered">
          <v-btn v-on:click="LogOut">
            <v-icon icon="mdi-logout" size=30></v-icon>
          </v-btn>
          <v-btn @click="Redirect('account')">
            <v-icon icon="mdi-account-circle" size=30></v-icon>
          </v-btn>
        </template>
      </v-app-bar>
    </header>

    <v-main>
      <RouterView v-slot="{ Component }">
        <component :is="Component" @onLoginTrigger="onLoginTrigger" />
      </RouterView>
    </v-main>

    <footer>
      <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation v-model="link" class="bottom_nav_container">
          <!-- <v-btn value="notifications">
            <v-icon icon="mdi-bell-outline" size="small"></v-icon>
            <span>Уведомления</span>
          </v-btn> -->

          <v-btn @click="Redirect('booking')">
            <v-icon icon="mdi-timetable" size="small"></v-icon>
            <span>Бронирование аудитории</span>
          </v-btn>

          <v-btn @click="Redirect('login')" v-if="!isRegistered">
            <v-icon icon="mdi-account-circle" size="small"></v-icon>
            <span>Авторизация</span>
          </v-btn>
        </v-bottom-navigation>
      </v-layout>
    </footer>
  </v-app>
</template>

<style scoped>
body {
  font-family: Roboto;
}

.app_bar_container {
  background-color: #00014c;
  color: #fff;
}

.bottom_nav_container {
  background-color: #00014c;
  color: #fff;
}
</style>
