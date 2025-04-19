<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios';
import api from '../api_config.json';

interface TimeSlotsBtn {
  number: number;
  time_slot: string;
  is_active: boolean;
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

const first_selected = ref<TimeSlotsBtn | null>(null);
const second_selected = ref<TimeSlotsBtn | null>(null);
const selected_date = ref("2025-04-22");
const selected_floor = ref("Все аудитории");

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

async function findAvailableRooms(start_slot: number, end_slot: number, date: string, floor: number) {
  try {
    const url = `${api.host}/booking/find/`;
    const response = await axios.get(url, {
      params: { start_slot, end_slot, date, floor }
    });
    console.log("Available rooms:", response.data);
    return response.data;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
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

  const floor = floorMap[selected_floor.value] || 111;

  findAvailableRooms(
    Math.min(startSlot, endSlot),
    Math.max(startSlot, endSlot),
    selected_date.value,
    floor
  );
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col class="mt-10">
        <v-btn
          v-for="slot in TimeSlots"
          :key="slot.number"
          :color="slot.is_active ? 'success' : 'default'"
          class="ma-1"
          @click="selectSlot(slot)"
        >
          {{ slot.time_slot }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pa-5">
        <v-select
          v-model="selected_floor"
          :items="floorOptions"
          label="Этаж"
        ></v-select>
      </v-col>
      <v-col class="col_container">
        <v-btn @click="findAvailable" class="ml-5 ma-5">Применить</v-btn>
      </v-col>
    </v-row>

    <v-row class="row_container">
      <v-col cols="10">
        <!-- Results will be displayed here -->
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.row_container {
  align-items: center;
  justify-content: center;
}
</style>
