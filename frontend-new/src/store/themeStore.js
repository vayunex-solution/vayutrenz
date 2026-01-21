import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'light', // default light theme

            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light'
                document.documentElement.setAttribute('data-theme', newTheme)
                set({ theme: newTheme })
            },

            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme)
                set({ theme })
            },

            initTheme: () => {
                const theme = get().theme
                document.documentElement.setAttribute('data-theme', theme)
            }
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state) {
                    document.documentElement.setAttribute('data-theme', state.theme)
                }
            }
        }
    )
)
