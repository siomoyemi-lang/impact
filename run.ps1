# run.ps1 — load .env and start the dev server
# Usage: .\run.ps1
if (Test-Path -Path ".env") {
  Get-Content .env | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
    $parts = $_ -split '=',2
    Set-Item -Path "env:$($parts[0].Trim())" -Value $parts[1].Trim()
  }
}
$env:NODE_ENV = "development"
npm run dev
