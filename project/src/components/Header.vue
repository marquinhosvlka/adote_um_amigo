<template>
<header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <button class="sm:hidden p-2">
          <Menu class="h-6 w-6 text-gray-600" />
        </button>
        <div class="flex items-center space-x-2">
          <PawPrint class="h-8 w-8 text-purple-600" />
          <span class="text-xl font-bold text-gray-900">Pet Amigo</span>
        </div>
      </div>

      <nav class="hidden sm:flex space-x-8">
        <a href="/pets" class="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
          <Heart class="h-5 w-5" />
          <span>Adotar</span>
        </a>
        <a href="/my-pets" class="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
          <PawPrint class="h-5 w-5" />
          <span>Meus Pets</span>
        </a>
      </nav>

      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-600 hover:text-gray-900">
          <Bell class="h-6 w-6" />
        </button>
        <button class="p-2 text-gray-600 hover:text-gray-900">
          <UserCircle class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</header>
</template>

<script setup lang="ts">
import { Menu, Heart, PawPrint, UserCircle, Bell } from 'lucide-vue-next';
</script>