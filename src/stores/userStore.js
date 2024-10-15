import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    wishlist: [],
    loading: false,
  }),
  actions: {
    async init() {
      const jwt = localStorage.getItem('jwt');  // Verificamos si hay un JWT en localStorage
      if (jwt) {
        await this.fetchUser();  // Si hay JWT, intentamos recuperar la sesión
      }
    },
    async fetchUser() {
      this.setLoading(true)
      try {
        const { data, error } = await supabase.auth.getSession()
        const session = data?.session

        if (error) throw error
        if (session) {
          this.setUser(session.user)
          console.log('User session:', session.user);
          await this.loadUserProfile(session.user.id);
          await this.loadWishlist(session.user.id)
        } else {
          this.setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user session:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async loadUserProfile(userId) {
      this.setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        this.user = { ...this.user, ...profile }; 
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        this.setLoading(false);
      }
    },
    async loadSession() {
      const token = localStorage.getItem('jwt')
    
      if (token) {
        try {
          const { data: user, error } = await supabase.auth.getUser()
          if (error) throw error;
          this.setUser(user)
          this.isAuthenticated = true
          await this.loadWishlist(user.id)
        } catch (err) {
          console.error("Error al verificar la sesión:", err)
          this.clearSession()
        }
      } else {
        this.clearSession()
      }
    },
    async logout() {
      this.setLoading(true)
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        this.setUser(null)
      } catch (error) {
        console.error('Error logging out:', error)
      } finally {
        this.setLoading(false)
      }
      localStorage.removeItem('jwt');
    },
    async loadWishlist(userId) {
      if (!userId) return;

      this.setLoading(true);
      try {
        const { data: wishlist, error } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        this.wishlist = wishlist || [];
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        this.setLoading(false);
      }
    },
    async saveWishlist() {
      if (!this.user?.id) return

      const wishlistData = this.wishlist.map(country => ({
        user_id: this.user.id,
        name: country.name,
        visited: country.visited,
      }))

      this.setLoading(true)
      try {
        const { error } = await supabase
          .from('wishlist')
          .upsert(wishlistData, { onConflict: ['user_id', 'name'] })

        if (error) throw error
      } catch (error) {
        console.error('Error saving wishlist:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async addCountry(countryName) {
      if (!this.user?.id) return

      this.setLoading(true)
      try {
        const { data: existingCountry, error } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', this.user.id)
          .eq('name', countryName)
          .single()

        if (error) throw error

        if (!existingCountry) {
          const { error: insertError } = await supabase
            .from('wishlist')
            .insert([{ user_id: this.user.id, name: countryName, visited: false }])

          if (insertError) throw insertError

          console.log('País añadido correctamente.')
          await this.loadWishlist(this.user.id)
        } else {
          console.log('El país ya está en la wishlist.')
        }
      } catch (error) {
        console.log('Error adding country:', error)
      } finally {
        this.setLoading(false)
      }
    },
    async editCountry(id, newName) {
      if (!this.user?.id) return;

      this.setLoading(true);
      try {
        const country = this.wishlist.find(c => c.id === id);
        if (!country) {
          console.error('País no encontrado en la wishlist.');
          return;
        }
        const { error } = await supabase
          .from('wishlist')
          .update({ name: newName })
          .eq('id', id)
          .eq('user_id', this.user.id);

        if (error) throw error;
    country.name = newName;  // Mantener el país en la misma posición
    console.log('País editado correctamente.');

  } catch (error) {
    console.error('Error al editar país:', error);
  } finally {
    this.setLoading(false);
  }
},
    async toggleVisited(id) {
      const country = this.wishlist.find(c => c.id === id)
      if (!country) return console.error('Country not found in the wishlist.')

      const newVisitedStatus = !country.visited

      this.setLoading(true)
      try {
        const { error } = await supabase
          .from('wishlist')
          .update({ visited: newVisitedStatus })
          .eq('id', id)

        if (error) throw error

        this.updateCountryVisitedStatus(id, newVisitedStatus)
        console.log('Country visit status updated:', newVisitedStatus)
      } catch (error) {
        console.error('Error toggling visited status:', error)
      } finally {
        this.setLoading(false)
      }
    },

    updateCountryVisitedStatus(id, newVisitedStatus) {
      const country = this.wishlist.find(c => c.id === id)
      if (country) {
        country.visited = newVisitedStatus
      }
    },

    async removeCountry(id) {
      const beforeLength = this.wishlist.length
      this.wishlist = this.wishlist.filter(country => country.id !== id)

      if (beforeLength !== this.wishlist.length) {
        this.setLoading(true)
        try {
          const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', id)
            .eq('user_id', this.user.id)

          if (error) throw error

          console.log('País eliminado correctamente de la base de datos')
        } catch (error) {
          console.error('Error deleting country from database:', error)
        } finally {
          this.setLoading(false)
        }
      } else {
        console.log('El país no estaba en la wishlist.')
      }
    },
    async signUp(email, password, name) {
      this.setLoading(true);
      try {
        const { user, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        console.log('Usuario registrado en Supabase Auth:', user); 

        // Aquí es donde insertamos los datos en la tabla 'profiles'
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')  // Inserta en la tabla 'profiles'
          .insert([{ 
            id: user.id,          // El mismo ID que el usuario de Supabase Auth
            name: name,           // El nombre proporcionado durante el registro
            created_at: new Date() // Fecha de creación actual
          }]);
    
        if (profileError) throw profileError;  // Si hay un error en la creación del perfil
    
        console.log('Perfil creado en la tabla "profiles":', profileData);
    
        // Ahora que el usuario está registrado, podemos actualizar el estado de la tienda
        this.setUser(user);  // Establecemos el usuario en el estado de la tienda
        this.isAuthenticated = true;  // Marcamos que el usuario está autenticado
        await this.loadUserProfile(user.id);
      } catch (error) {
        console.error('Error en el registro:', error.message);  // Captura y muestra errores
      } finally {
        this.setLoading(false);  // Desactivar el loading
      }
    },
    setUser(newUser) {
      this.user = newUser
      this.isAuthenticated = !!newUser
    },

    setLoading(isLoading) {
      this.loading = isLoading
    },
  },
})