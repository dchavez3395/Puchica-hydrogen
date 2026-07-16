$ErrorActionPreference = 'Stop'
$token = $null
$tokenPaths = @(
  'C:\Users\dchav\.openclaw\workspace\shared-bus\.bus-token',
  'E:\.openclaw\workspace\shared-bus\.bus-token'
)
foreach ($p in $tokenPaths) {
  if (Test-Path $p) { $token = (Get-Content $p -Raw).Trim(); break }
}
if (-not $token) {
  $found = Get-ChildItem -Path 'E:\.openclaw','C:\Users\dchav\.openclaw' -Recurse -Filter '.bus-token' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { $token = (Get-Content $found.FullName -Raw).Trim() }
}
if (-not $token) { Write-Host 'NO_TOKEN'; exit 1 }
Write-Host "TOKEN_OK len=$($token.Length)"

$headers = @{ 'X-Bus-Token' = $token }

# Read context
Write-Host "`n=== CONTEXT (key=AGENT_...6_22) ==="
try {
  $ctx = Invoke-RestMethod -Uri 'http://127.0.0.1:9420/context?key=AGENT_%E2%80%A66_22' -Headers $headers -TimeoutSec 10
  $ctx | ConvertTo-Json -Depth 6
} catch {
  # Try without truncation key
  try {
    $ctx2 = Invoke-RestMethod -Uri 'http://127.0.0.1:9420/context' -Headers $headers -TimeoutSec 10
    $ctx2 | ConvertTo-Json -Depth 6
  } catch {
    Write-Host "CONTEXT_ERR: $_"
  }
}

# Read backlog
Write-Host "`n=== MESSAGES (limit=20) ==="
try {
  $msgs = Invoke-RestMethod -Uri 'http://127.0.0.1:9420/messages?limit=20' -Headers $headers -TimeoutSec 10
  foreach ($m in $msgs) {
    $line = "#$($m.id) [$($m.kind)] from=$($m.from) ts=$($m.ts)"
    if ($m.subject) { $line += " subj=`"$($m.subject)`"" }
    Write-Host $line
    if ($m.body) {
      $body = $m.body.ToString()
      if ($body.Length -gt 400) { $body = $body.Substring(0,400) + '...[trunc]' }
      Write-Host "  BODY: $body"
    }
  }
} catch {
  Write-Host "MSG_ERR: $_"
}

# Post heartbeat
Write-Host "`n=== HEARTBEAT ==="
$hbBody = @{ name='claude-code'; status='active'; working_on='resumed from handoff; checking for new tasks' } | ConvertTo-Json
try {
  $hb = Invoke-RestMethod -Uri 'http://127.0.0.1:9420/agents/heartbeat' -Headers $headers -Method Post -Body $hbBody -ContentType 'application/json' -TimeoutSec 10
  $hb | ConvertTo-Json -Depth 4
} catch {
  Write-Host "HB_ERR: $_"
}
