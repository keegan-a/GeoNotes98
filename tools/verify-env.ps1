Write-Host "Checking Node via fnm..."
fnm -v | Out-Null; if ($LASTEXITCODE -ne 0) { Write-Error "fnm not found"; exit 1 }
fnm use --install-if-missing --lts | Out-Null

Write-Host "Checking Rust..."
rustup show | Out-Null; if ($LASTEXITCODE -ne 0) { Write-Error "rustup not found"; exit 1 }
rustup default stable

Write-Host "Environment looks OK."
