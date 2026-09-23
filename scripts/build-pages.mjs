import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'seo-content', 'pages');

const DOMAIN = 'https://cardy.today';
const APP_STORE_URL = 'https://apps.apple.com/us/app/cardy-reflections/id6757249840';
const WEB_APP_URL = 'https://app.cardy.today';

// Dates for Article schema freshness signals (AI systems favor dated, recently-updated content).
// Override per-page with `date_published` / `date_modified` frontmatter (YYYY-MM-DD).
const DEFAULT_PUBLISHED = '2026-09-18';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Known internal link mapping
const SLUG_MAP = {
  'what is cardology': '/what-is-cardology',
  'how to read destiny cards': '/how-to-read-destiny-cards',
  '52 cards of destiny': '/52-cards-of-destiny',
  'the 52 cards of destiny': '/52-cards-of-destiny',
  'playing card astrology': '/playing-card-astrology',
  'cardology vs astrology': '/cardology-vs-astrology',
  'robert lee camp destiny cards': '/robert-lee-camp-destiny-cards',
  'robert lee camp & destiny cards': '/robert-lee-camp-destiny-cards',
  'destiny cards meaning': '/destiny-cards-meaning',
  'destiny cards meanings': '/destiny-cards-meaning',
  'birth card meanings': '/birth-card-meanings',
  'what are karma cards': '/what-are-karma-cards',
  'what are karma cards?': '/what-are-karma-cards',
  'challenging karma card': '/challenging-karma-card',
  'supporting karma card': '/supporting-karma-card',
  'destiny cards calculator': '/destiny-cards-calculator',
  'find my birth card': '/find-my-birth-card',
  'find my cards': '/find-my-birth-card',
  'get your birth card free': '/find-my-birth-card',
  'cardology yearly spread': '/cardology-yearly-spread',
  'destiny cards relationship chart': '/destiny-cards-relationship-chart',
  'cardology compatibility': '/cardology-compatibility',
  'love cards compatibility': '/love-cards-compatibility',
  'get cardy': APP_STORE_URL,
  'get cardy free': APP_STORE_URL,
  'download cardy': APP_STORE_URL,
  'download cardy free': APP_STORE_URL,
  'get cardy on the app store': APP_STORE_URL,
  'see all 3 cards free in the app': APP_STORE_URL,
  'reveal your full spread in cardy': APP_STORE_URL,
  'get your free birth card reading in cardy': APP_STORE_URL,
  'find my current card in cardy': APP_STORE_URL,
  'check your relationship in cardy': APP_STORE_URL,
  'look up a birthday in cardy': APP_STORE_URL,
  'check compatibility in cardy': APP_STORE_URL,
  'check your compatibility in cardy free': APP_STORE_URL,
  'check their card free': '/find-my-birth-card',
  'web app': WEB_APP_URL,
  'cardy web app': WEB_APP_URL,
  'use the web app': WEB_APP_URL,
  'open web app': WEB_APP_URL
};

// Reader-facing names for the internal pillar labels in frontmatter ("2 — Foundations & ...").
const PILLAR_LABELS = {
  'tools & calculators': 'Free Tools',
  'foundations & beginner education': 'Cardology Basics',
  'card meanings & karma cards': 'Card Meanings',
  'love & compatibility': 'Compatibility',
  'advanced cardology': 'Advanced'
};

function pillarLabel(pillar) {
  const name = (pillar.split('—')[1] || pillar).trim();
  return PILLAR_LABELS[name.toLowerCase()] || name;
}

// Plain text for JSON-LD: drop "(see [X →])" references and markdown syntax so AI bots read clean answers.
function toPlainText(text) {
  return text
    .replace(/\*?\(\s*\[[^\]]+\]\s*\)\*?/g, '')
    .replace(/\[([^\]]+?)\s*→?\s*\]/g, '$1')
    .replace(/\*\*|\*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const metaLines = match[1].split('\n');
  const meta = {};
  for (const line of metaLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: match[2].trim() };
}

