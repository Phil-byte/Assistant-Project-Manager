// src/lib/seo.js
/**
 * Utilitaires d'optimisation SEO pour l'application
 */

/**
 * Génère les balises meta pour le SEO
 * @param {Object} options - Options de configuration
 * @returns {string} - HTML des balises meta
 */
export function generateMetaTags(options = {}) {
  const {
    title = 'Communication Project Manager',
    description = 'Application de gestion de projets pour les chefs de projet en communication',
    keywords = 'gestion de projet, communication, chef de projet, briefs, tâches',
    author = 'Communication Project Manager',
    ogImage = '/images/og-image.jpg',
    twitterCard = 'summary_large_image',
    canonicalUrl = '',
    robots = 'index, follow'
  } = options;

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="${author}" />
    <meta name="robots" content="${robots}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}" />` : ''}
    
    <!-- Twitter -->
    <meta property="twitter:card" content="${twitterCard}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${ogImage}" />
    
    ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}" />` : ''}
  `;
}

/**
 * Génère un sitemap XML pour l'application
 * @param {Array} routes - Liste des routes de l'application
 * @param {string} baseUrl - URL de base de l'application
 * @returns {string} - Contenu du sitemap XML
 */
export function generateSitemap(routes, baseUrl) {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${route.path}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq || 'monthly'}</changefreq>\n`;
    sitemap += `    <priority>${route.priority || '0.8'}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  
  return sitemap;
}

/**
 * Génère un fichier robots.txt pour l'application
 * @param {string} baseUrl - URL de base de l'application
 * @param {Array} disallowPaths - Chemins à interdire aux robots
 * @returns {string} - Contenu du fichier robots.txt
 */
export function generateRobotsTxt(baseUrl, disallowPaths = []) {
  let robotsTxt = 'User-agent: *\n';
  
  disallowPaths.forEach(path => {
    robotsTxt += `Disallow: ${path}\n`;
  });
  
  robotsTxt += `\nSitemap: ${baseUrl}/sitemap.xml`;
  
  return robotsTxt;
}

/**
 * Génère des URL conviviales pour le SEO
 * @param {string} text - Texte à transformer en slug
 * @returns {string} - Slug SEO-friendly
 */
export function generateSlug(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Génère des données structurées JSON-LD pour le SEO
 * @param {string} type - Type de données structurées
 * @param {Object} data - Données à inclure
 * @returns {string} - Balise script contenant les données structurées
 */
export function generateStructuredData(type, data) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };
  
  return `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
}

/**
 * Génère des breadcrumbs pour le SEO
 * @param {Array} items - Éléments du fil d'Ariane
 * @param {string} baseUrl - URL de base de l'application
 * @returns {string} - Données structurées pour les breadcrumbs
 */
export function generateBreadcrumbs(items, baseUrl) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `${baseUrl}${item.path}`
    }))
  };
  
  return `<script type="application/ld+json">${JSON.stringify(breadcrumbList)}</script>`;
}
