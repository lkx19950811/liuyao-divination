---
name: "powershell-commands"
description: "Reference guide for Windows PowerShell commands. Invoke BEFORE running any PowerShell command to ensure correct syntax."
---

# Windows PowerShell Commands Reference

**CRITICAL: Read this BEFORE executing any PowerShell command to avoid syntax errors.**

## Key Differences from Bash/Linux

PowerShell uses different syntax than Bash. Common mistakes to avoid:

## Directory Operations

### Create Directory
```powershell
New-Item -ItemType Directory -Path ".trae/skills/new-skill" -Force
```

### Remove Directory
```powershell
Remove-Item -Path "dist" -Recurse -Force
```

### List Directory
```powershell
Get-ChildItem -Path "src"
ls src
dir src
```

## File Operations

### Remove File
```powershell
Remove-Item -Path "file.txt" -Force
```

### Copy File
```powershell
Copy-Item -Path "source.txt" -Destination "dest.txt"
```

### Move/Rename File
```powershell
Move-Item -Path "old.txt" -Destination "new.txt"
```

## Environment Variables

### Set Environment Variable
```powershell
$env:VARIABLE_NAME = "value"
npx cross-env VARIABLE_NAME=value command
```

### Read Environment Variable
```powershell
$env:VARIABLE_NAME
```

## Path Operations

### Path Join
```powershell
Join-Path -Path "src" -ChildPath "components"
```

### Current Directory
```powershell
Get-Location
Set-Location -Path "src"
```

## Quick Reference Table

| Bash | PowerShell |
|------|------------|
| `mkdir -p path` | `New-Item -ItemType Directory -Path path -Force` |
| `rm -rf path` | `Remove-Item -Path path -Recurse -Force` |
| `cp src dest` | `Copy-Item -Path src -Destination dest` |
| `mv src dest` | `Move-Item -Path src -Destination dest` |
| `touch file` | `New-Item -ItemType File -Path file` |
| `cat file` | `Get-Content -Path file` |
| `export VAR=val` | `$env:VAR = "val"` |
| `which cmd` | `Get-Command cmd` |
| `grep pattern` | `Select-String -Pattern pattern` |
| `find . -name "*.ts"` | `Get-ChildItem -Recurse -Filter "*.ts"` |

## Best Practices

1. Use PowerShell cmdlets instead of Unix commands
2. Use `-Force` flag to avoid confirmation prompts
3. Use `-Recurse` flag for directory operations
4. Quote paths with spaces: `"path with spaces"`
5. Use `cross-env` package for environment variables in npm scripts