function resolveInternalLinks(text) {
  return text.replace(/\[([^\]]+)\]/g, (match, inner) => {
    let clean = inner.replace(/[→\s]+$/, '').trim();
    const lower = clean.toLowerCase();

    // Direct match in map
    if (SLUG_MAP[lower]) {
      const isExternal = SLUG_MAP[lower].startsWith('http');
      const extra = isExternal ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${SLUG_MAP[lower]}"${extra}>${clean} →</a>`;
    }

    // Check if it's an anchor like [Get Cardy →]
    for (const [key, slug] of Object.entries(SLUG_MAP)) {
      if (lower.includes(key)) {
        const isExternal = slug.startsWith('http');
        const extra = isExternal ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${slug}"${extra}>${clean} →</a>`;
      }
    }

    return match;
  });
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let listType = null;
  let inTable = false;
  let tableRows = [];
  let inFaq = false;
  const faqs = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Check if closing table
    if (inTable && (!line.startsWith('|') || i === lines.length - 1)) {
      if (line.startsWith('|')) tableRows.push(line);
      out.push(renderTable(tableRows));
      inTable = false;
      tableRows = [];
      if (!line.startsWith('|')) {
        // continue processing current line below
      } else {
        continue;
      }
    }

    // Check if closing list
    if (listType && !line.startsWith('- ') && !line.startsWith('* ') && !line.match(/^\d+\.\s/)) {
      out.push(listType === 'ol' ? '</ol>' : '</ul>');
      listType = null;
    }

    if (!line) {
      continue;
    }

    // Skip initial H1 since it's injected into .article-header
    if (line.startsWith('# ')) {
      continue;
    }

    // Raw HTML (widgets, divs, options, selects, buttons)
    if (line.startsWith('<')) {
      out.push(line);
      continue;
    }

    // Tables
    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    }

    // Unordered lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!listType) {
        out.push('<ul>');
        listType = 'ul';
      }
      const content = line.slice(2);
      out.push(`<li>${formatInline(content)}</li>`);
      continue;
    }

    // Ordered lists
    if (line.match(/^\d+\.\s/)) {
      if (!listType) {
        out.push('<ol>');
        listType = 'ol';
      }
      const content = line.replace(/^\d+\.\s*/, '');
      out.push(`<li>${formatInline(content)}</li>`);
      continue;
    }

    // Headings
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      if (title.toLowerCase().includes('faq')) {
        inFaq = true;
      }
      out.push(`<h2>${formatInline(title)}</h2>`);
      continue;
    }

    if (line.startsWith('### ')) {
      const title = line.slice(4).trim();
      let idAttr = '';
      if (title.includes('Hearts')) idAttr = ' id="hearts"';
      else if (title.includes('Clubs')) idAttr = ' id="clubs"';
      else if (title.includes('Diamonds')) idAttr = ' id="diamonds"';
      else if (title.includes('Spades')) idAttr = ' id="spades"';
      else if (title.includes('Joker')) idAttr = ' id="joker"';
      out.push(`<h3${idAttr}>${formatInline(title)}</h3>`);
      continue;
    }

    if (line.startsWith('#### ')) {
      const title = line.slice(5).trim();
      let slug = '';
      const prefix = title.split(/[—–:-]/)[0].trim().toLowerCase();
      slug = prefix.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const idAttr = slug ? ` id="${slug}"` : '';
      out.push(`<h4${idAttr}>${formatInline(title)}</h4>`);
      continue;
    }

    // Closing CTA
    if (line.startsWith('> 🎯 **CLOSING CTA:**') || line.startsWith('> 🎯 CLOSING CTA:')) {
      const text = line.replace(/^>\s*🎯\s*(\*\*CLOSING CTA:\*\*|CLOSING CTA:)/, '').trim();
      out.push(`
        <div class="closing-cta-card">
          <span class="pillar-badge">Experience Cardy</span>
          <h3>Play your cards right.</h3>
          <p>${formatInline(text)}</p>
          <div class="hero-buttons" style="justify-content: center; margin-top: 24px;">
            <a href="${APP_STORE_URL}" class="store-btn store-btn--apple" target="_blank" rel="noopener">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div class="store-label">
                <small>Download on the</small>
                <span>App Store</span>
              </div>
            </a>
            <a href="${WEB_APP_URL}" class="store-btn store-btn--web" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"/></svg>
              <div class="store-label">
                <small>On Android? Use the</small>
                <span>Web App</span>
              </div>
            </a>
          </div>
        </div>
      `);
      continue;
    }

    // Standard CTA Callout
    if (line.startsWith('> 🎯 **CTA:**') || line.startsWith('> 🎯 CTA:')) {
      const text = line.replace(/^>\s*🎯\s*(\*\*CTA:\*\*|CTA:)/, '').trim();
      out.push(`
        <div class="cta-callout">
          <p>${formatInline(text)}</p>
        </div>
      `);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      out.push(`<blockquote><p>${formatInline(line.slice(2))}</p></blockquote>`);
      continue;
    }

    // Related bar
    if (line.startsWith('*Related:')) {
      out.push(`
        <div class="related-links-bar">
          <strong>Related Guides:</strong> ${formatInline(line.replace(/^\*Related:\s*/, '').replace(/\*$/, ''))}
        </div>
      `);
      continue;
    }

    // Parse FAQ items if in FAQ section
    if (inFaq && line.startsWith('**') && line.includes('?**')) {
      const qMatch = line.match(/\*\*(.*?)\*\*/);
      if (qMatch) {
        const question = qMatch[1];
        let answer = '';
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length && !lines[j].startsWith('#') && !lines[j].startsWith('>')) {
          answer = lines[j].trim();
          i = j; // advance
        }
        faqs.push({ question, answer });
        out.push(`
          <div class="faq-item" style="margin-bottom: 20px;">
            <h4 style="font-size: 18px; color: var(--cream); margin-bottom: 6px;">${formatInline(question)}</h4>
            <p style="color: var(--cream-dim); line-height: 1.7;">${formatInline(answer)}</p>
          </div>
        `);
        continue;
      }
    }

    // Default paragraph
    out.push(`<p>${formatInline(line)}</p>`);
  }

  if (listType) out.push(listType === 'ol' ? '</ol>' : '</ul>');

  return { html: out.join('\n'), faqs };
}

