<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../firebase/config'
import { sendPasswordResetEmail } from 'firebase/auth'

const email = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const handleRecoverPassword = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''
  success.value = false

  try {
    await sendPasswordResetEmail(auth, email.value)
    success.value = true
  } catch (e: any) {
    error.value = 'Erro ao enviar email de recuperação. Verifique o email informado.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-[80vh]">
    <div class="flex flex-col md:flex-row w-full max-w-4xl mx-auto">
      <!-- Logo Section -->
      <div class="flex flex-col items-center justify-center w-full md:w-1/2 bg-card rounded-l-lg md:rounded-l-none mb-6 md:mb-0">
        <div class="text-center">
          <img src="../assets/logo.png" alt="Logo" class="w-32 h-32 mx-auto mb-4" />
          <h1 class="text-2xl font-bold text-primary">Adote um Amigo</h1>
          <p class="text-gray-600">Recupere o acesso à sua conta</p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="w-full md:w-1/2 card md:rounded-l-none px-4 py-6">
        <h2 class="text-2xl font-bold text-primary mb-6">Recuperar Senha</h2>

        <!-- Success message -->
        <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Email de recuperação enviado! Verifique sua caixa de entrada.
        </div>

        <!-- Password recovery form -->
        <form v-else @submit.prevent="handleRecoverPassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              v-model="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            />
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <button 
            type="submit" 
            class="btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? 'Enviando...' : 'Enviar Email de Recuperação' }}
          </button>
          <p class="text-center text-sm">
            Lembrou sua senha?
            <router-link to="/login" class="text-primary hover:text-primary-hover">
              Voltar para o login
            </router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile Layout */
@media (max-width: 768px) {
  /* Ensure logo section is above the form in mobile */
  .flex-col {
    flex-direction: column; /* Stack items vertically on small screens */
  }

  /* Make the logo image full-width on mobile */
  .w-32 {
    width: 100%; /* Full width for the logo image */
  }

  /* Add some margin for spacing between elements */
  .mb-4 {
    margin-bottom: 1rem;
  }

  .mb-6 {
    margin-bottom: 1.5rem;
  }
}

/* Web Layout */
@media (min-width: 768px) {
  /* Align elements in a row for larger screens */
  .md\:flex-row {
    flex-direction: row; /* Align elements horizontally on larger screens */
  }

  /* Adjust spacing for large screens */
  .md\:rounded-l-none {
    border-radius: 0;
  }

  /* Ensure the left section (logo) only takes half of the screen */
  .md\:w-1\/2 {
    width: 50%;
  }
}
</style>
