import { BrowserWindow, app, webContents } from 'electron'

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function isLocalDevHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

function isRemoteHttpPage(url: string): boolean {
  if (!isHttpUrl(url)) return false
  try {
    return !isLocalDevHost(new URL(url).hostname)
  } catch {
    return false
  }
}

function isProbablyEmbedGuest(contents: Electron.WebContents): boolean {
  if (contents.isDestroyed()) return false
  try {
    if (contents.getType() === 'webview') return true
  } catch {
    /* continue */
  }
  let url = ''
  try {
    url = contents.getURL()
  } catch {
    return false
  }
  return isRemoteHttpPage(url)
}

function shouldStealPopupIntoOpener(openerWc: Electron.WebContents, popupWc: Electron.WebContents): boolean {
  if (openerWc.isDestroyed() || popupWc.isDestroyed()) return false
  if (isProbablyEmbedGuest(openerWc)) return true

  let openerUrl = ''
  try {
    openerUrl = openerWc.getURL()
  } catch {
    return false
  }
  if (!isRemoteHttpPage(openerUrl)) return false

  try {
    return popupWc.session === openerWc.session
  } catch {
    return false
  }
}

function isIgnoredMergeUrl(url: string): boolean {
  return /^devtools:/i.test(url) || url.startsWith('chrome://') || url.startsWith('file://')
}

function resolveEmbedGuestForPopup(popupWc: Electron.WebContents): Electron.WebContents | null {
  if (popupWc.isDestroyed()) return null

  let openerFrame: Electron.WebFrameMain
  try {
    openerFrame = popupWc.opener
  } catch {
    openerFrame = undefined as unknown as Electron.WebFrameMain
  }
  if (openerFrame && !openerFrame.isDestroyed()) {
    const fromOpener = webContents.fromFrame(openerFrame)
    if (fromOpener && !fromOpener.isDestroyed() && shouldStealPopupIntoOpener(fromOpener, popupWc)) {
      return fromOpener
    }
  }

  let sess: Electron.Session
  try {
    sess = popupWc.session
  } catch {
    return null
  }

  const candidates: Electron.WebContents[] = []
  for (const wc of webContents.getAllWebContents()) {
    if (wc === popupWc || wc.isDestroyed()) continue
    try {
      if (wc.session !== sess) continue
      if (wc.getType() !== 'webview') continue
      if (!shouldStealPopupIntoOpener(wc, popupWc)) continue
      candidates.push(wc)
    } catch {
      continue
    }
  }
  if (candidates.length === 0) return null
  const focused = webContents.getFocusedWebContents()
  if (focused && candidates.includes(focused)) {
    return focused
  }
  return candidates.length === 1 ? candidates[0] : null
}

export function registerGuestPopupInplaceNavigation(getPrimaryWindow: () => BrowserWindow | null): void {
  app.on('web-contents-created', (_e, guest) => {
    guest.setWindowOpenHandler((details) => {
      if (!isProbablyEmbedGuest(guest)) {
        return { action: 'allow' }
      }
      if (details.postBody) {
        return { action: 'allow' }
      }
      const url = details.url
      if (!url) {
        return { action: 'allow' }
      }
      if (isIgnoredMergeUrl(url)) {
        return { action: 'deny' }
      }
      if (url === 'about:blank' || !isHttpUrl(url)) {
        return { action: 'allow' }
      }
      if (!isRemoteHttpPage(url)) {
        return { action: 'allow' }
      }
      void guest.loadURL(url)
      return { action: 'deny' }
    })

    guest.on('did-create-window', (childWindow, details) => {
      if (!isProbablyEmbedGuest(guest) || guest.isDestroyed()) return
      if (details.postBody) return
      const url = details.url
      if (!url || !isHttpUrl(url) || isIgnoredMergeUrl(url)) return
      if (!isRemoteHttpPage(url)) return
      void guest.loadURL(url)
      if (!childWindow.isDestroyed()) {
        childWindow.close()
      }
    })
  })

  app.on('browser-window-created', (_event, popupWin) => {
    const primary = getPrimaryWindow()
    if (primary && !primary.isDestroyed() && popupWin.id === primary.id) {
      return
    }

    const popupWc = popupWin.webContents
    if (!popupWc || popupWc.isDestroyed()) return

    const openerWc = resolveEmbedGuestForPopup(popupWc)
    if (!openerWc || openerWc.isDestroyed()) return
    if (!shouldStealPopupIntoOpener(openerWc, popupWc)) return

    try {
      popupWin.hide()
    } catch {
      /* still try merge */
    }

    const onNav = (evt: Electron.Event<Electron.WebContentsDidStartNavigationEventParams>) => {
      if (!evt.isMainFrame || evt.isSameDocument) return
      const url = evt.url
      if (!url || !isHttpUrl(url) || isIgnoredMergeUrl(url)) return
      if (!isRemoteHttpPage(url)) return

      popupWc.removeListener('did-start-navigation', onNav)
      if (!openerWc.isDestroyed()) {
        void openerWc.loadURL(url)
      }
      if (!popupWin.isDestroyed()) {
        popupWin.close()
      }
    }

    popupWc.on('did-start-navigation', onNav)
    popupWin.once('closed', () => {
      popupWc.removeListener('did-start-navigation', onNav)
    })
  })
}
