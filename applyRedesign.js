const fs = require('fs');

// 1. Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');
const newCSS = `

/* New UI Styles */
.script-category-pills { display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; margin-bottom: 1rem; justify-content: center; }
.script-pill { padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; font-weight: bold; cursor: pointer; border: 1px solid #ddd; background: white; color: #555; }
.script-pill.active { background: #FF4757; color: white; border-color: #FF4757; }
.script-list-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-left: 3px solid #FF4757; background: white; border-radius: 8px; margin-bottom: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.script-ko-text { font-weight: bold; font-size: 1.05rem; margin-bottom: 0.3rem; color: #222; }
.script-pronun { font-style: italic; font-size: 0.85rem; color: #777; margin-bottom: 0.3rem; }
.script-en-text { font-size: 0.9rem; color: #555; }
.script-speaker { font-size: 1.2rem; cursor: pointer; color: #6E9CFA; }
.quiz-header-title { text-align: center; font-size: 1.3rem; font-weight: bold; margin-bottom: 1.5rem; }
.quiz-dialogue-box { border: 2px solid #FF4757; border-radius: 12px; padding: 1.5rem; position: relative; margin-bottom: 2rem; background: white; margin-left: 1rem; margin-right: 1rem; }
.quiz-dialogue-avatar { position: absolute; left: -20px; top: 50%; transform: translateY(-50%); background: #FF9A9E; width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; font-weight: bold; color: #333; font-size: 1.2rem; border-radius: 8px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); }
.quiz-dialogue-content { padding-left: 3rem; }
.quiz-dialogue-content .question-en { color: #FF4757; font-weight: bold; font-size: 1.1rem; margin-top: 0.3rem; }
.quiz-option-btn { width: 100%; background: white; border: 1px solid #eee; border-radius: 8px; padding: 1.2rem; margin-bottom: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: center; cursor: pointer; transition: all 0.2s; }
.quiz-option-btn:hover { border-color: #FF4757; }
.quiz-option-ko { font-weight: bold; font-size: 1.1rem; margin-bottom: 0.3rem; }
.quiz-option-pronun { font-style: italic; font-size: 0.85rem; color: #777; }
`;
if (!css.includes('.script-category-pills')) {
  fs.writeFileSync('styles.css', css + newCSS);
}


