import { createRouter, createWebHistory } from 'vue-router'
import BookingView from '../views/BookingView.vue'
import EventsView from '../views/EventsView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/booking',
      name: 'booking',
      component: BookingView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LogInView.vue'),
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView
    },
  ],
})

export default router
