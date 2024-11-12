<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePetsStore } from '../stores/pets'


const router = useRouter()
const authStore = useAuthStore()
const petsStore = usePetsStore()

const petData = ref({
  name: '',
  species: '',
  breed: '',
  age: '',
  size: '',
  description: '',
  city: '',
  state: '',
})

const imageFile = ref<File | null>(null)
const previewUrl = ref('')
const error = ref('')

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
    previewUrl.value = URL.createObjectURL(target.files[0])
  }
}

const handleSubmit = async () => {
  if (!imageFile.value) {
    error.value = 'Por favor, selecione uma imagem'
    return
  }

  try {
    const petDataToSend = {
      ...petData.value,
      userId: authStore.user?.uid,
      age: parseInt(petData.value.age)
    }

    await petsStore.createPet(petDataToSend, imageFile.value)
    router.push('/profile')
  } catch (e) {
    error.value = 'Erro ao criar anúncio. Tente novamente.'
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-primary mb-6">Anunciar um Pet</h1>
    
    <form @submit.prevent="handleSubmit" class="card space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome do Pet</label>
          <input
            v-model="petData.name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Espécie</label>
          <select
            v-model="petData.species"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          >
            <option value="">Selecione</option>
            <option value="Cachorro">Cachorro</option>
            <option value="Gato">Gato</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Raça</label>
          <input
            v-model="petData.breed"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Idade (anos)</label>
          <input
            v-model="petData.age"
            type="number"
            required
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Porte</label>
          <select
            v-model="petData.size"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          >
            <option value="">Selecione</option>
            <option value="Pequeno">Pequeno</option>
            <option value="Médio">Médio</option>
            <option value="Grande">Grande</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Cidade</label>
          <input
            v-model="petData.city"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Estado</label>
          <input
            v-model="petData.state"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="petData.description"
            rows="4"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Foto do Pet</label>
          <input
            type="file"
            accept="image/*"
            @change="handleImageChange"
            required
            class="mt-1 block w-full"
          />
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Preview"
            class="mt-2 h-48 w-auto object-cover rounded"
          />
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <div class="flex justify-end space-x-4">
        <router-link to="/profile" class="btn-primary bg-gray-500 hover:bg-gray-600">
          Cancelar
        </router-link>
        <button type="submit" class="btn-primary" :disabled="petsStore.loading">
          {{ petsStore.loading ? 'Criando...' : 'Criar Anúncio' }}
        </button>
      </div>
    </form>
  </div>
</template>
