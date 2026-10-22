# ✦ Sonic — music from any link, together

A runnable, dark Spotify-inspired music web app rebuilt from your screen recording.

## Run it on Windows (VS Code or a regular terminal)

1. Install **Node.js 20 or newer** from https://nodejs.org (skip if already installed).
2. Extract `Sonic-Music-App.zip` and open the **sonic-music-app** folder in VS Code.
3. Open **Terminal → New Terminal** and run:

   ```powershell
   npm start
   ```

4. Open **http://localhost:3000** in Edge or Chrome.
5. Register an account to save songs and playlists. The six **Sonic Originals** demo tracks play immediately even without an account.

There is **no `npm install` step**: this project uses built-in Node libraries and plain HTML/CSS/JS. Stop the server with `Ctrl+C`.

## Features

- Dark Spotify-style home, search, jams, music library, likes, playlists, filters, and mini-player.
- Play real audio from **MP3/WAV/M4A/OGG/WEBM/FLAC** files (up to 20 MB each) and direct audio URLs.
- Save and open **YouTube** links via its embedded player (subject to YouTube restrictions).
- Save **Instagram** Reel/post links and open them at the source, since in-app playback isn't generally guaranteed.
- Save **Google Drive** public file links and show a Drive preview (depending on file sharing and provider permissions).
- Six original electronic instrumentals included, so there is audio to test right away.
- Color palettes, live accent-color controls, multiple fonts, and sparkle animations when buttons are clicked.
- Text-prompt theme generation: works with built-in prompt-matched palettes by default. To enable true AI-generated palettes, put your own Gemini API key in a file named `.env` (see `.env.example`) and restart the server.
- Email/password login (prototype), liked songs, personal uploads, playlists.
- Shareable rooms with a code, live WebSocket chat, shared song queue, and controls anyone can use.

## Listen with friends

Open **Listening Rooms → New room**. Share the invitation link/code. Friends must create accounts and reach the **same running server**. Songs uploaded or added to room queue will then be available to the room. Direct audio playback positions are synchronized across participants. YouTube sync is best-effort; its player/API/browser may prevent exact timing or autoplay. Google Drive and Instagram have separate players and cannot offer reliable cross-device synchronization.

`localhost:3000` is **only on your computer**. To invite people elsewhere, deploy the Node project to a web host that supports **persistent Node servers + WebSockets** and HTTPS. Configure persistent storage for the `data/` and `uploads/` directories and use a database/security upgrades before launching publicly. The local version alone **does not create a public website**.

## Optional AI theme API key

Copy `.env.example` to `.env`, then edit:

```
GEMINI_API_KEY=YOUR_OWN_KEY
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

Do not share `.env` or put API keys into `public/`. Without a key, the theme generator still picks colors/fonts from your prompt using built-in themes.

## Notes & limitations

- This is a personal/self-hosted prototype, not a production Spotify clone or a licensed music-streaming service. Sonic does not scrape/download music from YouTube, Instagram, or Google.
- A normal **Google Search** link or a web article is **not** a playable audio URL. Use a direct audio file link, YouTube video, public Drive file, or upload instead.
- Account storage uses local JSON files; there is no email verification or password recovery. Use a unique password and do not host publicly without additional hardening/moderation.
- Browser autoplay policies require a user click on some devices. Embedded services can disable playback or controls.
- Songs provided as demo tracks are original custom-generated audio, not copyrighted commercial songs.

## Testing

```powershell
npm test
```

The test checks registration, music library, favorites, playlists, AI theme fallback, 206 audio streaming, and live multi-user WebSocket room queue/chat behavior.

## Files

- `public/index.html` — app shell
- `public/styles.css` — dark styling, layouts, animations, mobile responsiveness
- `public/app.js` — all front-end screens and interactions
- `public/demo/` — playable, original sample tracks
- `server.js` — HTTP API, accounts, playlists, rooms, uploads, audio streaming, WebSockets
- `data/`, `uploads/` — local storage (created as needed, not included in the ZIP)
