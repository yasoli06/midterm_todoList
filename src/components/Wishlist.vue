<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { supabase } from '../supabase';

const userStore = useUserStore();

const newCountry = ref('');

const addCountryToWishlist = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("Error fetching session or user not authenticated:", sessionError);
    return;
  }
  const user = session.user;

 // Verificar si el usuario ya existe en la tabla 'users'
 const { data: userExists, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  // Si el usuario no existe, insertarlo en la tabla 'users'
  if (userError || !userExists) {
    const { data, error: insertUserError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || 'default_username', // Default username if missing
      })
      .single();

    if (insertUserError) {
      console.error("Error inserting user in 'users' table:", insertUserError);
      return;
    }
    console.log("User inserted successfully:", data);
  } else {
    console.log("User already exists in 'users' table.");
  }

  // Insertar el país en la wishlist si el nombre no está vacío
  if (newCountry.value.trim() !== '') {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ name: newCountry.value, user_id: user.id });

      if (error) {
        throw error;
      }

      userStore.addCountry(data[0]); // Actualiza el estado del store con el nuevo país
      newCountry.value = ''; // Limpiar el campo después de agregar
    } catch (err) {
      console.error('Error adding country:', err);
    }
  } else {
    console.log("Country name is empty.");
  }
};

const toggleVisitedStatus = async (id) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .update({ visited: !userStore.getCountryById(id).visited })
      .eq('id', id)
      .select();

    if (error) throw error;

    userStore.toggleVisited(id); // Actualiza la store localmente
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
        <span class="country-name">{{ country.name }}</span>

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