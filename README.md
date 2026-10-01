# 🌱 Plantree

**Your personal arborist, plant doctor, and growth companion — completely free.**

Identify plants from photos, diagnose problems, track day-by-day growth, and get simple step-by-step care advice. All data stays on your device. AI powered by free OpenRouter models.

**Live site (after deploy):** https://ohkariku-boop.github.io/plantree/

---

## Features

- **Identify** – Snap or upload a photo → get plant name + care basics
- **Plant Doctor** – Upload a problem photo → diagnosis + recovery steps
- **My Plants** – Personal collection with care guides
- **Growth Journal** – Photo + notes timeline for each plant
- **Offline-friendly** – PWA, data in localStorage
- **100% free** – No paid APIs required (uses free OpenRouter models)

---

## Quick start (local)

```bash
git clone https://github.com/ohkariku-boop/plantree.git
cd plantree
npm install
npm run dev
```

Open http://localhost:5173/plantree/

### Add your free OpenRouter key

1. Go to [openrouter.ai](https://openrouter.ai) → sign up (free)
2. Create an API key
3. In the app → **Settings** → paste the key → Save

That’s it. Identification and diagnosis will work.

---

## Deploy to GitHub Pages (free)

1. Push this repo to `https://github.com/ohkariku-boop/plantree`
2. In the repo → **Settings → Pages**
3. Source: **GitHub Actions** (or Deploy from branch `gh-pages`)
4. Or simply run:

```bash
npm install
npm run deploy
```

(The `deploy` script builds and pushes the `dist` folder to the `gh-pages` branch.)

Make sure the `base` in `vite.config.ts` matches your repo name (`/plantree/`).

---

## Tech

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- OpenRouter (Gemini / Llama Vision free models)
- LocalStorage for plants & journal
- PWA ready

---

## Roadmap ideas

- Cloud sync (optional Supabase)
- Watering reminders / push notifications
- More detailed care calendars
- Community tips
- Offline model fallback

---

Made with care for plant parents. Contributions welcome!
