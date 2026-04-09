<!-- GitHub ignores relative paths in <video>; use raw URL so the player renders -->
<p align="center">
  <video
    src="https://raw.githubusercontent.com/Danil1ch/AI-Hub/main/docs/media/ai-hub-preview.mp4"
    width="100%"
    controls
    playsinline
  ></video>
</p>

<p align="center">
  <a href="https://github.com/Danil1ch/AI-Hub/raw/main/docs/media/ai-hub-preview.mp4">Download / open the demo video (MP4)</a>
</p>

---

# AI Hub

<p align="center">
  <a href="https://nodejs.org/"><img alt="Node.js 18+" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /></a>
  <a href="https://www.electronjs.org/"><img alt="Electron 33" src="https://img.shields.io/badge/Electron-33.x-47848F?style=for-the-badge&logo=electron&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /></a>
  <a href="https://react.dev/"><img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" /></a>
  <a href="https://vitejs.dev/"><img alt="Vite 5" src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" /></a>
  <a href="./LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-fbbf24?style=for-the-badge" /></a>
  <a href="./LICENSE"><img alt="100% free app" src="https://img.shields.io/badge/Price-100%25_Free-22c55e?style=for-the-badge" /></a>
  <a href="https://www.microsoft.com/windows"><img alt="Windows x64" src="https://img.shields.io/badge/Windows-x64-0078D6?style=for-the-badge&logo=windows&logoColor=white" /></a>
</p>

> **Stop opening a pile of browser tabs** just to juggle ChatGPT, Claude, Gemini, and the rest—**one desktop workspace is enough.**

> **Хватит плодить вкладки** ради ChatGPT, Claude, Gemini и остальных ИИ — **соберите всё в одном окне на рабочем столе.**

**EN:** **AI Hub** is a **100% free**, **open-source** (**MIT**) **desktop app** for Windows: a single **Electron** workspace for those services, **split layouts**, **fast switching**. **No paywall for the app itself.**

**RU:** **AI Hub** — **полностью бесплатное** (**MIT**) **open-source** приложение для Windows: то же самое **на одном экране**, **мультиокно**, **быстрое переключение**. **За само приложение не платите** (подписки могут быть только у самих сервисов по их правилам).

---

## English

### Contents

