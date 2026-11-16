$lines = [System.IO.File]::ReadAllText("e:\projects\fruits\fruits\src\components\fruit\FruitHero.tsx") -split "`n"
$returnLine = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^\s*return\s*\(") { $returnLine = $i; break }
}
Write-Output "Return at line $($returnLine + 1)"
$depth = 0
for ($i = $returnLine; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    # Count non-self-closing open tags
    $openCount = ([regex]::Matches($line, '<(div|section|button|h[1-6]|p)(\s+[^/]|>)')).Count
    # Count self-closing open tags  
    $selfCloseCount = ([regex]::Matches($line, '<(div|section|button|h[1-6]|p)[^>]*/>|<(div|section|button|h[1-6]|p)[^>]*/\s*>')).Count
    # Count close tags
    $closeCount = ([regex]::Matches($line, '</(div|section|button|h[1-6]|p)>')).Count
    $net = $openCount - $closeCount
    $depth += $net
    if ($net -ne 0) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -gt 70) { $trimmed = $trimmed.Substring(0,70) }
        Write-Output "Line $($i+1) (net=$net depth=$depth): $trimmed"
    }
}
Write-Output "FINAL DEPTH: $depth"
