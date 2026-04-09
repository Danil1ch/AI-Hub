import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { InternetDnsFileV1, InternetDnsMode } from '../shared/internetDns'
import { createDefaultInternetDnsFile, parseInternetDnsFile, validateDohUrlForSave } from '../shared/internetDns'

const CONFIG_BASENAME = 'internet-dns.json'

/** Same layout Electron uses for `package.json` name `ai-hub` before `app` paths are ready. */
export function defaultUserDataDirForAiHub(): string {
  if (process.platform === 'win32') {
    const base = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
    return path.join(base, 'ai-hub')
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'ai-hub')
  }
  return path.join(os.homedir(), '.config', 'ai-hub')
}

function configPath(dir: string): string {
  return path.join(dir, CONFIG_BASENAME)
}

export function readInternetDnsFromDir(dir: string): InternetDnsFileV1 {
  const fp = configPath(dir)
  if (!fs.existsSync(fp)) return createDefaultInternetDnsFile()
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(fp, 'utf-8'))
    const parsed = parseInternetDnsFile(raw)
    return parsed ?? createDefaultInternetDnsFile()
  } catch {
    return createDefaultInternetDnsFile()
  }
}

export function readInternetDnsResolved(): InternetDnsFileV1 {
  try {
    const dir = app.getPath('userData')
    return readInternetDnsFromDir(dir)
  } catch {
    return readInternetDnsFromDir(defaultUserDataDirForAiHub())
  }
}

export function writeInternetDnsResolved(cfg: InternetDnsFileV1): void {
  const dir = app.getPath('userData')
  fs.mkdirSync(dir, { recursive: true })
  const fp = configPath(dir)
  fs.writeFileSync(fp, `${JSON.stringify(cfg, null, 0)}\n`, 'utf-8')
}

export type InternetDnsSavePayload = { mode: InternetDnsMode; dohUrl: string }

export function coerceInternetDnsSave(raw: unknown):
  | { ok: true; value: InternetDnsFileV1 }
  | { ok: false; error: string } {
  if (raw === null || typeof raw !== 'object') return { ok: false, error: 'Invalid payload' }
  const o = raw as Record<string, unknown>
  if (o.mode !== 'default' && o.mode !== 'custom') return { ok: false, error: 'Invalid mode' }
  const dohUrl = typeof o.dohUrl === 'string' ? o.dohUrl : ''

  if (o.mode === 'custom') {
    const v = validateDohUrlForSave(dohUrl)
    if (!v.ok) return { ok: false, error: v.message }
    return { ok: true, value: { version: 1, mode: 'custom', dohUrl: v.normalized } }
  }

  return { ok: true, value: { version: 1, mode: 'default', dohUrl: '' } }
}
