const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a base SVG icon
const createSVG = (size, maskable = false) => {
  const padding = maskable ? size * 0.1 : 0;
  const iconSize = size - (padding * 2);
  const fontSize = iconSize * 0.3;
  
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.2}" fill="url(#grad)"/>
      <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">IT</text>
      <circle cx="${size/2}" cy="${size/2 - fontSize/2}" r="${fontSize/6}" fill="white" opacity="0.8"/>
    </svg>
  `;
};

// Generate icons
const generateIcon = async (size, filename, maskable = false) => {
  const svg = createSVG(size, maskable);
  const outputPath = path.join(__dirname, '../public', filename);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
    
  console.log(`Generated ${filename}`);
};

// Generate all required icons
const generateAllIcons = async () => {
  try {
    await generateIcon(192, 'icon-192.png');
    await generateIcon(512, 'icon-512.png');
    await generateIcon(192, 'icon-maskable-192.png', true);
    await generateIcon(512, 'icon-maskable-512.png', true);
    await generateIcon(96, 'shortcut-practice.png');
    await generateIcon(96, 'shortcut-timed.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
};

generateAllIcons();