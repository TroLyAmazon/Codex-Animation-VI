param([switch]$CheckOnly, [switch]$AttachOnly, [switch]$NoDialogs)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding
# A GUI launch may inherit PowerShell Core module paths from Codex. Windows
# PowerShell must load its own built-in modules, not the Core equivalents.
$env:PSModulePath = @(
    (Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\Modules'),
    (Join-Path $env:ProgramFiles 'WindowsPowerShell\Modules'),
    (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'WindowsPowerShell\Modules')
) -join ';'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logFolder = Join-Path $projectRoot '.build\windows'
New-Item -ItemType Directory -Force -Path $logFolder | Out-Null
$logFile = Join-Path $logFolder 'launcher.log'
$launcherMutex = New-Object System.Threading.Mutex($false, 'Local\CodexStartupAnimationLauncher')
$ownsMutex = $false
try {
    $ownsMutex = $launcherMutex.WaitOne(0)
    if (-not $ownsMutex) { exit 0 }
    $package = Get-AppxPackage -Name OpenAI.Codex | Sort-Object Version -Descending | Select-Object -First 1
    if (-not $package) { throw 'Không tìm thấy bản cài Codex / ChatGPT chính thức trên máy.' }
    $appExecutable = Join-Path $package.InstallLocation 'app\ChatGPT.exe'
    $signature = Get-AuthenticodeSignature -LiteralPath $appExecutable
    if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'O="?OpenAI OpCo, LLC"?(,|$)') {
        throw 'Ứng dụng không có chữ ký OpenAI hợp lệ.'
    }
    $nodeExecutable = Join-Path $projectRoot 'runtime\node.exe'
    if (-not (Test-Path -LiteralPath $nodeExecutable)) { $nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source }
    $nodeMajor = [int]((& $nodeExecutable --version) -replace '^v(\d+).*$', '$1')
    if ($nodeMajor -lt 22) { throw 'Cần cài Node.js phiên bản 22 trở lên.' }
    $appProcesses = @(Get-CimInstance Win32_Process -Filter "Name = 'ChatGPT.exe'" | Where-Object {
        $_.ExecutablePath -eq $appExecutable -and $_.CommandLine -notmatch '--type='
    })
    $debugPort = $null
    if ($appProcesses.Count -gt 1) { throw 'Có nhiều tiến trình Codex chính. Hãy thoát hoàn toàn Codex rồi thử lại.' }
    if ($appProcesses.Count -eq 1) {
        $appProcess = $appProcesses[0]
        if ($appProcess.CommandLine -match '--remote-debugging-port[= ](\d+)') {
            $debugPort = [int]$Matches[1]
        } else {
            throw 'Codex đang chạy nhưng chưa mở cổng kết nối. Hãy lưu công việc, thoát hoàn toàn Codex rồi mở lại bằng lối tắt Codex Animation.'
        }
    } elseif ($AttachOnly -or $CheckOnly) {
        throw 'Codex chưa chạy. Hãy mở lối tắt Codex Animation để khởi động.'
    } else {
        $portReservation = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
        $portReservation.Start()
        $debugPort = $portReservation.LocalEndpoint.Port
        $portReservation.Stop()
        # This is the requested visible app; only the launcher/helper runs hidden.
        $launchedApp = Start-Process -FilePath $appExecutable -ArgumentList @('--remote-debugging-address=127.0.0.1', "--remote-debugging-port=$debugPort") -PassThru
        $appProcess = [PSCustomObject]@{ProcessId=$launchedApp.Id}
    }
    $listenerDeadline = [DateTime]::UtcNow.AddSeconds(45)
    do {
        $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $debugPort -ErrorAction SilentlyContinue)
        if ($listeners.Count -gt 0) { break }
        Start-Sleep -Milliseconds 200
    } while ([DateTime]::UtcNow -lt $listenerDeadline)
    if ($listeners.Count -eq 0) { throw 'Cổng kết nối nội bộ của Codex chưa sẵn sàng.' }
    foreach ($listener in $listeners) {
        if ($listener.LocalAddress -ne '127.0.0.1' -or $listener.OwningProcess -ne $appProcess.ProcessId) {
            throw 'Cổng kết nối không thuộc riêng tiến trình Codex đã xác minh trên máy này.'
        }
    }
    if ($CheckOnly) {
        "Đã xác minh OpenAI $($package.Version), Node $nodeMajor, cổng nội bộ $debugPort, PID $($appProcess.ProcessId)"
        exit 0
    }
    "$(Get-Date -Format o) - OpenAI $($package.Version), PID $($appProcess.ProcessId), port $debugPort" | Set-Content -LiteralPath $logFile -Encoding UTF8
    & $nodeExecutable (Join-Path $PSScriptRoot 'windows-inject.mjs') $debugPort install 2>&1 | ForEach-Object {
        $_ | Out-File -LiteralPath $logFile -Append -Encoding UTF8
        Write-Output $_
    }
    if ($LASTEXITCODE -ne 0) { throw "Không nạp được hoạt ảnh. Xem chi tiết tại: $logFile" }
} catch {
    $_.Exception.Message | Out-File -LiteralPath $logFile -Append -Encoding UTF8
    if (-not $NoDialogs) {
        $messageShell = New-Object -ComObject WScript.Shell
        $messageShell.Popup($_.Exception.Message, 0, 'Codex Animation', 48) | Out-Null
    }
    Write-Error $_.Exception.Message
    exit 1
} finally {
    if ($ownsMutex) { $launcherMutex.ReleaseMutex() }
    $launcherMutex.Dispose()
}
