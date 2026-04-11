import { BrowserWindow, Menu, Tray, app, ipcMain, nativeImage, screen, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { readAppSettings, writeAppSettings, applyOpenAtLoginSetting, markIntroSeen } from './appSettings'
import { coerceInternetDnsSave, defaultUserDataDirForAiHub, readInternetDnsResolved, writeInternetDnsResolved } from './internetDnsConfig'
import { applyInternetDnsHostResolver, flushHostResolverCaches, flushInternetDnsAfterConfigChange } from './hostResolverDns'
import { flushWindowsSystemDnsCache } from './winDnsFlush'
import { registerGuestPopupInplaceNavigation } from './guestPopupRedirect'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
type WindowStateV1 = {
  version: 1
  bounds: { x: number; y: number; width: number; height: number }
  maximized: boolean
}

/** Same folder for early DNS config read, IPC writes, and persisted profile (dev + prod). */
if (!app.isReady()) {
  /** Prefer IPv4 first — reduces flaky timeouts (ERR_TIMED_OUT) on some networks with broken IPv6. */
  app.commandLine.appendSwitch('dns-result-order', 'ipv4first')
  app.setPath('userData', defaultUserDataDirForAiHub())
}

/* Windows: taskbar / jump list name; must run before creating any window. */
if (process.platform === 'win32') {
  app.setAppUserModelId('dev.aihub.desktop')
}

process.title = 'AI Hub'

registerGuestPopupInplaceNavigation(() => mainWindow)

function resolveIconPath(): string | undefined {
  const candidates = app.isPackaged
    ? [path.join(process.resourcesPath, 'app-icon.png')]
    : [path.join(__dirname, '../../resources/app-icon.png'), path.join(app.getAppPath(), 'resources', 'app-icon.png')]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return undefined
}

function windowStatePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function readWindowState(): WindowStateV1 | null {
  try {
    const fp = windowStatePath()
    if (!fs.existsSync(fp)) return null
    const raw = JSON.parse(fs.readFileSync(fp, 'utf-8')) as any
    if (raw?.version !== 1) return null
    const b = raw?.bounds
    if (!b || typeof b.x !== 'number' || typeof b.y !== 'number' || typeof b.width !== 'number' || typeof b.height !== 'number') {
      return null
    }
    const maximized = Boolean(raw?.maximized)
    return { version: 1, bounds: { x: b.x, y: b.y, width: b.width, height: b.height }, maximized }
  } catch {
    return null
  }
}

function isReasonableBounds(b: { x: number; y: number; width: number; height: number }): boolean {
  return Number.isFinite(b.x) && Number.isFinite(b.y) && b.width >= 320 && b.height >= 240 && b.width <= 10000 && b.height <= 10000
}

function clampToVisibleArea(b: { x: number; y: number; width: number; height: number }): { x: number; y: number; width: number; height: number } | null {
  if (!isReasonableBounds(b)) return null
  const displays = screen.getAllDisplays()
  // Find a display whose workArea intersects the bounds.
  const hit = displays.find((d) => {
    const a = d.workArea
    const x1 = Math.max(a.x, b.x)
    const y1 = Math.max(a.y, b.y)
    const x2 = Math.min(a.x + a.width, b.x + b.width)
    const y2 = Math.min(a.y + a.height, b.y + b.height)
    return x2 - x1 > 80 && y2 - y1 > 80
  })
  const area = (hit ?? screen.getPrimaryDisplay()).workArea
  const width = Math.min(Math.max(b.width, 800), area.width)
  const height = Math.min(Math.max(b.height, 600), area.height)
  const x = Math.min(Math.max(b.x, area.x), area.x + area.width - width)
  const y = Math.min(Math.max(b.y, area.y), area.y + area.height - height)
  return { x, y, width, height }
}

function writeWindowState(win: BrowserWindow): void {
  try {
    const state: WindowStateV1 = {
      version: 1,
      bounds: win.getBounds(),
      maximized: win.isMaximized()
    }
    fs.mkdirSync(app.getPath('userData'), { recursive: true })
    fs.writeFileSync(windowStatePath(), `${JSON.stringify(state)}\n`, 'utf-8')
  } catch {
    // ignore
  }
}

function buildTrayContextMenu(): Menu {
  const openAtLogin = readAppSettings().openAtLogin
  return Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        if (!mainWindow) return
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Open at login',
      type: 'checkbox',
      checked: openAtLogin,
      click: (item) => {
        const v = item.checked
        const cur = readAppSettings()
        writeAppSettings({ version: 1, openAtLogin: v, introSeen: cur.introSeen })
        applyOpenAtLoginSetting(v)
        tray?.setContextMenu(buildTrayContextMenu())
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        if (mainWindow) mainWindow.close()
        else app.quit()
      }
    }
  ])
}

