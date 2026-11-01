$env:PSModulePath = @(
    (Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\Modules'),
    (Join-Path $env:ProgramFiles 'WindowsPowerShell\Modules')
) -join ';'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$build=Join-Path $root '.build\release'
$stage=Join-Path $build 'app'
$dist=Join-Path $root 'dist'
foreach($path in @($stage,$dist)){New-Item -ItemType Directory -Force -Path $path | Out-Null}
foreach($file in @('video\Start\codex_edited.mp4','video\wallpaper\girl_only_dark_blue_wallpaper.mp4')){if(-not(Test-Path -LiteralPath (Join-Path $root $file))){throw "Thiếu video: $file"}}
$csc=Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $csc /nologo /target:winexe /platform:x64 /win32icon:"$root\branding\codex-animation.ico" /reference:System.Windows.Forms.dll /out:"$stage\Codex Animation.exe" "$PSScriptRoot\Launcher.cs"
if($LASTEXITCODE -ne 0){throw 'Không biên dịch được launcher.'}
$manifest=(Invoke-WebRequest -UseBasicParsing 'https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt').Content
$line=($manifest -split "`n" | Where-Object {$_ -match 'win-x64.zip$'} | Select-Object -First 1).Trim()
$hash,$name=$line -split '\s+'
$download=Join-Path $build $name
if(-not(Test-Path -LiteralPath $download)){Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/latest-v22.x/$name" -OutFile $download}
if((Get-FileHash -LiteralPath $download -Algorithm SHA256).Hash.ToLower() -ne $hash){throw 'SHA256 Node.js không khớp.'}
Expand-Archive -LiteralPath $download -DestinationPath (Join-Path $build 'node') -Force
$node=Join-Path (Join-Path $build 'node') ($name -replace '\.zip$','')
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'runtime') | Out-Null
Copy-Item -LiteralPath (Join-Path $node 'node.exe') -Destination (Join-Path $stage 'runtime')
Copy-Item -LiteralPath (Join-Path $node 'LICENSE') -Destination (Join-Path $stage 'runtime\LICENSE-Node.txt')
foreach($file in @('animation.js','image-settings.js','index.html','style.css')){Copy-Item -LiteralPath (Join-Path $root $file) -Destination $stage}
foreach($folder in @('extension','video','docs')){Copy-Item -LiteralPath (Join-Path $root $folder) -Destination $stage -Recurse -Force}
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'tools') | Out-Null
foreach($file in @('windows-launch.ps1','windows-inject.mjs')){Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $stage 'tools')}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=Join-Path $build 'payload.zip'
$stream=[IO.File]::Open($archive,[IO.FileMode]::Create)
$zip=New-Object IO.Compression.ZipArchive($stream,[IO.Compression.ZipArchiveMode]::Create)
try{foreach($file in Get-ChildItem -LiteralPath $stage -File -Recurse){$relative=$file.FullName.Substring($stage.Length+1).Replace('\','/');[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$relative,[IO.Compression.CompressionLevel]::Optimal) | Out-Null}}finally{$zip.Dispose();$stream.Dispose()}
$output=Join-Path $dist 'Codex Animation Setup.exe'
& $csc /nologo /target:winexe /platform:x64 /win32icon:"$root\branding\codex-animation.ico" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll /resource:"$archive",payload.zip /out:"$output" "$PSScriptRoot\Setup.cs"
if($LASTEXITCODE -ne 0){throw 'Không biên dịch được trình cài.'}
$verify=Start-Process -FilePath $output -ArgumentList '--verify' -PassThru -Wait
if($verify.ExitCode -ne 0){throw 'Gói cài đặt thiếu tệp bắt buộc.'}
Get-Item -LiteralPath $output | Format-List FullName,Length
Get-FileHash -LiteralPath $output -Algorithm SHA256 | Format-List
