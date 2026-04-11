import { app, session } from 'electron'
import { SERVICES } from '../shared/services'
import type { InternetDnsFileV1 } from '../shared/internetDns'
import { toSecureDnsServerUri, validateDohUrlForSave } from '../shared/internetDns'
import { readInternetDnsResolved } from './internetDnsConfig'

/** Partitions used by `EmbeddedSite` webviews (must stay in sync). */
export function webviewPartitionNames(): string[] {
  return SERVICES.map((s) =>
    s.id === 'deepseek' ? 'persist:svc.deepseek.chrome-ua' : `persist:svc.${s.id}`
  )
}

function hubSessions(): Electron.Session[] {
  return [session.defaultSession, ...webviewPartitionNames().map((p) => session.fromPartition(p))]
}

export async function flushHostResolverCaches(): Promise<void> {
  await Promise.all(hubSessions().map((s) => s.clearHostResolverCache().catch(() => undefined)))
}

/**
 * After DNS settings change: drop resolver cache + HTTP cache for default session and all
 * service webviews so lookups and pages don’t stick to stale state.
 */
export async function flushInternetDnsAfterConfigChange(): Promise<void> {
  const sessions = hubSessions()
  await Promise.all(sessions.map((s) => s.clearHostResolverCache().catch(() => undefined)))
  await Promise.all(sessions.map((s) => s.clearCache().catch(() => undefined)))
}

/**
 * Apply DoH via Electron host resolver (works at runtime; affects all sessions / webviews).
 * Call after `app.ready`. Pair with `flushHostResolverCaches` so old lookups are dropped.
 */
export function applyInternetDnsHostResolver(cfg?: InternetDnsFileV1): void {
  const c = cfg ?? readInternetDnsResolved()

  if (c.mode === 'custom' && c.dohUrl.trim()) {
    const v = validateDohUrlForSave(c.dohUrl)
    if (v.ok) {
      app.configureHostResolver({
        secureDnsMode: 'secure',
        secureDnsServers: [toSecureDnsServerUri(v.normalized)],
        enableBuiltInResolver: true
      })
      return
    }
  }

  app.configureHostResolver({
    secureDnsMode: 'automatic',
    secureDnsServers: []
  })
}
