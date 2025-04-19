<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import axios, { type AxiosResponse } from 'axios';
import api from '../api_config.json';
import { useRouter } from 'vue-router'

interface TimeSlotsBtn {
  number: number;
  time_slot: string;
  is_active: boolean;
}

interface Room {
  id: number,
  name: string,
  capacity: number,
  room_type: string,
  building: string,
  floor: string,
  features: string,
  is_available_for_range: boolean
}


const TimeSlots = ref<TimeSlotsBtn[]>([
  { number: 0, time_slot: '9:00-9:45', is_active: false },
  { number: 1, time_slot: '9:50-10:35', is_active: false },
  { number: 2, time_slot: '10:50-11:35', is_active: false },
  { number: 3, time_slot: '11:40-12:25', is_active: false },
  { number: 4, time_slot: '13:30-14:15', is_active: false },
  { number: 5, time_slot: '14:20-15:05', is_active: false },
  { number: 6, time_slot: '15:20-16:05', is_active: false },
  { number: 7, time_slot: '16:10-16:55', is_active: false },
  { number: 8, time_slot: '17:05-17:50', is_active: false },
  { number: 9, time_slot: '17:55-18:40', is_active: false },
  { number: 10, time_slot: '18:55-19:40', is_active: false },
  { number: 11, time_slot: '19:45-20:30', is_active: false },
  { number: 12, time_slot: '20:30-20:45', is_active: false },
  { number: 13, time_slot: '20:45-21:30', is_active: false },
  { number: 14, time_slot: '21:35-22:00', is_active: false },
]);

const router = useRouter();
const first_selected = ref<TimeSlotsBtn | null>(null);
const second_selected = ref<TimeSlotsBtn | null>(null);
const selected_date = shallowRef(new Date());
const selected_floor = ref("Все аудитории");
const error_dialog = ref(false)
const error_msg = ref("Ошибка!")

const floorOptions = ['Цокольный этаж', 'Все аудитории', '1 Этаж', '2 Этаж', '3 Этаж', '4 Этаж', '5 Этаж'];

const floorMap: Record<string, number> = {
  'Цокольный этаж': 0,
  'Все аудитории': 111,
  '1 Этаж': 1,
  '2 Этаж': 2,
  '3 Этаж': 3,
  '4 Этаж': 4,
  '5 Этаж': 5
};

const AvailableRooms = ref<Room[]>([
  {
    "id": 0,
    "name": "string",
    "capacity": 0,
    "room_type": "string",
    "building": "string",
    "floor": "string",
    "features": "string",
    "is_available_for_range": true
  }
])

function activateButtons(first_number: number, second_number: number, is_active: boolean) {
  const start = Math.min(first_number, second_number);
  const end = Math.max(first_number, second_number);

  for (let i = start + 1; i < end; i++) {
    TimeSlots.value[i].is_active = is_active;
  }
}

function selectSlot(slot: TimeSlotsBtn) {
  if (first_selected.value === slot) {
    if (second_selected.value) {
      activateButtons(first_selected.value.number, second_selected.value.number, false);
    }
    TimeSlots.value[first_selected.value.number].is_active = false;
    first_selected.value = null;
  }
  else if (second_selected.value === slot) {
    if (first_selected.value) {
      activateButtons(first_selected.value.number, second_selected.value.number, false);
    }
    TimeSlots.value[second_selected.value.number].is_active = false;
    second_selected.value = null;
  }
  else if (!first_selected.value && second_selected.value !== slot) {
    first_selected.value = slot;
    TimeSlots.value[first_selected.value.number].is_active = true;
  }
  else if (!second_selected.value && first_selected.value !== slot) {
    second_selected.value = slot;
    TimeSlots.value[second_selected.value.number].is_active = true;
  }

  if (first_selected.value && second_selected.value) {
    activateButtons(first_selected.value.number, second_selected.value.number, true);
  }
}

