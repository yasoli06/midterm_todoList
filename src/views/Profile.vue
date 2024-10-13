<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { supabaseClient } from '@/composables/useSupabase';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// Ref para la URL del avatar
const avatarUrl = ref('');

// Ref para almacenar los datos del usuario
const user = ref({});

// Obtener los datos del usuario cuando se monta el componente
onMounted(() => {
  user.value = userStore.user;
  if (user.value) {
    // Si el usuario tiene una imagen de avatar cargada, mostrarla
    if (user.value.avatar_url) {
      avatarUrl.value = user.value.avatar_url;
    }
  }
});

// Función para cargar el avatar
const uploadAvatar = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      // Subir imagen de avatar a Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('avatars')
        .upload(`public/${user.value.id}.jpg`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Obtener la URL de la imagen cargada
      const { publicURL, error: urlError } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(`public/${user.value.id}.jpg`);

      if (urlError) {
        throw urlError;
      }

      // Actualizar la URL del avatar en el estado del usuario
      avatarUrl.value = publicURL;

      // Guardar el avatar en el perfil del usuario en la base de datos
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({ avatar_url: publicURL })
        .eq('id', user.value.id);

      if (updateError) {
        throw updateError;
      }

      // Actualizar el estado del usuario en la store
      userStore.user.avatar_url = publicURL;
    } catch (err) {
      console.error('Error al cargar el avatar:', err);
    }
  }
};
</script>

<template>
    <div class="container">
      <div class="profile-header has-text-centered">
        <div class="profile-avatar">
          <!-- Avatar del usuario, se podrá cargar desde un input de tipo file -->
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="User Avatar"
            class="avatar-img"
          />
          <input
            v-else
            type="file"
            @change="uploadAvatar"
            class="avatar-input"
          />
          <p v-if="!avatarUrl" class="upload-avatar-text">
            Carga tu avatar
          </p>
        </div>
        <h1 class="title is-3">{{ user.name }}</h1>
      </div>
  
      <div class="profile-details">
        <div class="box">
          <p class="subtitle is-5">Correo electrónico: {{ user.email }}</p>
          <p v-if="user.wishlist && user.wishlist.length > 0">
            <router-link :to="{ name: 'wishlist' }" class="button is-link">
              Ver mi wishlist
            </router-link>
          </p>
          <p v-else>
            <span class="tag is-danger">¡No tienes ningún país en tu wishlist todavía!</span>
          </p>
        </div>
      </div>
    </div>
  </template>

<style scoped>
/* Estilos personalizados */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-avatar {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #ddd;
  margin: 0 auto 15px auto;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-input {
  display: none;
}

.upload-avatar-text {
  font-size: 16px;
  color: #555;
  margin-top: 10px;
}

.profile-details {
  text-align: center;
}

.profile-details .box {
  padding: 20px;
}

.profile-details p {
  margin: 15px 0;
}

.tag {
  margin-top: 20px;
  font-size: 16px;
}

.button.is-link {
  margin-top: 10px;
}
</style>