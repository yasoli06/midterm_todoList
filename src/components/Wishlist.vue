<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { supabase } from '../supabase'

const userStore = useUserStore()

const newCountry = ref('')

// Función para validar UUID
const isUUID = id =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

// Verificar si el usuario está autenticado y retornar su perfil
const getUserProfile = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.error(
      'Error fetching session or user not authenticated:',
      sessionError,
    )
    return null
  }

  const user = session.user
  if (!user.id || !isUUID(user.id)) {
    console.error('Invalid User ID:', user.id)
    return null
  }

  return user
}

// Función para cargar los países de la wishlist del usuario
const fetchCountries = async () => {
  const user = await getUserProfile()
  if (!user) return
  await userStore.loadWishlist(user.id)
}
onMounted(() => {
  fetchCountries()
})

// Verificar si el perfil del usuario existe, y si no, crear uno
// const ensureUserProfile = async user => {
//   const { data: profileExists, error: profileError } = await supabase
//     .from('profiles')
//     .select('id')
//     .eq('id', user.id)
//     .single()

//   if (profileError) {
//     console.error('Error checking user profile:', profileError)
//     return false
//   }

//   if (!profileExists) {
//     // Crear el perfil solo si no existe
//     const { data: newProfile, error: insertProfileError } = await supabase
//       .from('profiles')
//       .insert({
//         id: user.id,
//         name: user.user_metadata?.name || user.email,
//         avatar_url: user.user_metadata?.avatar_url || '',
//       })
//       .single()

//     if (insertProfileError) {
//       console.error('Error inserting profile:', insertProfileError)
//       return false
//     }
//     console.log('Profile created successfully:', newProfile)
//   } else {
//     console.log('Profile already exists.')
//   }

//   return true
// }

// Función para añadir país a la wishlist
const addCountryToWishlist = async () => {
  const user = await getUserProfile()
  if (!user) return

  if (newCountry.value.trim() === '') {
    console.log('Country name is empty.')
    return
  }
  try {
    // const profileCreated = await ensureUserProfile(user)
    // if (!profileCreated) return

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        name: newCountry.value,
        user_id: user.id,
      })
      .select('*')

    if (error) throw error
    if (data && data.length > 0) {
      console.log('Country inserted:', data)
      userStore.addCountry(data[0])
      newCountry.value = '' // Limpiar el campo después de agregar
      fetchCountries() // Recargar la wishlist
    }
  } catch (err) {
    console.error('Error adding country:', err)
  }
}

// Activar el modo de edición para un país
const editCountry = country => {
  country.isEditing = true
  country.newName = country.name // Mantener el valor original mientras se edita
}

// Guardar el nombre editado en la base de datos
const saveEdit = async country => {
  if (country.newName.trim() === '') {
    console.log('Country name cannot be empty.')
    return
  }

  try {
    // Guardar el nuevo nombre en la base de datos
    await userStore.editCountry(country.id, country.newName)

    // Después de la actualización, recargar la wishlist para reflejar el cambio
    await fetchCountries()

    // Desactivar el modo de edición
    country.isEditing = false
  } catch (error) {
    console.error('Error saving edited country:', error)
  }
}

// Cambiar el estado de "visited" a "not visited"
const toggleVisitedStatus = async id => {
  try {
    await userStore.toggleVisited(id)
  } catch (error) {
    console.error('Error al actualizar el estado de visitado:', error)
  }
}

// Eliminar país de la lista de deseos
const removeCountryFromWishlist = async id => {
  try {
    await userStore.removeCountry(id)
  } catch (error) {
    console.error('Error al eliminar el país:', error)
  }
}

// Se llama a `fetchCountries` cuando el componente se monta
onMounted(() => {
  fetchCountries()
})
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
        <button @click="addCountryToWishlist" class="button is-primary">
          Add
        </button>
      </div>
    </div>

    <!-- Lista de países -->
    <div class="countries">
      <div
        v-for="country in userStore.wishlist"
        :key="country.id"
        class="box country-item"
      >
        <!-- Mostrar el nombre del país -->
        <div class="country-name">
          <p v-if="!country.isEditing">{{ country.name }}</p>
          <input v-else v-model="country.newName" class="input" type="text" />
        </div>

        <!-- Botones de estado de visitado/no visitado -->
        <div class="status-buttons buttons is-centered">
          <button
            @click="toggleVisitedStatus(country.id)"
            :class="[
              'button',
              { 'is-success': country.visited, 'is-light': !country.visited },
            ]"
          >
            Visited
          </button>
          <button
            @click="toggleVisitedStatus(country.id)"
            :class="[
              'button',
              { 'is-danger': !country.visited, 'is-light': country.visited },
            ]"
          >
            Not Visited
          </button>

          <!-- Botones de eliminar y editar (alineados) -->
          <div class="buttons is-right">
            <!-- Botón de editar -->
            <button
              v-if="!country.isEditing"
              @click="editCountry(country)"
              class="button is-info is-small"
            >
              <span class="icon">
                <i class="fas fa-pencil-alt edit-icon"></i>
              </span>
            </button>

            <!-- Botón para guardar cambios -->
            <button
              v-if="country.isEditing"
              @click="saveEdit(country)"
              class="button is-success is-small"
            >
              <span class="icon">
                <i class="fas fa-save"></i>
              </span>
            </button>

            <!-- Botón de eliminar -->
            <button
              @click="removeCountryFromWishlist(country.id)"
              class="button is-danger is-small"
            >
              <span class="icon">
                <i class="fas fa-trash-alt delete-icon"></i>
              </span>
            </button>
          </div>
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

.status-buttons .button.is-light {
  background-color: #666;
}

.buttons.is-right {
  display: flex;
  gap: 5px;
  align-items: center;
}

.is-small {
  font-size: 0.7em; /* Botón más pequeño */
  padding: 0.3em 0.5em; /* Ajustar el tamaño del padding */
}

.icon {
  display: inline-block;
  width: 16px; /* Ajustar el tamaño de los iconos */
  height: 16px;
}
</style>
