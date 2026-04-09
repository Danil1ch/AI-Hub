import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ServiceId } from '../shared/services'
import type { InternetDnsMode } from '../shared/internetDns'

export type LayoutMode = 1 | 2 | 3 | 4

interface HubState {
  activeId: ServiceId | null
  /** Last opened service — for “Open last session” on the picker */
  lastSessionId: ServiceId | null
  internetDnsMode: InternetDnsMode
  internetDohUrl: string
  layoutMode: LayoutMode
  /** Slots used for multi-pane layouts (length 4). Slot 0 is the primary pane. */
  layoutSlots: [ServiceId | null, ServiceId | null, ServiceId | null, ServiceId | null]
  setActive: (id: ServiceId) => void
  setInternetDns: (mode: InternetDnsMode, dohUrl: string) => void
  setLayoutMode: (mode: LayoutMode) => void
  setLayoutSlot: (idx: 0 | 1 | 2 | 3, id: ServiceId | null) => void
  swapLayoutSlots: (a: 0 | 1 | 2 | 3, b: 0 | 1 | 2 | 3) => void
}

export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      activeId: null,
      lastSessionId: null,
      internetDnsMode: 'default',
      internetDohUrl: '',
      layoutMode: 1,
      layoutSlots: [null, null, null, null],
      setActive: (id) => set({ activeId: id, lastSessionId: id }),
      setInternetDns: (mode, dohUrl) => set({ internetDnsMode: mode, internetDohUrl: dohUrl })
      ,
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      setLayoutSlot: (idx, id) =>
        set((s) => {
          const next: HubState['layoutSlots'] = [...s.layoutSlots] as HubState['layoutSlots']
          // Enforce uniqueness: any service can exist in at most one slot.
          if (id != null) {
            for (let i = 0; i < next.length; i++) {
              if (i !== idx && next[i] === id) next[i] = null
            }
          }
          next[idx] = id
          return { layoutSlots: next }
        }),
      swapLayoutSlots: (a, b) =>
        set((s) => {
          if (a === b) return {}
          const next: HubState['layoutSlots'] = [...s.layoutSlots] as HubState['layoutSlots']
          const tmp = next[a]
          next[a] = next[b]
          next[b] = tmp
          return { layoutSlots: next }
        })
    }),
    {
      name: 'ai-hub-shell',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        activeId: s.activeId,
        lastSessionId: s.lastSessionId,
        internetDnsMode: s.internetDnsMode,
        internetDohUrl: s.internetDohUrl,
        layoutMode: s.layoutMode,
        layoutSlots: s.layoutSlots
      })
    }
  )
)
