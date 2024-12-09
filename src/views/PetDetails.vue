<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc, collection, addDoc, updateDoc, getDocs } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pet = ref<any>(null)
const owner = ref<any>(null)
const loading = ref(true)
const showAdoptionForm = ref(false)
const adoptionRequests = ref<any[]>([])
const adoptionReason = ref('')
const adopterName = ref('')
const adopterEmail = ref('')
const adopterPhone = ref('')
const error = ref('')

// Carrega os detalhes do pet e do dono
const fetchPetDetails = async () => {
  try {
    const petDoc = await getDoc(doc(db, 'pets', route.params.id as string))
    if (petDoc.exists()) {
      pet.value = { id: petDoc.id, ...petDoc.data() }
      const ownerDoc = await getDoc(doc(db, 'users', pet.value.userId))
      owner.value = ownerDoc.data()

      // Carregar pedidos de adoção
      const requestsSnapshot = await getDocs(collection(db, `pets/${pet.value.id}/adoptionRequests`))
      adoptionRequests.value = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error)
  } finally {
    loading.value = false
  }
}

// Envia a solicitação de adoção
const handleAdoptionRequest = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    await addDoc(collection(db, `pets/${pet.value.id}/adoptionRequests`), {
      adopterName: adopterName.value,
      adopterEmail: adopterEmail.value,
      adopterPhone: adopterPhone.value,
      reason: adoptionReason.value,
      status: 'pending',
      createdAt: new Date()
    })

    showAdoptionForm.value = false
    adopterName.value = ''
    adopterEmail.value = ''
    adopterPhone.value = ''
    adoptionReason.value = ''
    fetchPetDetails() // Atualiza a lista de pedidos
  } catch (e) {
    error.value = 'Erro ao enviar solicitação. Tente novamente.'
  }
}

// Altera o status de disponibilidade do pet
const toggleAvailability = async () => {
  try {
    const newStatus = pet.value.status === 'available' ? 'unavailable' : 'available'
    await updateDoc(doc(db, 'pets', pet.value.id), { status: newStatus })
    pet.value.status = newStatus
  } catch (e) {
    error.value = 'Erro ao alterar o status. Tente novamente.'
  }
}

onMounted(fetchPetDetails)
</script>

<template>
  <div v-if="loading" class="text-center py-8">
    <p class="text-gray-600">Carregando...</p>
  </div>

  <div v-else-if="pet" class="max-w-4xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img :src="pet.imageUrl" :alt="pet.name" class="w-full h-96 object-cover rounded-lg shadow-lg" />
      </div>

      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-primary">{{ pet.name }}</h1>
          <p class="text-gray-600">{{ pet.breed }} • {{ pet.age }} anos</p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-2">Sobre {{ pet.name }}</h2>
          <p class="text-gray-700">{{ pet.description }}</p>
        </div>

        <!-- Informações do dono -->
        <div v-if="owner" class="card">
          <h2 class="text-xl font-semibold mb-2">Informações do Dono</h2>
          <p><strong>Nome:</strong> {{ owner.name }}</p>
          <p><strong>Telefone:</strong> {{ owner.phone }}</p>
        </div>

        <!-- Botão para alterar o status do pet -->
        <div v-if="authStore.user?.uid === pet.userId">
          <button @click="toggleAvailability" class="btn-primary w-full">
            Alterar Status ({{ pet.status === 'available' ? 'Disponível' : 'Indisponível' }})
          </button>

          <!-- Lista de pedidos de adoção -->
          <div v-if="adoptionRequests.length" class="card">
            <h2 class="text-xl font-semibold mb-2">Pedidos de Adoção</h2>
            <ul class="space-y-4">
              <li v-for="request in adoptionRequests" :key="request.id" class="border rounded-md p-4">
                <p><strong>Nome:</strong> {{ request.adopterName }}</p>
                <p><strong>Email:</strong> {{ request.adopterEmail }}</p>
                <p><strong>Telefone:</strong> {{ request.adopterPhone }}</p>
                <p><strong>Motivo:</strong> {{ request.reason }}</p>
              </li>
            </ul>
          </div>
        </div>

        <!-- Opções de adoção para quem não é o dono -->
        <div v-else>
          <!-- Botão de WhatsApp -->
          <a v-if="owner && owner.phone" :href="`https://wa.me/+55${owner.phone.replace(/\D/g, '')}`" target="_blank"
            class="btn-primary w-full">
            Quero Adotar via WhatsApp
          </a>

          <!-- Formulário de adoção -->
          <div v-if="showAdoptionForm" class="card">
            <h3 class="text-lg font-semibold mb-4">Solicitar Adoção</h3>
            <form @submit.prevent="handleAdoptionRequest">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nome</label>
                  <input v-model="adopterName" required type="text" class="input-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input v-model="adopterEmail" required type="email" class="input-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Telefone</label>
                  <input v-model="adopterPhone" required type="tel" class="input-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Por que você quer adotar {{ pet.name }}?</label>
                  <textarea v-model="adoptionReason" required rows="4" class="input-primary"></textarea>
                </div>
                <p v-if="error" class="text-red-500">{{ error }}</p>
                <div class="flex justify-end space-x-4">
                  <button type="button" @click="showAdoptionForm = false" class="btn-primary bg-gray-500">
                    Cancelar
                  </button>
                  <button type="submit" class="btn-primary">Enviar</button>
                </div>
              </div>
            </form>
          </div>

          <!-- Botão para abrir o formulário -->
          <button v-else @click="showAdoptionForm = true" class="btn-primary w-full">
            Quero Adotar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.btn-primary {
  background-color: #009951;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #007c40;
}
.input-primary {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
