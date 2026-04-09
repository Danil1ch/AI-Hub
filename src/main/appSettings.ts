import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

export type AppSettingsV1 = {
  version: 1
  openAtLogin: boolean
  /** After the long intro overlay has been shown once. */
  introSeen: boolean
}

const FILENAME = 'app-settings.json'

function filePath(): string {
  return path.join(app.getPath('userData'), FILENAME)
}

export function readAppSettings(): AppSettingsV1 {
  try {
    const fp = filePath()
    if (!fs.existsSync(fp)) {
      return { version: 1, openAtLogin: true, introSeen: false }
    }
    const raw = JSON.parse(fs.readFileSync(fp, 'utf-8')) as unknown
    const r = raw as Record<string, unknown>
    if (r?.version !== 1) {
      return { version: 1, openAtLogin: true, introSeen: true }
    }
    const openAtLogin = typeof r.openAtLogin === 'boolean' ? r.openAtLogin : true
    /* Files from before introSeen: treat as already seen so we do not force the long intro. */
    const introSeen = r.introSeen === undefined ? true : Boolean(r.introSeen)
    return { version: 1, openAtLogin, introSeen }
  } catch {
    return { version: 1, openAtLogin: true, introSeen: true }
  }
}

export function markIntroSeen(): void {
  const cur = readAppSettings()
  writeAppSettings({ version: 1, openAtLogin: cur.openAtLogin, introSeen: true })
}

export function writeAppSettings(s: AppSettingsV1): void {
  fs.mkdirSync(app.getPath('userData'), { recursive: true })
  fs.writeFileSync(filePath(), `${JSON.stringify(s)}\n`, 'utf-8')
}

/** Applies OS login-item registration (packaged app only — avoids dev Electron in Startup). */
export function applyOpenAtLoginSetting(openAtLogin: boolean): void {
  if (!app.isPackaged) {
    return
  }
  try {
    app.setLoginItemSettings({
      openAtLogin
    })
  } catch {
    //
  }
}
