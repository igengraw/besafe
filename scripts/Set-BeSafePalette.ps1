[CmdletBinding()]
param(
    [ValidatePattern('^#[0-9A-Fa-f]{6}$')]
    [string]$Pink = '#F7CBCA',

    [ValidatePattern('^#[0-9A-Fa-f]{6}$')]
    [string]$Warm = '#DDD3D3',

    [ValidatePattern('^#[0-9A-Fa-f]{6}$')]
    [string]$Background = '#F1F7F7',

    [ValidatePattern('^#[0-9A-Fa-f]{6}$')]
    [string]$Soft = '#D5E5E5',

    [ValidatePattern('^#[0-9A-Fa-f]{6}$')]
    [string]$Teal = '#B0D7D8',

    [ValidatePattern('^#[0-9A-Fa-f]{6}$')]
    [string]$Slate = '#5D6B6B',

    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),

    [switch]$Apply
)

$ErrorActionPreference = 'Stop'

function Convert-HexToRgb {
    param([Parameter(Mandatory = $true)][string]$Hex)

    $value = $Hex.TrimStart('#')
    if ($value.Length -eq 3) {
        $value = '{0}{0}{1}{1}{2}{2}' -f $value[0], $value[1], $value[2]
    }

    if ($value.Length -ne 6) {
        throw "Unsupported HEX color: $Hex"
    }

    $r = [Convert]::ToInt32($value.Substring(0, 2), 16)
    $g = [Convert]::ToInt32($value.Substring(2, 2), 16)
    $b = [Convert]::ToInt32($value.Substring(4, 2), 16)
    return ('{0}, {1}, {2}' -f $r, $g, $b)
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$Frontend = Join-Path $ProjectRoot 'frontend'
$SourceRoot = Join-Path $Frontend 'src'
$CssPath = Join-Path $SourceRoot 'styles.css'

if (!(Test-Path -LiteralPath $CssPath)) {
    throw "Cannot find frontend/src/styles.css under $ProjectRoot"
}

# Each semantic token has one role in the six-color palette.
$Targets = [ordered]@{
    '--bg'           = $Background
    '--surface'      = $Background
    '--surface-soft' = $Soft
    '--surface-tint' = $Warm
    '--line'         = $Warm
    '--line-strong'  = $Teal
    '--ink'          = $Slate
    '--ink-soft'     = $Slate
    '--muted'        = $Slate
    '--slate'        = $Slate
    '--slate-deep'   = $Slate
    '--teal'         = $Teal
    '--pink'         = $Pink
    '--pink-ink'     = $Slate
    '--warm'         = $Warm
    '--danger'       = $Slate
}

$cssText = [System.IO.File]::ReadAllText($CssPath)
$rootMatch = [regex]::Match($cssText, '(?s):root\s*\{.*?\}')
if (!$rootMatch.Success) {
    throw 'Could not find the :root block in styles.css'
}

# Map whatever palette is currently in :root to the requested palette.
$colorMap = @{}
foreach ($entry in $Targets.GetEnumerator()) {
    $pattern = '(?m)^\s*' + [regex]::Escape($entry.Key) + '\s*:\s*(#[0-9a-fA-F]{6})\s*;'
    $match = [regex]::Match($rootMatch.Value, $pattern)
    if (!$match.Success) {
        throw "Missing or unsupported CSS token: $($entry.Key)"
    }

    $oldHex = $match.Groups[1].Value.ToUpperInvariant()
    $newHex = $entry.Value.ToUpperInvariant()

    if ($colorMap.ContainsKey($oldHex) -and $colorMap[$oldHex] -ne $newHex) {
        throw "The current CSS uses $oldHex for multiple semantic roles. Refusing an ambiguous global replacement."
    }
    $colorMap[$oldHex] = $newHex
}

# Legacy hard-coded colors from the earlier BeSafe stylesheet.
$legacy = @{
    '#FFFFFF' = $Background
    '#FFF'    = $Background
    '#000000' = $Slate
    '#F2BCBB' = $Pink
    '#3F4B4A' = $Slate
    '#EAF2F2' = $Background
    '#6F3936' = $Slate
    '#7E3F3B' = $Slate
    '#CFDCDC' = $Warm
    '#E7F0F0' = $Teal
    '#263231' = $Slate
    '#3F4C4B' = $Slate
    '#6E7C7B' = $Slate
    '#4C5958' = $Slate
    '#8E4B47' = $Slate
    '#A8544E' = $Slate
}
foreach ($oldHex in $legacy.Keys) {
    $key = $oldHex.ToUpperInvariant()
    if (!$colorMap.ContainsKey($key)) {
        $colorMap[$key] = $legacy[$oldHex].ToUpperInvariant()
    }
}

# Create matching RGB/RGBA mappings while preserving the alpha channel.
$rgbMap = @{}
foreach ($oldHex in @($colorMap.Keys)) {
    $oldRgb = Convert-HexToRgb $oldHex
    $newRgb = Convert-HexToRgb $colorMap[$oldHex]
    if ($rgbMap.ContainsKey($oldRgb) -and $rgbMap[$oldRgb] -ne $newRgb) {
        throw "Ambiguous RGB mapping for $oldRgb"
    }
    $rgbMap[$oldRgb] = $newRgb
}

$extensions = @('.css', '.scss', '.js', '.jsx', '.ts', '.tsx', '.html', '.svg')
$files = @(
    Get-ChildItem -LiteralPath $Frontend -Recurse -File |
        Where-Object {
            $_.FullName -notmatch '[\\/](node_modules|dist|coverage|\.git)[\\/]' -and
            $_.FullName -notmatch '[\\/]public[\\/]icons\.svg$' -and
            $_.FullName -notmatch '[\\/]src[\\/]assets[\\/](react|vite)\.svg$' -and
            $extensions -contains $_.Extension.ToLowerInvariant()
        }
)

$results = @{}
$changedFiles = @()

foreach ($file in $files) {
    $original = [System.IO.File]::ReadAllText($file.FullName)
    $content = $original

    foreach ($oldHex in @($colorMap.Keys)) {
        $hexPattern = '(?i)(?<![0-9a-f])' + [regex]::Escape($oldHex) + '(?![0-9a-f])'
        $content = [regex]::Replace($content, $hexPattern, [string]$colorMap[$oldHex])
    }

    foreach ($oldRgb in @($rgbMap.Keys)) {
        $parts = $oldRgb -split ',\s*'
        $rgbPattern = '(?i)(rgba?\(\s*)' + [regex]::Escape($parts[0]) + '\s*,\s*' + [regex]::Escape($parts[1]) + '\s*,\s*' + [regex]::Escape($parts[2])
        $mappedRgb = [string]$rgbMap[$oldRgb]

        $content = [regex]::Replace(
            $content,
            $rgbPattern,
            [System.Text.RegularExpressions.MatchEvaluator]{
                param($match)
                return $match.Groups[1].Value + $mappedRgb
            }
        )
    }

    $results[$file.FullName] = $content
    if ($content -cne $original) {
        $changedFiles += $file.FullName
    }
}

# Audit the transformed content before optionally writing it.
$allowedHex = @($Pink, $Warm, $Background, $Soft, $Teal, $Slate) | ForEach-Object { $_.ToUpperInvariant() }
$allowedRgb = @($Pink, $Warm, $Background, $Soft, $Teal, $Slate) | ForEach-Object { Convert-HexToRgb $_ }
$unknown = @()

foreach ($filePath in $results.Keys) {
    $content = $results[$filePath]
    $hexMatches = [regex]::Matches($content, '(?i)(?<![0-9a-f])#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})(?![0-9a-f])')
    foreach ($match in $hexMatches) {
        $value = $match.Value.ToUpperInvariant()
        if ($value.Length -eq 4) {
            $value = '#' + [string]::Concat($value[1], $value[1], $value[2], $value[2], $value[3], $value[3])
        }
        if ($allowedHex -notcontains $value) {
            $unknown += "{0}: {1}" -f $filePath, $match.Value
        }
    }

    $rgbMatches = [regex]::Matches($content, '(?i)\brgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)')
    foreach ($match in $rgbMatches) {
        $value = '{0}, {1}, {2}' -f $match.Groups[1].Value, $match.Groups[2].Value, $match.Groups[3].Value
        if ($allowedRgb -notcontains $value) {
            $unknown += "{0}: rgb({1})" -f $filePath, $value
        }
    }
}

Write-Host "`n=== BE SAFE PALETTE ===" -ForegroundColor Cyan
foreach ($entry in $Targets.GetEnumerator()) {
    Write-Host ('{0} = {1}' -f $entry.Key, $entry.Value)
}

Write-Host "`nFiles to change: $($changedFiles.Count)" -ForegroundColor Cyan
foreach ($filePath in $changedFiles) {
    Write-Host ('  ' + $filePath.Substring($Frontend.Length).TrimStart('\', '/'))
}

if ($Apply) {
    foreach ($filePath in $changedFiles) {
        [System.IO.File]::WriteAllText(
            $filePath,
            $results[$filePath],
            [System.Text.UTF8Encoding]::new($false)
        )
    }
    Write-Host "`nPalette applied successfully." -ForegroundColor Green
} else {
    Write-Host "`nPREVIEW ONLY. No files changed. Run with -Apply to write changes." -ForegroundColor Yellow
}

Write-Host "`n=== UNMAPPED HEX/RGB COLORS ===" -ForegroundColor Cyan
if ($unknown.Count -eq 0) {
    Write-Host 'No unmapped HEX/RGB colors found.' -ForegroundColor Green
} else {
    $unknown | Sort-Object -Unique | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
}
