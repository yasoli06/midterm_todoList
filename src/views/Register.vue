<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase.js';

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');

const router = useRouter();

const register = async () => {
  error.value = '';
  if (name.value && email.value && password.value) {
    try {
      const {  data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      });
      console.log(email.value, password.value);
      if (error) throw error;

      // Acceder al usuario creado en la respuesta
      const user = data.user;

      if (user) {
        if (!user.confirmed_at) {
          error.value = 'Se ha enviado un correo electrónico de verificación. Por favor, verifica tu correo electrónico para activar tu cuenta.';
        } else {
          router.push({ name: 'homeuser' });
        }
      }
      resetFields();
    } catch (err) {
      console.error('Error al registrarse:', err);
      if (err.message.includes('Email address')) {
        error.value = 'El correo electrónico no está autorizado. Verifica tu dominio de correo o usa otro email.';
      } else {
        error.value = 'Hubo un problema al registrarse. Intenta nuevamente más tarde.';
      }
    }
  } else {
    error.value = 'Todos los campos son obligatorios.';
  }
}

const resetFields = () => {
  name.value = '';
  email.value = '';
  password.value = '';
  error.value = '';
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
  
          <div class="notification is-danger mt-10" v-if="error">{{ error }}</div>
        </div>
      </div>
    </div>
  </template>
