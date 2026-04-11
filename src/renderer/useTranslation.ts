import { useCallback } from 'react'
import {
  msg,
  translateDnsSaveError,
  type MsgKey,
  type UiLocale,
} from '../shared/uiLocale'
import { useHubStore } from './store'

export function useTranslation() {
  const preference = useHubStore((s) => s.uiLocalePreference)
  const setPreference = useHubStore((s) => s.setUiLocalePreference)

  const locale: UiLocale = preference

  const t = useCallback((key: MsgKey) => msg(locale, key), [locale])

  const te = useCallback((err: string) => translateDnsSaveError(err, locale), [locale])

  const cyclePreference = useCallback(() => {
    setPreference(preference === 'ru' ? 'en' : 'ru')
  }, [preference, setPreference])

  return { t, te, locale, preference, setPreference, cyclePreference }
}
