const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function generateIcons() {
  const iconDir = path.join(__dirname, '../src-tauri/icons');
  const logoPath = path.join(iconDir, 'logo.png');
  
  // Load the original logo
  const logo = await loadImage(logoPath);
  
  // Icon sizes to generate
  const sizes = [
    { name: '32x32.png', size: 32 },
    { name: '128x128.png', size: 128 },
    { name: '128x128@2x.png', size: 256 },
  ];
  
  // Generate each icon size
  for (const { name, size } of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw the logo resized
    ctx.drawImage(logo, 0, 0, size, size);
    
    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconDir, name), buffer);
    
    console.log(`Generated ${name}`);
  }
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
