/**
 * Figma Integration Service
 * Enables design-to-app workflow from Figma designs
 */

export interface FigmaDesign {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  lastModified: string;
  pages: FigmaPage[];
}

export interface FigmaPage {
  id: string;
  name: string;
  frames: FigmaFrame[];
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: 'FRAME' | 'COMPONENT' | 'INSTANCE' | 'GROUP';
  children: FigmaNode[];
  layout: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  styles: FigmaStyles;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  layout: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  styles: FigmaStyles;
  children?: FigmaNode[];
}

export interface FigmaStyles {
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: string;
  };
}

export interface FigmaConfig {
  accessToken: string;
  teamId?: string;
  projectId?: string;
}

export interface GeneratedCode {
  html: string;
  css: string;
  javascript: string;
  components: string[];
}

export class FigmaService {
  private config: FigmaConfig | null = null;

  /**
   * Configure Figma service
   */
  configure(config: FigmaConfig): void {
    this.config = config;
    console.log('[FigmaService] Configured with access token');
  }

  /**
   * Fetch design from Figma URL
   */
  async fetchDesign(figmaUrl: string): Promise<FigmaDesign> {
    if (!this.config) {
      throw new Error('Figma service not configured');
    }

    // Extract file key from Figma URL
    const fileKey = this.extractFileKey(figmaUrl);
    if (!fileKey) {
      throw new Error('Invalid Figma URL');
    }

    console.log(`[FigmaService] Fetching design from Figma: ${fileKey}`);

    // In real implementation, this would call Figma API
    // For now, return mock data
    return this.getMockDesign(fileKey, figmaUrl);
  }

