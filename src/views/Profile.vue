<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { useNotificationsStore } from '../stores/notifications';
import { useAdoptionsStore } from '../stores/adoptions';
import { usePetsStore } from '../stores/pets';
import PetCard from '../components/PetCard.vue';
import { isValidPhone, isValidName, formatPhone } from '../utils/validators';
import { Trash2, Pause, Play, ChevronDown } from 'lucide-vue-next';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';

const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const adoptionsStore = useAdoptionsStore();
const petsStore = usePetsStore();
const myPets = ref<any[]>([]);
const adoptedPets = ref<any[]>([]);
const notifications = ref<any[]>([]);
const myAdoptionRequests = ref<any[]>([]);
const loading = ref(true);
const saveLoading = ref(false);
const showDeleteModal = ref(false);
const petToDelete = ref<any>(null);

// Profile fields
const editingProfile = ref(false);
const userName = ref(authStore.userData?.name || '');
const userEmail = ref(authStore.userData?.email || '');
const userPhone = ref(authStore.userData?.phone || '');
const formErrors = ref({
  name: '',
  phone: '',
});
const updateSuccess = ref(false);

const validateForm = () => {
  let isValid = true;
  formErrors.value = {
    name: '',
    phone: '',
  };

  if (!isValidName(userName.value)) {
    formErrors.value.name = 'Nome deve ter entre 2 e 50 caracteres';
    isValid = false;
  }

  if (!isValidPhone(userPhone.value)) {
    formErrors.value.phone = 'Telefone inválido';
    isValid = false;
  }

  return isValid;
};

