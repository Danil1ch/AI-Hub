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

export async function flushHostResolverCaches(): Promise<void> {
  const sessions = [session.defaultSession, ...webviewPartitionNames().map((p) => session.fromPartition(p))]
  await Promise.all(sessions.map((s) => s.clearHostResolverCache().catch(() => undefined)))
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