- [Why AI Hub](#why-ai-hub)
- [About AI Hub](#about-ai-hub)
- [Features](#features)
- [System requirements](#system-requirements)
- [Run from source](#run-from-source)
- [Build portable `.exe` (Windows)](#build-portable-exe-windows)
- [Legal & trademarks](#legal--trademarks)
- [Links](#links)

### Why AI Hub

AI Hub pulls popular **AI chat** web apps into **one native window** so you can **switch in a click**, **tile the view to compare answers**, and **hard-reload** a stuck page without losing your rhythm. Built with **Electron**; **free** under **MIT**, not a store subscription.

### About AI Hub

Looking for a **free ChatGPT desktop client**, **Claude alternative**, **Gemini in one place**, **AI chat aggregator**, or **open-source multi-assistant workspace** on Windows—you’re in the right repo. AI Hub is **not affiliated** with OpenAI, Google, Anthropic, Microsoft, or any listed vendor; it shows each provider’s **official website** inside a **local webview** you control.

### Features

- **Multi-AI workspace** — ChatGPT, Claude, Gemini, Qwen, DeepSeek, Kimi, Grok, Perplexity, Mistral, Copilot, Meta AI, Character.AI (see `src/shared/services.ts`).
- **Split view** — up to **four panes**; compare replies side by side without copy-paste gymnastics.
- **Per-service storage** — separate `webview` **partitions** so cookies and logins don’t collide across brands (each site’s own rules still apply).
- **Custom DNS / DoH** — optional tweaks when a network blocks or throttles AI sites.
- **Top bar UX** — **quick switch**, **hard reload**, layout controls, and session-friendly flow.
- **Portable Windows build** — **x64** `.exe` via `electron-builder` (`npm run dist`).
- **MIT & zero price for the hub** — fork, audit, self-build; **the shell stays free**.

### System requirements

- **Windows 10/11 (64-bit)** for the shipped portable target (source can be adapted for other OS later).
- **Node.js 18+** and **npm** for development builds.

### Run from source

```bash
git clone https://github.com/Danil1ch/AI-Hub.git
cd AI-Hub
npm install
npm run dev
```

### Build portable `.exe` (Windows)

```bash
npm run dist
```

Artifacts appear under `release/` (see `package.json` / `electron-builder` config).

### Legal & trademarks

Names like **ChatGPT**, **Claude**, **Gemini**, **Copilot**, etc. are **trademarks of their owners**. AI Hub does not claim ownership; compatibility means **loading public web UIs** in a desktop webview. Use each provider’s **terms of service** and **privacy policy** when you log in.

### Links

- **Source:** [github.com/Danil1ch/AI-Hub](https://github.com/Danil1ch/AI-Hub)
- **Issues:** [github.com/Danil1ch/AI-Hub/issues](https://github.com/Danil1ch/AI-Hub/issues)
- **Releases (when published):** [github.com/Danil1ch/AI-Hub/releases](https://github.com/Danil1ch/AI-Hub/releases)

---

## Русский

### Содержание

- [Зачем AI Hub](#зачем-ai-hub)
- [О проекте](#о-проекте)
- [Особенности](#особенности)
- [Системные требования](#системные-требования)
- [Запуск из исходников](#запуск-из-исходников)
- [Сборка portable EXE (Windows)](#сборка-portable-exe-windows)
- [Право и бренды](#право-и-бренды)
- [Ссылки](#ссылки)

### Зачем AI Hub

Все нужные **ИИ-чаты** — в **одном нативном окне**: **переключаетесь** с верхней панели, **сравниваете ответы** в сетке, **перезагружаете** зависшую страницу. **Electron**, **MIT**, **без оплаты за сам хаб** — не магазинная подписка.

### О проекте

Если искали **бесплатный десктоп для ChatGPT / Claude / Gemini**, **агрегатор нейросетей**, **open-source Electron** под **Windows** — вы по адресу. Проект **не связан** с владельцами брендов: открываются **официальные сайты** в **`webview`**, которым управляете вы. Ключевые слова для поиска: **бесплатный AI клиент**, **мультиокно**, **нейросети в одном приложении**.

### Особенности

- **Мульти-ИИ рабочее место** — ChatGPT, Claude, Gemini, Qwen, DeepSeek, Kimi, Grok, Perplexity, Mistral, Copilot, Meta AI, Character.AI (список в `src/shared/services.ts`).
- **Разделённый экран** — до **четырёх** панелей, сравнение ответов без копипасты.
- **Отдельное хранилище на сервис** — свои **partition** у `webview`, куки разных брендов не мешают друг другу (но правила входа задаёт каждый сайт).
- **Свой DNS / DoH** — когда сеть режет или «душит» доступ к ИИ-сайтам.
- **Верхняя панель** — **смена сервиса**, **жёсткое обновление**, раскладки, удобный сценарий работы.
- **Portable под Windows x64** — **EXE** через `npm run dist` / `electron-builder`.
- **MIT и ноль рублей за оболочку** — можно **собрать самому** и проверить код; **приложение бесплатное**.

### Системные требования

- **Windows 10/11 (x64)** для готовой portable-сборки.
- **Node.js 18+** и **npm** для разработки.

### Запуск из исходников

```bash
git clone https://github.com/Danil1ch/AI-Hub.git
cd AI-Hub
npm install
npm run dev
```

### Сборка portable EXE (Windows)

```bash
npm run dist
```

Готовые файлы — в папке **`release/`**.

### Право и бренды

Названия **ChatGPT**, **Claude**, **Gemini** и др. — **товарные знаки** владельцев. Проект открывает **публичные веб-интерфейсы** в `webview`. Соблюдайте **правила** и **политики** выбранного сервиса при авторизации.

### Ссылки

- **Репозиторий:** [github.com/Danil1ch/AI-Hub](https://github.com/Danil1ch/AI-Hub)
- **Замечания по багам:** [github.com/Danil1ch/AI-Hub/issues](https://github.com/Danil1ch/AI-Hub/issues)
- **Релизы:** [github.com/Danil1ch/AI-Hub/releases](https://github.com/Danil1ch/AI-Hub/releases)
