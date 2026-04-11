import type { UiLocale } from '../../shared/uiLocale'
import { useTranslation } from '../useTranslation'

const btnBase =
  'rounded-md font-semibold tracking-tight transition-[background,color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40'

const activeCls =
  'bg-sky-500/[0.22] text-stone-100 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.38)]'
const idleCls = 'text-stone-400 hover:bg-white/[0.06] hover:text-stone-200'

export function LocaleSwitcher() {
  const { t, preference, setPreference } = useTranslation()

  const h = 'h-8'
  const text = 'text-[11px]'
  const px = 'px-2.5'

  const seg = (loc: UiLocale, label: string) => {
    const on = preference === loc
    return (
      <button
        key={loc}
        type="button"
        onClick={() => setPreference(loc)}
        className={`${btnBase} ${h} ${px} ${text} ${on ? activeCls : idleCls}`}
        title={t('locale.title')}
        aria-pressed={on}
        aria-label={`${t('locale.title')}: ${label}`}
      >
        {label}
      </button>
    )
  }

  const wrap =
    'flex items-center gap-0.5 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04] p-0.5'

  return (
    <div className={wrap} role="group" aria-label={t('locale.title')}>
      {seg('en', t('locale.en'))}
      {seg('ru', t('locale.ru'))}
    </div>
  )
}
