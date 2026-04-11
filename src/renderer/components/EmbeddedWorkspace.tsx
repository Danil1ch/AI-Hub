import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { SERVICES, getService, type ServiceId } from '../../shared/services'
import { EMBED_FRAME_INSET_PX } from '../../shared/shell'
import { useHubStore, type LayoutMode } from '../store'
import { useTranslation } from '../useTranslation'
import { ServiceBrandIcon } from './ServiceBrandIcon'

type WebviewEl = HTMLElement & {
  src: string
  partition: string
  loadURL: (url: string) => Promise<void> | void
  reloadIgnoringCache: () => void
  getURL: () => string
}

export type EmbeddedWorkspaceHandle = {
  hardReload: () => void
  goHome: () => void
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

function layoutSlotCount(mode: LayoutMode): 1 | 2 | 3 | 4 {
  return mode
}

function gridTemplateFor(mode: LayoutMode): string {
  if (mode === 2) return 'grid-cols-2 grid-rows-1'
  if (mode === 3) return 'grid-cols-2 grid-rows-2'
  if (mode === 4) return 'grid-cols-2 grid-rows-2'
  return 'grid-cols-1 grid-rows-1'
}

function slotClass(mode: LayoutMode, idx: number): string {
  if (mode === 3 && idx === 2) return 'col-span-2'
  return ''
}

export const EmbeddedWorkspace = forwardRef<EmbeddedWorkspaceHandle>(function EmbeddedWorkspace(_, ref) {
  const { t } = useTranslation()
  const activeId = useHubStore((s) => s.activeId)
  const layoutMode = useHubStore((s) => s.layoutMode)
  const layoutSlots = useHubStore((s) => s.layoutSlots)
  const setActive = useHubStore((s) => s.setActive)
  const setLayoutSlot = useHubStore((s) => s.setLayoutSlot)
  const swapLayoutSlots = useHubStore((s) => s.swapLayoutSlots)

  const poolRef = useRef<Map<ServiceId, WebviewEl>>(new Map())
  const hostRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null])

  const slots = useMemo(() => {
    const count = layoutSlotCount(layoutMode)
    if (layoutMode === 1) {
      return [activeId]
    }
    return layoutSlots.slice(0, count)
  }, [activeId, layoutMode, layoutSlots])

  // In multi-pane mode, `activeId` is focus only; it does not force any slot.

  useImperativeHandle(
    ref,
    () => ({
      hardReload: () => {
        if (!activeId) return
        const w = poolRef.current.get(activeId)
        w?.reloadIgnoringCache()
      },
      goHome: () => {
        if (!activeId) return
        const w = poolRef.current.get(activeId)
        if (!w || typeof w.loadURL !== 'function') return
        void w.loadURL(getService(activeId).homeUrl)
      }
    }),
    [activeId]
  )

  // (log removed)

  useEffect(() => {
    for (const id of slots) {
      if (!id) continue
      if (!poolRef.current.get(id)) {
        const w = createWebview(id)
        // Webview lifecycle logging (helps triage multi-window bugs).
        w.addEventListener('focus', () => {
          // Clicking inside a <webview> doesn't bubble to the React wrapper; keep our "active tile" in sync.
          setActive(id)
        })
        w.addEventListener('did-fail-load', (e: any) => {
          // no-op (log removed)
        })
        w.addEventListener('crashed', () => {
          // no-op (log removed)
        })
        w.addEventListener('render-process-gone', (e: any) => {
          // no-op (log removed)
        })
        poolRef.current.set(id, w)
      }
    }

    slots.forEach((id, idx) => {
      const host = hostRefs.current[idx]
      if (!host) return
      if (!id) {
        host.innerHTML = ''
        return
      }
      const w = poolRef.current.get(id)
      if (!w) return
      if (!host.contains(w)) {
        host.innerHTML = ''
        host.appendChild(w)
      }
      w.style.position = 'absolute'
      w.style.top = '0'
      w.style.left = '0'
      w.style.right = '0'
      w.style.bottom = '0'
      w.style.width = '100%'
      w.style.height = '100%'
      w.style.visibility = 'visible'
      w.style.pointerEvents = 'auto'
      w.style.zIndex = '1'
    })
  }, [slots])

  useEffect(() => {
    return () => {
      for (const el of poolRef.current.values()) el.remove()
      poolRef.current.clear()
    }
  }, [])

  const pad = EMBED_FRAME_INSET_PX
  const count = layoutSlotCount(layoutMode)

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 bg-[var(--canvas)]"
      style={{
        flex: '1 1 auto',
        padding: pad
      }}
    >
      <div
        className={`grid min-h-0 min-w-0 flex-1 gap-3 ${gridTemplateFor(layoutMode)}`}
        style={{ flex: '1 1 auto' }}
      >
        {Array.from({ length: count }).map((_, idx) => {
          const id = slots[idx] ?? null
          const isActive = id != null && id === activeId
          const accent = id ? getService(id).accent : null
          const showActiveRing = layoutMode !== 1 && isActive && accent
          return (
            <div
              key={idx}
              className={`relative min-h-0 min-w-0 overflow-hidden rounded-[10px] ring-1 ring-white/[0.08] ${slotClass(layoutMode, idx)}`}
              style={{
                boxShadow: [
                  '0 14px 52px -18px rgba(0, 0, 0, 0.75)',
                  'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                  showActiveRing ? `0 0 0 1px color-mix(in srgb, ${accent} 38%, transparent)` : null,
                  showActiveRing ? `0 0 0 4px color-mix(in srgb, ${accent} 10%, transparent)` : null
                ]
                  .filter(Boolean)
                  .join(', ')
              }}
              onMouseDown={() => {
                if (id) setActive(id)
              }}
            >
              {id ? (
                <>
                  {layoutMode !== 1 ? (
                    <TileSwitch
                      slotIdx={idx as 0 | 1 | 2 | 3}
                      serviceId={id}
                      active={isActive}
                      onPick={(picked) => {
                        // If chosen service already exists in another slot, swap tiles.
                        const otherIdx = layoutSlots.findIndex((x, j) => j !== idx && x === picked)
                        if (otherIdx >= 0) {
                          swapLayoutSlots(otherIdx as 0 | 1 | 2 | 3, idx as 0 | 1 | 2 | 3)
                          if (isActive) setActive(picked)
                          return
                        }
                        setLayoutSlot(idx as 0 | 1 | 2 | 3, picked)
                        if (isActive) setActive(picked)
                      }}
                    />
                  ) : null}
                  <div ref={(el) => (hostRefs.current[idx] = el)} className="absolute inset-0" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--surface-elevated)_70%,black)]">
                  <div className="w-full max-w-[280px] rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                    <p className="mb-2 text-[12px] font-medium text-stone-300">{t('embed.chooseService')}</p>
                    <div className="grid max-h-[220px] grid-cols-2 gap-2 overflow-auto pr-1">
                      {SERVICES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setLayoutSlot(idx as 0 | 1 | 2 | 3, s.id)
                          }}
                          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2 text-left text-[12px] text-stone-200 transition-colors hover:bg-white/[0.06]"
                        >
                          <ServiceBrandIcon id={s.id} accent={s.accent} width={14} height={14} />
                          <span className="min-w-0 flex-1 truncate">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

function TileSwitch({
  slotIdx,
  serviceId,
  active,
  onPick
}: {
  slotIdx: 0 | 1 | 2 | 3
  serviceId: ServiceId
  active: boolean
  onPick: (id: ServiceId) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const svc = getService(serviceId)
  return (
    <div
      ref={rootRef}
      className="absolute left-1/2 top-2 z-[10] -translate-x-1/2"
      style={{ pointerEvents: 'auto' }}
      onMouseDown={(e) => {
        // Prevent the tile from stealing focus / becoming slot0 when user interacts with the switch.
        e.stopPropagation()
      }}
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={`flex max-w-[min(46vw,220px)] items-center gap-2 rounded-lg border px-2 py-1 text-[12px] font-medium text-stone-200 backdrop-blur transition-colors ${
          active
            ? 'border-[color-mix(in_srgb,var(--accent)_28%,transparent)] bg-black/45'
            : 'border-white/10 bg-black/35 hover:bg-black/45'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('embed.tileSwitchAria').replace('{{n}}', String(slotIdx + 1))}
      >
        <ServiceBrandIcon id={serviceId} accent={svc.accent} width={14} height={14} />
        <span className="min-w-0 max-w-[140px] truncate">{svc.label}</span>
        <ChevronSmall className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          className="mt-2 overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[0_14px_60px_rgba(0,0,0,0.55)]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="max-h-[min(46vh,380px)] overflow-y-auto py-1">
            {SERVICES.map((s) => {
              const selected = s.id === serviceId
              return (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPick(s.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px] tracking-[-0.01em] transition-colors ${
                    selected
                      ? 'bg-[var(--accent-muted)] text-stone-100'
                      : 'text-stone-400 hover:bg-[var(--surface-hover)] hover:text-stone-200'
                  }`}
                >
                  <ServiceBrandIcon
                    id={s.id}
                    accent={s.accent}
                    width={s.id === 'character' ? 18 : 16}
                    height={s.id === 'character' ? 18 : 16}
                    className="shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ChevronSmall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

