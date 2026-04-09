import { useEffect, useRef, useState } from 'react'
import type { Service, ServiceId } from '../../shared/services'
import { SERVICES } from '../../shared/services'
import { TOP_BAR_HEIGHT_PX } from '../../shared/shell'
import { ServiceBrandIcon } from './ServiceBrandIcon'
import { useHubStore } from '../store'
import type { InternetDnsMode } from '../../shared/internetDns'

interface TopBarProps {
  active: Service
  onSelect: (id: ServiceId) => void
  onHardReload: () => void
}

export function TopBar({ active, onSelect, onHardReload }: TopBarProps) {
  const [open, setOpen] = useState(false)
  const [internetOpen, setInternetOpen] = useState(false)
  const [layoutOpen, setLayoutOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  const layoutMode = useHubStore((s) => s.layoutMode)
  const setLayoutMode = useHubStore((s) => s.setLayoutMode)
  const layoutSlots = useHubStore((s) => s.layoutSlots)
  const setLayoutSlot = useHubStore((s) => s.setLayoutSlot)

  const multi = layoutMode !== 1

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!internetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInternetOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [internetOpen])

  useEffect(() => {
    if (!layoutOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!layoutRef.current?.contains(e.target as Node)) setLayoutOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [layoutOpen])

  return (
    <>
    <header
      className="sticky top-0 z-[100] grid w-full shrink-0 grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 border-b border-white/[0.07] px-2.5 backdrop-blur-xl backdrop-saturate-150 min-[520px]:px-3"
      style={{
        height: TOP_BAR_HEIGHT_PX,
        backgroundColor: 'color-mix(in srgb, var(--surface) 78%, transparent)',
        boxShadow: 'inset 0 -1px 0 color-mix(in srgb, var(--accent) 12%, transparent)'
      }}
    >
      <div className="min-w-0 justify-self-start" aria-hidden />

      <div className="flex min-w-0 max-w-[min(52vw,360px)] items-center justify-center gap-2 justify-self-center sm:max-w-[420px]">
        {multi ? (
          <>
            <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-stone-100">
              Workspace
            </span>
            <span className="text-stone-500">·</span>
            <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-stone-400">
              {layoutMode} windows
            </span>
          </>
        ) : (
          <>
            <ServiceBrandIcon
              id={active.id}
              accent={active.accent}
              width={active.id === 'character' ? 22 : 20}
              height={active.id === 'character' ? 22 : 20}
              className="shrink-0"
            />
            <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-stone-100">
              {active.label}
            </span>
          </>
        )}
      </div>

      <div className="flex min-w-0 shrink-0 items-center justify-end justify-self-end gap-0.5 sm:gap-1">
        <div className="relative" ref={layoutRef}>
          <button
            type="button"
            onClick={() => setLayoutOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
            title="Layout"
            aria-label="Layout"
            aria-expanded={layoutOpen}
            aria-haspopup="listbox"
          >
            <LayoutIcon className="h-[15px] w-[15px] opacity-90" />
          </button>

          {layoutOpen ? (
            <ul
              role="listbox"
              className="absolute right-0 top-[calc(100%+6px)] z-[220] min-w-[210px] overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--surface-elevated)] py-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              {(
                [
                  { mode: 1 as const, label: '1 window' },
                  { mode: 2 as const, label: '2 windows' },
                  { mode: 3 as const, label: '3 windows' },
                  { mode: 4 as const, label: '4 windows' }
                ] as const
              )
                // Always keep 1 first; hide current selection
                .filter((x) => x.mode !== layoutMode)
                .map((x) => (
                  <li key={x.mode} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = x.mode
                        setLayoutMode(nextMode)
                        if (nextMode !== 1) {
                          // Seed slot0 on first entry into multi-pane mode.
                          if (layoutSlots[0] == null) setLayoutSlot(0, active.id)
                        }
                        setLayoutOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[13px] tracking-[-0.01em] text-stone-200 transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.04] text-[11px] font-semibold text-stone-300 ring-1 ring-white/[0.08]">
                        {x.mode}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{x.label}</span>
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>

        {multi ? null : (
        <div className="relative" ref={rootRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 max-w-[min(38vw,148px)] items-center gap-1 rounded-lg px-2 text-[12px] font-medium tracking-[-0.01em] text-stone-200 transition-colors hover:bg-white/[0.08] min-[520px]:max-w-[200px] min-[520px]:gap-1.5 min-[520px]:px-2.5 min-[520px]:text-[13px]"
            style={{
              boxShadow: open ? '0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent)' : undefined
            }}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label="Switch AI service"
          >
            <span className="min-w-0 truncate">Switch</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-70" open={open} />
          </button>

          {open ? (
            <ul
              role="listbox"
              className="absolute right-0 top-[calc(100%+6px)] z-[200] max-h-[min(70vh,420px)] min-w-[232px] overflow-y-auto rounded-[10px] border border-[var(--line)] bg-[var(--surface-elevated)] py-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              {SERVICES.map((s) => {
                const selected = s.id === active.id
                return (
                  <li key={s.id} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(s.id)
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
                        width={s.id === 'character' ? 22 : 18}
                        height={s.id === 'character' ? 22 : 18}
                        className="shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
        )}

        <button
          type="button"
          onClick={onHardReload}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
          title={multi ? 'Reload active window' : 'Reload page'}
          aria-label={multi ? 'Reload active window' : 'Reload page, ignoring cache'}
        >
          <ReloadIcon className="h-[15px] w-[15px] opacity-90" />
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setInternetOpen(true)
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
            title="DNS settings"
            aria-label="DNS settings"
            aria-expanded={internetOpen}
            aria-haspopup="dialog"
        >
          <InternetGlobeIcon className="h-[15px] w-[15px] opacity-90" />
        </button>
      </div>
    </header>

    {internetOpen ? (
      <InternetSettingsStub open={internetOpen} onClose={() => setInternetOpen(false)} />
    ) : null}
    </>
  )
}

function InternetSettingsStub({ open, onClose }: { open: boolean; onClose: () => void }) {
  const storedMode = useHubStore((s) => s.internetDnsMode)
  const storedUrl = useHubStore((s) => s.internetDohUrl)
  const setInternetDns = useHubStore((s) => s.setInternetDns)

  const [mode, setMode] = useState<InternetDnsMode>(storedMode)
  const [dohUrl, setDohUrl] = useState(storedUrl)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOkHint, setSaveOkHint] = useState(false)
  const wasDialogOpenRef = useRef(false)

  /** Only reset local state when the dialog opens — not when Zustand updates after Save (fixes missing success hint). */
  useEffect(() => {
    if (open && !wasDialogOpenRef.current) {
      setMode(storedMode)
      setDohUrl(storedUrl)
      setSaveError(null)
      setSaveOkHint(false)
    }
    wasDialogOpenRef.current = open
  }, [open, storedMode, storedUrl])

  const dirty =
    mode !== storedMode || (mode === 'custom' && dohUrl.trim() !== storedUrl.trim())
  const canApply = dirty && !(mode === 'custom' && !dohUrl.trim())

  const onApply = async () => {
    if (!canApply || saving) return
    setSaveError(null)
    setSaveOkHint(false)
    setSaving(true)
    try {
      const res = await window.hub.internetDns.save({
        mode,
        dohUrl: mode === 'custom' ? dohUrl : ''
      })
      if (!res.ok) {
        setSaveError(res.error)
        return
      }
      setInternetDns(res.config.mode, res.config.dohUrl)
      setDohUrl(res.config.dohUrl)
      setSaveOkHint(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="internet-dialog-title"
        aria-describedby="internet-dialog-desc"
        className="relative z-[1] w-full max-w-[440px] overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-5 pt-5">
          <div className="min-w-0 pr-2">
            <h2
              id="internet-dialog-title"
              className="text-[17px] font-semibold tracking-[-0.03em] text-stone-100"
            >
              DNS settings
            </h2>
            <p
              id="internet-dialog-desc"
              className="mt-2.5 text-[13px] leading-relaxed text-stone-300"
            >
              Use custom DNS when sites load slowly or fail. In other cases, your device&apos;s
              defaults apply.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-stone-400 transition-colors hover:bg-white/[0.07] hover:text-stone-200"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5 px-5 pb-1">
          <label
            className={`flex cursor-pointer gap-3 rounded-[12px] border p-3.5 transition-all ${
              mode === 'default'
                ? 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-muted)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_12%,transparent)]'
                : 'border border-transparent bg-[var(--surface)] hover:border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            <input
              type="radio"
              name="internet-dns-mode"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              checked={mode === 'default'}
              onChange={() => setMode('default')}
            />
            <DnsOptionNormalIcon
              className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${mode === 'default' ? 'text-stone-200' : 'text-stone-400'}`}
            />
            <span className="min-w-0">
              <span
                className={`block text-[13px] font-semibold ${mode === 'default' ? 'text-stone-100' : 'text-stone-200'}`}
              >
                Use your current service provider
              </span>
              <span
                className={`mt-1 block text-[13px] leading-relaxed ${mode === 'default' ? 'text-stone-200' : 'text-stone-400'}`}
              >
                Uses your device&apos;s default DNS. AI Hub does not override it with a custom link.
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer gap-3 rounded-[12px] border p-3.5 transition-all ${
              mode === 'custom'
                ? 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-muted)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_12%,transparent)]'
                : 'border border-transparent bg-[var(--surface)] hover:border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            <input
              type="radio"
              name="internet-dns-mode"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              checked={mode === 'custom'}
              onChange={() => setMode('custom')}
            />
            <DnsOptionCustomIcon
              className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${mode === 'custom' ? 'text-stone-200' : 'text-stone-400'}`}
            />
            <span className="min-w-0 flex-1">
              <span
                className={`block text-[13px] font-semibold ${mode === 'custom' ? 'text-stone-100' : 'text-stone-200'}`}
              >
                Custom DNS link
              </span>
              <span
                className={`mt-1 block text-[13px] leading-relaxed ${mode === 'custom' ? 'text-stone-200' : 'text-stone-400'}`}
              >
                HTTPS link from your DNS provider (often ends with /dns-query).
              </span>
              {mode === 'custom' ? (
                <input
                  type="url"
                  value={dohUrl}
                  onChange={(e) => setDohUrl(e.target.value)}
                  placeholder="https://your-provider.example/dns-query"
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-3 w-full rounded-[10px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,black)] px-3 py-2.5 text-[13px] leading-normal text-stone-100 outline-none ring-0 placeholder:text-stone-500 focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_28%,transparent)]"
                />
              ) : null}
            </span>
          </label>
        </div>

        <p className="mt-4 px-5 text-[12px] leading-relaxed text-stone-400">
          Encrypted DNS inside this app only. Not a VPN.
        </p>

        {saveError ? (
          <p className="mx-5 mt-3 text-[13px] leading-relaxed text-red-400/95" role="alert">
            {saveError}
          </p>
        ) : null}

        {saveOkHint ? (
          <div className="mx-5 mt-3 rounded-[10px] border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-[var(--accent-muted)] px-3.5 py-3">
            <p className="text-[13px] leading-relaxed text-stone-200">
              <span className="font-semibold text-stone-100">Applied.</span>{' '}
              If this tab was already open, press <span className="font-medium text-stone-100">Reload</span> in the
              top bar.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2.5 border-t border-[var(--line)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2.5 text-[13px] font-medium text-stone-300 transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !canApply}
            onClick={() => void onApply()}
            className={`flex-1 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition-opacity ${
              canApply && !saving
                ? 'bg-[var(--accent)] text-white shadow-[0_4px_20px_-4px_color-mix(in_srgb,var(--accent)_45%,transparent)] hover:opacity-95'
                : 'cursor-not-allowed bg-white/[0.06] text-stone-500 shadow-none'
            } ${saving ? 'opacity-80' : ''}`}
          >
            {saving ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DnsOptionNormalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.55a11 11 0 0114 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M8.53 16.11a6 6 0 016.95 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M12 20h.01" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}

function DnsOptionCustomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ReloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 0114.906-4M20 12a8 8 0 01-14.906 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M17 5V2h3M7 19v3H4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.75 4.75h6.5v6.5h-6.5v-6.5zM12.75 4.75h6.5v6.5h-6.5v-6.5zM4.75 12.75h6.5v6.5h-6.5v-6.5zM12.75 12.75h6.5v6.5h-6.5v-6.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Globe with parallels / meridian (adapted for `currentColor`, dark UI). */
function InternetGlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 15L20 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9L20 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fill="currentColor"
        d="M12.0004 20.8182L11.2862 21.5181C11.4742 21.7101 11.7317 21.8182 12.0004 21.8182C12.2691 21.8182 12.5265 21.7101 12.7146 21.5181L12.0004 20.8182ZM12.0004 3.18188L12.7146 2.48198C12.5265 2.29005 12.2691 2.18188 12.0004 2.18188C11.7317 2.18188 11.4742 2.29005 11.2861 2.48198L12.0004 3.18188ZM14.6004 12.0001C14.6004 15.1611 13.3373 18.0251 11.2862 20.1183L12.7146 21.5181C15.1173 19.0662 16.6004 15.7053 16.6004 12.0001H14.6004ZM11.2861 3.88178C13.3373 5.97501 14.6004 8.83903 14.6004 12.0001H16.6004C16.6004 8.29478 15.1173 4.93389 12.7146 2.48198L11.2861 3.88178ZM9.40039 12.0001C9.40039 8.83903 10.6634 5.97501 12.7146 3.88178L11.2861 2.48198C8.88347 4.93389 7.40039 8.29478 7.40039 12.0001H9.40039ZM12.7146 20.1183C10.6634 18.0251 9.40039 15.1611 9.40039 12.0001H7.40039C7.40039 15.7053 8.88348 19.0662 11.2862 21.5181L12.7146 20.1183Z"
      />
    </svg>
  )
}

function ChevronDown({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      className={`${className ?? ''} transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
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
