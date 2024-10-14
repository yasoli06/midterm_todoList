<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useUserStore } from '@/stores/userStore'

const email = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()
const userStore = useUserStore()

const login = async () => {
  error.value = ''
  if (email.value && password.value) {
    try {
      const {
        data: { user },
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (loginError) throw loginError

      if (user) {
        // Actualizar el estado del usuario en la store
        userStore.setUser(user)

        // Verificar si el usuario tiene una cuenta (deberías ajustar esto a tu lógica)
        if (user) {
          userStore.setUser(user);
          router.push({ name: 'profile' })
        } else {
          // Si no hay usuario (error en la sesión), redirigir a la página de registro
          router.push({ name: 'register' })
        }
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      error.value = err.message
    }
  } else {
    error.value = 'Todos los campos son obligatorios.'
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
