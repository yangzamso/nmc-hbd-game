import { create } from 'zustand'
import { COSTUMES } from '../data/costumes'
import { EMPTY_SLOTS } from '../data/slots'
import { updateSlot, adminVerifySlot6, resetSlots as resetSlotsApi } from '../utils/api'

const GAME_POOL = COSTUMES.filter((c) => c.id !== 'strawberry').map((c) => c.id)

export const useSessionStore = create((set, get) => ({
  screen: 'auth', // 'auth' | 'hub' | 'game' | 'dressup'
  nickname: '',
  password: '', // 인증된 슬롯 갱신 요청에 재사용 (세션 메모리에만 보관, 저장하지 않음)
  activeSlotId: null,
  slots: EMPTY_SLOTS,

  login: (nickname, password, slots) => set({ nickname, password, slots: slots ?? EMPTY_SLOTS, screen: 'hub' }),
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

  // 로컬 개발용 — 슬롯 전체 초기화
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
}))
