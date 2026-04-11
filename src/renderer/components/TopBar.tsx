import { useEffect, useRef, useState } from 'react'
import type { Service, ServiceId } from '../../shared/services'
import { SERVICES } from '../../shared/services'
import { TOP_BAR_HEIGHT_PX } from '../../shared/shell'
import { ServiceBrandIcon } from './ServiceBrandIcon'
import { InternetDnsSettingsDialog, InternetGlobeIcon } from './InternetDnsSettingsDialog'
import { LocaleSwitcher } from './LocaleSwitcher'
import { useHubStore } from '../store'
import { useTranslation } from '../useTranslation'

interface TopBarProps {
  active: Service
  onSelect: (id: ServiceId) => void
  onHardReload: () => void
  onGoHome: () => void
}

export function TopBar({ active, onSelect, onHardReload, onGoHome }: TopBarProps) {
  const { t } = useTranslation()
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false)
  const [internetOpen, setInternetOpen] = useState(false)
  const [layoutOpen, setLayoutOpen] = useState(false)
  const serviceCenterRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  const layoutMode = useHubStore((s) => s.layoutMode)
  const setLayoutMode = useHubStore((s) => s.setLayoutMode)
  const layoutSlots = useHubStore((s) => s.layoutSlots)
  const setLayoutSlot = useHubStore((s) => s.setLayoutSlot)

  const multi = layoutMode !== 1

  useEffect(() => {
    if (!serviceMenuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!serviceCenterRef.current?.contains(e.target as Node)) setServiceMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [serviceMenuOpen])

  useEffect(() => {
    if (!layoutOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!layoutRef.current?.contains(e.target as Node)) setLayoutOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [layoutOpen])

  useEffect(() => {
    if (!serviceMenuOpen && !layoutOpen && !internetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setServiceMenuOpen(false)
      setLayoutOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [serviceMenuOpen, layoutOpen, internetOpen])

  const layoutOptions = [
    { mode: 1 as const, labelKey: 'top.layout1' as const },
    { mode: 2 as const, labelKey: 'top.layout2' as const },
    { mode: 3 as const, labelKey: 'top.layout3' as const },
    { mode: 4 as const, labelKey: 'top.layout4' as const }
  ] as const

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

        <div className="relative flex min-w-0 max-w-[min(52vw,360px)] justify-center justify-self-center sm:max-w-[420px]">
          {multi ? (
            <div className="flex min-w-0 items-center justify-center gap-2">
              <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-stone-100">
                {t('top.workspace')}
              </span>
              <span className="text-stone-500">·</span>
              <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-stone-400">
                {layoutMode} {t('top.windows')}
              </span>
            </div>
          ) : (
            <div className="relative min-w-0" ref={serviceCenterRef}>
              <button
                type="button"
                onClick={() => {
                  setLayoutOpen(false)
                  setServiceMenuOpen((v) => !v)
                }}
                className="flex max-w-[min(52vw,360px)] min-w-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-left transition-[background,border-color,box-shadow] hover:border-white/[0.12] hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] sm:max-w-[420px]"
                style={{
                  boxShadow: serviceMenuOpen
                    ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
                aria-expanded={serviceMenuOpen}
                aria-haspopup="listbox"
                title={t('top.switchServiceCenter')}
                aria-label={t('top.switchService')}
              >
                <ServiceBrandIcon
                  id={active.id}
                  accent={active.accent}
                  width={active.id === 'character' ? 22 : 20}
                  height={active.id === 'character' ? 22 : 20}
                  className="shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.02em] text-stone-100">
                  {active.label}
                </span>
                <ChevronDown
                  className="h-3 w-3 shrink-0 opacity-70"
                  open={serviceMenuOpen}
                />
              </button>

              {serviceMenuOpen ? (
                <ul
                  role="listbox"
                  className="absolute left-1/2 top-[calc(100%+8px)] z-[200] max-h-[min(70vh,420px)] min-w-[232px] max-w-[min(92vw,320px)] -translate-x-1/2 overflow-y-auto rounded-[12px] border border-[var(--line)] bg-[var(--surface-elevated)] py-1 shadow-[0_14px_48px_rgba(0,0,0,0.55)]"
                >
                  {SERVICES.map((s) => {
                    const selected = s.id === active.id
                    return (
                      <li key={s.id} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          onClick={() => {
                            if (s.id === active.id) onGoHome()
                            else onSelect(s.id)
                            setServiceMenuOpen(false)
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
        </div>

        <div className="flex min-w-0 shrink-0 items-center justify-end justify-self-end gap-0.5 sm:gap-1">
          <LocaleSwitcher />

          <div className="relative" ref={layoutRef}>
            <button
              type="button"
              onClick={() => {
                setServiceMenuOpen(false)
                setLayoutOpen((v) => !v)
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
              title={t('top.layout')}
              aria-label={t('top.layout')}
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
                {layoutOptions
                  .filter((x) => x.mode !== layoutMode)
                  .map((x) => (
                    <li key={x.mode} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextMode = x.mode
                          setLayoutMode(nextMode)
                          if (nextMode !== 1) {
                            if (layoutSlots[0] == null) setLayoutSlot(0, active.id)
                          }
                          setLayoutOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[13px] tracking-[-0.01em] text-stone-200 transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.04] text-[11px] font-semibold text-stone-300 ring-1 ring-white/[0.08]">
                          {x.mode}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{t(x.labelKey)}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onGoHome}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
            title={t('top.home')}
            aria-label={t('top.home')}
          >
            <HomeIcon className="h-[15px] w-[15px] opacity-90" />
          </button>

          <button
            type="button"
            onClick={onHardReload}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
            title={multi ? t('top.reloadActive') : t('top.reload')}
            aria-label={multi ? t('top.reloadActive') : t('top.reload')}
          >
            <ReloadIcon className="h-[15px] w-[15px] opacity-90" />
          </button>

          <button
            type="button"
            onClick={() => {
              setServiceMenuOpen(false)
              setLayoutOpen(false)
              setInternetOpen(true)
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-200 transition-colors hover:bg-white/[0.08]"
            title={t('top.dns')}
            aria-label={t('top.dns')}
            aria-expanded={internetOpen}
            aria-haspopup="dialog"
          >
            <InternetGlobeIcon className="h-[15px] w-[15px] opacity-90" />
          </button>
        </div>
      </header>

      {internetOpen ? (
        <InternetDnsSettingsDialog open={internetOpen} onClose={() => setInternetOpen(false)} />
      ) : null}
    </>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 10.5L12 3l8.5 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 9.8V20h11V9.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
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
