const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

js = js.replace(/characters:\s*\[[\s\S]*?\]/, `characters: [
    { id: 'shini', name: '신이', img1: 'images/char1.png', img2: 'images/char1.png' },
    { id: 'ari', name: '아리', img1: 'images/char2.png', img2: 'images/char2.png' },
    { id: 'ashi', name: '아시', img1: 'images/char3.png', img2: 'images/char3.png' },
    { id: 'hyuk', name: '혁이', img1: 'images/char4.png', img2: 'images/char4.png' }
  ],

  scriptQuizState: {
    category: 'All',
    questions: [],
    currentIndex: 0,
    score: 0,
    isAnswered: false
  }`);

fs.writeFileSync('app.js', js);
console.log('app.js fixed');
