<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const successMessage = ref('')

const router = useRouter()

// Validación de campos
const isValidForm = () => {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Todos los campos son obligatorios.'
    return false
  }
  if (!validateEmail(email.value)) {
    error.value = 'Por favor, ingresa un correo electrónico válido.'
    return false
  }
  return true
}

// Expresión regular para validar un correo electrónico
const validateEmail = email => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return emailRegex.test(email)
}

// Función principal para registrar el usuario
const register = async () => {
  error.value = '' // Limpiar el error anterior
  successMessage.value = '' // Limpiar el mensaje de éxito

  if (!isValidForm()) {
    return // Si la validación falla, no continuar
  }

  try {
    // Intentar registrar al usuario con Supabase
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (signupError) throw signupError

    // Obtener el usuario de la respuesta
    const user = data.user

    if (user) {
      // Verificar si el usuario ya ha confirmado su correo electrónico
      if (!user.confirmed_at) {
        // Si el usuario no ha confirmado su correo, mostrar un mensaje
        successMessage.value =
          '¡Se ha enviado un correo electrónico de verificación! Por favor, confirma tu cuenta para continuar.'
      } else {
        // Si el usuario ya ha confirmado su correo, guardar el nombre en la tabla de users
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, name: name.value }]) // Guardamos el nombre junto con el id del usuario

        if (insertError) throw insertError

        // Redirigir al perfil
        router.push({ name: 'profile' })
      }
    } else {
      console.error('No se creó el usuario correctamente')
    }
  } catch (err) {
    console.error('Error al registrarse:', err)
    handleSignupError(err)
  } finally {
    // Limpiar los campos de entrada después de intentar el registro
    resetFields()
  }
}

// Manejo de errores específicos del registro
const handleSignupError = err => {
  if (err.message.includes('Email address')) {
    error.value =
      'El correo electrónico no está autorizado. Verifica tu dominio de correo o usa otro email.'
  } else {
    error.value =
      'Hubo un problema al registrarse. Intenta nuevamente más tarde.'
  }
}

// Función para resetear los campos del formulario
const resetFields = () => {
  name.value = ''
  email.value = ''
  password.value = ''
  error.value = ''
}
</script>

<template>
  <div class="container mt-50">
    <div class="columns">
      <div class="column is-6 is-offset-3">
        <h3 class="title is-3">¡Crear cuenta!</h3>
        <form @submit.prevent="register">
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input class="input" type="text" v-model="name" />
            </div>
          </div>
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
          <button type="submit" class="button is-primary">Registrarse</button>
        </form>

        <!-- Mostrar el mensaje de error si hay alguno -->
        <div class="notification is-danger mt-10" v-if="error">{{ error }}</div>

        <!-- Mostrar el mensaje de éxito después del registro -->
        <div class="notification is-info mt-10" v-if="successMessage">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
