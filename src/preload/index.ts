import { contextBridge, ipcRenderer } from 'electron'
import type { InternetDnsFileV1, InternetDnsMode } from '../shared/internetDns'

contextBridge.exposeInMainWorld('hub', {
  markIntroSeen: () => ipcRenderer.invoke('hub:intro-seen') as Promise<void>,
  openExternal: (url: string) => ipcRenderer.invoke('hub:open-external', url) as Promise<void>,
  internetDns: {
    get: () => ipcRenderer.invoke('hub:internet-dns-get') as Promise<InternetDnsFileV1>,
    save: (payload: { mode: InternetDnsMode; dohUrl: string }) =>
      ipcRenderer.invoke('hub:internet-dns-save', payload) as Promise<
        { ok: true; needsRestart: boolean; config: InternetDnsFileV1 } | { ok: false; error: string }
      >,
    relaunch: () => ipcRenderer.invoke('hub:relaunch') as Promise<void>
  }
})
