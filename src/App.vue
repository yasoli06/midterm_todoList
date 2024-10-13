<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue';
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>
