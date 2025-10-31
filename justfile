# Use PowerShell on Windows
set shell := ["powershell", "-NoProfile", "-Command"]

# Absolute path to the justfile's directory (the repo root)
project_root := justfile_directory()

install:
    cd "{{project_root}}/apps/desktop"; npm install

dev:
    cd "{{project_root}}/apps/desktop"; npm run tauri:dev

build:
    cd "{{project_root}}/apps/desktop"; npm run tauri:build

lint:
    cd "{{project_root}}/apps/desktop"; npm run lint && npm run check

test:
    cd "{{project_root}}/apps/desktop"; npm run test
