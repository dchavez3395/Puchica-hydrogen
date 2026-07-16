$ErrorActionPreference = 'Stop'
$token = (Get-Content 'C:\Users\dchav\.openclaw\workspace\shared-bus\.bus-token' -Raw).Trim()
$headers = @{ 'X-Bus-Token' = $token }

Write-Host "=== Endpoints probe ==="

# Try common endpoints to discover shape
$endpoints = @(
  @{ m='GET'; u='/' },
  @{ m='GET'; u='/health' },
  @{ m='GET'; u='/status' },
  @{ m='GET'; u='/agents' },
  @{ m='GET'; u='/messages' },
  @{ m='GET'; u='/messages?limit=20' },
  @{ m='GET'; u='/context' }
)
foreach ($e in $endpoints) {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:9420$($e.u)" -Headers $headers -Method $e.m -TimeoutSec 5 -ErrorAction Stop
    $body = $r.Content
    if ($body.Length -gt 800) { $body = $body.Substring(0,800) + '...[trunc]' }
    Write-Host "$($e.m) $($e.u) -> $($r.StatusCode): $body"
  } catch {
    Write-Host "$($e.m) $($e.u) -> ERR: $_"
  }
  Write-Host ""
}