function renderTable(rows) {
  if (rows.length < 2) return '';
  const headerCols = rows[0].split('|').map(c => c.trim()).filter(Boolean);
  const bodyRows = rows.slice(2);

  let html = '<div class="table-wrap"><table class="article-table"><thead><tr>';
  for (const h of headerCols) {
    html += `<th>${formatInline(h)}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (const row of bodyRows) {
    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
    if (!cols.length) continue;
    html += '<tr>';
    for (const c of cols) {
      html += `<td>${formatInline(c)}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  return html;
}

function formatInline(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Internal bracket links
  text = resolveInternalLinks(text);
  return text;
}

function buildHtmlPage(meta, contentHtml, faqs) {
  const canonicalUrl = `${DOMAIN}${meta.slug}`;
  const title = meta.meta_title || `${meta.target_keyword} | Cardy`;
  const description = meta.meta_description || 'Explore destiny cards, cardology, and personal archetypes with Cardy.';
  const pillar = meta.pillar || 'Cardology Library';

  // Build JSON-LD BreadcrumbList
  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': DOMAIN
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': pillarLabel(pillar),
        'item': `${DOMAIN}#library`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': title.split('|')[0].trim(),
        'item': canonicalUrl
      }
    ]
  };

  // Build JSON-LD FAQPage if faqs exist
  let faqSchemaHtml = '';
  if (faqs && faqs.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(f => ({
        '@type': 'Question',
        'name': toPlainText(f.question),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': toPlainText(f.answer)
        }
      }))
    };
    faqSchemaHtml = `<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>`;
  }

  // Build JSON-LD Article — gives AI systems author/publisher attribution + freshness dates.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title.split('|')[0].trim(),
    'description': description,
    'inLanguage': 'en',
    'image': `${DOMAIN}/icon@3x.png`,
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonicalUrl },
    'datePublished': meta.date_published || DEFAULT_PUBLISHED,
    'dateModified': meta.date_modified || BUILD_DATE,
    'author': { '@type': 'Organization', 'name': 'Cardy', 'url': DOMAIN },
    'publisher': {
      '@type': 'Organization',
      'name': 'Cardy',
      'url': DOMAIN,
      'logo': { '@type': 'ImageObject', 'url': `${DOMAIN}/icon@3x.png` }
    }
  };
  const articleSchemaHtml = `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n</script>`;

  // Check if interactive widget script is needed
  const cleanSlugForWidget = (meta.slug || '').replace(/^\/+/, '');
  const hasInteractiveWidget = ['destiny-cards-calculator', 'find-my-birth-card', 'destiny-cards-relationship-chart'].includes(cleanSlugForWidget);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${DOMAIN}/icon@3x.png" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />

  <link rel="icon" type="image/png" href="/icon@3x.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Shared & Page Styles -->
  <link rel="stylesheet" href="/css/article.css" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --red: #B42B19;
      --red-light: #D4382A;
      --cream: #FFF4F4;
      --cream-dim: #FFF4F4CC;
      --dark: #0B0E1A;
      --dark-surface: #131729;
      --dark-card: #1A1F35;
      --navy: #1E2340;
      --font-display: 'Abril Fatface', serif;
      --font-body: 'Manrope', sans-serif;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      background: var(--dark);
      color: var(--cream);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .gradient-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      background: linear-gradient(135deg, #0B0E17 0%, #0F121D 25%, #131723 50%, #181B28 75%, #1C1F2E 100%);
    }
    .linen-texture {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .gradient-orb--1 {
      width: 600px; height: 600px; top: -5%; left: -5%;
      background: radial-gradient(circle, rgba(140, 35, 25, 0.4) 0%, transparent 70%);
      filter: blur(80px); opacity: 0.4;
    }
    .gradient-orb--2 {
      width: 550px; height: 550px; top: 20%; right: -5%;
      background: radial-gradient(circle, rgba(60, 30, 70, 0.4) 0%, transparent 70%);
      filter: blur(90px); opacity: 0.35;
    }
    /* Nav */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 16px 32px; display: flex; align-items: center; justify-content: space-between;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      background: rgba(11, 14, 26, 0.75);
      border-bottom: 1px solid rgba(255, 244, 244, 0.06);
    }
    .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .nav-logo img { width: 38px; height: 38px; border-radius: 9px; }
    .nav-logo span { font-family: var(--font-display); font-size: 22px; color: var(--cream); }
    .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
    .nav-links a { color: var(--cream-dim); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover { color: var(--cream); }
    .nav-cta {
      background: var(--red); color: var(--cream) !important; padding: 9px 20px;
      border-radius: 999px; font-weight: 600 !important; font-size: 14px;
      transition: background 0.2s, transform 0.15s !important;
    }
    .nav-cta:hover { background: var(--red-light); transform: scale(1.02); }
    footer {
      position: relative; z-index: 1; padding: 48px 32px;
      border-top: 1px solid rgba(255, 244, 244, 0.06);
      background: rgba(11, 14, 26, 0.9);
    }
    .footer-inner {
      max-width: 1000px; margin: 0 auto; display: flex;
      justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;
    }
    .footer-left { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--cream-dim); }
    .footer-left img { width: 28px; height: 28px; border-radius: 6px; }
    .footer-links { display: flex; gap: 24px; list-style: none; font-size: 14px; }
    .footer-links a { color: var(--cream-dim); text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: var(--cream); }
    @media (max-width: 768px) {
      nav { padding: 14px 20px; }
      .nav-links { display: none; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
    }
  </style>

  <!-- Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(breadcrumbsSchema, null, 2)}
  </script>
  ${articleSchemaHtml}
  ${faqSchemaHtml}
