<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import axios, { type AxiosResponse } from 'axios';
import api from '../api_config.json';
import * as parser from '../scripts/cookie_parser'
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
  range_status: string,
  bid: number,
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
const book_room_dialog = ref(false);
const is_loading = ref(false)

const floorOptions = ['Цокольный этаж', '1 Этаж', '2 Этаж', '3 Этаж', '4 Этаж', '5 Этаж', 'Все аудитории'];

const floorMap: Record<string, number> = {
  'Цокольный этаж': 0,
  'Все аудитории': 111,
  '1 Этаж': 1,
  '2 Этаж': 2,
  '3 Этаж': 3,
  '4 Этаж': 4,
  '5 Этаж': 5
};

const AvailableRooms = ref<Room[]>([])

const selected_room = ref<Room>({
  "id": 0,
  "name": "string",
  "capacity": 0,
  "room_type": "string",
  "building": "string",
  "floor": "string",
  "features": "string",
  "range_status": "AVAILABLE",
  "bid": 0,
});

const sort_items = ['Забронированно', 'Доступно для брони', 'На аукционе', 'Не применять сортировку']
const select_sort = ref('Не применять сортировку');

function MatchFilter(range_status: string) {
  if (range_status === 'AVAILABLE' && select_sort.value === 'Доступно для брони') {
    return true;
  }
  if (range_status === 'BOOKED' && select_sort.value === 'Забронированно') {
    return true;
  }
  if (range_status === 'IN_AUCTION' && select_sort.value === 'На аукционе') {
    return true;
  }
  if (select_sort.value === 'Не применять сортировку') {
    return true;
  }
  return false;
}

const selected_slots_number = computed(() => {
  if (first_selected.value && second_selected.value) {
    return Math.abs(first_selected.value.number - second_selected.value.number) + 1;
  }
  if (first_selected.value === null && second_selected.value === null) {
    return 0;
  }
  return 1;
});

const time_period = computed(() => {
  if (first_selected.value != null && second_selected.value != null) {
    if (first_selected.value.number < second_selected.value.number) {
      return first_selected.value.time_slot.split('-')[0] + " - " + second_selected.value?.time_slot.split('-')[1]
    }
    return second_selected.value.time_slot.split('-')[0] + " - " + first_selected.value?.time_slot.split('-')[1]
  }
  if (first_selected.value != null) {
    return first_selected.value.time_slot;
  }
  if (second_selected.value != null) {
    return second_selected.value.time_slot;
  }
  return "::"
})

function SelectRoom(room: Room) {
  book_room_dialog.value = true;
  selected_room.value = room;
}

function activateButtons(first_number: number, second_number: number, is_active: boolean): void {
  const start = Math.min(first_number, second_number);
  const end = Math.max(first_number, second_number);

  for (let i = start + 1; i < end; i++) {
    TimeSlots.value[i].is_active = is_active;
  }
}

function selectSlot(slot: TimeSlotsBtn): void {
  if (first_selected.value && second_selected.value) {
    activateButtons(first_selected.value.number, second_selected.value.number, false);
    TimeSlots.value[first_selected.value.number].is_active = false;
    first_selected.value = null;
    TimeSlots.value[second_selected.value.number].is_active = false;
    second_selected.value = null;
  }

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

async function findAvailable_(start_slot: number, end_slot: number, date: string, floor: number): Promise<void> {
  is_loading.value = true;
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

    is_loading.value = false;
    AvailableRooms.value = response.data.rooms;
    for (const room of AvailableRooms.value) {
      room.bid = 0;
    }
  } catch (error: any) {
    is_loading.value = false;
    console.error(error);
    error_dialog.value = true;
    error_msg.value = error.message
  }
}

