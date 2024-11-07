<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pet = ref<any>(null)
const owner = ref<any>(null)
const loading = ref(true)
const showAdoptionForm = ref(false)
const adoptionReason = ref('')
const error = ref('')

const fetchPetDetails = async () => {
  try {
    const petDoc = await getDoc(doc(db, 'pets', route.params.id as string))
    if (petDoc.exists()) {
      pet.value = { id: petDoc.id, ...petDoc.data() }
      const ownerDoc = await getDoc(doc(db, 'users', pet.value.userId))
      owner.value = ownerDoc.data()
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error)
  } finally {
    loading.value = false
  }
}

const handleAdoptionRequest = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    await addDoc(collection(db, 'adoptionRequests'), {
      petId: pet.value.id,
      petName: pet.value.name,
      userId: authStore.user.uid,
      userName: authStore.userData.name,
      ownerId: pet.value.userId,
      reason: adoptionReason.value,
      status: 'pending',
      createdAt: new Date()
    })
    
    showAdoptionForm.value = false
    adoptionReason.value = ''
  } catch (e) {
    error.value = 'Erro ao enviar solicitação. Tente novamente.'
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
        <img
          :src="pet.imageUrl"
          :alt="pet.name"
          class="w-full h-96 object-cover rounded-lg shadow-lg"
        />
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

        <div class="card">
          <h2 class="text-xl font-semibold mb-2">Informações</h2>
          <ul class="space-y-2">
            <li><span class="font-medium">Espécie:</span> {{ pet.species }}</li>
            <li><span class="font-medium">Porte:</span> {{ pet.size }}</li>
          </ul>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-2">Contato</h2>
          <ul class="space-y-2" v-if="owner">
            <li><span class="font-medium">Nome:</span> {{ owner.name }}</li>
            <li><span class="font-medium">Telefone:</span> {{ owner.phone }}</li>
          </ul>
        </div>

        <div v-if="pet.status === 'available' && authStore.user?.uid !== pet.userId">
          <button
            v-if="!showAdoptionForm"
            @click="showAdoptionForm = true"
            class="btn-primary w-full"
          >
            Quero Adotar
          </button>

          <form v-else @submit.prevent="handleAdoptionRequest" class="card">
            <h3 class="text-lg font-semibold mb-4">Solicitar Adoção</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Por que você quer adotar {{ pet.name }}?
                </label>
                <textarea
                  v-model="adoptionReason"
                  required
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                ></textarea>
              </div>
              <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="showAdoptionForm = false"
                  class="btn-primary bg-gray-500 hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  Enviar Solicitação
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>