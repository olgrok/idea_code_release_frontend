<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify';
import axios from 'axios';
import api from '../api_config.json';
import * as parser from '../scripts/cookie_parser'

const { mobile } = useDisplay();

const user = ref({
  name: 'Иван Иванов',
  email: 'ivan.ivanov@example.com',
  avatar: 'https://banner2.cleanpng.com/20180516/jq/kisspng-computer-icons-user-avatar-computer-software-5afc5548caec32.9866818415264863448312.jpg',
  user_id: 11111111,
});

const settings = ref({
  notifications: true,
  darkMode: false,
  emailNotifications: false,
});

const bookings = ref([
  {
    id: 1,
    room: 'Аудитория 301',
    date: '2023-10-15',
    time: '14:00-16:00',
    status: 'Подтверждено',
  },
  {
    id: 2,
    room: 'Конференц-зал',
    date: '2023-10-20',
    time: '10:00-12:00',
    status: 'Ожидание',
  },
  {
    id: 3,
    room: 'Лаборатория 205',
    date: '2023-10-25',
    time: '09:00-11:00',
    status: 'Отклонено',
  },
]);

const editMode = ref(false);
const tempUser = ref({ ...user.value });

const saveProfile = () => {
  user.value = { ...tempUser.value };
  editMode.value = false;
};

const cancelEdit = () => {
  tempUser.value = { ...user.value };
  editMode.value = false;
};

async function GetProfileInfo(): Promise<void> {
  const url = api.host + 'auth/profile/';
  const token = parser.GetCookie('msu_book_token')

  await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    timeout: api.timeout,
  },).then((response) => {
    user.value.name = response.data.first_name + response.data.second_name;
    user.value.email = response.data.email;
    user.value.user_id = response.data.user_id;
  }).catch((error) => {
    console.log(error);
  });
}

onMounted(async () => {
  await GetProfileInfo();
})

</script>

<template>
  <v-container class="profile-container">
    <v-row>
      <v-col cols="12" md="4" class="pr-md-4">
        <v-card elevation="2" class="profile-card">
          <v-card-text class="text-center">
            <v-avatar size="120" class="mb-4">
              <v-img :src="user.avatar" alt="Аватар пользователя"></v-img>
            </v-avatar>

            <template v-if="!editMode">
              <h2 class="text-h5 mb-2">{{ user.name }}</h2>
              <p class="text-subtitle-1 text-medium-emphasis mb-1">
                <v-icon small>mdi-email</v-icon> {{ user.email }}
              </p>
              <p class="text-subtitle-1 text-medium-emphasis mb-1">
                <v-icon small>mdi-identifier</v-icon> {{ user.user_id }}
              </p>

              <v-btn color="primary" variant="outlined" class="mt-4" @click="editMode = true" :disabled="true">
                Редактировать профиль
              </v-btn>
            </template>

            <template v-else>
              <v-text-field v-model="tempUser.name" label="ФИО" class="mb-2"></v-text-field>

              <v-text-field v-model="tempUser.email" label="Email" type="email" class="mb-2"></v-text-field>

              <div class="d-flex justify-space-between mt-4">
                <v-btn color="error" variant="outlined" @click="cancelEdit">
                  Отмена
                </v-btn>

                <v-btn color="primary" @click="saveProfile">
                  Сохранить
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>

        <v-card elevation="2" class="mt-4" :disabled="true">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-cog</v-icon>
            Настройки
          </v-card-title>

          <v-card-text>
            <v-switch v-model="settings.notifications" label="Уведомления" color="primary" hide-details></v-switch>

            <v-switch v-model="settings.darkMode" label="Темная тема" color="primary" hide-details
              class="mt-2"></v-switch>

            <v-switch v-model="settings.emailNotifications" label="Email уведомления" color="primary" hide-details
              class="mt-2"></v-switch>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-calendar-clock</v-icon>
            Мои бронирования
          </v-card-title>

          <v-card-text>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Аудитория</th>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Статус</th>
                  <th v-if="!mobile">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.id">
                  <td>{{ booking.room }}</td>
                  <td>{{ new Date(booking.date).toLocaleDateString() }}</td>
                  <td>{{ booking.time }}</td>
                  <td>
                    <v-chip :color="booking.status === 'Подтверждено' ? 'success' :
                      booking.status === 'Ожидание' ? 'warning' : 'error'" size="small">
                      {{ booking.status }}
                    </v-chip>
                  </td>
                  <td v-if="!mobile">
                    <v-btn icon size="small" color="error" v-if="booking.status === 'Ожидание'">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin-top: 24px;
}

.profile-card {
  position: relative;
  overflow: visible;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background-color: #1976D2;
  border-radius: 4px 4px 0 0;
}

.v-avatar {
  position: relative;
  z-index: 2;
  border: 4px solid white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
}

@media (max-width: 960px) {
  .profile-container {
    padding: 8px;
  }

  .pr-md-4 {
    padding-right: 12px !important;
  }
}
</style>
