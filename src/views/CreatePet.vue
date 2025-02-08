<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePetsStore } from '../stores/pets';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();
const petsStore = usePetsStore();

interface Estado {
  sigla: string;
  nome: string;
}
interface Cidade {
  nome: string;
}

const petData = ref({
  name: '',
  species: '',
  breed: '',
  age: '',
  size: '',
  description: '',
  city: '',
  state: '',
  imageUrl: '', // Changed from File to URL string
});

const error = ref('');
const errors = ref({
  name: '',
  breed: '',
  age: '',
  description: '',
  imageUrl: '',
});
const estados = ref<Estado[]>([]);
const cidades = ref<Cidade[]>([]);

const validateForm = () => {
  errors.value = {
    name: '',
    breed: '',
    age: '',
    description: '',
    imageUrl: '',
  };
  let isValid = true;

  // Validate name (2-30 characters)
  if (petData.value.name.length < 2 || petData.value.name.length > 30) {
    errors.value.name = 'O nome deve ter entre 2 e 30 caracteres';
    isValid = false;
  }

  // Validate breed (2-30 characters)
  if (petData.value.breed.length < 2 || petData.value.breed.length > 30) {
    errors.value.breed = 'A raça deve ter entre 2 e 30 caracteres';
    isValid = false;
  }

  // Validate age (number between 0 and 30)
  const age = parseInt(petData.value.age);
  if (isNaN(age) || age < 0 || age > 30) {
    errors.value.age = 'A idade deve ser um número entre 0 e 30';
    isValid = false;
  }

  // Validate description (10-500 characters)
  if (petData.value.description.length < 10 || petData.value.description.length > 500) {
    errors.value.description = 'A descrição deve ter entre 10 e 500 caracteres';
    isValid = false;
  }

  // Validate image URL
  if (!petData.value.imageUrl) {
    errors.value.imageUrl = 'A URL da imagem é obrigatória';
    isValid = false;
  } else {
    try {
      new URL(petData.value.imageUrl);
    } catch {
      errors.value.imageUrl = 'URL da imagem inválida';
      isValid = false;
    }
  }

  return isValid;
};

const fetchEstados = async () => {
  try {
    const response = await axios.get(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
    );
    estados.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
  }
};

const fetchCidades = async (estadoSigla: string) => {
  try {
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios`
    );
    cidades.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
  }
};

const handleSubmit = async () => {
  error.value = '';
  
  if (!validateForm()) {
    error.value = 'Por favor, corrija os erros no formulário';
    return;
  }

  try {
    const petDataToSend = {
      ...petData.value,
      userId: authStore.user?.uid,
      age: parseInt(petData.value.age),
    };

    await petsStore.createPet(petDataToSend);
    router.push('/profile');
  } catch (e) {
    error.value = 'Erro ao criar anúncio. Tente novamente.';
  }
};

onMounted(() => {
  fetchEstados();
});
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
            maxlength="30"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ petData.name.length }}/30</p>
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
            maxlength="30"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            :class="{ 'border-red-500': errors.breed }"
          />
          <p v-if="errors.breed" class="text-red-500 text-sm mt-1">{{ errors.breed }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ petData.breed.length }}/30</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Idade (anos)</label>
          <input
            v-model="petData.age"
            type="number"
            required
            min="0"
            max="30"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            :class="{ 'border-red-500': errors.age }"
          />
          <p v-if="errors.age" class="text-red-500 text-sm mt-1">{{ errors.age }}</p>
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
          <label class="block text-sm font-medium text-gray-700">Estado</label>
          <select
            v-model="petData.state"
            @change="fetchCidades(petData.state)"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          >
            <option value="">Selecione</option>
            <option
              v-for="estado in estados"
              :key="estado.sigla"
              :value="estado.sigla"
            >
              {{ estado.nome }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Cidade</label>
          <select
            v-model="petData.city"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          >
            <option value="">Selecione</option>
            <option
              v-for="cidade in cidades"
              :key="cidade.nome"
              :value="cidade.nome"
            >
              {{ cidade.nome }}
            </option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="petData.description"
            rows="4"
            required
            maxlength="500"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            :class="{ 'border-red-500': errors.description }"
          ></textarea>
          <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ petData.description.length }}/500</p>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">URL da Imagem</label>
          <input
            v-model="petData.imageUrl"
            type="url"
            required
            placeholder="https://exemplo.com/imagem.jpg"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            :class="{ 'border-red-500': errors.imageUrl }"
          />
          <p v-if="errors.imageUrl" class="text-red-500 text-sm mt-1">{{ errors.imageUrl }}</p>
          <img
            v-if="petData.imageUrl"
            :src="petData.imageUrl"
            alt="Preview"
            class="mt-2 h-48 w-auto object-cover rounded"
            @error="errors.imageUrl = 'Não foi possível carregar a imagem'"
          />
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <div class="flex justify-end space-x-4">
        <router-link
          to="/profile"
          class="btn-primary bg-gray-500 hover:bg-gray-600"
        >
          Cancelar
        </router-link>
        <button type="submit" class="btn-primary" :disabled="petsStore.loading">
          {{ petsStore.loading ? 'Criando...' : 'Criar Anúncio' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-md;
}

.btn-primary {
  @apply bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>