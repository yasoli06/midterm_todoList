<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/userStore';
import { supabase } from '../supabase';

const userStore = useUserStore();

const newCountry = ref('');

// Función para validar UUID
function isUUID(id) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}
// Función para obtener los países del usuario desde la base de datos
const fetchCountries = async () => {
  if (!userStore.user?.id || !isUUID(userStore.user.id)) {
    console.error("Invalid user ID or user not authenticated");
    return;
  }

  const { data, error } = await supabase
    .from('wishlist')
    .select('id, name, visited')
    .eq('user_id', userStore.user.id); // Obtiene los países del usuario autenticado

  if (error) {
    console.error("Error fetching countries:", error);
  } else {
    console.log("Countries fetched:", data);
    userStore.loadWishlist(data); // Guardar los países en el store
  }
};

const addCountryToWishlist = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("Error fetching session or user not authenticated:", sessionError);
    return;
  }

  const user = session.user;
  console.log("User ID:", user.id);
  if (!user.id || !isUUID(user.id)) {
    console.error("Invalid User ID:", user.id);
    return;
  }

  // Verificar si el usuario ya existe en la tabla 'profiles'
  const { data: profileExists, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // Si el perfil no existe, crear uno nuevo en la tabla 'profiles'
  if (profileError || !profileExists) {
    const { data: newProfile, error: insertProfileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id, // El ID del usuario que viene de auth.users
        name: user.user_metadata?.name || user.email, // Usar el nombre del metadata, o el email como fallback
        avatar_url: user.user_metadata?.avatar_url || '', // URL del avatar si está disponible
      })
      .single();

    if (insertProfileError) {
      console.error("Error inserting profile in 'profiles' table:", insertProfileError);
      return;
    }
    console.log("Profile created successfully:", newProfile);
  } else {
    console.log("Profile already exists in 'profiles' table.");
  }
  console.log("Data being sent to wishlist:", {
  name: newCountry.value,
  user_id: user.id
});
  // Insertar el país en la wishlist si el nombre no está vacío
  if (newCountry.value.trim() !== '') {
  try {
    // Verifica si user.id es válido antes de hacer la inserción
    if (!user.id || !isUUID(user.id)) {
      throw new Error("Invalid User ID");
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert({ 
        name: newCountry.value,  // Nombre del país
        user_id: user.id  // El ID del usuario (debe ser un UUID válido)
      });

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
        console.log("Country inserted:", data);
        userStore.addCountry(data[0]); // Actualiza el estado del store con el nuevo país
        newCountry.value = ''; // Limpiar el campo después de agregar
      } else {
        console.error("No data returned from insert.");
      }
  } catch (err) {
    console.error('Error adding country:', err);
  }
} else {
  console.log("Country name is empty.");
}
};

const toggleVisitedStatus = async (id) => {
  try {
    const country = userStore.getCountryById(id); // Obtén el país desde la store
    if (!country) {
      throw new Error('Country not found');
    }

    // Actualiza el estado en la base de datos
    const { data, error } = await supabase
      .from('wishlist')
      .update({ visited: !country.visited }) // Actualiza el campo 'visited'
      .eq('id', id)
      .select();

    if (error) throw error;

    userStore.toggleVisited(id); // Actualiza localmente en el store
  } catch (err) {
    console.error('Error al actualizar el estado del país:', err);
  }
};

// Eliminar país de la lista de deseos
const removeCountryFromWishlist = async (id) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', id);

    if (error) throw error;

    userStore.removeCountry(id); // Elimina el país de la store localmente
  } catch (err) {
    console.error('Error al eliminar el país:', err);
  }
};

// Se llama a `fetchCountries` cuando el componente se monta
onMounted(() => {
  fetchCountries();
});
</script>

<template>
  <div class="wishlist-container box">
    <!-- Título centralizado -->
    <h1 class="title has-text-centered">Countries to Visit</h1>

    <!-- Campo para añadir país -->
    <div class="add-country field is-grouped mb-5">
      <div class="control is-expanded">
        <input
          class="input"
          type="text"
          placeholder="Add country to your wishlist"
          v-model="newCountry"
        />
      </div>
      <div class="control">
        <button @click="addCountryToWishlist" class="button is-primary">Add</button>
      </div>
    </div>

    <!-- Lista de países -->
    <div class="countries">
      <div v-for="country in userStore.wishlist" :key="country.id" class="box country-item">
        
        <!-- Edición del nombre del país
        <span v-if="!country.isEditing" class="country-name">{{ country.name }}</span>
        <input
          v-if="country.isEditing"
          v-model="country.editName"
          @blur="saveCountryEdit(country.id)"
          class="input"
          type="text"
          placeholder="Edit country name"
        /> -->

        <!-- Botones para editar el nombre -->
        <!-- <button @click="editCountryName(country)" class="button is-light is-small">
          <span class="icon">
            <i class="fas fa-pencil-alt"></i>
          </span>
          Edit
        </button> -->

        <!-- Botones para estado de visitado/no visitado -->
        <div class="status-buttons buttons">
          <button
            @click="toggleVisitedStatus(country.id)"
            :class="['button', { 'is-success': country.visited, 'is-light': !country.visited }]"
          >
            Visited
          </button>
          <button
            @click="toggleVisitedStatus(country.id)"
            :class="['button', { 'is-danger': !country.visited, 'is-light': country.visited }]"
          >
            Not Visited
          </button>

          <!-- Botón de eliminar país -->
          <button @click="removeCountryFromWishlist(country.id)" class="button is-light">
            <span class="icon">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wishlist-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #333;
  border-radius: 10px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2em;
  color: #fff;
}

.add-country {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.country-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #444;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  color: #fff;
}

.status-buttons {
  display: flex;
  gap: 10px;
}

.status-buttons .button {
  min-width: 100px;
  text-align: center;
}
</style>