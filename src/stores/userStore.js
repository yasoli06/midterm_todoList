import { defineStore } from 'pinia';
import { supabaseClient } from '../composables/useSupabase';

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
          const { data: { user }, error } = await supabaseClient.auth.session(); // Get user session
          if (error) throw error;
  
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
          const { error } = await supabaseClient.auth.signOut();
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
          const { data: wishlist, error } = await supabaseClient
            .from('wishlist')
            .select('*')
            .eq('user_id', userId)
            .single(); // Fetch wishlist for user
  
          if (error) throw error;
  
          this.wishlist = wishlist || [];
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      },
      async saveWishlist() {
        try {
          const userId = this.user?.id; // Ensure user exists
          if (!userId) return; // Exit if no user
  
          const { error } = await supabaseClient
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
      addCountry(countryName) {
        const newCountry = {
          id: Date.now(),
          name: countryName,
          visited: false,
        };
        this.wishlist.push(newCountry);
        this.saveWishlist();
      },
      toggleVisited(id) {
        const countryIndex = this.wishlist.findIndex((country) => country.id === id);
        if (countryIndex !== -1) {
          this.wishlist[countryIndex].visited = !this.wishlist[countryIndex].visited;
          this.saveWishlist();
        }
      },
      removeCountry(id) {
        this.wishlist = this.wishlist.filter((country) => country.id !== id);
        this.saveWishlist();
      },
      setUser(newUser) {
        this.user = newUser;
        this.isAuthenticated = !!newUser; // Marca el estado de autenticación
      },
    },
  });