<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useRouter } from 'vue-router'
import { ref, watch } from 'vue';

const link = ref("booking")

const page_title: Map<string, string> = new Map([
  ['notifications', 'Уведомления'],
  ['booking', "Бронирование аудитории"],
  ['account', "Профиль"],
  ['login', 'Авторизация']
])

const router = useRouter();
const isRegistered = ref(false);

watch(link, (new_link) => {
  router.push(new_link);
})

const HandleLoginTrigger = () => {
  isRegistered.value = true;
  router.push('booking');
}

</script>

<template>
  <v-app>
    <header>
      <v-app-bar :elevation="1" class="app_bar_container">
        <v-app-bar-title>
          {{ page_title.get(link) }}
        </v-app-bar-title>

        <template v-slot:append v-if="isRegistered">
          <v-btn v-on:click="link = 'account'">
            <v-icon icon="mdi-account-circle" size=30></v-icon>
          </v-btn>
        </template>
      </v-app-bar>
    </header>

    <v-main>
      <RouterView v-slot="{ Component }">
        <component :is="Component" @on_login_trigger="HandleLoginTrigger" />
      </RouterView>
    </v-main>

    <footer>
      <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation v-model="link" class="bottom_nav_container">
          <v-btn value="notifications">
            <v-icon icon="mdi-bell-outline" size="small"></v-icon>
            <span>Уведомления</span>
          </v-btn>

          <v-btn value="booking">
            <v-icon icon="mdi-timetable" size="small"></v-icon>
            <span>Бронирование аудитории</span>
          </v-btn>

          <v-btn value="login" v-if="!isRegistered">
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
