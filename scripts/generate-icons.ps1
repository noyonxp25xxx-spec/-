Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path 'public/icons' | Out-Null

function Resize-Image {
    param(
        [string]$src,
        [string]$dst,
        [int]$width,
        [int]$height,
        [bool]$maskable = $false
    )
    $img = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($maskable) {
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
        $g.FillRectangle($brush, 0, 0, $width, $height)
        $padX = [int]($width * 0.1)
        $padY = [int]($height * 0.1)
        $drawW = $width - (2 * $padX)
        $drawH = $height - (2 * $padY)
        $g.DrawImage($img, $padX, $padY, $drawW, $drawH)
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.DrawImage($img, 0, 0, $width, $height)
    }

    $g.Dispose()
    $img.Dispose()
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$logoPath = Resolve-Path 'public/logo.jpg'
Resize-Image $logoPath 'public/icons/icon-192x192.png' 192 192 $false
Resize-Image $logoPath 'public/icons/icon-512x512.png' 512 512 $false
Resize-Image $logoPath 'public/icons/icon-maskable-192x192.png' 192 192 $true
Resize-Image $logoPath 'public/icons/icon-maskable-512x512.png' 512 512 $true
Resize-Image $logoPath 'public/apple-touch-icon.png' 180 180 $false
Write-Output 'Icons generated successfully'
