export type UiLocale = 'en' | 'ru'

/** Stored UI choice: explicit EN / RU only. Default is English (no OS auto-detection). */
export type UiLocalePreference = UiLocale

/** IPC / shared validation messages → UI language */
export function translateDnsSaveError(message: string, locale: UiLocale): string {
  const table: Record<string, { en: string; ru: string }> = {
    'Enter a DoH URL.': { en: 'Enter a DoH URL.', ru: 'Введите URL DoH.' },
    'Invalid URL.': { en: 'Invalid URL.', ru: 'Некорректный URL.' },
    'DoH URL must use https://': {
      en: 'DoH URL must use https://',
      ru: 'DoH URL должен начинаться с https://'
    },
    'Missing host in URL.': { en: 'Missing host in URL.', ru: 'В URL нет хоста.' },
    'URL is too long.': { en: 'URL is too long.', ru: 'URL слишком длинный.' },
    'Invalid payload': { en: 'Invalid payload', ru: 'Некорректные данные.' },
    'Invalid mode': { en: 'Invalid mode', ru: 'Некорректный режим.' }
  }
  const row = table[message]
  if (row) return row[locale]
  return message
}

export type MsgKey =
  | 'choose.title'
  | 'choose.subtitle'
  | 'choose.lastSession'
  | 'choose.footer'
  | 'locale.en'
  | 'locale.ru'
  | 'locale.title'
  | 'top.workspace'
  | 'top.windows'
  | 'top.layout'
  | 'top.layout1'
  | 'top.layout2'
  | 'top.layout3'
  | 'top.layout4'
  | 'top.home'
  | 'top.reload'
  | 'top.reloadActive'
  | 'top.switchService'
  | 'top.switchServiceCenter'
  | 'top.dns'
  | 'dns.title'
  | 'dns.intro'
  | 'dns.close'
  | 'dns.defaultTitle'
  | 'dns.defaultDesc'
  | 'dns.customTitle'
  | 'dns.customDesc'
  | 'dns.placeholder'
  | 'dns.footnote'
  | 'dns.cancel'
  | 'dns.apply'
  | 'dns.applying'
  | 'dns.applied'
  | 'embed.chooseService'
  | 'embed.tileSwitchAria'

const DICT: Record<UiLocale, Record<MsgKey, string>> = {
  en: {
    'choose.title': 'Where do you want to start?',
    'choose.subtitle': 'All your AI tools in one place',
    'choose.lastSession': 'Open last session',
    'choose.footer': 'You can switch anytime',
    'locale.en': 'EN',
    'locale.ru': 'RU',
    'locale.title': 'Interface language',
    'top.workspace': 'Workspace',
    'top.windows': 'windows',
    'top.layout': 'Layout',
    'top.layout1': '1 window',
    'top.layout2': '2 windows',
    'top.layout3': '3 windows',
    'top.layout4': '4 windows',
    'top.home': 'Go to service home',
    'top.reload': 'Reload page',
    'top.reloadActive': 'Reload active window',
    'top.switchService': 'Switch AI service',
    'top.switchServiceCenter': 'Choose AI service — click to change',
    'top.dns': 'DNS settings',
    'dns.title': 'DNS settings',
    'dns.intro':
      'Use custom DNS when sites load slowly or fail. In other cases, your device’s defaults apply.',
    'dns.close': 'Close',
    'dns.defaultTitle': 'Use your current service provider',
    'dns.defaultDesc':
      "Uses your device's default DNS. AI Hub does not override it with a custom link.",
    'dns.customTitle': 'Custom DNS link',
    'dns.customDesc': 'HTTPS link from your DNS provider (often ends with /dns-query).',
    'dns.placeholder': 'https://your-provider.example/dns-query',
    'dns.footnote': 'Encrypted DNS inside this app only. Not a VPN.',
    'dns.cancel': 'Cancel',
    'dns.apply': 'Apply',
    'dns.applying': 'Applying…',
    'dns.applied':
      'Applied. In-app resolver and HTTP caches were cleared; on Windows the system DNS client cache was flushed (ipconfig /flushdns). If a tab was already open, use Reload in the top bar (shown after you choose a service).',
    'embed.chooseService': 'Choose a service',
    'embed.tileSwitchAria': 'Switch service for tile {{n}}'
  },
  ru: {
    'choose.title': 'С чего начнём?',
    'choose.subtitle': 'Все ваши ИИ-инструменты в одном месте',
    'choose.lastSession': 'Открыть последнюю сессию',
    'choose.footer': 'Сервис можно сменить в любой момент',
    'locale.en': 'EN',
    'locale.ru': 'RU',
    'locale.title': 'Язык интерфейса',
    'top.workspace': 'Рабочее место',
    'top.windows': 'окон',
    'top.layout': 'Сетка окон',
    'top.layout1': '1 окно',
    'top.layout2': '2 окна',
    'top.layout3': '3 окна',
    'top.layout4': '4 окна',
    'top.home': 'На главную сервиса',
    'top.reload': 'Обновить страницу',
    'top.reloadActive': 'Обновить активное окно',
    'top.switchService': 'Сменить ИИ-сервис',
    'top.switchServiceCenter': 'Выбор ИИ — нажмите, чтобы сменить',
    'top.dns': 'Настройки DNS',
    'dns.title': 'Настройки DNS',
    'dns.intro':
      'Укажите свой DNS, если сайты грузятся медленно или не открываются. Иначе действуют настройки системы.',
    'dns.close': 'Закрыть',
    'dns.defaultTitle': 'Как у провайдера / системы',
    'dns.defaultDesc':
      'Используется DNS устройства. AI Hub не подменяет его своей ссылкой.',
    'dns.customTitle': 'Своя ссылка DNS (DoH)',
    'dns.customDesc': 'HTTPS-ссылка провайдера (часто заканчивается на /dns-query).',
    'dns.placeholder': 'https://ваш-провайдер.example/dns-query',
    'dns.footnote': 'Шифрованный DNS только внутри этого приложения. Не VPN.',
    'dns.cancel': 'Отмена',
    'dns.apply': 'Применить',
    'dns.applying': 'Применение…',
    'dns.applied':
      'Применено. Кэш резолвера и HTTP очищены в приложении; в Windows сброшен клиентский кэш DNS (ipconfig /flushdns). Если вкладка уже была открыта, нажмите «Обновить» в верхней панели (появится после выбора сервиса).',
    'embed.chooseService': 'Выберите сервис',
    'embed.tileSwitchAria': 'Сменить сервис в плитке {{n}}'
  }
}

export function msg(locale: UiLocale, key: MsgKey): string {
  return DICT[locale][key]
}
