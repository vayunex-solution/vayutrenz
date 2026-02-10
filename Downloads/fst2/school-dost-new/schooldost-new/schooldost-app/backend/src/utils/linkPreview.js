// Link Preview Utility - Extract Open Graph metadata from URLs
const https = require('https');
const http = require('http');
const { URL } = require('url');

const fetchLinkPreview = async (url) => {
    try {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;

        const html = await new Promise((resolve, reject) => {
            const req = client.get(url, {
                headers: { 'User-Agent': 'SchoolDost/1.0 LinkPreview Bot' },
                timeout: 5000
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Follow redirect
                    return fetchLinkPreview(res.headers.location).then(resolve).catch(reject);
                }
                let data = '';
                res.setEncoding('utf8');
                res.on('data', chunk => {
                    data += chunk;
                    // Only need the <head> section
                    if (data.length > 50000) res.destroy();
                });
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        });

        // Extract OG tags
        const getMetaContent = (property) => {
            const patterns = [
                new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
                new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
                new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')
            ];
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) return match[1];
            }
            return null;
        };

        const title = getMetaContent('og:title') || getMetaContent('twitter:title') || 
                       (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
        const description = getMetaContent('og:description') || getMetaContent('twitter:description') || 
                            getMetaContent('description') || '';
        const image = getMetaContent('og:image') || getMetaContent('twitter:image') || '';
        const siteName = getMetaContent('og:site_name') || parsed.hostname;

        return {
            url,
            title: title.slice(0, 200),
            description: description.slice(0, 300),
            image,
            siteName,
            domain: parsed.hostname
        };
    } catch (error) {
        return { url, title: '', description: '', image: '', siteName: '', domain: new URL(url).hostname };
    }
};

module.exports = { fetchLinkPreview };
