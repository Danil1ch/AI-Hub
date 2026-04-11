import { useEffect, useRef, useState } from 'react'
import type { InternetDnsMode } from '../../shared/internetDns'
import { useHubStore } from '../store'
import { useTranslation } from '../useTranslation'

export function InternetDnsSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, te } = useTranslation()
  const storedMode = useHubStore((s) => s.internetDnsMode)
  const storedUrl = useHubStore((s) => s.internetDohUrl)
  const setInternetDns = useHubStore((s) => s.setInternetDns)

  const [mode, setMode] = useState<InternetDnsMode>(storedMode)
  const [dohUrl, setDohUrl] = useState(storedUrl)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOkHint, setSaveOkHint] = useState(false)
  const wasDialogOpenRef = useRef(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

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

  if (!open) return null

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
              {t('dns.title')}
            </h2>
            <p
              id="internet-dialog-desc"
              className="mt-2.5 text-[13px] leading-relaxed text-stone-300"
            >
              {t('dns.intro')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-stone-400 transition-colors hover:bg-white/[0.07] hover:text-stone-200"
            aria-label={t('dns.close')}
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
                {t('dns.defaultTitle')}
              </span>
              <span
                className={`mt-1 block text-[13px] leading-relaxed ${mode === 'default' ? 'text-stone-200' : 'text-stone-400'}`}
              >
                {t('dns.defaultDesc')}
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
                {t('dns.customTitle')}
              </span>
              <span
                className={`mt-1 block text-[13px] leading-relaxed ${mode === 'custom' ? 'text-stone-200' : 'text-stone-400'}`}
              >
                {t('dns.customDesc')}
              </span>
              {mode === 'custom' ? (
                <input
                  type="url"
                  value={dohUrl}
                  onChange={(e) => setDohUrl(e.target.value)}
                  placeholder={t('dns.placeholder')}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-3 w-full rounded-[10px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,black)] px-3 py-2.5 text-[13px] leading-normal text-stone-100 outline-none ring-0 placeholder:text-stone-500 focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_28%,transparent)]"
                />
              ) : null}
            </span>
          </label>
        </div>

        <p className="mt-4 px-5 text-[12px] leading-relaxed text-stone-400">
          {t('dns.footnote')}
        </p>

        {saveError ? (
          <p className="mx-5 mt-3 text-[13px] leading-relaxed text-red-400/95" role="alert">
            {te(saveError)}
          </p>
        ) : null}

        {saveOkHint ? (
          <div className="mx-5 mt-3 rounded-[10px] border border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-[var(--accent-muted)] px-3.5 py-3">
            <p className="text-[13px] leading-relaxed text-stone-200">{t('dns.applied')}</p>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2.5 border-t border-[var(--line)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2.5 text-[13px] font-medium text-stone-300 transition-colors hover:bg-white/[0.06]"
          >
            {t('dns.cancel')}
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
            {saving ? t('dns.applying') : t('dns.apply')}
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

/** Globe with parallels / meridian (adapted for `currentColor`, dark UI). */
export function InternetGlobeIcon({ className }: { className?: string }) {
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