</head>
<body>
  <!-- Ambient background -->
  <div class="gradient-bg">
    <div class="linen-texture" id="linenTexture"></div>
    <div class="gradient-orb gradient-orb--1"></div>
    <div class="gradient-orb gradient-orb--2"></div>
  </div>

  <!-- Navigation -->
  <nav>
    <a href="/" class="nav-logo">
      <img src="/icon@3x.png" alt="Cardy Logo" />
      <span>Cardy</span>
    </a>
    <ul class="nav-links">
      <li><a href="/destiny-cards-calculator">Calculator</a></li>
      <li><a href="/what-is-cardology">Learn</a></li>
      <li><a href="/cardology-compatibility">Compatibility</a></li>
      <li class="nav-cta-group">
        <a href="${APP_STORE_URL}" class="nav-cta nav-cta--apple" id="navPrimaryCta" target="_blank" rel="noopener">Get App</a>
        <a href="${WEB_APP_URL}" class="nav-cta nav-cta--web" target="_blank" rel="noopener">Web App</a>
      </li>
    </ul>
  </nav>

  <!-- Article -->
  <main class="article-page">
    <article class="article-shell">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs">
        <a href="/">Home</a>
        <span class="sep">/</span>
        <a href="/#library">${pillarLabel(pillar)}</a>
        <span class="sep">/</span>
        <span class="current">${title.split('|')[0].trim()}</span>
      </div>

      <!-- Header -->
      <header class="article-header">
        <span class="pillar-badge">${pillarLabel(pillar)}</span>
        <h1>${title.split('|')[0].trim()}</h1>
      </header>

      <!-- Main Body -->
      <div class="article-content">
        ${contentHtml}
      </div>
    </article>
  </main>

  <!-- Footer -->
  <footer>
    <div class="footer-inner">
      <div class="footer-left">
        <img src="/icon@3x.png" alt="Cardy" />
        <span>&copy; <span id="copyrightYear">2026</span> Cardy. Play your cards right.</span>
      </div>
      <ul class="footer-links">
        <li><a href="/destiny-cards-calculator">Calculator</a></li>
        <li><a href="/find-my-birth-card">Birth Card Finder</a></li>
        <li><a href="/cardology-compatibility">Compatibility</a></li>
        <li><a href="/#support">Support</a></li>
        <li><a href="/#privacy">Privacy</a></li>
        <li><a href="/#terms">Terms</a></li>
      </ul>
    </div>
  </footer>

  <!-- Linen Canvas Texture Generator -->
  <script>
    document.getElementById('copyrightYear').textContent = new Date().getFullYear();
    (function generateLinenWeave() {
      const spacing = 3, segLen = 3, lineW = 0.5, tileSize = 120, maxJitter = 0.4;
      const dpr = window.devicePixelRatio || 1;
      let seed = 42;
      function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
      function jitter() { return (rand() * 2 - 1) * maxJitter; }

      const canvas = document.createElement('canvas');
      canvas.width = tileSize * dpr; canvas.height = tileSize * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr); ctx.lineWidth = lineW; ctx.lineCap = 'round';
      const threadCount = Math.floor(tileSize / spacing) + 1;

      for (let i = 0; i < threadCount; i++) {
        const baseY = i * spacing;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.028)' : 'rgba(0,0,0,0.021)';
        let x = 0;
        while (x < tileSize) {
          ctx.beginPath();
          ctx.moveTo(x + jitter(), baseY + jitter());
          ctx.lineTo(x + segLen + jitter(), baseY + jitter());
          ctx.stroke();
          x += segLen;
        }
      }
      for (let i = 0; i < threadCount; i++) {
        const baseX = i * spacing;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.018)';
        let y = 0;
        while (y < tileSize) {
          ctx.beginPath();
          ctx.moveTo(baseX + jitter(), y + jitter());
          ctx.lineTo(baseX + jitter(), y + segLen + jitter());
          ctx.stroke();
          y += segLen;
        }
      }
      const el = document.getElementById('linenTexture');
      if (el) {
        el.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
        el.style.backgroundSize = tileSize + 'px ' + tileSize + 'px';
      }
    })();

    // OS adaptive CTA focus
    (function detectOS() {
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        const primary = document.getElementById('navPrimaryCta');
        if (primary) {
          primary.href = '${WEB_APP_URL}';
          primary.textContent = 'Web App';
        }
      }
    })();
  </script>

  ${hasInteractiveWidget ? '<script src="/js/card-calculator.js"></script>' : ''}

  <!-- Vercel Web Analytics -->
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>
</body>
</html>`;
}

// Generate sitemap.xml
function generateSitemap(pages) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const page of pages) {
    const isTool = page.meta.pillar && page.meta.pillar.includes('Tools');
    const priority = isTool ? '0.9' : '0.8';
    xml += `
  <url>
    <loc>${DOMAIN}${page.meta.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  xml += '\n</urlset>\n';
  return xml;
}

