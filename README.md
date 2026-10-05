# Task Manager (Node.js & Express) 📝

A faithful implementation of the classic Node.js, Express, EJS, and Tailwind CSS Task Manager and File-based Notes Application, matching the interface shown on `http://localhost:3000` / `http://localhost:9000`.

---

## 📸 Overview & Features

- **Pixel-Accurate Frontend**:
  - Dark zinc theme (`#18181b` / `bg-zinc-900` canvas, `#27272a` / `bg-zinc-800` cards & input controls).
  - Title input with placeholder `Title goes here..`.
  - Task details textarea with placeholder `Write your task details here...`.
  - Blue action button `Create Task` (`bg-blue-600 hover:bg-blue-700`).
  - Responsive flex card grid displaying the exact 8 pre-seeded task files:
    1. `.txt`
    2. `adsf.txt`
    3. `backendoeftxfhh.txt`
    4. `chacha.md.txt`
    5. `dbfiles.txt`
    6. `helo.js.txt`
    7. `kushal.txt`
    8. `nilotpalfrontend.txt`
  - Blue `read more` link on each card leading to the file's detail view.
  - Quick action controls to **Rename** and **Delete** tasks.

- **Robust Backend Design**:
  - **Zero-database file persistence**: All tasks are stored as `.txt` files in `./files`.
  - Built with **Express 4.x** and **EJS 3.x**.
  - Built-in directory traversal protection using `path.basename`.
  - Automatic whitespace stripping from titles (`title.split(' ').join('') + '.txt'`), correctly handling empty titles as `.txt`.
  - Dual-port listener: listens simultaneously on **port 3000** and **port 9000**.
  - Includes both server-rendered web routes and full REST API JSON endpoints.

---

## 🚀 Running on Localhost

The server is already running in the background. You can open either:
- 👉 **[http://localhost:3000](http://localhost:3000)**
- 👉 **[http://localhost:9000](http://localhost:9000)**

To run or restart the server manually:

```bash
cd c:/Users/Reddy/.antigravity-ide/task-manager
npm start
```

Or run with automatic reload during development:

```bash
npm run dev
```

---

## 🛠️ Routes & Endpoints Reference

### Web UI Routes (EJS & React)
| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Renders the main dashboard with task form, cards, and interactive React Share modal trigger |
| `POST` | `/create` | Creates a new `.txt` file with the title and details |
| `GET` | `/file/:filename` | Reads and displays the full contents of the task with Share File action |
| `GET` | `/edit/:filename` | Renders the filename renaming form |
| `POST` | `/edit` | Renames the task file from previous name to new name |
| `POST` | `/delete/:filename` | Deletes the specified task file |
| `GET` | `/demo` | Dedicated preview page for the React `ShareDialog` and `TaskShareDemo` component |

### REST API Endpoints (JSON)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/tasks` | Lists all tasks with preview text and metadata |
| `GET` | `/api/tasks/:filename` | Returns specific task details and full content |
| `POST` | `/api/tasks` | Creates a new task via JSON payload (`{ title, details }`) |
| `DELETE` | `/api/tasks/:filename` | Deletes a task via API |

---

## 🎨 React & shadcn UI Integration

The codebase now supports **shadcn UI structure**, **Tailwind CSS**, and **TypeScript**:

- **Component Path**: `components/ui/share-file-dialog.tsx` and `components/ui/demo.tsx`
- **Utility Path**: `lib/utils.ts` (containing the standard `cn` helper)
- **Configuration**:
  - `components.json` (shadcn CLI configuration)
  - `tsconfig.json` (TypeScript paths `@/*` -> `./*`)
  - `tailwind.config.js` & `postcss.config.js`
- **Client Bundle**: `public/js/task-share.bundle.js` (built via `npm run build:ui`)
- **Interactive Experience**:
  - Click **"share"** on any task card on the homepage to open the ShareDialog modal for that task file.
  - Click **"Share Task"** on any task detail page (`/file/:filename`).
  - Visit **`/demo`** for the standalone component demonstration with stock Unsplash collaborator avatars.

---

## 📁 Project Directory Structure

```
task-manager/
├── files/                     # Stores .txt files for tasks
│   ├── .txt
│   ├── adsf.txt
│   ├── backendoeftxfhh.txt
│   ├── chacha.md.txt
│   ├── dbfiles.txt
│   ├── helo.js.txt
│   ├── kushal.txt
│   └── nilotpalfrontend.txt
├── views/                     # EJS templates
│   ├── index.ejs              # Main task list & form UI
│   ├── show.ejs               # Read more view
│   └── edit.ejs               # Rename filename form
├── public/                    # Static assets
│   └── css/
│       └── style.css          # Fallback and typography styles
├── index.js                   # Express server and file handling logic
├── package.json               # Dependencies & start scripts
└── README.md                  # Project documentation
```
