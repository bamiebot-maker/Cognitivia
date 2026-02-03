# Cognitivia (Frontend-only BYOK Study Assistant)

Cognitivia is a frontend-only web app that helps you turn notes into flashcards and quizzes, run study sessions, and track progress over time. Everything runs in the browser with local persistence.

## Tech stack
- Vite + React + TypeScript
- HeroUI (React Aria based components)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- IndexedDB via `idb-keyval`

## How it works
- Study sets are created and edited in the browser, then stored in IndexedDB.
- Notes are autosaved and used to generate flashcards and quizzes.
- The AI provider calls a BYOK endpoint using your API key. If the call fails or no key is set, an offline generator builds content from headings and keywords.
- Quiz sessions record answers and accuracy. Attempts are stored locally and used to compute progress insights (accuracy over time, weak topics).
- Settings (theme, difficulty, API key, model, API URL) are saved in localStorage.

## Project structure
```
.
|-- firebase.json
|-- index.html
|-- package.json
|-- src
|   |-- App.tsx
|   |-- index.css
|   |-- main.tsx
|   |-- components
|   |-- context
|   |-- data
|   |-- pages
|   `-- utils
`-- vite.config.ts
```

## Run locally
```
npm install
npm run dev
```

## Build for production
```
npm run build
npm run preview
```

## BYOK (Bring Your Own Key)
- Add your API URL and API key in Settings.
- The app sends requests directly from your browser to the API endpoint.
- The key is stored only in localStorage and never transmitted anywhere else.
- If no key is configured or the call fails, the app falls back to an offline generator.

Security disclaimer: This is a client-only app. Your API key lives in the browser. Only use keys you are comfortable storing in localStorage and revoke/rotate them as needed.

## Firebase Hosting (SPA)
1. Build the app:
   ```
   npm run build
   ```
2. Install Firebase tools and login:
   ```
   npm install -g firebase-tools
   firebase login
   ```
3. Initialize hosting (if needed):
   ```
   firebase init hosting
   ```
   - Select "dist" as the public folder
   - Configure as a single-page app (rewrite to /index.html)
4. Deploy:
   ```
   firebase deploy
   ```

Your site will be available at a `*.web.app` URL after deployment.

## Notes
- Study sets, generated content, and attempts are saved in IndexedDB.
- Settings (theme, default difficulty, BYOK key, model, API URL) are stored in localStorage.
- A sample study set is created on first run.