const saveProfile = async () => {
  if (!validateForm() || !authStore.user) return;
  
  saveLoading.value = true;
  try {
    const userRef = doc(db, 'users', authStore.user.uid);
    const updateData = {
      name: userName.value,
      phone: userPhone.value,
    };

    await updateDoc(userRef, updateData);
    
    // Update local state
    if (authStore.userData) {
      authStore.userData.name = userName.value;
      authStore.userData.phone = userPhone.value;
    }

    editingProfile.value = false;
    updateSuccess.value = true;
    setTimeout(() => {
      updateSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Error saving profile:', error);
    formErrors.value.name = 'Erro ao salvar perfil. Tente novamente.';
  } finally {
    saveLoading.value = false;
  }
};

const startEditing = () => {
  userName.value = authStore.userData?.name || '';
  userPhone.value = authStore.userData?.phone || '';
  editingProfile.value = true;
};

const cancelEditing = () => {
  userName.value = authStore.userData?.name || '';
  userPhone.value = authStore.userData?.phone || '';
  editingProfile.value = false;
  formErrors.value = { name: '', phone: '' };
};

const confirmDelete = (pet: any) => {
  petToDelete.value = pet;
  showDeleteModal.value = true;
};

const deletePet = async () => {
  if (!petToDelete.value) return;
  
  try {
    await petsStore.deletePet(petToDelete.value.id);
    myPets.value = myPets.value.filter(p => p.id !== petToDelete.value.id);
    showDeleteModal.value = false;
  } catch (error) {
    console.error('Erro ao excluir pet:', error);
  }
};

const togglePetStatus = async (pet: any) => {
  try {
    const newStatus = pet.status === 'paused' ? 'available' : 'paused';
    await petsStore.updatePetStatus(pet.id, newStatus);
    pet.status = newStatus;
  } catch (error) {
    console.error('Erro ao atualizar status do pet:', error);
  }
};

const deleteNotification = async (notificationId: string) => {
  try {
    await notificationsStore.deleteNotification(notificationId);
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
  }
};

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

        <!-- Success Message -->
        <div
          v-if="updateSuccess"
          class="mb-4 p-4 bg-green-100 text-green-700 rounded-md"
        >
          Perfil atualizado com sucesso!
        </div>

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
              :value="userEmail"
              type="email"
              disabled
              class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm cursor-not-allowed"
            />
            <p class="text-sm text-gray-500 mt-1">O email não pode ser alterado</p>
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
              @click="cancelEditing"
              class="btn-secondary"
              :disabled="saveLoading"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="saveLoading"
            >
              {{ saveLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="border-b pb-2">
              <p class="text-sm text-gray-600">Nome</p>
              <p class="font-medium">{{ authStore.userData?.name }}</p>
            </div>
            
            <div class="border-b pb-2">
              <p class="text-sm text-gray-600">Email</p>
              <p class="font-medium">{{ authStore.userData?.email }}</p>
            </div>
            
            <div class="border-b pb-2">
              <p class="text-sm text-gray-600">Telefone</p>
              <p class="font-medium">{{ formatPhone(authStore.userData?.phone) }}</p>
            </div>
          </div>
          
          <button @click="startEditing" class="btn-primary mt-4">
            Editar Perfil
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <Disclosure v-if="notifications.length > 0" v-slot="{ open }" as="div" class="mb-6">
        <DisclosureButton class="card w-full flex justify-between items-center p-4">
          <h2 class="text-xl font-semibold">Notificações</h2>
          <ChevronDown
            class="h-5 w-5 transform transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          />
        </DisclosureButton>
        <DisclosurePanel class="mt-2">
          <div class="space-y-4">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-4 rounded-lg bg-white shadow flex items-center justify-between"
              :class="{ 'bg-gray-50': notification.read }"
            >
              <div class="flex-1">
                <p class="text-gray-800">{{ notification.message }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ new Date(notification.createdAt.toDate()).toLocaleDateString() }}
                </p>
              </div>
              <button
                @click="deleteNotification(notification.id)"
                class="ml-4 p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Excluir notificação"
              >
                <Trash2 class="h-5 w-5" />
              </button>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>

      <!-- Pets for Adoption -->
      <Disclosure v-slot="{ open }" as="div" class="mb-6">
        <DisclosureButton class="card w-full flex justify-between items-center p-4">
          <h2 class="text-xl font-semibold">Meus Pets para Adoção</h2>
          <ChevronDown
            class="h-5 w-5 transform transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          />
        </DisclosureButton>
        <DisclosurePanel class="mt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="pet in myPets" :key="pet.id" class="relative">
              <PetCard :pet="pet" />
              <div class="absolute top-2 right-2 flex gap-2">
                <button
                  @click="togglePetStatus(pet)"
                  class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                  :title="pet.status === 'paused' ? 'Reativar anúncio' : 'Pausar anúncio'"
                >
                  <Play v-if="pet.status === 'paused'" class="w-5 h-5 text-green-500" />
                  <Pause v-else class="w-5 h-5 text-yellow-500" />
                </button>
                <button
                  @click="confirmDelete(pet)"
                  class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                  title="Excluir anúncio"
                >
                  <Trash2 class="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>

      <!-- Adopted Pets -->
      <Disclosure v-slot="{ open }" as="div" class="mb-6">
        <DisclosureButton class="card w-full flex justify-between items-center p-4">
          <h2 class="text-xl font-semibold">Pets Adotados</h2>
          <ChevronDown
            class="h-5 w-5 transform transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          />
        </DisclosureButton>
        <DisclosurePanel class="mt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PetCard v-for="pet in adoptedPets" :key="pet.id" :pet="pet" />
          </div>
        </DisclosurePanel>
      </Disclosure>

      <!-- My Adoption Requests -->
      <Disclosure v-if="myAdoptionRequests.length > 0" v-slot="{ open }" as="div" class="mb-6">
        <DisclosureButton class="card w-full flex justify-between items-center p-4">
          <h2 class="text-xl font-semibold">Meus Pedidos de Adoção</h2>
          <ChevronDown
            class="h-5 w-5 transform transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          />
        </DisclosureButton>
        <DisclosurePanel class="mt-2">
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
        </DisclosurePanel>
      </Disclosure>
    </div>
  </div>

  <!-- Modal de confirmação de exclusão -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h3 class="text-xl font-bold mb-4">Confirmar Exclusão</h3>
      <p>Tem certeza que deseja excluir o anúncio de {{ petToDelete?.name }}?</p>
      <p class="text-sm text-gray-600 mt-2">Esta ação não pode ser desfeita.</p>
      <div class="flex justify-end space-x-4 mt-6">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          @click="deletePet"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.card {
  @apply bg-white p-6 rounded-lg shadow-md;
}
</style>