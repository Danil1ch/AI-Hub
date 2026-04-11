import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { getService, type ServiceId } from '../../shared/services'
import { EMBED_FRAME_INSET_PX } from '../../shared/shell'

type WebviewEl = HTMLElement & {
  src: string
  partition: string
  reloadIgnoringCache: () => void
  getURL: () => string
}

export type EmbeddedSiteHandle = {
  hardReload: () => void
  openInSystemBrowser: () => void
}

interface EmbeddedSiteProps {
  serviceId: ServiceId
}

function createWebview(serviceId: ServiceId): WebviewEl {
  const { homeUrl } = getService(serviceId)
  const w = document.createElement('webview') as WebviewEl
  w.partition =
    serviceId === 'deepseek' ? 'persist:svc.deepseek.chrome-ua' : `persist:svc.${serviceId}`
  w.src = homeUrl
  w.setAttribute('allowpopups', 'allowpopups')
  w.style.border = 'none'
  w.style.backgroundColor = '#141416'
  return w
}

export const EmbeddedSite = forwardRef<EmbeddedSiteHandle, EmbeddedSiteProps>(function EmbeddedSite(
  { serviceId },
  ref
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const poolRef = useRef<Map<ServiceId, WebviewEl>>(new Map())

  useImperativeHandle(
    ref,
    () => ({
      hardReload: () => {
        const w = poolRef.current.get(serviceId)
        w?.reloadIgnoringCache()
      },
      openInSystemBrowser: () => {
        const w = poolRef.current.get(serviceId)
        const home = getService(serviceId).homeUrl
        let url = home
        if (w && typeof w.getURL === 'function') {
          try {
            const u = w.getURL()
            if (u && !u.startsWith('about:') && /^https?:\/\//i.test(u)) url = u
          } catch {
            /* keep home */
          }
        }
        void window.hub.openExternal(url)
      }
    }),
    [serviceId]
  )

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let w = poolRef.current.get(serviceId)
    if (!w) {
      w = createWebview(serviceId)
      poolRef.current.set(serviceId, w)
    }

    for (const [id, el] of poolRef.current) {
      if (!host.contains(el)) {
        host.appendChild(el)
      }
      const active = id === serviceId
      el.style.position = 'absolute'
      el.style.top = '0'
      el.style.left = '0'
      el.style.right = '0'
      el.style.bottom = '0'
      el.style.width = '100%'
      el.style.height = '100%'
      el.style.zIndex = active ? '2' : '1'
      el.style.visibility = active ? 'visible' : 'hidden'
      el.style.pointerEvents = active ? 'auto' : 'none'
    }
  }, [serviceId])

  useEffect(() => {
    return () => {
      for (const el of poolRef.current.values()) {
        el.remove()
      }
      poolRef.current.clear()
    }
  }, [])

  const pad = EMBED_FRAME_INSET_PX

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 bg-[var(--canvas)]"
      style={{
        flex: '1 1 auto',
        padding: pad
      }}
    >
      <div
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-[10px] ring-1 ring-white/[0.08]"
        style={{
          flex: '1 1 auto',
          boxShadow: '0 14px 52px -18px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        }}
      >
        <div ref={hostRef} className="absolute inset-0 min-h-0 min-w-0" />
      </div>
    </div>
  )
})