function ensureTray(_icon: Electron.NativeImage | undefined): void {
  if (tray) return
  const iconPath = resolveIconPath()
  const img = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty()
  tray = new Tray(img)
  tray.setToolTip('AI Hub')

  tray.on('click', () => {
    if (!mainWindow) return
    mainWindow.show()
    mainWindow.focus()
  })

  tray.setContextMenu(buildTrayContextMenu())
}

function loadMainUrl(win: BrowserWindow, showIntro: boolean): void {
  if (process.env.ELECTRON_RENDERER_URL) {
    const u = new URL(process.env.ELECTRON_RENDERER_URL)
    if (showIntro) u.searchParams.set('firstLaunch', '1')
    void win.loadURL(u.href)
  } else {
    const indexPath = path.join(__dirname, '../renderer/index.html')
    if (showIntro) {
      void win.loadFile(indexPath, { query: { firstLaunch: '1' } })
    } else {
      void win.loadFile(indexPath)
    }
  }
}

function attachMainWindowListeners(win: BrowserWindow): void {
  // "Close" hides to tray; quitting is only via tray -> Quit.
  win.on('close', (e) => {
    if (isQuitting) return
    e.preventDefault()
    win.hide()
  })

  const persistNow = () => {
    if (!mainWindow || mainWindow !== win) return
    if (win.isMaximized() || win.isMinimized()) return
    writeWindowState(win)
  }
  const debouncedPersist = debounce(persistNow, 350)
  win.on('resize', debouncedPersist)
  win.on('move', debouncedPersist)
  win.on('maximize', () => {
    writeWindowState(win)
  })
  win.on('unmaximize', debouncedPersist)

  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null
  })
}

function createMainWindowAndLoad(
  icon: Electron.NativeImage | undefined,
  opts: { show: boolean; deferTray: boolean; backgroundColor?: string; showIntro?: boolean }
): BrowserWindow {
  const restored = readWindowState()
  const safeBounds = restored ? clampToVisibleArea(restored.bounds) : null

  const win = new BrowserWindow({
    ...(safeBounds ? safeBounds : { width: 1280, height: 840 }),
    title: 'AI Hub',
    minWidth: 800,
    minHeight: 600,
    backgroundColor: opts.backgroundColor ?? '#141416',
    show: opts.show,
    autoHideMenuBar: true,
    ...(icon && !icon.isEmpty() ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  })

  if (restored?.maximized) {
    win.maximize()
  }

  loadMainUrl(win, Boolean(opts.showIntro))

  if (opts.showIntro) {
    win.webContents.once('did-finish-load', () => {
      if (win.isDestroyed()) return
      if (!win.isMaximized()) {
        win.maximize()
      }
      win.show()
      ensureTray(icon)
    })
  } else if (!opts.deferTray) {
    ensureTray(icon)
  }

  attachMainWindowListeners(win)
  return win
}

function createWindow(): void {
  const iconPath = resolveIconPath()
  const icon = iconPath ? nativeImage.createFromPath(iconPath) : undefined

  const showIntro = !readAppSettings().introSeen

  mainWindow = createMainWindowAndLoad(icon, {
    show: !showIntro,
    deferTray: showIntro,
    backgroundColor: showIntro ? '#09090b' : undefined,
    showIntro
  })
}

function debounce(fn: () => void, ms: number): () => void {
  let t: NodeJS.Timeout | null = null
  return () => {
    if (t) clearTimeout(t)
    t = setTimeout(() => {
      t = null
      fn()
    }, ms)
  }
}

app.whenReady().then(() => {
  applyInternetDnsHostResolver()
  void flushHostResolverCaches()

  applyOpenAtLoginSetting(readAppSettings().openAtLogin)

  ipcMain.handle('hub:internet-dns-get', () => readInternetDnsResolved())

  ipcMain.handle('hub:internet-dns-save', async (_event, raw: unknown) => {
    const coerced = coerceInternetDnsSave(raw)
    if (!coerced.ok) return { ok: false as const, error: coerced.error }
    writeInternetDnsResolved(coerced.value)
    applyInternetDnsHostResolver(coerced.value)
    await flushInternetDnsAfterConfigChange()
    await flushWindowsSystemDnsCache()
    return { ok: true as const, needsRestart: false, config: coerced.value }
  })

  ipcMain.handle('hub:relaunch', () => {
    app.relaunch()
    app.exit(0)
  })

  ipcMain.handle('hub:intro-seen', () => {
    markIntroSeen()
  })

  ipcMain.handle('hub:open-external', async (_event, raw: unknown) => {
    if (typeof raw !== 'string' || raw.length > 8192) return
    let parsed: URL
    try {
      parsed = new URL(raw)
    } catch {
      return
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return
    await shell.openExternal(raw)
  })

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) app.quit()
})
