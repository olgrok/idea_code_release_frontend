<template>
  <v-container>
    <h1>События</h1>

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="selectedSubject"
          :items="subjectOptions"
          label="Выберите предмет"
          @update:model-value="filterEvents"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-btn color="primary" @click="openCreateEventDialog">
          Создать мероприятие
        </v-btn>
      </v-col>
    </v-row>

    <FullCalendar
      :options="calendarOptions"
    />

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>
          {{ selectedEvent?.subject }}
        </v-card-title>
        <v-card-text>
          <p><b>Дата:</b> {{ selectedEvent?.date }}</p>
          <p><b>Время:</b> {{ selectedEvent?.time }}</p>
          <p><b>Контакты:</b> {{ selectedEvent?.contacts }}</p>
          <p><b>Group ID:</b> {{ selectedEvent?.group_id }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-grey darken-1" text @click="dialog = false">
            Закрыть
          </v-btn>
          <v-btn color="primary" @click="joinGroup(selectedEvent)">
            Присоединиться
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Event Dialog -->
    <v-dialog v-model="createEventDialog" width="500">
      <v-card>
        <v-card-title>
          Создать мероприятие
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newEvent.subject" label="Предмет"></v-text-field>
          <v-text-field v-model="newEvent.date" label="Дата (YYYY-MM-DD)"></v-text-field>
          <v-select
              v-model="newEvent.start_slot"
              :items="slotOptions"
              label="Начальный слот"
          ></v-select>
          <v-select
              v-model="newEvent.end_slot"
              :items="slotOptions"
              label="Конечный слот"
          ></v-select>
          <v-select
              v-model="newEvent.room"
              :items="roomOptions"
              item-title="name"
              item-value="id"
              label="Кабинет"
              @focus="fetchRooms"
          ></v-select>
          <v-textarea v-model="newEvent.description" label="Описание"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-grey darken-1" text @click="closeCreateEventDialog">
            Отмена
          </v-btn>
          <v-btn color="primary" @click="createEvent">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios'; // Import axios
import * as parser from '../scripts/cookie_parser';
interface EventItem {
  id: number;
  date: string; // YYYY-MM-DD
  start_slot: number;
  end_slot: number;
  subject: string;
  description: string | null;
  initiator: number;
  booking_attempt: number | null;
  group: number | null;
  room: number | null;
  contacts?: string; // Added for compatibility with mock data and dialog
  group_id?: string; // Added for compatibility with mock data and dialog
  time?: string;  // Added for compatibility with mock data and dialog
}

interface Room {
  id: number;
  name: string;
}

const events = ref<EventItem[]>([]);
const subjectOptions = ref<string[]>(['Все предметы']);
const selectedSubject = ref('Все предметы');
const filteredEvents = ref<EventItem[]>([]);

const dialog = ref(false);
const selectedEvent = ref<EventItem | null>(null);

const API_BASE_URL = 'https://ggbook.serveo.net'; // Adjust as needed

const fetchEvents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/list/`);
    events.value = response.data.results;
    // Extract subjects for filtering
    const uniqueSubjects = new Set(events.value.map(event => event.subject));
    subjectOptions.value = ['Все предметы', ...uniqueSubjects];
    filterEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const filterEvents = async () => {
    try {
        let url = `${API_BASE_URL}/events/list/`;
        if (selectedSubject.value !== 'Все предметы') {
            // Using search parameter as there's no direct subject filter in the API
            url += `?search=${selectedSubject.value}`;
        }

        const response = await axios.get(url);
        filteredEvents.value = response.data.results;

    } catch (error) {
        console.error('Error filtering events:', error);
    }
};


const calendarEvents = computed(() => {
  return filteredEvents.value.map(event => {
    const startTime = slotToTime(event.start_slot);
    const endTime = slotToTimeEnd(event.end_slot);

    return {
      title: event.subject,
      start: `${event.date}T${startTime}:00`, //YYYY-MM-DDTHH:MM:SS
      end: `${event.date}T${endTime}:00`, //YYYY-MM-DDTHH:MM:SS
      extendedProps: {
        ...event,
        contacts: 'Неизвестно',  // Placeholder until API returns contacts
        group_id: 'Неизвестно',  // Placeholder until API returns group_id
        time: `${startTime}-${endTime}`
      },
      backgroundColor: getColorForSubject(event.subject),
    };
  });
});

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  locale: 'ru',
  events: calendarEvents.value,
  eventClick: handleEventClick,
}));

const handleEventClick = (info: any) => {
  selectedEvent.value = info.event.extendedProps as EventItem;
  dialog.value = true;
};

const getColorForSubject = (subject: string) => {
  const colors = {
    'Математика': '#f44336',
    'Физика': '#e91e63',
    'Информатика': '#9c27b0',
    'Химия': '#3f51b5',
    'Биология': '#2196f3',
    'Другое': '#607d8b',
  };
  return colors[subject] || colors['Другое'];
};

const joinGroup = (event: EventItem | null) => {
  if (event) {
    // TODO: Add logic for joining group with actual backend call
    alert(`Joining group ${event.group_id} for subject ${event.subject}`);
    dialog.value = false; // Close the dialog after joining
  }
};

const slotToTime = (slot: number): string => {
  const slotTimes = {
    1: '09:00',
    2: '09:50',
    3: '10:50',
    4: '11:40',
    5: '13:30',
    6: '14:20',
    7: '15:20',
    8: '16:10',
    9: '17:05',
    10: '17:55',
    11: '18:55',
    12: '19:45',
    13: '20:45',
    14: '21:35',
  };
  return slotTimes[slot as keyof typeof slotTimes] || '00:00';
};

const slotToTimeEnd = (slot: number): string => {
  const slotTimes = {
    1: '09:45',
    2: '10:35',
    3: '11:35',
    4: '12:25',
    5: '14:15',
    6: '15:05',
    7: '16:05',
    8: '16:55',
    9: '17:50',
    10: '18:40',
    11: '19:40',
    12: '20:30',
    13: '21:30',
    14: '22:00',
  };
  return slotTimes[slot as keyof typeof slotTimes] || '00:00';
};

// Create Event Functionality
const createEventDialog = ref(false);
const newEvent = ref({
  subject: '',
  date: '',
  start_slot: null,
  end_slot: null,
  room: null,
  description: '',
  initiator: 1, //TODO: Get current user
  booking_attempt: null,
  group: null,
});

const slotOptions = ref([
    { value: 1, text: 'Слот 1 (09:00 - 09:45)' },
    { value: 2, text: 'Слот 2 (09:50 - 10:35)' },
    { value: 3, text: 'Слот 3 (10:50 - 11:35)' },
    { value: 4, text: 'Слот 4 (11:40 - 12:25)' },
    { value: 5, text: 'Слот 5 (13:30 - 14:15)' },
    { value: 6, text: 'Слот 6 (14:20 - 15:05)' },
    { value: 7, text: 'Слот 7 (15:20 - 16:05)' },
    { value: 8, text: 'Слот 8 (16:10 - 16:55)' },
    { value: 9, text: 'Слот 9 (17:05 - 17:50)' },
    { value: 10, text: 'Слот 10 (17:55 - 18:40)' },
    { value: 11, text: 'Слот 11 (18:55 - 19:40)' },
    { value: 12, text: 'Слот 12 (19:45 - 20:30)' },
    { value: 13, text: 'Слот 13 (20:45 - 21:30)' },
    { value: 14, text: 'Слот 14 (21:35 - 22:00)' },
]);

const roomOptions = ref<Room[]>([])

const openCreateEventDialog = () => {
  createEventDialog.value = true;
};

const closeCreateEventDialog = () => {
  createEventDialog.value = false;
  resetNewEvent();
  roomOptions.value = [];
};
const token = parser.GetCookie('msu_book_token');
const createEvent = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/events/create/`, newEvent.value, {
           headers: {
                'Authorization': `${token}`
            }
        });
        console.log('Event created:', response.data);
        fetchEvents(); // Refresh events after creation
        closeCreateEventDialog();
    } catch (error) {
        console.error('Error creating event:', error);
    }
};

