<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <PawPrint class="h-12 w-12 text-purple-600" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Recuperar senha
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Lembrou sua senha?
        <router-link to="/login" class="font-medium text-purple-600 hover:text-purple-500">
          Voltar para login
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form v-if="!emailSent" class="space-y-6" @submit.prevent="handleForgotPassword">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
              <span v-else>Enviar instruções</span>
            </button>
          </div>
        </form>

        <div v-else class="text-center">
          <CheckCircle class="mx-auto h-12 w-12 text-green-500" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">Email enviado!</h3>
          <p class="mt-2 text-sm text-gray-600">
            Enviamos as instruções de recuperação de senha para {{ email }}. 
            Por favor, verifique sua caixa de entrada.
          </p>
          <div class="mt-6">
            <router-link
              to="/login"
              class="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Voltar para login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PawPrint, Loader2, CheckCircle } from 'lucide-vue-next';

const email = ref('');
const isLoading = ref(false);
const emailSent = ref(false);

const handleForgotPassword = async () => {
  isLoading.value = true;
  try {
    // Implement password recovery logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password recovery:', { email: email.value });
    emailSent.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>