async function findAvailable_(start_slot: number, end_slot: number, date: string, floor: number) {
  try {
    const url = api.host + '/booking/find/';
    let response: AxiosResponse;

    if (floor === 111) {
      response = await axios.get(url, {
        params: { start_slot, end_slot, date }
      });
    } else {
      response = await axios.get(url, {
        params: { start_slot, end_slot, date, floor }
      });
    }

    AvailableRooms.value = response.data.rooms;
  } catch (error) {
    console.error(error);
  }
}

function findAvailable() {
  if (!first_selected.value && !second_selected.value) {
    console.error("No time slots selected");
    return;
  }

  const startSlot = first_selected.value
    ? first_selected.value.number + 1
    : second_selected.value!.number + 1;

  const endSlot = second_selected.value
    ? second_selected.value.number + 1
    : first_selected.value!.number + 1;

  const floor = floorMap[selected_floor.value];

  findAvailable_(
    Math.min(startSlot, endSlot),
    Math.max(startSlot, endSlot),
    Intl.DateTimeFormat('en-CA').format(selected_date.value),
    floor
  );
}

async function BookingAttempt(room: Room) {
  const url = api.host + '/booking/booking-attempt-create/';
  const start = Math.min(first_selected.value, second_selected.value);
  const end = Math.max(first_selected.value, second_selected.value);

  const request_body = {
    room: room,
    start_slot: start,
    end_slot: end,
    total_bid: 2147483647,
    funding_group: 0,
    booking_date: selected_date.value
  }

  await axios.get(url, {
    params: request_body
  }).then(() => {
    room.is_available_for_range = false;
  }).catch((error) => {
    error_dialog.value = true;
    if (error.status === 403) {
      error_msg.value = "Авторизируйтесть, чтобы забронировать аудиторию."
    } else {
      error_msg.value = error.response.data.detail;
    }
    console.log(error);
  });
}

function Redirect() {
  error_dialog.value = false
  router.push('login');
}

</script>

<template>
  <v-container>
    <v-dialog v-model="error_dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 error--text">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Ошибка
        </v-card-title>

        <v-card-text>
          {{ error_msg }}
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="error_dialog = false">
            Закрыть
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="Redirect">
            Авторизация
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row class="filters-row mt-3">
      <v-col cols="12" md="6">
        <v-date-picker v-model="selected_date" label="Дата бронирования" :max-width="360" variant="outlined" />
      </v-col>

      <v-col cols="12" md="6">
        <div>
          <v-select v-model="selected_floor" :items="floorOptions" label="Этаж" variant="outlined" />
        </div>
        <div class="ma-3">
          <div class="text-h4 mb-3">Время:</div>
          <v-btn v-for="slot in TimeSlots" :key="slot.number" :color="slot.is_active ? 'success' : 'default'"
            class="ma-1" @click="selectSlot(slot)">
            {{ slot.time_slot }}
          </v-btn>
        </div>
        <div class="mt-8" style="text-align: center;">
          <v-btn @click="findAvailable" color="primary" class="search-btn" size="large">
            Найти аудитории
          </v-btn>
        </div>
      </v-col>
    </v-row>


    <v-row class="row_container" v-if="AvailableRooms.length > 0">
      <v-col cols="10" class="room_col">
        <v-card class="room_card ma-2 pa-2" v-for="room in AvailableRooms" :key="room.id">
          <v-chip :color="room.is_available_for_range ? 'green' : 'red'" variant="flat">
            Доступна для брони
          </v-chip>
          <v-card-title>{{ room.name }}</v-card-title>
          <v-card-text>
            <p>Вместимость: {{ room.capacity }}</p>
            <p>Тип: {{ room.room_type }}</p>
            <p>Этаж: {{ room.floor }}</p>
            <p>Особенности: {{ room.features }}</p>
          </v-card-text>
          <v-btn @click="BookingAttempt(room)" :disabled="room.is_available_for_range ? false : true" color="primary">
            Забронировать
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.row_container {
  align-items: center;
  justify-content: center;
}

.room_col {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.room_card {
  max-width: 200px;
  text-align: center;
}
</style>
