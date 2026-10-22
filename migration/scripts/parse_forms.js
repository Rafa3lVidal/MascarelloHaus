const fs = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, '..', 'snapshot', 'html');

function extractFormDetails(html, formId) {
  const formRegex = new RegExp(`<form[^>]*id=["']${formId}["'][\\s\\S]*?<\\/form>`, 'i');
  const match = html.match(formRegex);
  if (!match) return null;
  const formHtml = match[0];

  // Extrair campos: labels, inputs, selects, textareas
  const fields = [];
  const fieldBlockRegex = /<div[^>]*class=["'][^"']*wpforms-field[^"']*["'][^>]*>([\s\S]*?)<\/div>(?=\s*<div[^>]*class=["'][^"']*wpforms-field|(?=\s*<\/div>\s*<div[^>]*class=["']wpforms-submit-container)|$)/gi;
  
  // Pegar todos os inputs/selects/textareas
  const inputMatches = formHtml.match(/<(input|textarea|select)[^>]+>/gi) || [];
  const labels = (formHtml.match(/<label[^>]*>[\s\S]*?<\/label>/gi) || []).map(l => l.replace(/<[^>]+>/g, '').trim());

  // Extrair botões submit
  const submitMatch = formHtml.match(/<button[^>]*class=["'][^"']*wpforms-submit[^"']*["'][^>]*>([\s\S]*?)<\/button>/i);
  const submitText = submitMatch ? submitMatch[1].replace(/<[^>]+>/g, '').trim() : 'Enviar';

  return {
    formId,
    submitText,
    rawLength: formHtml.length,
    labels: labels.filter(l => l.length > 0),
    inputs: inputMatches.map(tag => {
      const name = (tag.match(/name=["']([^"']+)["']/i) || [])[1];
      const type = (tag.match(/type=["']([^"']+)["']/i) || [])[1] || 'textarea/select';
      const required = tag.includes('wpforms-field-required') || tag.includes('required');
      const placeholder = (tag.match(/placeholder=["']([^"']+)["']/i) || [])[1];
      const value = (tag.match(/value=["']([^"']+)["']/i) || [])[1];
      return { tag: tag.substring(0, 10), name, type, required, placeholder, value };
    })
  };
}

// Analisar os 4 formulários
const contatoHtml = fs.readFileSync(path.join(HTML_DIR, 'page_contato.html'), 'utf-8');
const lgpdHtml = fs.readFileSync(path.join(HTML_DIR, 'page_central-de-protecao-de-dados.html'), 'utf-8');
const denunciasHtml = fs.readFileSync(path.join(HTML_DIR, 'page_canal-de-denuncias.html'), 'utf-8');
const quizHtml = fs.readFileSync(path.join(HTML_DIR, 'page_questionario-de-conformidade.html'), 'utf-8');

const result = {
  contato_1684: extractFormDetails(contatoHtml, 'wpforms-form-1684'),
  central_lgpd_1764: extractFormDetails(lgpdHtml, 'wpforms-form-1764'),
  canal_denuncias_2805: extractFormDetails(denunciasHtml, 'wpforms-form-2805'),
  quiz_conformidade_2854: extractFormDetails(quizHtml, 'wpforms-form-2854')
};

fs.writeFileSync(path.join(__dirname, '..', 'snapshot', 'forms_detailed.json'), JSON.stringify(result, null, 2), 'utf-8');
console.log('Formulários analisados e salvos em forms_detailed.json!');