  /**
   * Extract file key from Figma URL
   */
  private extractFileKey(url: string): string | null {
    const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Generate code from Figma design
   */
  async generateCode(design: FigmaDesign, options: {
    framework?: 'react' | 'vue' | 'svelte' | 'vanilla';
    styling?: 'tailwind' | 'css' | 'styled-components';
    components?: boolean;
  } = {}): Promise<GeneratedCode> {
    const framework = options.framework || 'react';
    const styling = options.styling || 'tailwind';

    console.log(`[FigmaService] Generating ${framework} code with ${styling} styling`);

    // Generate code based on design
    const html = this.generateHTML(design);
    const css = this.generateCSS(design, styling);
    const javascript = this.generateJavaScript(design, framework);
    const components = this.generateComponents(design, framework);

    return {
      html,
      css,
      javascript,
      components
    };
  }

  /**
   * Generate HTML from Figma design
   */
  private generateHTML(design: FigmaDesign): string {
    let html = '<div class="figma-design">\n';
    
    for (const page of design.pages) {
      html += `  <div class="page" data-page="${page.name}">\n`;
      for (const frame of page.frames) {
        html += this.generateFrameHTML(frame, 2);
      }
      html += '  </div>\n';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Generate HTML for a frame
   */
  private generateFrameHTML(frame: FigmaFrame, indent: number): string {
    const spaces = ' '.repeat(indent);
    let html = `${spaces}<div class="frame" data-frame="${frame.name}" style="width: ${frame.layout.width}px; height: ${frame.layout.height}px; position: absolute; left: ${frame.layout.x}px; top: ${frame.layout.y}px;">\n`;
    
    for (const node of frame.children) {
      html += this.generateNodeHTML(node, indent + 2);
    }
    
    html += `${spaces}</div>\n`;
    return html;
  }

  /**
   * Generate HTML for a node
   */
  private generateNodeHTML(node: FigmaNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    const tag = this.getHTMLTag(node.type);
    
    let html = `${spaces}<${tag} class="${node.type.toLowerCase()}" data-node="${node.name}" style="width: ${node.layout.width}px; height: ${node.layout.height}px; position: absolute; left: ${node.layout.x}px; top: ${node.layout.y}px;">\n`;
    
    if (node.children) {
      for (const child of node.children) {
        html += this.generateNodeHTML(child, indent + 2);
      }
    }
    
    html += `${spaces}</${tag}>\n`;
    return html;
  }

  /**
   * Get HTML tag based on Figma node type
   */
  private getHTMLTag(type: string): string {
    const tagMap: Record<string, string> = {
      'TEXT': 'p',
      'RECTANGLE': 'div',
      'ELLIPSE': 'div',
      'VECTOR': 'svg',
      'FRAME': 'div',
      'GROUP': 'div',
      'INSTANCE': 'div',
      'COMPONENT': 'div',
    };
    return tagMap[type] || 'div';
  }

  /**
   * Generate CSS from Figma design
   */
  private generateCSS(design: FigmaDesign, styling: string): string {
    if (styling === 'tailwind') {
      return this.generateTailwindCSS(design);
    }
    return this.generateStandardCSS(design);
  }

  /**
   * Generate Tailwind CSS classes
   */
  private generateTailwindCSS(design: FigmaDesign): string {
    let css = '/* Tailwind CSS classes would be generated here */\n';
    css += '/* Use the HTML structure with appropriate Tailwind utility classes */\n';
    return css;
  }

  /**
   * Generate standard CSS
   */
  private generateStandardCSS(design: FigmaDesign): string {
    let css = '.figma-design {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n';
    
    for (const page of design.pages) {
      css += `.page[data-page="${page.name}"] {\n  position: relative;\n}\n\n`;
      
      for (const frame of page.frames) {
        css += this.generateFrameCSS(frame);
      }
    }
    
    return css;
  }

  /**
   * Generate CSS for a frame
   */
  private generateFrameCSS(frame: FigmaFrame): string {
    let css = `.frame[data-frame="${frame.name}"] {\n`;
    css += `  width: ${frame.layout.width}px;\n`;
    css += `  height: ${frame.layout.height}px;\n`;
    css += `  position: absolute;\n`;
    css += `  left: ${frame.layout.x}px;\n`;
    css += `  top: ${frame.layout.y}px;\n`;
    css += '}\n\n';
    return css;
  }

  /**
   * Generate JavaScript from Figma design
   */
  private generateJavaScript(design: FigmaDesign, framework: string): string {
    switch (framework) {
      case 'react':
        return this.generateReactCode(design);
      case 'vue':
        return this.generateVueCode(design);
      case 'svelte':
        return this.generateSvelteCode(design);
      default:
        return this.generateVanillaJS(design);
    }
  }

  /**
   * Generate React component code
   */
  private generateReactCode(design: FigmaDesign): string {
    return `
import React from 'react'

export default function FigmaDesign() {
  return (
    <div className="figma-design">
      {/* Generated from Figma design */}
      <div className="design-content">
        <h1>${design.name}</h1>
        {/* Components would be generated here */}
      </div>
    </div>
  )
}
`;
  }

  /**
   * Generate Vue component code
   */
  private generateVueCode(design: FigmaDesign): string {
    return `
<template>
  <div class="figma-design">
    <div class="design-content">
      <h1>{{ '${design.name}' }}</h1>
      <!-- Components would be generated here -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'FigmaDesign'
}
</script>
`;
  }

  /**
   * Generate Svelte component code
   */
  private generateSvelteCode(design: FigmaDesign): string {
    return `
<div class="figma-design">
  <div class="design-content">
    <h1>${design.name}</h1>
    <!-- Components would be generated here -->
  </div>
</div>

<script>
export let name = '${design.name}'
</script>
`;
  }

  /**
   * Generate vanilla JavaScript code
   */
  private generateVanillaJS(design: FigmaDesign): string {
    return `
// Generated from Figma design: ${design.name}
document.addEventListener('DOMContentLoaded', () => {
  const design = document.querySelector('.figma-design')
  if (design) {
    console.log('Figma design loaded:', '${design.name}')
  }
})
`;
  }

  /**
   * Generate reusable components from design
   */
  private generateComponents(design: FigmaDesign, framework: string): string[] {
    const components: string[] = [];
    
    // Identify reusable components from frames
    for (const page of design.pages) {
      for (const frame of page.frames) {
        if (frame.type === 'COMPONENT') {
          components.push(this.generateComponentCode(frame, framework));
        }
      }
    }
    
    return components;
  }

  /**
   * Generate code for a single component
   */
  private generateComponentCode(frame: FigmaFrame, framework: string): string {
    const componentName = this.sanitizeComponentName(frame.name);
    
    switch (framework) {
      case 'react':
        return `
export function ${componentName}() {
  return (
    <div className="${componentName.toLowerCase()}">
      {/* Component: ${frame.name} */}
    </div>
  )
}
`;
      default:
        return `// Component: ${frame.name}\n`;
    }
  }

  /**
   * Sanitize component name
   */
  private sanitizeComponentName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, 'Component$&')
      .replace(/^./, str => str.toUpperCase());
  }

  /**
   * Get mock design for testing
   */
  private getMockDesign(fileKey: string, url: string): FigmaDesign {
    return {
      id: fileKey,
      name: 'Mock Figma Design',
      url: url,
      thumbnailUrl: '',
      lastModified: new Date().toISOString(),
      pages: [
        {
          id: 'page-1',
          name: 'Page 1',
          frames: [
            {
              id: 'frame-1',
              name: 'Main Frame',
              type: 'FRAME',
              layout: { width: 375, height: 812, x: 0, y: 0 },
              styles: { fills: [{ type: 'solid', color: '#ffffff' }] },
              children: [
                {
                  id: 'node-1',
                  name: 'Header',
                  type: 'TEXT',
                  layout: { width: 200, height: 30, x: 20, y: 20 },
                  styles: {
                    typography: {
                      fontFamily: 'Inter',
                      fontSize: 24,
                      fontWeight: 600,
                      lineHeight: 30,
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Validate Figma access token
   */
  async validateToken(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    // In real implementation, this would validate with Figma API
    console.log('[FigmaService] Validating access token...');
    return true;
  }
}

// Global Figma service instance
export const figmaService = new FigmaService();
