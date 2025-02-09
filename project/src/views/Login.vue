<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/');
  } catch (e: any) {
    error.value = 'Email ou senha incorretos';
  }
};
</script>

<template>
  <div class="flex justify-center items-center min-h-[80vh]">
    <div class="flex flex-col md:flex-row w-full max-w-4xl mx-auto">
      <!-- Logo Section (Mobile: Above Form) -->
      <div
        class="w-full md:w-1/2 flex justify-center items-center bg-card rounded-t-lg md:rounded-l-lg mb-6 md:mb-0"
      >
        <div class="text-center p-4">
          <img
            src="../assets/logo.png"
            alt="Logo"
            class="w-32 h-32 mx-auto mb-4"
          />
          <h1 class="text-2xl font-bold text-primary">Adote um Amigo</h1>
          <p class="text-gray-600 hidden md:block">
            Encontre seu companheiro perfeito
          </p>
          <!-- Hidden in Mobile -->
        </div>
      </div>

      <!-- Form Section -->
      <div class="w-full md:w-1/2 card md:rounded-l-none">
        <h2 class="text-2xl font-bold text-primary mb-6">Entrar</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              v-model="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              v-model="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            />
          </div>
          <div class="text-right">
            <router-link
              to="/recover-password"
              class="text-sm text-primary hover:text-primary-hover"
            >
              Esqueceu sua senha?
            </router-link>
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <button type="submit" class="btn-primary w-full">Entrar</button>
          <p class="text-center text-sm">
            Não tem uma conta?
            <router-link
              to="/register"
              class="text-primary hover:text-primary-hover"
            >
              Cadastre-se
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
  .md\:w-1\/2 {
    width: 100%; /* Form and logo take full width */
  }

  /* Ensure logo section is above the form in mobile */
  .flex-col {
    flex-direction: column; /* Column layout for mobile */
  }

  /* Hide slogan text in mobile */
  .md\:block {
    display: none;
  }
}

/* Web Layout */
@media (min-width: 768px) {
  .md\:flex-row {
    flex-direction: row; /* Ensure it's row layout for larger screens */
  }
  .md\:order-none {
    order: 0;
  }
}
</style>
