const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, '..', 'snapshot', 'html');
const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

const scriptsFound = new Set();
const fontsFound = new Set();
const cookieKeywords = [];
const thirdPartyPatterns = [
  { name: 'Google Tag Manager', regex: /googletagmanager\.com/i },
  { name: 'Google Analytics (gtag/ga)', regex: /google-analytics\.com|googletagmanager\.com\/gtag/i },
  { name: 'Facebook Pixel', regex: /connect\.facebook\.net/i },
  { name: 'WhatsApp Widget', regex: /api\.whatsapp\.com|wa\.me|joinchat|wp-whatsapp/i },
  { name: 'reCAPTCHA', regex: /google\.com\/recaptcha|recaptcha/i },
  { name: 'Hotjar', regex: /hotjar\.com/i },
  { name: 'Clarity', regex: /clarity\.ms/i },
  { name: 'All in One SEO', regex: /aioseo/i },
  { name: 'Elementor Pro', regex: /elementor-pro/i },
  { name: 'WPForms', regex: /wpforms/i },
  { name: 'Complianz / Cookie Banner', regex: /complianz|cookie-law-info|moove_gdpr|cookiebot|axeptio|wp-consent-api/i }
];

const thirdPartyMatches = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(HTML_DIR, file), 'utf-8');

  // Checar third party
  thirdPartyPatterns.forEach(tp => {
    if (tp.regex.test(content)) {
      thirdPartyMatches[tp.name] = (thirdPartyMatches[tp.name] || 0) + 1;
    }
  });

  // Checar scripts externos
  const scriptSrcs = content.match(/<script[^>]+src=["']([^"']+)["']/gi) || [];
  scriptSrcs.forEach(s => {
    const src = (s.match(/src=["']([^"']+)["']/i) || [])[1];
    if (src) scriptsFound.add(src);
  });

  // Checar fontes Google Fonts
  const gfonts = content.match(/fonts\.googleapis\.com\/css2?[^"']+/gi) || [];
  gfonts.forEach(gf => fontsFound.add(gf));

  // Checar referências a banner de cookie
  if (/cookie/i.test(content)) {
    const cookieSnippets = content.match(/<div[^>]*class=["'][^"']*cookie[^"']*["'][^>]*>[\s\S]*?<\/div>/gi) || [];
    if (cookieSnippets.length > 0) {
      cookieKeywords.push({ file, snippet: cookieSnippets[0].substring(0, 300) });
    }
  }
});

const report = {
  thirdPartyMatches,
  externalScriptsSample: Array.from(scriptsFound).filter(s => !s.includes('mascarellohaus.adv.br')),
  googleFonts: Array.from(fontsFound),
  cookieBannersDetected: cookieKeywords
};

fs.writeFileSync(path.join(__dirname, '..', 'snapshot', 'third_party_and_fonts.json'), JSON.stringify(report, null, 2), 'utf-8');
console.log('Análise de scripts de terceiros e fontes concluída com sucesso!');
