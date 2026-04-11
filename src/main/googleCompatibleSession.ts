import { app, session, type Session, type WebRequestFilter } from 'electron'

/** Normal `Set`: some Electron builds pass non-object values into `session-created`. */
const configuredSessions = new Set<Session>()

/** Match embedded Chromium so Google OAuth sees a normal Chrome on Windows (not Electron). */
function chromeLikeUserAgent(): string {
  const v = process.versions.chrome
  return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v} Safari/537.36`
}

/** Broad filter; we only mutate headers for Google-related hosts inside the listener. */
const ALL_HTTP: WebRequestFilter = { urls: ['http://*/*', 'https://*/*'] }

function shouldAugmentHeadersForUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return (
      h === 'google.com' ||
      h.endsWith('.google.com') ||
      h.endsWith('.google.ru') ||
      h.endsWith('.googleapis.com') ||
      h.endsWith('.gstatic.com')
    )
  } catch {
    return false
  }
}

function configureSession(sess: Session | null | undefined): void {
  if (sess == null || typeof sess !== 'object') return
  if (configuredSessions.has(sess)) return
  configuredSessions.add(sess)

  const ua = chromeLikeUserAgent()
  try {
    sess.setUserAgent(ua)
  } catch {
    /* ignore */
  }

  const major = process.versions.chrome.split('.')[0] || '131'

  try {
    sess.webRequest.onBeforeSendHeaders(ALL_HTTP, (details, callback) => {
      if (!shouldAugmentHeadersForUrl(details.url)) {
        callback({ requestHeaders: details.requestHeaders })
        return
      }
      const headers = { ...details.requestHeaders }
      headers['Sec-CH-UA'] = `"Chromium";v="${major}", "Google Chrome";v="${major}", "Not_A Brand";v="24"`
      headers['Sec-CH-UA-Mobile'] = '?0'
      headers['Sec-CH-UA-Platform'] = '"Windows"'
      callback({ requestHeaders: headers })
    })
  } catch {
    /* ignore */
  }
}

/**
 * Call from `app.whenReady()` before creating windows/webviews.
 * Configures the default session, future partition sessions, and app UA fallback.
 */
export function registerGoogleCompatibleSessions(): void {
  const ua = chromeLikeUserAgent()
  try {
    app.userAgentFallback = ua
  } catch {
    /* ignore */
  }

  configureSession(session.defaultSession)

  app.on('session-created', (_event, sess) => {
    configureSession(sess as Session | undefined)
  })
}
