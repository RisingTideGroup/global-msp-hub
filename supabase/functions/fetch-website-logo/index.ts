
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate and sanitize URL to prevent SSRF attacks
    let websiteUrl: string;
    try {
      // Ensure URL has protocol
      const inputUrl = url.startsWith('http') ? url : `https://${url}`;
      const parsedUrl = new URL(inputUrl);
      
      // Block private/local network ranges
      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Block localhost, private IPs, and metadata services
      const blockedPatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^192\.168\./,
        /^169\.254\./,  // Link-local
        /^::1$/,        // IPv6 localhost
        /^fc00:/,       // IPv6 private
        /^fe80:/,       // IPv6 link-local
        /metadata/i,    // Cloud metadata services
      ];
      
      if (blockedPatterns.some(pattern => pattern.test(hostname))) {
        throw new Error('Access to private/local networks is not allowed');
      }
      
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are allowed');
      }
      
      websiteUrl = parsedUrl.toString();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: `Invalid URL: ${error.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch the website HTML
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobMatch/1.0; +https://jobmatch.com)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract logo URLs using various methods
    const logoUrls: string[] = []
    
    // Method 1: Look for apple-touch-icon (high quality)
    const appleIconMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
    if (appleIconMatch) {
      logoUrls.push(resolveUrl(appleIconMatch[1], websiteUrl))
    }
    
    // Method 2: Look for favicon with large size
    const faviconMatches = html.matchAll(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi)
    for (const match of faviconMatches) {
      const linkTag = match[0]
      const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i)
      const sizeMatch = linkTag.match(/sizes=["']([^"']+)["']/i)
      
      if (hrefMatch) {
        const href = resolveUrl(hrefMatch[1], websiteUrl)
        // Prefer larger icons
        if (sizeMatch && (sizeMatch[1].includes('192') || sizeMatch[1].includes('180') || sizeMatch[1].includes('152'))) {
          logoUrls.unshift(href) // Add to beginning for priority
        } else {
          logoUrls.push(href)
        }
      }
    }
    
    // Method 3: Look for Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    if (ogImageMatch) {
      logoUrls.push(resolveUrl(ogImageMatch[1], websiteUrl))
    }
    
    // Method 4: Default favicon.ico
    logoUrls.push(new URL('/favicon.ico', websiteUrl).toString())
    
    // Try each URL until we find one that works
    for (const logoUrl of logoUrls) {
      try {
        const logoResponse = await fetch(logoUrl, { method: 'HEAD' })
        if (logoResponse.ok && logoResponse.headers.get('content-type')?.startsWith('image/')) {
          return new Response(
            JSON.stringify({ 
              logoUrl,
              title: extractTitle(html),
              description: extractDescription(html)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch (error) {
        console.log(`Failed to fetch logo from ${logoUrl}:`, error)
        continue
      }
    }
    
    // If no logo found, return metadata without logo
    return new Response(
      JSON.stringify({ 
        logoUrl: null,
        title: extractTitle(html),
        description: extractDescription(html)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error fetching website logo:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('//')) {
    return `https:${url}`
  }
  if (url.startsWith('/')) {
    return new URL(url, baseUrl).toString()
  }
  if (url.startsWith('http')) {
    return url
  }
  return new URL(url, baseUrl).toString()
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return titleMatch[1].trim()
  
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (ogTitleMatch) return ogTitleMatch[1].trim()
  
  return null
}

function extractDescription(html: string): string | null {
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (metaDescMatch) return metaDescMatch[1].trim()
  
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  if (ogDescMatch) return ogDescMatch[1].trim()
  
  return null
}
