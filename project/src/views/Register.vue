<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';

  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    await updateProfile(user, {
      displayName: name.value,
    });

    await setDoc(doc(db, 'users', user.uid), {
      name: name.value,
      email: email.value,
      phone: phone.value,
      createdAt: new Date(),
    });

    router.push('/');
  } catch (e: any) {
    console.error('Erro no registro:', e);
    error.value =
      e.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso'
        : 'Erro ao criar conta. Tente novamente.';
  } finally {
    loading.value = false;
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
            Junte-se a nós e ajude a encontrar lares para pets
          </p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="w-full md:w-1/2 card md:rounded-l-none">
        <h2 class="text-2xl font-bold text-primary mb-6">Criar Conta</h2>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              v-model="name"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            />
          </div>
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
            <label class="block text-sm font-medium text-gray-700"
              >Telefone</label
            >
            <input
              type="tel"
              v-model="phone"
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
              minlength="6"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
            />
            <p class="text-sm text-gray-500 mt-1">Mínimo de 6 caracteres</p>
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
          <p class="text-center text-sm">
            Já tem uma conta?
            <router-link
              to="/login"
              class="text-primary hover:text-primary-hover"
            >
              Faça login
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
