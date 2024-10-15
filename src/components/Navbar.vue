<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore'
import { supabase } from '../supabase';

const isOpen = ref(false);
const router = useRouter();
const userStore = useUserStore();

const user = computed(() => userStore.user);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const logout = async () => {
    try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    userStore.logout();
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

onMounted(async () => {
  // Check for logged-in user from Supabase or store
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (session) {
      userStore.setUser(session.user); // Update store if needed
    } else {
      userStore.logout();
    }
  } catch (err) {
    console.error('Error fetching session:', err);
  }
});
</script>

<template>
    <div id="app">
     <nav class="navbar" role="navigation" aria-label="main navigation">
   <div class="navbar-brand">
     <router-link class="nav-bar-item" to="/"></router-link>
         <h3 class="title is-3 has-text-white m-5">Steps on the map</h3>
 
 <!-- boton hamburguesa-->
     <a role="button" class="navbar-burger" :class="{'is-active': isOpen}" @click="toggleMenu" aria-label="menu" :aria-expanded="isOpen">
       <span aria-hidden="true"></span>
       <span aria-hidden="true"></span>
       <span aria-hidden="true"></span>
       <span aria-hidden="true"></span>
     </a>
   </div>
 
   <div id="navbarBasicExample" class="navbar-menu" :class="{'is-active': isOpen}">
     <div class="navbar-start">
      <router-link class="nav-bar-item has-text-white" to="/" style="margin-top: 40px; margin-right: 20px;">Home</router-link>
      <router-link class="nav-bar-item has-text-white" to="/profile" style="margin-top: 40px;">Profile</router-link>
   </div>
 
     <div class="navbar-end">
       <div class="navbar-item">
         <template v-if="user">
           <div class="navbar-item has-dropdown is-hoverable">
         <a class="navbar-link">
           {{ user.displayName || user.email }}
         </a>
 
         <div class="navbar-dropdown">
           <router-link class="navbar-item" to="/wishlist">
             Wishlist
           </router-link>
           <a class="navbar-item is-selected" @click="logout">
             Logout
           </a>
         </div>
       </div>
         </template>
         <template v-else>
           <div class="buttons">
             <router-link class="button is-primary" to="/register">
                 <strong>Sign up</strong>
             </router-link>
             <router-link class="button is-ligth" to="/login">
                 <strong>Login</strong>
             </router-link>
         </div>
         </template>
       </div>
     </div>
   </div>
 </nav>
     </div>
 </template>