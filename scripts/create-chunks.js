const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ChunkCreator {
    constructor() {
        this.chunkSize = 10 * 1024 * 1024; // 10MB chunks
        this.outputDir = path.join(__dirname, '../installer/chunks');
        this.manifestPath = path.join(__dirname, '../installer/manifest.json');
    }

    async createChunks() {
        console.log('Creating chunks for Aether AI IDE installer...');
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Get the built executable
        const executablePath = path.join(__dirname, '../src-tauri/target/release/app.exe');
        
        if (!fs.existsSync(executablePath)) {
            throw new Error(`Executable not found at ${executablePath}. Please build the application first with 'npm run tauri:build'`);
        }

        // Read the executable
        const fileBuffer = fs.readFileSync(executablePath);
        const fileSize = fileBuffer.length;
        console.log(`File size: ${this.formatFileSize(fileSize)}`);

        // Create chunks
        const chunks = [];
        const totalChunks = Math.ceil(fileSize / this.chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * this.chunkSize;
            const end = Math.min(start + this.chunkSize, fileSize);
            const chunkBuffer = fileBuffer.slice(start, end);
            
            // Create chunk file
            const chunkFileName = `chunk-${String(i + 1).padStart(3, '0')}.bin`;
            const chunkPath = path.join(this.outputDir, chunkFileName);
            
            fs.writeFileSync(chunkPath, chunkBuffer);
            
            // Calculate checksum
            const checksum = crypto.createHash('sha256').update(chunkBuffer).digest('hex');
            
            chunks.push({
                id: `chunk-${i + 1}`,
                fileName: chunkFileName,
                url: `https://releases.aether-ai.com/v1.0.0/chunks/${chunkFileName}`,
                size: chunkBuffer.length,
                checksum,
                index: i
            });

            console.log(`Created chunk ${i + 1}/${totalChunks}: ${chunkFileName} (${this.formatFileSize(chunkBuffer.length)})`);
        }

        // Create manifest
        const manifest = {
            version: '1.0.0',
            totalSize: fileSize,
            chunkSize: this.chunkSize,
            totalChunks,
            chunks,
            createdAt: new Date().toISOString(),
            requirements: {
                os: 'windows',
                minVersion: '10.0',
                architecture: 'x64',
                memory: '4GB RAM',
                storage: '100MB free space'
            },
            metadata: {
                name: 'Aether AI IDE',
                description: 'AI-Powered Development Environment',
                version: '1.0.0',
                executable: 'app.exe',
                installPath: 'C:\\Program Files\\Aether AI IDE'
            }
        };

        fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
        
        // Create checksums file
        const checksumsPath = path.join(__dirname, '../installer/checksums.sha256');
        const allChecksums = chunks.map(chunk => `${chunk.fileName} ${chunk.checksum}`).join('\n');
        fs.writeFileSync(checksumsPath, allChecksums);

        console.log(`\n✅ Chunk creation complete!`);
        console.log(`📁 Chunks: ${totalChunks} files in ${this.outputDir}`);
        console.log(`📋 Manifest: ${this.manifestPath}`);
        console.log(`🔐 Checksums: ${checksumsPath}`);
        console.log(`📦 Total size: ${this.formatFileSize(fileSize)}`);
        
        return manifest;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Run if called directly
if (require.main === module) {
    const chunker = new ChunkCreator();
    chunker.createChunks().catch(console.error);
}

module.exports = ChunkCreator;
