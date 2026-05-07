const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageFiles = [
  'analytics-dashboard.png',
  'bento-hero-image.png',
  'code-editor-interface.png',
  'database-admin-interface.png',
  'ecommerce-interface.png',
  'mobile-app-interface.png',
  'settings-interface.png',
  'social-messaging-interface.png',
  'video-game-interface.png'
];

const publicDir = path.join(__dirname, '..', 'public');

async function optimizeImages() {
  console.log('Optimizing images...');
  
  for (const file of imageFiles) {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.png', '.webp'));
    
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${file} - not found`);
      continue;
    }
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);
      
      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      
      console.log(`✓ ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% reduction)`);
    } catch (error) {
      console.error(`✗ Error optimizing ${file}:`, error.message);
    }
  }
  
  console.log('\nImage optimization complete!');
}

optimizeImages();
