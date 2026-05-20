const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

// evaluate without document methods
const cleanCode = code
  .replace(/document\.[a-zA-Z0-querySelectorAll]+\(.*?\)/g, '{}')
  .replace(/window\.scrollTo\(.*?\)/g, '')
  .replace(/app\.init\(\)/g, '');

try {
  eval(cleanCode);
  app.currentLang = 'en';
  console.log('EN:', app.getKioskText('chal_step0', app.getKioskText('eatin'), app.getKioskText('add_kimbap'), app.getKioskText('credit_card')));
  app.currentLang = 'ko';
  console.log('KO:', app.getKioskText('chal_step0', app.getKioskText('eatin'), app.getKioskText('add_kimbap'), app.getKioskText('credit_card')));
} catch (e) {
  console.error(e);
}
