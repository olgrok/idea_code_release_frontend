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

watch(link, (new_link) => {
  router.push(new_link);
})

</script>

<template>
  <v-app>
    <header>
      <v-app-bar :elevation="1" class="app_bar_container">
        <v-app-bar-title style="font-size: 1.5rem;">
          {{ page_title.get(link) }}
        </v-app-bar-title>
      </v-app-bar>
    </header>

    <v-main>
      <RouterView />
    </v-main>

    <footer>
      <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation v-model="link" class="bottom_nav_container">
          <v-btn value="notifications">
            <span>Уведомления</span>
          </v-btn>

          <v-btn value="booking">
            <span>Бронирование аудитории</span>
          </v-btn>

          <v-btn value="account">
            <span>Профиль</span>
          </v-btn>

          <v-btn value="login">
            <span>Авторизация</span>
          </v-btn>
        </v-bottom-navigation>
      </v-layout>
    </footer>
  </v-app>
</template>

<style scoped>
.app_bar_container {
  background-color: #00014c;
  color: #fff;
}

.bottom_nav_container {
  background-color: #00014c;
  color: #fff;
}

.bottom_nav_container span {
  font-size: 1rem;
}
</style>
