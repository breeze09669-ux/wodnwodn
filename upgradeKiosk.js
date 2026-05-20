const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

// Remove the hardcoded kioskScenarios array
code = code.replace(/kioskScenarios:\s*\[[\s\S]*?\],\n/, '');

// Replace the random selection logic with fully dynamic generation
const dynamicLogic = `
    const dinings = ['eatin', 'takeout'];
    const menus = ['add_kimbap', 'add_tteokbokki'];
    const payments = ['credit_card', 'cash'];
    const d = dinings[Math.floor(Math.random() * dinings.length)];
    const m = menus[Math.floor(Math.random() * menus.length)];
    const p = payments[Math.floor(Math.random() * payments.length)];
    this.kioskState.scenario = {
      dining: d,
      menu: m,
      payment: p,
      price: m === 'add_kimbap' ? 3500 : 4500
    };
`;

code = code.replace(/const randomIndex = Math\.floor\(Math\.random\(\) \* this\.kioskScenarios\.length\);\s*this\.kioskState\.scenario = this\.kioskScenarios\[randomIndex\];/, dynamicLogic);

fs.writeFileSync('app.js', code);
console.log('Successfully upgraded random generation');
