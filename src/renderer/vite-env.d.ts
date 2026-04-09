/// <reference types="vite/client" />

import type { InternetDnsFileV1, InternetDnsMode } from '../shared/internetDns'

export {}

declare global {
  interface Window {
    hub: {
      markIntroSeen: () => Promise<void>
      openExternal: (url: string) => Promise<void>
      internetDns: {
        get: () => Promise<InternetDnsFileV1>
        save: (payload: { mode: InternetDnsMode; dohUrl: string }) => Promise<
          { ok: true; needsRestart: boolean; config: InternetDnsFileV1 } | { ok: false; error: string }
        >
        relaunch: () => Promise<void>
      }
    }
  }
}
