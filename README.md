## Art Viewer – Inspiration Browser for Artists & Designers

Art Viewer is a lightweight, focused inspiration tool built with **Vue 3**, **TypeScript**, **Pinia**, **Vite**, **Tailwind** and **daisyUI**.  
It is designed specifically for **artists and designers** who need a fast, organic way to explore visual ideas without a lot of UI noise.

I made a deliberate assumption that this tool will be used in creative workflows where attention should stay on the images, not on complex controls.  
That’s why the experience is intentionally simple: search by **keywords**, refine by **color palettes**, and grab assets via **drag-and-drop / one-click download** for a smoother workflow.

---

## Core Features

- **Keyword-based Search**
  - Global search bar powered by the Pexels API (`brains.ts` store).
  - Debounced search for responsive typing without spamming the API.
  - Live feedback: *“Searching…”*, error messages, and total result count.

- **Smart Color Palette Filter**
  - Compact color picker in the search bar (`App.vue`).
  - Curated palette of accent colors plus support for a **custom hex input** (e.g. `#ff6b6b`).
  - Color similarity is computed in **LAB color space** with a tolerance (`COLOR_TOLERANCE` in `brains.ts`) so results feel visually close, not just exact hex matches.

- **Image Grid & Card Interactions**
  - Responsive image grid (`ImageGrid.vue`) rendering images as `ImageCard` components.
  - Each card (`ImageCard.vue`) shows:
    - Large thumbnail (`photo.src.large2x`) with clean, minimal framing.
    - Subtle hover overlay with the image title and usage hint.
  - **Average color chip** on each image:
    - Displays the image’s average color.
    - Click to **copy the hex color** to clipboard, with a small “Copied” confirmation.

- **Fast Download & Drag-and-Drop Workflow**
  - Click an image to **download** the original file.
  - **Drag the image card** to compatible targets (e.g. desktop or design tools) using a `DownloadURL` payload for quick transfer.
  - Download status on each card:
    - Loading overlay with spinner and “Downloading…” text.
    - Error state with message and **Retry** button on the card.

- **Download History Sidebar**
  - A dedicated `HistorySidebar.vue` shows your previously downloaded images.
  - Uses a persisted `downloadHistory` in the `brains.ts` Pinia store so your history survives page reloads.
  - Latest downloads are always at the top; history is trimmed to a reasonable length to stay lightweight.

- **Organic, Focused UI**
  - Minimal chrome: main focus is the search bar, color control, and image grid.
  - Clean typography with the **Outfit7** typeface defined in `style.css`.
  - Tailwind + daisyUI for fast but consistent styling, with smooth hover and interaction states.

---

## Technology Stack

- **Vue 3** with `<script setup>` SFCs
- **TypeScript**
- **Pinia** for state management (`brains.ts`)
- **Vite** for bundling / dev server
- **Tailwind CSS** + **daisyUI** for styling

You’ll need a **Pexels API key** exposed as `VITE_PEXELS_API_KEY` in your environment for the app to load images.

---

## Running the App

```bash
npm install
npm run dev
```

Then open the local URL from the terminal in your browser.