<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/config'
import { signOut, onAuthStateChanged, User } from 'firebase/auth'

const router = useRouter()
const searchQuery = ref('') // Futura implementação da busca
const currentUser = ref<User | null>(null) // Inicializa como null para garantir que o estado reativo funcione

// Observa mudanças de estado de autenticação
onAuthStateChanged(auth, (user) => {
  currentUser.value = user
})

// Função de logout
const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

// Função para lidar com a mudança de pesquisa
const handleSearchChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  searchQuery.value = target.value
}
</script>

<template>
  <nav class="bg-green-500 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="text-white font-bold text-xl">
          Adote um Amigo
        </router-link>

        <!-- Barra de Pesquisa -->
        <div class="flex items-center space-x-2 ml-4">
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearchChange"
            placeholder="Buscar pets..."
            class="p-2 border rounded-full"
          />
          <button class="p-2 bg-white text-green-500 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M13.295 12.705a8 8 0 1 0-1.41 1.41l3.663 3.663a1 1 0 1 0 1.414-1.414l-3.667-3.663zM15 8a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <!-- Navegação de Links -->
        <div class="hidden md:flex space-x-4">
          <router-link to="/" class="text-white hover:text-gray-300">
            Início
          </router-link>
          <template v-if="currentUser">  
            <router-link to="/profile" class="text-white hover:text-gray-300">
              Perfil
            </router-link>
            <router-link to="/create-pet" class="text-white hover:text-gray-300">
              Anunciar Pet
            </router-link>
            <button @click="handleLogout" class="text-white hover:text-gray-300">
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
</template>

<style scoped>
/* Estilo para a barra superior (navbar) verde */
.bg-green-500 {
  background-color: #4CAF50; /* Cor verde para a barra */
}

/* Ajustes de estilo para a barra de pesquisa */
input[type="text"] {
  font-size: 16px;
  border-color: #ddd;
  transition: border-color 0.2s ease;
}

input[type="text"]:focus {
  border-color: #5c6ac4;
  outline: none;
}

/* Ajustes para o botão da lupa */
button {
  display: flex;
  align-items: center;
  justify-content: center;
}

button svg {
  fill: #4CAF50;
}

/* Ajustes para o layout da navbar */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.space-x-2 {
  margin-left: 0.5rem;
}

.ml-4 {
  margin-left: 1rem;
}
</style>
