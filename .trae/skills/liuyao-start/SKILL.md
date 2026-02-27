---
name: "liuyao-start"
description: "Starts LiuYao divination app with proper service checks. Invoke when user asks to run, start, or launch the app."
---

# LiuYao Start Skill

This skill handles starting the LiuYao (六爻预测) desktop application with proper service checks.

## When to Invoke

Invoke this skill when:
- User asks to "start the app" or "启动应用"
- User asks to "run the app" or "运行应用"
- User asks to "launch the app" or "打开应用"
- User wants to test the application during development

## Startup Procedure

**IMPORTANT: Follow these steps in order**

### Step 1: Check for Running Services

Before starting, check if there are any running terminals with the app:

```
Check available terminals - look for terminals with:
- command: npm run dev:full
- command: npm run dev
- command: electron .
- idle: false (running)
```

### Step 2: Stop Existing Services

If any terminals are running the app, stop them first:

```
Use StopCommand tool with the command_id of the running terminal
```

This ensures:
- No port conflicts (port 5173)
- Clean restart of Electron process
- Fresh database connections

### Step 3: Build Electron Main Process

Ensure the Electron main process is compiled:

```powershell
npm run build:electron
```

This compiles TypeScript files in `src/main/` to `dist-electron/`.

### Step 4: Start the Application

Use the dev:full script which starts both Vite and Electron:

```powershell
npm run dev:full
```

This command:
1. Starts Vite dev server on http://localhost:5173
2. Starts Electron with VITE_DEV_SERVER_URL environment variable
3. Opens the application window

### Step 5: Verify Startup

Check the command status to confirm:
- Vite is ready: "VITE v5.x.x ready in xxx ms"
- Electron started: No "exited with code 1" error
- Look for any errors in the output

## Complete Startup Flow

```
1. Check terminals → If running app found → Stop it
2. Run: npm run build:electron
3. Run: npm run dev:full (non-blocking)
4. Wait ~5-8 seconds
5. Check status → Confirm success
```

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Build Electron | `npm run build:electron` |
| Start Full App | `npm run dev:full` |
| Start Frontend Only | `npm run dev` |
| Start Electron Only | `npx electron .` |

## Troubleshooting

### Port 5173 Already in Use
```
1. Find and stop the process using the port
2. Or kill the terminal running npm run dev
```

### Electron Exits Immediately
```
1. Check if main process is compiled: npm run build:electron
2. Check for TypeScript errors
3. Verify better-sqlite3 is rebuilt: npx electron-rebuild -f -w better-sqlite3
```

### better-sqlite3 Binding Error
```
npx electron-rebuild -f -w better-sqlite3
```

### Blank Window / ERR_FILE_NOT_FOUND
```
Ensure VITE_DEV_SERVER_URL is set (handled by dev:full script)
```

## Notes

- Always stop existing services before starting new ones
- The app uses Electron 29.x with better-sqlite3
- Database location: `%APPDATA%/liuyao-divination/liuyao.db`
- DevTools opens automatically in development mode