// Generate robots.txt
function generateRobotsTxt() {
  // AI/LLM crawlers explicitly allowed so these platforms can read and cite Cardy.
  const aiBots = [
    'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
    'ClaudeBot', 'Claude-User', 'anthropic-ai',
    'PerplexityBot', 'Perplexity-User',
    'Google-Extended', 'Applebot', 'Applebot-Extended',
    'Bingbot', 'cohere-ai', 'Bytespider', 'Meta-ExternalAgent'
  ];
  const aiBlock = aiBots.map(b => `User-agent: ${b}\nAllow: /`).join('\n');
  return `# Cardy — ${DOMAIN}
# All crawlers, including AI/LLM bots, are welcome to read and cite our content.

User-agent: *
Allow: /

# AI / LLM crawlers (explicitly allowed so these platforms can cite Cardy)
${aiBlock}

Sitemap: ${DOMAIN}/sitemap.xml
`;
}

// Main Build Function
async function build() {
  console.log('🔮 Building Cardy SEO Pages...');

  if (!fs.existsSync(pagesDir)) {
    console.error(`Error: Pages directory not found at ${pagesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown page(s) in seo-content/pages/`);

  const processedPages = [];

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { meta, body } = parseFrontmatter(content);

    if (!meta.slug) {
      console.warn(`Skipping ${file}: missing slug frontmatter.`);
      continue;
    }

    const { html: bodyHtml, faqs } = markdownToHtml(body);
    const fullHtml = buildHtmlPage(meta, bodyHtml, faqs);

    // Write to <slug>/index.html
    const cleanSlug = meta.slug.replace(/^\/+/, '');
    const outDir = path.join(rootDir, cleanSlug);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPath = path.join(outDir, 'index.html');
    fs.writeFileSync(outPath, fullHtml, 'utf-8');
    console.log(`  ✓ Generated: /${cleanSlug} -> ${path.relative(rootDir, outPath)}`);

    processedPages.push({ file, meta });
  }

  // Generate sitemap.xml
  const sitemapXml = generateSitemap(processedPages);
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`  ✓ Generated sitemap.xml with ${processedPages.length + 1} URLs`);

  // Generate robots.txt
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(rootDir, 'robots.txt'), robotsTxt, 'utf-8');
  console.log('  ✓ Generated robots.txt');

  exportSite(processedPages);

  console.log('✨ Build complete!');
}

// Vercel serves the `public/` output directory once package.json has a build script,
// so copy the finished site there. Allowlisted so build tooling and drafts never ship.
const STATIC_ENTRIES = [
  'index.html', 'cardy-hero.png', 'icon@3x.png',
  'robots.txt', 'sitemap.xml', 'llms.txt', 'css', 'js', 'assets'
];

function exportSite(pages) {
  const publicDir = path.join(rootDir, 'public');
  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.mkdirSync(publicDir);

  const pageDirs = pages.map(p => p.meta.slug.replace(/^\/+/, ''));
  for (const entry of [...STATIC_ENTRIES, ...pageDirs]) {
    const src = path.join(rootDir, entry);
    if (!fs.existsSync(src)) {
      console.warn(`  ! Missing ${entry}, not exported`);
      continue;
    }
    fs.cpSync(src, path.join(publicDir, entry), { recursive: true });
  }
  console.log(`  ✓ Exported site to public/ (${STATIC_ENTRIES.length + pageDirs.length} entries)`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
