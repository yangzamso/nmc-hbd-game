import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COSTUMES } from '../data/costumes'
import { EMPTY_SLOTS } from '../data/slots'
import { updateSlot, adminVerifySlot6, resetSlots as resetSlotsApi } from '../utils/api'

const GAME_POOL = COSTUMES.filter((c) => c.id !== 'strawberry').map((c) => c.id)

const SESSION_INITIAL_STATE = {
  screen: 'auth',
  nickname: '',
  password: '',
  activeSlotId: null,
  slots: EMPTY_SLOTS,
}

export const useSessionStore = create(
  persist(
    (set, get) => ({
      ...SESSION_INITIAL_STATE,

      login: (nickname, password, slots) =>
        set({ nickname, password, slots: slots ?? EMPTY_SLOTS, screen: 'hub' }),
      logout: () => set({ ...SESSION_INITIAL_STATE }),
      openSlot: (slotId) => set({ activeSlotId: slotId, screen: 'game' }),
      backToHub: () => set({ activeSlotId: null, screen: 'hub' }),
      goToDressup: () => set({ screen: 'dressup' }),

      clearSlot: async (slotId, costumeId) => {
        const { nickname, password } = get()
        const { slots } = await updateSlot(nickname, password, slotId, costumeId)
        set({ slots })
      },

      adminClearSlot6: async (adminPassword) => {
        const { nickname } = get()
        const { slots } = await adminVerifySlot6(nickname, adminPassword)
        set({ slots })
      },

      resetSlots: async () => {
        const { nickname, password } = get()
        const { slots } = await resetSlotsApi(nickname, password)
        set({ slots })
      },

      getRandomUnownedFromPool: () => {
        const owned = Object.values(get().slots).filter(Boolean)
        const remaining = GAME_POOL.filter((id) => !owned.includes(id))
        if (remaining.length === 0) return null
        return remaining[Math.floor(Math.random() * remaining.length)]
      },
    }),
    {
      name: 'nmc-session',
      partialize: (state) => ({
        nickname: state.nickname,
        password: state.password,
        slots: state.slots,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.nickname) state.screen = 'hub'
      },
    }
  )
)
