# 🎓 StudyFlow

> A Premium, Gamified, AI-Powered Productivity Space.

[![Vite](https://img.shields.io/badge/Vite-8.0.16-646CFF?logo=vite&style=flat-square)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![TanStack Router](https://img.shields.io/badge/TanStack--Router-1.170-FF4154?style=flat-square)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-4.2-38B2AC?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![CI/CD Pages](https://img.shields.io/badge/CI%2FCD-GitHub--Pages-2088FF?logo=github-actions&style=flat-square)](https://Manish240812.github.io/studyFlow/)

Welcome to **StudyFlow**, a gamified, modern learning ecosystem. Far beyond a simple checklist, StudyFlow combines strict scheduling, interactive sound engineering, automatic progress analysis, and client-side LLM modules into a cohesive, fluid workspace.

🌐 **Production Link:

---

## 🏗️ Technical Architecture & Data Flow

StudyFlow is built as a serverless Single Page Application (SPA) designed to optimize compile performance and asset payloads for static hosting networks.

### System Architecture Blueprint
```
                   +------------------------+
                   |  TanStack Router SPA  |
                   |   (Routing & Views)    |
                   +-----------+------------+
                               |
            +------------------+------------------+
            |                  |                  |
    +-------v-------+  +-------v-------+  +-------v-------+
    |   Task List   |  |   Pomodoro    |  |  AI Buddy UI  |
    |  & Kanban View|  |  Sound Mixer  |  |  (Chat Room)  |
    +-------+-------+  +-------+-------+  +-------+-------+
            |                  |                  |
            +------------------+------------------+
                               |
                               | (Actions trigger XP/Logs)
                               v
                   +------------------------+
                   |   useGamification      |  <---+ (Client-Side Gemini API)
                   |   useLocalStorage      |      |
                   +-----------+------------+      |
                               |                   | Reads Context
                               | (Sync State)      | (Tasks, Logs, Streak)
                               v                   |
                      [( Browser Storage )] -------+
```

### Data Flow Execution Model
1.  **Task Lifecycle:** Creating a task stores it in the `localStorage` database. Completing a task triggers a `+100 XP` reward.
2.  **Focus Session Sync:** Starting the Pomodoro timer loops our **Soundscape Mixer** (which programmatically spawns isolated HTML5 `Audio` elements). Finishing a session pushes study logs to storage, triggers `+10 XP` per minute, checks for leveling thresholds, and confettis the viewport if a badge is unlocked.
3.  **AI Assistant Context Injection:** Opening the **AI Study Buddy** reads active tasks and logs. It packs these metrics into a system prompt, appending the user's query, and dispatches it directly to Google's Gemini 1.5 Flash REST endpoint using browser-native `fetch`.

---

## 🚀 Key Features

StudyFlow is packed with features designed to keep you motivated and structured:

### 🧠 AI Study Buddy
*   **Gemini 1.5 Flash Integration:** Connect your Google Gemini API key to ask open-ended conceptual questions, get custom revision plans, or request help.
*   **100% Serverless & Secure:** Your key is saved locally in your browser's private `localStorage` and sent directly to Google Gemini's endpoints.
*   **Conversational Chat Avatars:** Renders structured user initial badges (`ME`) and glassmorphic AI indicators (`Sparkles`) alongside chat bubbles.
*   **Wave Typing Loader:** When waiting for responses, the AI displays a spinning Sparkle module next to a three-dot wave animation timed with css-delays.
*   **Simulated AI Fallback:** Don't have a key? The buddy runs in a simulated mode that provides custom study plans based on your local metrics.

### 🎮 Gamification Engine (XP & Badges)
*   **Progressive XP System:** Earn `+100 XP` on task completions and `+10 XP` for every minute studied. Restoring completed tasks back to pending deducts XP.
*   **Leveling System:** Levels are calculated using a linear progress scale: `Level = Math.floor(XP / 500) + 1`. Reaching a new milestone displays an animated toast.
*   **Locker Cabinet:** Unlock 7 achievement badges representing study milestones like **First Step**, **Deep Focus Sage**, **Planner Guru**, and **Streak Starter**. 

### 🎵 Focus Soundscapes Mixer
*   **Multi-Channel Ambient Mixer:** Layer Cozy Rain, Deep Forest, Lofi Beats, and White Noise concurrently.
*   **Independent Volume Controls:** Toggling a sound channel expands an interactive slider, allowing you to blend your ideal background track.
*   **Active Soundwave Visualizer:** Active sound channels display a dynamic 3-bar jumping equalizer animation next to the track label, indicating active playback.

### 📋 List vs. Kanban Board View
*   **Grid Column Flow:** View tasks in a traditional priority list or toggle to an interactive Kanban Board.
*   **Fluid Status Columns:** Shift tasks seamlessly across **To Do**, **In Progress** (for pinned items), and **Completed** columns.

### 📅 Planner & Time Budgeting
*   **Weekly Planner:** Schedule tasks on a dynamic calendar grid.
*   **Time Budget Panel:** Set study hourly goals per subject (e.g., Math, Science) and watch your logged focus minutes automatically fill up your progress budgets.

---

## 📁 Repository Directory Blueprint

```
studyFlow/
├── .github/workflows/
│   └── deploy.yml          # Automated CI/CD deployment pipeline
├── public/                 # Static public assets (images, icons)
└── src/
    ├── components/
    │   ├── ui/             # Reusable design primitives (Buttons, Inputs, etc.)
    │   └── todo/           # Core features
    │       ├── AIBuddy.tsx       # AI Chatbot Interface & Gemini API logic
    │       ├── AppHeader.tsx     # Level progression bar & Header Menu
    │       ├── KanbanBoard.tsx   # Drag-like task lane manager
    │       ├── Pomodoro.tsx      # Pomodoro Focus Timer & Audio Sound Deck
    │       ├── ProfileModal.tsx  # 2D Badges Locker & User stats
    │       └── TaskList.tsx      # Searchable, filterable checklist
    ├── lib/
    │   ├── utils.ts        # CN style compilers
    │   └── todo/
    │       ├── central.ts  # State controller (gamification rules)
    │       ├── types.ts    # Centralized TypeScript definitions
    │       └── storage.ts  # LocalStorage hook controller (XP & Badge logic)
    ├── routes/
    │   └── index.tsx       # Primary Workspace Dashboard
    ├── router.tsx          # TanStack routing configuration
    └── styles.css          # Tailwind variables, gradients & keyframe animations
```

---

## 🎨 Premium Design System & Aesthetics

StudyFlow is designed around **Glassmorphism** and dynamic dark-mode elements to keep the interface feeling responsive and premium.

### Style System Specifications
*   **The Glass Card Base:** Standard panel sheets are created using semi-transparent HSL color tokens, backdrop filters, and subtle borders:
    ```css
    .glass {
      background: hsla(var(--card), 0.55);
      backdrop-filter: blur(12px);
      border: 1px solid hsla(var(--border), 0.4);
    }
    ```
*   **Typography:** The layout utilizes a geometric font structure: **Outfit** or **Inter** (sans-serif) for high scannability, paired with uppercase tracking-widest markers (`text-[10px] uppercase font-bold tracking-widest`) for section headers.
*   **Micro-Animations:** Fluid transitions are managed via Framer Motion. Clicking task triggers or Kanban board column moves translates components with a spring transition:
    `transition={{ type: "spring", stiffness: 350, damping: 25 }}`
*   **Bouncing Equalizer:** Active audio channels render jumping bars styled with pure CSS animations:
    ```css
    @keyframes sound-bar-bounce {
      0%, 100% { transform: scaleY(0.25); }
      50% { transform: scaleY(1); }
    }
    ```

---

## 🧠 Serverless AI Client-Side Sandboxing

To make StudyFlow fully static-deployable (serverless), the AI module is written with zero backend dependencies.

*   **API Protocol:** Native browser `fetch` calls standard REST endpoint:
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}`
*   **Encrypted Storage:** The credentials saved in the user's browser are never visible to secondary platforms.
*   **Simulated AI Model:** When no key is provided, a structural parser executes code analyses of the user's tasks and logs:
    ```typescript
    const totalMinutes = studyLogs.reduce((acc, l) => acc + l.duration, 0);
    // Returns tailored markdown roadmaps based on real logs
    ```

---

## 📦 Automated CI/CD & SPA Subpathing

Because GitHub Pages hosts projects inside subdirectory paths (`https://username.github.io/repositoryName/`), standard absolute asset routing breaks. We have implemented the following static configurations:

1.  **Vite Asset Base:** We set `base: process.env.BASE_URL || '/'` inside `vite.config.ts`. In our deploy workflow, we pass `BASE_URL: /studyFlow/`, ensuring all compiled JS/CSS resources reference relative paths.
2.  **Prerender Output Path:** During `npm run build`, Nitro prerenders the index page. Because of the base path `/studyFlow/`, it writes the HTML file to `.output/public/studyFlow/index.html`.
3.  **GitHub Deploy Workflow:** The Actions runner compiles assets, copies the static `index.html` to `404.html` (which acts as a routing fallback to ensure page refreshes don't throw 404s on subpaths), and publishes `.output/public/studyFlow` directly to the `gh-pages` branch.

### Push to Deploy
```bash
git add .
git commit -m "docs: upgrade README with architecture, design system and blueprints"
git push origin main
```
The automated script will immediately compile the TypeScript files and deploy the latest codebase within 60 seconds!
