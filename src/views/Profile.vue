<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore'; // Asumiendo que userStore es donde gestionas los datos del usuario
import { supabase } from '@/supabase'; // Asumiendo que tienes supabase configurado

const userStore = useUserStore(); // Obtener la referencia al store del usuario
const defaultAvatar = '/src/assets/mochilero.png'; 

// Función para obtener el perfil del usuario autenticado
const getUserProfile = async () => {
  const { data: session, error } = await supabase.auth.getSession();

  if (error || !session) {
    console.error('Error obteniendo la sesión o el usuario no está autenticado');
    return null; // Si no hay sesión o hay un error, retornar null
  }

  // Obtener los datos del usuario (en este caso, el id del usuario)
  const user = session.user;

  if (!user || !user.id) {
    return null;
  }

  return user; // Retornar los datos del usuario
};

// Función para cargar el perfil del usuario en el store
const fetchUserProfile = async () => {
  const user = await getUserProfile();
  if (user) {
    // Aquí puedes obtener el perfil desde la base de datos, si es necesario
    // Se asume que el store ya contiene un perfil o puede actualizarlo
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error al cargar el perfil:', error);
    } else {
      userStore.setUserProfile(profile); // Guardar el perfil en el store
    }
  }
};

// Se ejecuta cuando el componente se monta
onMounted(() => {
  fetchUserProfile();
});
</script>

<template>
  <div class="container profile-container">
    <!-- Encabezado del perfil -->
    <div class="profile-header has-text-centered">
      <div class="profile-avatar">
        <!-- Mostrar la imagen de avatar desde la carpeta assets -->
        <img :src="userStore.user?.avatar_url || defaultAvatar" alt="User Avatar" class="avatar-img" />
      </div>
      <h1 class="title is-3">Explorer: <span class="has-text-weight-bold">{{ userStore.user?.name }}</span></h1>
    </div>

    <!-- Detalles del perfil -->
    <div class="profile-details">
      <div class="box">
        <!-- Enlace a la wishlist -->
        <p v-if="userStore.wishlist.length > 0">
          <router-link :to="{ name: 'wishlist' }" class="button is-link">
            Ver mi wishlist
          </router-link>
        </p>
        <!-- Mensaje cuando no hay países en la wishlist -->
        <p v-else>
          <span class="tag is-danger">¡No tienes ningún país en tu wishlist todavía!</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Espaciado extra entre el navbar y el contenido del perfil */
.profile-container {
  margin-top: 80px; /* Aumenta el espacio entre el navbar y el contenido del perfil */
  padding: 100px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-img {
  border-radius: 50%;
  width: 150px;
  height: 150px;
}

.profile-header {
  margin-bottom: 20px; /* Puedes ajustar este margen si deseas más espacio */
}

.profile-details .box {
  padding: 20px;
}

.has-text-centered {
  text-align: center;
}
</style>