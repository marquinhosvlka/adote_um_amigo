<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <PawPrint class="h-12 w-12 text-purple-600" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Bem-vindo ao Pet Amigo
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Não tem uma conta?
        <router-link to="/register" class="font-medium text-purple-600 hover:text-purple-500">
          Cadastre-se gratuitamente
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
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
            <label for="password" class="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="show-password"
                v-model="showPassword"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label for="show-password" class="ml-2 block text-sm text-gray-900">
                Mostrar senha
              </label>
            </div>

            <div class="text-sm">
              <router-link to="/forgot-password" class="font-medium text-purple-600 hover:text-purple-500">
                Esqueceu sua senha?
              </router-link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isLoading" class="h-5 w-5 animate-spin" />
              <span v-else>Entrar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PawPrint, Loader2 } from 'lucide-vue-next';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  try {
    // Implement login logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Login:', { email: email.value, password: password.value });
  } finally {
    isLoading.value = false;
  }
};
</script>