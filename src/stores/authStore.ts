import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthUser {
  id: number
  email: string
  is_admin: boolean
  created_at: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        user: null,
        setUser: (user) =>
          set((state) => ({ ...state, auth: { ...state.auth, user } })),
        accessToken: '',
        setAccessToken: (accessToken) =>
          set((state) => ({ ...state, auth: { ...state.auth, accessToken } })),
        resetAccessToken: () =>
          set((state) => ({
            ...state,
            auth: { ...state.auth, accessToken: '', user: null },
          })),
        reset: () =>
          set((state) => ({
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          })),
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        auth: {
          user: state.auth.user,
          accessToken: state.auth.accessToken,
        },
      }),
    }
  )
)

export const useAuth = () => useAuthStore((state) => state.auth)