// 2. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const targetHtml = `      <div class="modal-header">
        <h2 class="section-title" data-i18n="modal_title" style="margin:0;">Situation-based Scripts</h2>
        <button class="close-btn" onclick="app.closeModal()">✕</button>
      </div>
      <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem;" data-i18n="modal_desc">Use these phrases to order and communicate easily.</p>
      <button class="btn btn-primary" style="margin-bottom: 1rem;" onclick="app.startScriptQuiz()">🎓 대화 스크립트 퀴즈 시작 (Start Quiz)</button>
      <div id="script-content">
        <!-- Scripts injected here -->
      </div>`;

const replaceHtml = `      <div class="modal-header" style="justify-content: space-between; border-bottom: none; padding-bottom: 0;">
        <h2 class="section-title" style="margin:0; font-size:1.3rem;">Scripts 🗣️</h2>
        <div style="display: flex; gap: 0.5rem;">
          <a href="https://translate.google.com/" target="_blank" style="text-decoration:none; border: 1px solid #6E9CFA; color: #6E9CFA; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">🌐 Translator</a>
          <button class="close-btn" onclick="app.closeModal()">✕</button>
        </div>
      </div>
      
      <div style="padding-top: 1rem;">
        <button style="width:100%; background:#00C87E; color:white; border:none; padding:0.8rem; border-radius:8px; font-weight:bold; font-size:1.1rem; margin-bottom:1rem; cursor:pointer;" onclick="app.startScriptQuiz()">🎯 Script Quiz!</button>
        
        <div class="script-category-pills" id="script-category-filters">
          <!-- Filters injected here -->
        </div>

        <div id="script-content">
          <!-- Scripts injected here -->
        </div>
      </div>`;

if (html.includes('Situation-based Scripts')) {
  html = html.replace(targetHtml, replaceHtml);
  fs.writeFileSync('index.html', html);
}

// 3. Update app.js
let appjs = fs.readFileSync('app.js', 'utf8');

// Replace openModal function
const targetAppjsModal = /openModal\(category\) \{[\s\S]*?scriptContent\.innerHTML = [\s\S]*?\}\)\.join\(''\);\s*\}/;

const replacementAppjsModal = `openModal(category) {
    const scriptContent = document.getElementById('script-content');
    const filtersContainer = document.getElementById('script-category-filters');
    
    const categories = ['Ordering', 'Dining In', 'Allergies'];
    if (!this.currentScriptCategory) this.currentScriptCategory = categories[0];
    
    // Render Filters
    if (filtersContainer) {
      filtersContainer.innerHTML = categories.map(cat => 
        \`<button class="script-pill \${this.currentScriptCategory === cat ? 'active' : ''}" onclick="app.changeScriptCategory('\${cat}')">\${cat}</button>\`
      ).join('');
    }
    
    // Helper function to map category string to group
    const catMap = { 'Ordering': 'When Ordering', 'Dining In': 'Dining In', 'Allergies': 'Allergies / Special Requests' };
    const targetGroupNameEn = catMap[this.currentScriptCategory];
    
    const filteredScripts = this.scripts.filter(group => group.situation['en'] === targetGroupNameEn);
    
    scriptContent.innerHTML = filteredScripts.map(group => {
      return group.scripts.map(s => {
        const translatedEn = s['en'] || s[this.currentLang] || '';
        return \`
        <div class="script-list-item">
          <div>
            <div class="script-ko-text">\${s.ko}</div>
            <div class="script-pronun">\${s.pronunciation || ''}</div>
            <div class="script-en-text">\${translatedEn}</div>
          </div>
          <div class="script-speaker" onclick="app.speak('\${s.ko}')">🔊</div>
        </div>
      \`}).join('');
    }).join('');
  },
  
  changeScriptCategory(cat) {
    this.currentScriptCategory = cat;
    this.openModal('All');
  },
  
  speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    window.speechSynthesis.speak(u);
  }`;

if (appjs.match(targetAppjsModal)) {
  appjs = appjs.replace(targetAppjsModal, replacementAppjsModal);
}

// Replace renderScriptQuiz function
const targetQuiz = /renderScriptQuiz\(\) \{[\s\S]*?\}\s*\n\s*\}\s*\n\s*handleQuizAnswer/;

const replacementQuiz = `renderScriptQuiz() {
    const container = document.getElementById('quiz-content');
    const state = this.scriptQuizState;

    if (state.currentIndex >= state.questions.length) {
      container.innerHTML = \`
        <div class="section-container" style="text-align:center; padding-top:2rem;">
          <h2 style="color:var(--primary); font-size:2rem; margin-bottom:1rem;">Quiz Complete! 🎉</h2>
          <div style="font-size:4rem; margin-bottom:1rem;">\${state.score >= 4 ? '🏆' : '👏'}</div>
          <p style="font-size:1.2rem; margin-bottom:2rem;">Your Score: <strong>\${state.score} / \${state.questions.length}</strong></p>
          <button class="btn btn-primary" style="width:100%; padding:1rem;" onclick="app.goHome()">Back to Home</button>
        </div>
      \`;
      return;
    }

    const currentQ = state.questions[state.currentIndex];

    container.innerHTML = \`
      <div class="section-container" style="padding-top:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <button class="btn btn-outline" style="border:none; padding:0; color:#555; font-size:1.5rem;" onclick="app.goHome()">⬅️</button>
          <div class="quiz-header-title" style="margin:0;">🗣️ Script Quiz</div>
          <div style="width:24px;"></div>
        </div>

        <div class="quiz-dialogue-box">
          <div class="quiz-dialogue-avatar">아리</div>
          <div class="quiz-dialogue-content">
            <div style="font-size:0.95rem; color:#555;">How do you say this in Korean?</div>
            <div class="question-en">"\${currentQ.questionEn}"</div>
          </div>
        </div>

        <div class="quiz-options">
          \${currentQ.options.map((opt, idx) => \`
            <div class="quiz-option-btn" id="quiz-opt-\${idx}" onclick="app.handleQuizAnswer(\${idx})">
              <div class="quiz-option-ko">\${opt.ko}</div>
              <div class="quiz-option-pronun">\${opt.pronunciation || ''}</div>
            </div>
          \`).join('')}
        </div>
      </div>
    \`;
  }

  handleQuizAnswer`;

if (appjs.match(targetQuiz)) {
  appjs = appjs.replace(targetQuiz, replacementQuiz);
}

fs.writeFileSync('app.js', appjs);
console.log('Successfully updated styles.css, index.html, and app.js');
