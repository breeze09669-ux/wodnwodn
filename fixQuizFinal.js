const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

const targetQuiz = /renderScriptQuiz\(\) \{[\s\S]*?checkScriptQuizAnswer\(idx, correctIdx, btnEl\) \{[\s\S]*?\}\s*\},/g;

const match = appjs.match(targetQuiz);
if (match) {
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

    const q = state.questions[state.currentIndex];
    
    // We expect q.en (question string), and q.options array of strings. We need their pronunciations if available.
    // However, q.options is just an array of ko strings.
    // Let's find their pronunciations from this.scripts
    const getPro = (koTxt) => {
      for (const g of this.scripts) {
        for (const s of g.scripts) {
          if (s.ko === koTxt) return s.pronunciation || '';
        }
      }
      return '';
    };

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
            <div class="question-en">"\${q.en}"</div>
          </div>
        </div>

        <div class="quiz-options">
          \${q.options.map((opt, idx) => \`
            <div class="quiz-option-btn" id="quiz-opt-\${idx}" onclick="app.checkScriptQuizAnswer(\${idx}, \${q.correctIndex}, this)">
              <div class="quiz-option-ko">\${opt}</div>
              <div class="quiz-option-pronun">\${getPro(opt)}</div>
            </div>
          \`).join('')}
        </div>
        
        <div id="quiz-feedback" style="text-align:center; margin-top:1.5rem; min-height:80px;"></div>
      </div>
    \`;
  },

  checkScriptQuizAnswer(idx, correctIdx, btnEl) {
    if (this.scriptQuizState.isAnswered) return;
    this.scriptQuizState.isAnswered = true;

    const isCorrect = (idx === correctIdx);
    if (isCorrect) this.scriptQuizState.score++;

    const opts = document.querySelectorAll('.quiz-option-btn');
    opts.forEach((btn, i) => {
      if (i === correctIdx) {
        btn.style.backgroundColor = '#d4edda';
        btn.style.borderColor = '#28a745';
      } else if (i === idx && !isCorrect) {
        btn.style.backgroundColor = '#f8d7da';
        btn.style.borderColor = '#dc3545';
      }
      btn.style.pointerEvents = 'none';
    });

    const feedback = document.getElementById('quiz-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div style="color:#28a745; font-weight:bold; font-size:1.5rem;">Correct! 🎵</div>';
    } else {
      feedback.innerHTML = '<div style="color:#dc3545; font-weight:bold; font-size:1.5rem;">Oops! 😢</div>';
    }

    setTimeout(() => {
      this.scriptQuizState.currentIndex++;
      this.scriptQuizState.isAnswered = false;
      this.renderScriptQuiz();
    }, 1500);
  },`;

  appjs = appjs.replace(match[0], replacementQuiz);
  fs.writeFileSync('app.js', appjs);
  console.log('Fixed app.js quiz correctly!');
} else {
  console.log('Could not match targetQuiz in app.js');
}
