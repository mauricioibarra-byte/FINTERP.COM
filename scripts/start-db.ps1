# Simple DB Checker
Write-Host "Checking for PostgreSQL..."

# 1. Check Windows Service
$svc = Get-Service "postgresql*" -ErrorAction SilentlyContinue
if ($svc) {
    Write-Host "Found Service: $($svc.Name)"
    if ($svc.Status -eq 'Running') {
        Write-Host "Service is Running."
    }
    else {
        Write-Host "Starting Service..."
        Start-Service $svc.Name
        Write-Host "Started."
    }
}
else {
    Write-Host "No Windows Service found."
}

# 2. Check Port 5432
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $tcp.Connect("127.0.0.1", 5432)
    Write-Host "SUCCESS: Connected to Port 5432."
    $tcp.Close()
}
catch {
    Write-Host "FAILURE: Could not connect to Port 5432."
}