const resetNewEvent = () => {
  newEvent.value = {
    subject: '',
    date: '',
    start_slot: null,
    end_slot: null,
    room: null,
    description: '',
    initiator: 1, //TODO: Get current user
    booking_attempt: null,
    group: null,
  };
};

const fetchRooms = async () => {
    try {
        //Check required fields
        if (!newEvent.value.date || !newEvent.value.start_slot || !newEvent.value.end_slot) {
            console.warn("Date, start_slot and end_slot are required to fetch rooms.");
            return;
        }

        // Fetch rooms based on selected date and time slots
        const response = await axios.get(
            `${API_BASE_URL}/booking/find/?date=${newEvent.value.date}&start_slot=${newEvent.value.start_slot}&end_slot=${newEvent.value.end_slot}`
        );

        if (response.data && response.data.rooms && Array.isArray(response.data.rooms)) {
            // Transform the response data into the format required for v-select
            roomOptions.value = response.data.rooms.map((room: any) => ({
                id: room.id,
                name: room.name,
            }));
        } else {
            console.error("Error: API returned non-array data for rooms:", response.data);
            // Optionally, set roomOptions to an empty array to prevent further errors
            roomOptions.value = [];
        }


    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
};

onMounted(() => {
  fetchEvents();
});

</script>

<style scoped>
/* You can add custom styles here, if needed */
</style>