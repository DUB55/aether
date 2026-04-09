// SEO boosting service
// Helps optimize projects for search engines

export interface SEOAnalysis {
  score: number
  issues: SEOIssue[]
  suggestions: SEOSuggestion[]
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info'
  category: string
  message: string
  fix?: string
}

export interface SEOSuggestion {
  category: string
  suggestion: string
  impact: 'high' | 'medium' | 'low'
}

export const seoService = {
  // Analyze project for SEO issues
  analyzeProject: (files: Record<string, string>): SEOAnalysis => {
    const issues: SEOIssue[] = []
    const suggestions: SEOSuggestion[] = []

    // Check for index.html
    const indexHtml = files['index.html'] || files['public/index.html'] || ''
    
    if (!indexHtml) {
      issues.push({
        type: 'critical',
        category: 'Structure',
        message: 'No index.html found',
        fix: 'Create an index.html file in the public directory'
      })
    } else {
      // Check for title tag
      if (!indexHtml.includes('<title>')) {
        issues.push({
          type: 'critical',
          category: 'Meta',
          message: 'Missing title tag',
          fix: 'Add a descriptive title tag to your HTML head'
        })
      }

      // Check for meta description
      if (!indexHtml.includes('name="description"')) {
        issues.push({
          type: 'warning',
          category: 'Meta',
          message: 'Missing meta description',
          fix: 'Add a meta description tag to improve search result snippets'
        })
      }

      // Check for viewport meta
      if (!indexHtml.includes('name="viewport"')) {
        issues.push({
          type: 'warning',
          category: 'Mobile',
          message: 'Missing viewport meta tag',
          fix: 'Add viewport meta tag for mobile responsiveness'
        })
      }

      // Check for canonical URL
      if (!indexHtml.includes('rel="canonical"')) {
        suggestions.push({
          category: 'Canonical',
          suggestion: 'Add canonical URL to prevent duplicate content issues',
          impact: 'high'
        })
      }

      // Check for Open Graph tags
      if (!indexHtml.includes('property="og:"')) {
        suggestions.push({
          category: 'Social',
          suggestion: 'Add Open Graph tags for better social media sharing',
          impact: 'medium'
        })
      }

      // Check for Twitter Card tags
      if (!indexHtml.includes('name="twitter:"')) {
        suggestions.push({
          category: 'Social',
          suggestion: 'Add Twitter Card tags for Twitter sharing',
          impact: 'medium'
        })
      }

      // Check for structured data
      if (!indexHtml.includes('application/ld+json')) {
        suggestions.push({
          category: 'Structured Data',
          suggestion: 'Add structured data (JSON-LD) for rich search results',
          impact: 'high'
        })
      }
    }

    // Check for robots.txt
    const robotsTxt = files['public/robots.txt'] || files['robots.txt'] || ''
    if (!robotsTxt) {
      suggestions.push({
        category: 'Crawling',
        suggestion: 'Add robots.txt to control crawler access',
        impact: 'medium'
      })
    }

    // Check for sitemap.xml
    const sitemapXml = files['public/sitemap.xml'] || files['sitemap.xml'] || ''
    if (!sitemapXml) {
      suggestions.push({
        category: 'Crawling',
        suggestion: 'Add sitemap.xml to help search engines discover pages',
        impact: 'high'
      })
    }

    // Calculate SEO score
    const criticalCount = issues.filter(i => i.type === 'critical').length
    const warningCount = issues.filter(i => i.type === 'warning').length
    const score = Math.max(0, 100 - (criticalCount * 25) - (warningCount * 10))

    return { score, issues, suggestions }
  },

  // Generate meta tags
  generateMetaTags: (config: {
    title: string
    description: string
    keywords?: string
    image?: string
    url?: string
    type?: 'website' | 'article'
  }): string => {
    const tags = [
      `<title>${config.title}</title>`,
      `<meta name="description" content="${config.description}">`,
      config.keywords ? `<meta name="keywords" content="${config.keywords}">` : '',
      `<meta property="og:title" content="${config.title}">`,
      `<meta property="og:description" content="${config.description}">`,
      config.image ? `<meta property="og:image" content="${config.image}">` : '',
      config.url ? `<meta property="og:url" content="${config.url}">` : '',
      `<meta property="og:type" content="${config.type || 'website'}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${config.title}">`,
      `<meta name="twitter:description" content="${config.description}">`,
      config.image ? `<meta name="twitter:image" content="${config.image}">` : ''
    ].filter(Boolean).join('\n')

    return tags
  },

  // Generate robots.txt
  generateRobotsTxt: (options?: {
    disallow?: string[]
    allow?: string[]
    sitemap?: string
  }): string => {
    const lines = ['User-agent: *']
    
    if (options?.disallow) {
      options.disallow.forEach(path => {
        lines.push(`Disallow: ${path}`)
      })
    }

    if (options?.allow) {
      options.allow.forEach(path => {
        lines.push(`Allow: ${path}`)
      })
    }

    if (options?.sitemap) {
      lines.push(`Sitemap: ${options.sitemap}`)
    }

    return lines.join('\n')
  },

  // Generate sitemap.xml
  generateSitemapXml: (urls: Array<{
    loc: string
    lastmod?: string
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority?: number
  }>): string => {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(url => {
        return `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`
      }),
      '</urlset>'
    ].join('\n')

    return xml
  },

  // Generate structured data
  generateStructuredData: (type: 'Organization' | 'WebSite' | 'Article', data: any): string => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    }

    return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`
  }
}
