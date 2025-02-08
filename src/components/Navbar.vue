<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase/config';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useNotificationsStore } from '../stores/notifications';
import Notification from './Notification.vue';

const router = useRouter();
const notificationsStore = useNotificationsStore();
const currentUser = ref<User | null>(null);
const isMenuOpen = ref(false);
const notifications = ref<any[]>([]);

// Observa mudanças de estado de autenticação
onAuthStateChanged(auth, (user) => {
  currentUser.value = user;
  if (user) {
    fetchNotifications();
  }
});

const fetchNotifications = async () => {
  if (currentUser.value) {
    notifications.value = await notificationsStore.fetchUserNotifications(currentUser.value.uid);
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};

const handleNotificationClick = async (notificationId: string) => {
  await notificationsStore.markAsRead(notificationId);
};

const handleNotificationClose = async (notificationId: string) => {
  await notificationsStore.deleteNotification(notificationId);
};

// Atualiza as notificações periodicamente
onMounted(() => {
  const interval = setInterval(fetchNotifications, 30000); // A cada 30 segundos
  return () => clearInterval(interval);
});

// Toggle menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <!-- Navbar para Desktop -->
  <nav class="hidden md:flex bg-green-500 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="text-white font-bold text-xl">
          <img
            src="../assets/logo.png"
            alt="Adote um Amigo"
            class="h-10 w-10 rounded-full"
          />
        </router-link>

        <!-- Menu de navegação -->
        <div class="flex space-x-6">
          <router-link to="/" class="text-white hover:text-gray-300">
            Início
          </router-link>
          <template v-if="currentUser">
            <router-link to="/profile" class="text-white hover:text-gray-300">
              Perfil
            </router-link>
            <router-link
              to="/create-pet"
              class="text-white hover:text-gray-300"
            >
              Anunciar Pet
            </router-link>
            <button
              @click="handleLogout"
              class="text-white hover:text-gray-300"
            >
              Sair
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="text-white hover:text-gray-300">
              Entrar
            </router-link>
            <router-link to="/register" class="text-white hover:text-gray-300">
              Cadastrar
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <!-- Notificações -->
  <div class="fixed top-4 right-4 space-y-4 z-50">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :id="notification.id"
      :message="notification.message"
      :type="notification.type"
      :pet-id="notification.petId"
      :read="notification.read"
      @mark-as-read="handleNotificationClick"
      @close="handleNotificationClose(notification.id)"
    />
  </div>

  <!-- Navbar para Mobile -->
  <nav class="md:hidden bg-green-500 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="text-white font-bold text-xl">
          <img
            src="../assets/logo.png"
            alt="Adote um Amigo"
            class="h-10 w-auto"
          />
        </router-link>

        <!-- Menu Mobile (Hamburguer) -->
        <button @click="toggleMenu" class="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-8 h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu de navegação (Mobile) - Aparece quando o menu hamburguer é clicado -->
    <div
      v-show="isMenuOpen"
      class="flex flex-col space-y-6 py-4 absolute top-16 left-0 right-0 bg-green-500 z-10"
    >
      <router-link to="/" class="text-white hover:text-gray-300 px-4 py-2">
        Início
      </router-link>
      <template v-if="currentUser">
        <router-link
          to="/profile"
          class="text-white hover:text-gray-300 px-4 py-2"
        >
          Perfil
        </router-link>
        <router-link
          to="/create-pet"
          class="text-white hover:text-gray-300 px-4 py-2"
        >
          Anunciar Pet
        </router-link>
        <button
          @click="handleLogout"
          class="text-white hover:text-gray-300 px-4 py-2"
        >
          Sair
        </button>
      </template>
      <template v-else>
        <router-link
          to="/login"
          class="text-white hover:text-gray-300 px-4 py-2"
        >
          Entrar
        </router-link>
        <router-link
          to="/register"
          class="text-white hover:text-gray-300 px-4 py-2"
        >
          Cadastrar
        </router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
/* Navbar Desktop */
.md\:flex {
  display: flex;
}

/* Navbar Mobile */
.md\:hidden {
  display: none;
}

.bg-green-500 {
  background-color: #4caf50; /* Cor de fundo */
}

.text-white {
  color: white;
}

.hover\:text-gray-300:hover {
  color: #d1d5db; /* Cor do texto ao passar o mouse */
}

.absolute {
  position: absolute;
}

.top-16 {
  top: 4rem; /* Espaço abaixo da navbar */
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

/* Responsividade: Exibe a navegação normalmente em telas maiores e oculta o menu hamburguer em telas grandes */
@media (min-width: 768px) {
  .md\:flex {
    display: flex;
  }

  .md\:hidden {
    display: none;
  }
}
</style>