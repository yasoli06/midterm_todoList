<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useUserStore } from '@/stores/userStore'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()
const userStore = useUserStore()

// Validar formato de email
const isValidEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)

// Función para manejar el login
const login = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Todos los campos son obligatorios.'
    return
  }

  if (!isValidEmail(email.value)) {
    error.value = 'El correo electrónico no tiene un formato válido.'
    return
  }
  loading.value = true

  try {
    const { data: { session, user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (loginError) throw loginError

    // Actualizar el estado del usuario en la store
    userStore.setUser(user)

    // Redirigir a la ruta adecuada si el login fue exitoso
    redirectUser(user)
    const jwt = session.access_token
      localStorage.setItem('jwt', jwt)

  } catch (err) {
    console.error('Error al iniciar sesión:', err)
    error.value = 'Hubo un problema al iniciar sesión. Intenta nuevamente.'
  } finally {
    // Desactivar el estado de carga
    loading.value = false
  }
}

// Función para redirigir al usuario después de iniciar sesión
const redirectUser = () => {
  if (!userStore.isAuthenticated) {
    router.push({ name: 'login' });  // Redirigir al login solo si no está autenticado
  } else {
    router.push({ name: 'profile' });  // Redirigir al perfil si está autenticado
  }
}

</script>

<template>
  <div class="container mt-50">
    <div class="columns">
      <div class="column is-6 is-offset-3">
        <h3 class="title is-3">¡Bienvenido!</h3>
        <form @submit.prevent="login">
          <div class="field">
            <label class="label">Correo electrónico</label>
            <div class="control">
              <input class="input" type="email" v-model="email" />
            </div>
          </div>
          <div class="field">
            <label class="label">Contraseña</label>
            <div class="control">
              <input class="input" type="password" v-model="password" />
            </div>
          </div>
          <button type="submit" class="button is-primary">
            Iniciar sesión
          </button>
        </form>

        <div class="notification is-danger mt-10" v-if="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>