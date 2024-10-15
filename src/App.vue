<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue';
import { useUserStore } from './stores/userStore';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  userStore.init();
});
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>
