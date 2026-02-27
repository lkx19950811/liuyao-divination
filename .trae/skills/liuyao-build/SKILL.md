---
name: "liuyao-build"
description: "Builds and packages LiuYao divination app for Windows. Invoke when user asks to build, package, or create installer for the app."
---

# LiuYao Build Skill

This skill handles building and packaging the LiuYao (六爻预测) desktop application for Windows.

## When to Invoke

Invoke this skill when:
- User asks to "build the app" or "打包应用"
- User asks to "create installer" or "创建安装包"
- User asks to "package for Windows" or "打包Windows版本"
- User wants to prepare the app for distribution

## Pre-Build Checks

**IMPORTANT: Follow these steps before building**

### Step 1: Stop Running Services

Check for any running terminals and stop them:

```
1. Check available terminals
2. If any terminal is running the app (npm run dev:full, electron, etc.)
3. Use StopCommand to stop them
```

This ensures:
- No file locks on build output directories
- Clean build environment
- No database connection issues

### Step 2: Clean Previous Build (Optional)

Remove old build artifacts for a clean build:

```powershell
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist-electron" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "release" -Recurse -Force -ErrorAction SilentlyContinue
```

## Build Commands

### Development Build
Build without packaging (for testing production build):

```powershell
npm run build
```

This compiles:
- Vue frontend (to `dist/`)
- Electron main process (to `dist-electron/`)

### Production Package (Windows Installer)
Create Windows installer:

```powershell
npm run build:win
```

Output location: `release/{version}/` directory

## Complete Build Flow

```
1. Check terminals → If running app found → Stop it
2. (Optional) Clean old build directories
3. Run: npm run build:win
4. Wait for build to complete
5. Check release/ directory for output
```

## Build Output

| Build Type | Output Directory | Contents |
|------------|------------------|----------|
| Development | `dist/`, `dist-electron/` | Compiled JS/HTML/CSS |
| Production | `release/{version}/` | NSIS installer (.exe) |

## Prerequisites Check

Before building, ensure:

1. **Dependencies installed**:
   ```powershell
   npm install
   ```

2. **Native modules rebuilt for Electron**:
   ```powershell
   npx electron-rebuild -f -w better-sqlite3
   ```

3. **No TypeScript errors**:
   ```powershell
   npm run typecheck
   ```

4. **All tests pass** (optional but recommended):
   ```powershell
   npm run test
   ```

## Troubleshooting

### Native Module Issues
If better-sqlite3 fails during build:
```powershell
npx electron-rebuild -f -w better-sqlite3
```

### TypeScript Errors
Run type check to identify issues:
```powershell
npm run typecheck
```

### Build Fails with "File in Use"
```
1. Stop all running terminals
2. Close any open Electron windows
3. Retry the build
```

### NSIS Installer Issues
```
1. Check electron-builder.yml configuration
2. Ensure build/icon.ico exists
3. Try clean build after deleting release/ directory
```

## Build Configuration

The build is configured in:
- `package.json` - build settings
- `electron-builder.yml` - electron-builder configuration

Key settings:
- App ID: `com.liuyao.app`
- Product Name: `六爻预测`
- Target: Windows x64 NSIS installer
- Icon: `build/icon.ico`

## Notes

- Always stop running services before building
- The build process may take several minutes
- Installer includes all necessary dependencies
- SQLite database is NOT included in installer (created on first run)
