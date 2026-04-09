export type InternetDnsMode = 'default' | 'custom'

export type InternetDnsFileV1 = {
  version: 1
  mode: InternetDnsMode
  /** DoH URI template (HTTPS). Empty when mode is default. */
  dohUrl: string
}

export function createDefaultInternetDnsFile(): InternetDnsFileV1 {
  return { version: 1, mode: 'default', dohUrl: '' }
}

/**
 * URI passed to Electron `secureDnsServers` (RFC 8484). POST-based DoH uses a plain HTTPS
 * URI; we only trim — no forced `{?dns}` (that can break some providers).
 */
export function toSecureDnsServerUri(input: string): string {
  let raw = input.trim()
  if (raw.endsWith('/')) raw = raw.slice(0, -1)
  return raw
}

export function validateDohUrlForSave(raw: string): { ok: true; normalized: string } | { ok: false; message: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, message: 'Enter a DoH URL.' }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { ok: false, message: 'Invalid URL.' }
  }

  if (parsed.protocol !== 'https:') return { ok: false, message: 'DoH URL must use https://' }
  if (!parsed.hostname) return { ok: false, message: 'Missing host in URL.' }
  if (trimmed.length > 2048) return { ok: false, message: 'URL is too long.' }

  return { ok: true, normalized: trimmed }
}

export function parseInternetDnsFile(raw: unknown): InternetDnsFileV1 | null {
  if (raw === null || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (o.version !== 1) return null
  if (o.mode !== 'default' && o.mode !== 'custom') return null
  if (typeof o.dohUrl !== 'string') return null
  return { version: 1, mode: o.mode, dohUrl: o.dohUrl }
}
