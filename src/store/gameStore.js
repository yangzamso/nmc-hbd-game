import { create } from 'zustand'

export const useGameStore = create((set) => ({
  equippedId: null,
  bgColor: '#ffffff',

  equip: (id) => set({ equippedId: id }),
  unequip: () => set({ equippedId: null }),
  setBg: (color) => set({ bgColor: color }),
}))
