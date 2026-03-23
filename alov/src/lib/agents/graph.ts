import { readFileSafe } from "@/lib/explorer/fs"
import path from "path"

export interface DependencyNode {
  path: string
  imports: string[]
  content?: string
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map()
  private processed: Set<string> = new Set()

  constructor(private rootPath: string = process.cwd()) {}

  // Resolve import path to absolute file path
  private resolvePath(currentFile: string, importPath: string): string | null {
    // Handle @/ alias
    if (importPath.startsWith('@/')) {
      return path.join(this.rootPath, 'src', importPath.substring(2))
    }
    
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const dir = path.dirname(currentFile)
      return path.resolve(dir, importPath)
    }

    // Ignore node_modules for now
    return null
  }

  // Extract imports from file content
  private extractImports(content: string, filePath: string): string[] {
    const imports: string[] = []
    
    // JS/TS Imports
    if (/\.(tsx?|jsx?|js|ts)$/.test(filePath)) {
      // import ... from '...'
      const importRegex = /import\s+(?:type\s+)?(?:[\w\s{},*]+from\s+)?['"]([^'"]+)['"]/g
      // export ... from '...'
      const exportRegex = /export\s+(?:type\s+)?(?:[\w\s{},*]+from\s+)?['"]([^'"]+)['"]/g
      // require('...')
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g
      // import('...') dynamic import
      const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g

      let match
      while ((match = importRegex.exec(content)) !== null) imports.push(match[1])
      while ((match = exportRegex.exec(content)) !== null) imports.push(match[1])
      while ((match = requireRegex.exec(content)) !== null) imports.push(match[1])
      while ((match = dynamicImportRegex.exec(content)) !== null) imports.push(match[1])
    }
    
    // Python Imports (basic support)
    if (/\.py$/.test(filePath)) {
      const fromRegex = /from\s+([\w.]+)\s+import/g
      const importRegex = /import\s+([\w.]+)/g
      
      let match
      while ((match = fromRegex.exec(content)) !== null) imports.push(match[1].replace(/\./g, '/'))
      while ((match = importRegex.exec(content)) !== null) imports.push(match[1].replace(/\./g, '/'))
    }

    return [...new Set(imports)] // Unique
  }

  // Try to find the file with extensions
  private async resolveFileWithExtensions(basePath: string): Promise<string | null> {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.py']
    
    // If it already has an extension, try it
    try {
      const exact = await readFileSafe(basePath)
      if (exact.content) return basePath
    } catch {}

    // Try adding extensions
    for (const ext of extensions) {
      try {
        const p = basePath + ext
        const file = await readFileSafe(p)
        if (file.content) return p
      } catch {}
    }
    
    // Try /index.ts, /index.tsx etc.
    for (const ext of extensions) {
      try {
        const p = path.join(basePath, 'index' + ext)
        const file = await readFileSafe(p)
        if (file.content) return p
      } catch {}
    }

    return null
  }

  // Build graph starting from entry files
  async build(entryPaths: string[], depth: number = 1): Promise<Map<string, DependencyNode>> {
    for (const p of entryPaths) {
      await this.processFile(p, depth)
    }
    return this.nodes
  }

  private async processFile(filePath: string, depth: number) {
    if (depth < 0 || this.processed.has(filePath)) return
    this.processed.add(filePath)

    try {
      const file = await readFileSafe(filePath)
      const content = file.content
      const imports = this.extractImports(content, filePath)
      const resolvedImports: string[] = []

      for (const imp of imports) {
        const resolved = this.resolvePath(filePath, imp)
        if (resolved) {
          const actualPath = await this.resolveFileWithExtensions(resolved)
          if (actualPath) {
            resolvedImports.push(actualPath)
            // Recursively process dependencies
            await this.processFile(actualPath, depth - 1)
          }
        }
      }

      this.nodes.set(filePath, {
        path: filePath,
        imports: resolvedImports,
        content
      })
    } catch (e) {
      // Ignore read errors
    }
  }

  getNodes() {
    return this.nodes
  }
}
