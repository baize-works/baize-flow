$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

# ============================================================
# Yak Ops Docker image publishing configuration
# Uses the local Docker image store and the default Docker builder.
# It does not create a Buildx builder, pull base images, or run Maven/npm builds.
# ============================================================
$DockerHubUsername = "weifuwan"
$Version = "1.0.0"
$BackendRepository = "yak-ops-api"
$FrontendRepository = "yak-ops"
$PushLatest = $true

# Local base images required by Dockerfile.
$BackendBaseImage = "eclipse-temurin:21-jre-jammy"
$FrontendBaseImage = "nginx:latest"

Set-Location $PSScriptRoot

function Write-Step {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Assert-Command {
    param([Parameter(Mandatory = $true)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

function Assert-ExitCode {
    param(
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $true)][string]$FailureMessage
    )

    if ($ExitCode -ne 0) {
        throw "$FailureMessage (exit code: $ExitCode)"
    }
}

function Assert-LocalImage {
    param([Parameter(Mandatory = $true)][string]$Image)

    & docker image inspect $Image *> $null
    $ExitCode = $LASTEXITCODE

    if ($ExitCode -ne 0) {
        throw "Required local image was not found: $Image. This script never pulls base images automatically."
    }

    $Platform = (& docker image inspect --format "{{.Os}}/{{.Architecture}}" $Image 2>$null | Select-Object -First 1)
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($Platform)) {
        Write-Host "Local image ready: $Image ($($Platform.Trim()))"
    }
    else {
        Write-Host "Local image ready: $Image"
    }
}

function Build-LocalImage {
    param(
        [Parameter(Mandatory = $true)][string]$Target,
        [Parameter(Mandatory = $true)][string]$Image,
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$VcsRef,
        [Parameter(Mandatory = $true)][string]$BuildDate
    )

    Write-Step "Building $Title from local base images"

    $DockerArgs = @(
        "build",
        "--progress=plain",
        "--pull=false",
        "--target", $Target,
        "--build-arg", "VERSION=$Version",
        "--build-arg", "VCS_REF=$VcsRef",
        "--build-arg", "BUILD_DATE=$BuildDate",
        "--tag", "${Image}:$Version"
    )

    if ($PushLatest) {
        $DockerArgs += @("--tag", "${Image}:latest")
    }

    $DockerArgs += "."

    & docker @DockerArgs
    Assert-ExitCode -ExitCode $LASTEXITCODE -FailureMessage "Failed to build $Title"
}

function Push-ImageTags {
    param(
        [Parameter(Mandatory = $true)][string]$Image,
        [Parameter(Mandatory = $true)][string]$Title
    )

    Write-Step "Pushing $Title"

    & docker push "${Image}:$Version"
    Assert-ExitCode -ExitCode $LASTEXITCODE -FailureMessage "Failed to push ${Image}:$Version"

    if ($PushLatest) {
        & docker push "${Image}:latest"
        Assert-ExitCode -ExitCode $LASTEXITCODE -FailureMessage "Failed to push ${Image}:latest"
    }
}

Assert-Command "docker"
Assert-Command "git"

if (-not (Test-Path ".\Dockerfile")) {
    throw "Dockerfile was not found in $PSScriptRoot. Put this script in the project root."
}

# Ensure `docker build` uses Docker Engine's default builder even if a custom
# Buildx builder was selected previously in this terminal.
if (Test-Path Env:BUILDX_BUILDER) {
    Remove-Item Env:BUILDX_BUILDER
}

Write-Step "Checking Docker"
& docker info *> $null
Assert-ExitCode -ExitCode $LASTEXITCODE -FailureMessage "Docker daemon is not running or cannot be accessed"

Write-Step "Checking required local base images"
Assert-LocalImage $BackendBaseImage
Assert-LocalImage $FrontendBaseImage

$VcsRef = (& git rev-parse --short HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($VcsRef)) {
    $VcsRef = "unknown"
}
else {
    $VcsRef = $VcsRef.Trim()
}

$BuildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$BackendImage = "$DockerHubUsername/$BackendRepository"
$FrontendImage = "$DockerHubUsername/$FrontendRepository"

Write-Host @"

Publishing configuration
------------------------
Docker Hub namespace : $DockerHubUsername
Version              : $Version
Git revision         : $VcsRef
Build date           : $BuildDate
Backend base image   : $BackendBaseImage (local only)
Frontend base image  : $FrontendBaseImage (local only)
Backend image        : ${BackendImage}:$Version
Frontend image       : ${FrontendImage}:$Version
Publish latest       : $PushLatest
Build mode           : default Docker builder, single platform
Distribution build   : skipped (uses existing tar.gz)
"@

Write-Step "Checking prebuilt Yak Ops distribution"
$DistFiles = @(Get-ChildItem ".\yak-ops-dist\target\yak-ops-*.tar.gz" -File -ErrorAction SilentlyContinue)
if ($DistFiles.Count -eq 0) {
    throw "No distribution archive found at yak-ops-dist\target\yak-ops-*.tar.gz"
}
if ($DistFiles.Count -gt 1) {
    throw "Multiple distribution archives were found. Keep only the archive that should be published."
}

Write-Host "Distribution archive: $($DistFiles[0].FullName)"

Build-LocalImage `
    -Target "backend-runtime" `
    -Image $BackendImage `
    -Title "backend image" `
    -VcsRef $VcsRef `
    -BuildDate $BuildDate

Build-LocalImage `
    -Target "frontend-runtime" `
    -Image $FrontendImage `
    -Title "frontend image" `
    -VcsRef $VcsRef `
    -BuildDate $BuildDate

Push-ImageTags -Image $BackendImage -Title "backend image"
Push-ImageTags -Image $FrontendImage -Title "frontend image"

Write-Host @"

Published successfully
----------------------
${BackendImage}:$Version
${FrontendImage}:$Version
"@ -ForegroundColor Green

if ($PushLatest) {
    Write-Host @"
${BackendImage}:latest
${FrontendImage}:latest
"@ -ForegroundColor Green
}
