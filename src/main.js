import './assets/main.css'
import 'bulma/css/bulma.min.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useUserStore } from './stores/userStore';

import App from './App.vue';
import router from './router';


const app = createApp(App);

app.use(createPinia());
app.use(router);

// Inicializar la sesión del usuario
const userStore = useUserStore();
userStore.init(); 

app.mount('#app');
