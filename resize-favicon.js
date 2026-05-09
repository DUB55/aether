import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resizeFavicon() {
  try {
    // Load the logo.png
    const logoPath = join(__dirname, 'public', 'logo.png');
    const logo = await loadImage(logoPath);
    
    // Create a larger canvas (512x512)
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    
    // Add solid background color (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    
    // Draw the logo scaled to fill most of the space (with padding)
    const padding = 20;
    const size = 512 - (padding * 2);
    ctx.drawImage(logo, padding, padding, size, size);
    
    // Save as PNG (browsers prefer PNG for larger favicons)
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(join(__dirname, 'public', 'favicon-large.png'), buffer);
    
    console.log('Created favicon-large.png (512x512) with solid background');
  } catch (error) {
    console.error('Error resizing favicon:', error);
  }
}

resizeFavicon();
