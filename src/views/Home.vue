<template>
  <div class="container mt-5 has-text-centered" >
    <div class="img mb-4">
    <img src="../assets/earth-plane-luggage.png" alt="Earth with Plane and Luggage" />
    </div>
    <h1 class="title">Welcome to Steps on the Map</h1>
    <p class="subtitle">Explore and create your wishlist of countries you want to visit.</p>
    <p>Start adding places you want to visit and mark the ones you've seen!</p>
    <br/>
    <router-link class="button is-primary" :to="{ name: 'login' }">Let's explore</router-link>
    </div>
    
</template>

<style scoped>
.container {

  padding: 20px;
  border-radius: 5px;
}

.img{
  max-width: 200px; /* Ajuste para el tamaño de la imagen */
  height: auto; /* Mantiene la proporción de la imagen */
  margin: 0 auto; /* Centramos la imagen en el contenedor */
}
</style>