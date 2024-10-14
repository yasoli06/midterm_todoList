import { defineStore } from 'pinia';
import { supabase } from '../supabase';

export const useUserStore = defineStore('user', {
    state: () => ({
      user: null,
      isAuthenticated: false,
      wishlist: [],
      loading: false,
    }),
    actions: {
      async init() {
        await this.fetchUser();
      },
      async fetchUser() {
        this.loading = true;
        try {
          const { data: { user }, error } = await supabase.auth.getSession();
          if (error) throw error;
      
          console.log('User fetched:', user);  // Verifica que el usuario esté correctamente cargado
          this.user = user;
          this.isAuthenticated = !!user;
      
          if (user) {
            await this.loadWishlist(user.id);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          this.loading = false;
        }
      },
      async logout() {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
  
          this.user = null;
          this.isAuthenticated = false;
          // No need to remove JWT as Supabase handles authentication tokens
        } catch (error) {
          console.error('Error logging out:', error);
        }
      },
      async loadWishlist(userId) {
        try {
          const { data: wishlist, error } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', userId)
            //.single(); // Fetch wishlist for user
  
          if (error) throw error;
  
          this.wishlist = wishlist || [];
        } catch (error) {
          //console.error('Error loading wishlist:', error);
        }
      },
      async saveWishlist() {
        try {
          const userId = this.user?.id; // Ensure user exists
          if (!userId) return; // Exit if no user
  
          const { error } = await supabase
            .from('wishlist')
            .upsert({ // Upsert combines insert and update
              user_id: userId,
              wishlist: this.wishlist,
            });
  
          if (error) throw error;
        } catch (error) {
          console.error('Error saving wishlist:', error);
        }
      },
      async addCountry(countryName) {
        const exists = this.wishlist.some(country => country.name === countryName);
        if (!exists) {
          const newCountry = {
            name: countryName,
            visited: false,
            user_id: this.user.id, // Asegúrate de que el país esté asociado al usuario
          };

          const { data, error } = await supabase
          .from('wishlist')
          .insert(newCountry); 

        if (error) {
          console.error('Error inserting country into database:', error);
          return;
        }
        this.wishlist.push(newCountry);
       // this.saveCountryToDatabase(newCountry); // Guarda en la base de datos
        //this.loadWishlist(this.user.id);
      } else {
        console.log('El país ya está en la wishlist.');
      }
    },

      toggleVisited(id) {
        const countryIndex = this.wishlist.findIndex((country) => country.id === id);
        if (countryIndex !== -1) {
          this.wishlist[countryIndex].visited = !this.wishlist[countryIndex].visited;
          this.saveWishlist();
        }
      },
      async removeCountry(id) {
        const beforeLength = this.wishlist.length;
        this.wishlist = this.wishlist.filter((country) => country.id !== id);

        if (beforeLength !== this.wishlist.length) {
        this.saveWishlist();
        } else {
        console.log('El país no estaba en la wishlist.');
      }
      },
      setUser(newUser) {
        this.user = newUser;
        this.isAuthenticated = !!newUser; // Marca el estado de autenticación
      },   
    },
  });