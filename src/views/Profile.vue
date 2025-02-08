<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { useNotificationsStore } from '../stores/notifications';
import { useAdoptionsStore } from '../stores/adoptions';
import PetCard from '../components/PetCard.vue';
import Notification from '../components/Notification.vue';
import { isValidEmail, isValidPhone, isValidName, formatPhone } from '../utils/validators';

const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const adoptionsStore = useAdoptionsStore();
const myPets = ref<any[]>([]);
const adoptedPets = ref<any[]>([]);
const notifications = ref<any[]>([]);
const myAdoptionRequests = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

// Profile fields
const editingProfile = ref(false);
const userName = ref(authStore.userData?.name || '');
const userEmail = ref(authStore.userData?.email || '');
const userPhone = ref(authStore.userData?.phone || '');
const formErrors = ref({
  name: '',
  email: '',
  phone: '',
});

const validateForm = () => {
  let isValid = true;
  formErrors.value = {
    name: '',
    email: '',
    phone: '',
  };

  if (!isValidName(userName.value)) {
    formErrors.value.name = 'Nome deve ter entre 2 e 50 caracteres';
    isValid = false;
  }

  if (!isValidEmail(userEmail.value)) {
    formErrors.value.email = 'Email inválido';
    isValid = false;
  }

  if (!isValidPhone(userPhone.value)) {
    formErrors.value.phone = 'Telefone inválido';
    isValid = false;
  }

  return isValid;
};

// Fetch user's pets (both for adoption and adopted)
const fetchPets = async () => {
  if (!authStore.user) return;

  try {
    // Fetch pets for adoption
    const forAdoptionQuery = query(
      collection(db, 'pets'),
      where('userId', '==', authStore.user.uid)
    );
    const forAdoptionSnapshot = await getDocs(forAdoptionQuery);
    myPets.value = forAdoptionSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch adopted pets
    const adoptedQuery = query(
      collection(db, 'pets'),
      where('adoptedBy', '==', authStore.user.uid)
    );
    const adoptedSnapshot = await getDocs(adoptedQuery);
    adoptedPets.value = adoptedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch adoption requests
    myAdoptionRequests.value = await adoptionsStore.fetchUserAdoptionRequests(
      authStore.user.uid
    );

    // Fetch notifications
    notifications.value = await notificationsStore.fetchUserNotifications(authStore.user.uid);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPets);
</script>

<template>
  <div class="container mx-auto px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-primary mb-6">Meu Perfil</h1>

      <!-- Profile Information -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">Informações Pessoais</h2>

        <form v-if="editingProfile" @submit.prevent="saveProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="userName"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              :class="{ 'border-red-500': formErrors.name }"
            />
            <p v-if="formErrors.name" class="text-red-500 text-sm mt-1">
              {{ formErrors.name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="userEmail"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              :class="{ 'border-red-500': formErrors.email }"
            />
            <p v-if="formErrors.email" class="text-red-500 text-sm mt-1">
              {{ formErrors.email }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              v-model="userPhone"
              type="tel"
              @input="userPhone = formatPhone(userPhone)"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
              :class="{ 'border-red-500': formErrors.phone }"
            />
            <p v-if="formErrors.phone" class="text-red-500 text-sm mt-1">
              {{ formErrors.phone }}
            </p>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="editingProfile = false"
              class="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Salvar
            </button>
          </div>
        </form>

        <div v-else>
          <div class="space-y-4">
            <p><strong>Nome:</strong> {{ userName }}</p>
            <p><strong>Email:</strong> {{ userEmail }}</p>
            <p><strong>Telefone:</strong> {{ formatPhone(userPhone) }}</p>
            <button @click="editingProfile = true" class="btn-primary">
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div v-if="notifications.length > 0" class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">Notificações</h2>
        <div class="space-y-4">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 rounded-lg bg-white shadow"
            :class="{ 'bg-gray-50': notification.read }"
          >
            <p class="text-gray-800">{{ notification.message }}</p>
            <p class="text-sm text-gray-500 mt-1">
              {{ new Date(notification.createdAt.toDate()).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pets for Adoption -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-primary mb-4">
          Meus Pets para Adoção
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetCard v-for="pet in myPets" :key="pet.id" :pet="pet" />
        </div>
      </div>

      <!-- Adopted Pets -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-primary mb-4">Pets Adotados</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetCard v-for="pet in adoptedPets" :key="pet.id" :pet="pet" />
        </div>
      </div>

      <!-- My Adoption Requests -->
      <div v-if="myAdoptionRequests.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-primary mb-4">Meus Pedidos de Adoção</h2>
        <div class="grid grid-cols-1 gap-4">
          <div
            v-for="request in myAdoptionRequests"
            :key="request.id"
            class="card p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold">{{ request.petData.name }}</h3>
                <p class="text-sm text-gray-600">
                  Solicitado em: {{ new Date(request.createdAt.toDate()).toLocaleDateString() }}
                </p>
                <p class="mt-2">
                  Status:
                  <span
                    :class="{
                      'text-yellow-600': request.status === 'pending',
                      'text-green-600': request.status === 'approved',
                      'text-red-600': request.status === 'rejected'
                    }"
                  >
                    {{ 
                      request.status === 'pending' ? 'Pendente' :
                      request.status === 'approved' ? 'Aprovado' :
                      'Recusado'
                    }}
                  </span>
                </p>
              </div>
              <router-link
                :to="`/pet/${request.petId}`"
                class="btn-primary text-sm"
              >
                Ver Pet
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors;
}

.card {
  @apply bg-white p-6 rounded-lg shadow-md;
}
</style>