# PWA Icons

## Required Icons

This directory should contain the following PWA icons:

- `icon-192x192.png` - Android home screen icon (192x192px)
- `icon-512x512.png` - Android splash screen icon (512x512px)
- `apple-touch-icon.png` - iOS home screen icon (180x180px)
- `favicon.ico` - Browser favicon

## Icon Generation

You can generate icons from `icon.svg` using:

```bash
# Using ImageMagick
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png
convert icon.svg -resize 180x180 apple-touch-icon.png

# Using online tool
# Upload icon.svg to https://realfavicongenerator.net/
```

## Branding

Current placeholder uses:
- Background: #7c3aed (purple-600)
- Text: "FF" for FeetFans
- Font: Arial Bold

Replace with professional branding assets before production deployment.