function findAvailable(): void {
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

async function BookingAttempt(room: Room, bid: number): Promise<void> {
  let start: number
  let end: number

  if (first_selected.value && second_selected.value) {
    start = Math.min(first_selected.value.number, second_selected.value.number) + 1;
    end = Math.max(first_selected.value.number, second_selected.value.number) + 1;
  } else if (first_selected.value) {
    start = first_selected.value.number + 1;
    end = first_selected.value.number + 1;
  } else if (second_selected.value) {
    start = second_selected.value.number + 1;
    end = second_selected.value.number + 1;
  } else {
    error_dialog.value = true;
    error_msg.value = "Выберите временной промежуток"
    return;
  }

  const url = api.host + '/booking/booking-attempt-create/';
  const token = parser.GetCookie('msu_book_token')

  const request_body = {
    room: room.id,
    start_slot_number: start,
    end_slot_number: end,
    total_bid: bid,
    // funding_group: 1,
    date: Intl.DateTimeFormat('en-CA').format(selected_date.value)
  }

  console.log(request_body)

  await axios.post(url, request_body, {
    headers: {
      'Authorization': token
    },
    timeout: api.timeout,
  }).then(() => {
    room.range_status = "IN_AUCTION";
    book_room_dialog.value = false;
  }).catch((error) => {
    error_dialog.value = true;
    if (error.status === 403) {
      error_msg.value = "Авторизируйтесь, чтобы забронировать аудиторию."
    } else {
      console.log(error);
      error_msg.value = error.response.data;
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
          <v-spacer v-if="error_msg === 'Авторизируйтесь, чтобы забронировать аудиторию.'"></v-spacer>
          <v-btn v-if="error_msg === 'Авторизируйтесь, чтобы забронировать аудиторию.'" color="success"
            @click="Redirect">
            Авторизация
          </v-btn>
          <v-spacer v-if="error_msg === 'Авторизируйтесть, чтобы забронировать аудиторию.'"></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="book_room_dialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 error--text">
          <v-icon color="info" class="mr-2">mdi-information</v-icon>
          Подвердите бронь
        </v-card-title>

        <v-card-text>
          <p>Время: {{ time_period }}</p>
          <p>Количество выбранных слотов: {{ selected_slots_number }}</p>
          <p>Название: {{ selected_room.name }}</p>
          <p>Вместимость: {{ selected_room.capacity }} </p>
          <p>Тип: {{ selected_room.room_type }}</p>
          <p>Здание: {{ selected_room.building }}</p>
          <p>Этаж: {{ selected_room.floor }}</p>
          <p>Описание: {{ selected_room.features }}</p>
          <p>Стоимость в баллах: {{ Math.max(selected_room.bid, selected_slots_number) }}</p>
          <v-number-input v-model="selected_room.bid" :min="selected_slots_number"
            control-variant="stacked"></v-number-input>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" variant="flat" @click="BookingAttempt(selected_room, selected_slots_number)">
            Подвердить
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="book_room_dialog = false">
            Закрыть
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
        <div>
          <v-select class="mt-2" style="max-width: 500px;" v-model="select_sort" :items="sort_items" label="Сортировка"
            variant="outlined" />
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


    <v-row class="row_container">
      <v-progress-circular v-if="is_loading" indeterminate :size="45" :width="5"></v-progress-circular>

      <v-col cols="10" class="room_col" v-if="AvailableRooms.length > 0">
        <div v-for="room in AvailableRooms" :key="room.id">

          <v-card elevation="3" class="room_card ma-2 pa-2" v-if="MatchFilter(room.range_status)">
            <v-chip v-if="room.range_status === 'AVAILABLE'" color="green" variant="flat">
              Доступна для брони
            </v-chip>
            <v-chip v-if="room.range_status === 'IN_AUCTION'" color="warning" variant="flat">
              На аукционе
            </v-chip>
            <v-chip v-if="room.range_status === 'BOOKED'" color="red" variant="flat">
              Недоступна для брони
            </v-chip>
            <v-card-title class="text-h4">{{ room.name }}</v-card-title>
            <v-card-text>
              <p>Тип: {{ room.room_type }}</p>
              <p>Этаж: {{ room.floor }}</p>
            </v-card-text>
            <v-btn @click="SelectRoom(room)" :disabled="room.range_status !== 'AVAILABLE'" color="primary">
              Забронировать
            </v-btn>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.row_container {
  align-items: center;
  justify-content: center;
  min-height: 200px;
  max-height: 50dvh;
  overflow-y: scroll;
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
