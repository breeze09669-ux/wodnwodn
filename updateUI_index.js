const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const target = `      <!-- Banner Section -->
      <section class="section-container" style="padding-top: 1rem; padding-bottom: 0; display: flex; flex-direction: column; gap: 0.8rem;">
        
        <!-- Top Row: Kiosk & Translate -->
        <div style="display: flex; gap: 0.8rem;">
          <!-- Kiosk Master (2/3) -->
          <div style="flex: 2; background: linear-gradient(135deg, var(--primary), #ff9a9e); border-radius: var(--radius); padding: 1.2rem; color: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-shadow: var(--card-shadow);" onclick="app.goKioskTutorial()">
            <div>
              <h2 style="margin:0; font-size: 1.2rem;">📱 Kiosk Master</h2>
              <p style="margin: 0.3rem 0 0 0; font-size: 0.8rem; opacity: 0.9;">키오스크 연습!</p>
            </div>
            <div style="font-size: 2rem;">👆</div>
          </div>
          
          <!-- Google Translate (1/3) -->
          <a href="https://translate.google.com/" target="_blank" style="flex: 1; text-decoration: none; background: linear-gradient(135deg, #4285F4, #8ab4f8); border-radius: var(--radius); padding: 1.2rem; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; box-shadow: var(--card-shadow); text-align: center;">
            <div style="font-size: 1.8rem; margin-bottom: 0.3rem;">🌐</div>
            <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.2;">번역기<br><span style="font-size:0.75rem; opacity:0.9;">Translate</span></div>
          </a>
        </div>

        <!-- Bottom Row: Dialogue Script -->
        <div style="background: linear-gradient(135deg, #FFB75E, #ED8F03); border-radius: var(--radius); padding: 1.2rem; color: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-shadow: var(--card-shadow);" onclick="app.openModal('scriptModal')">
          <div>
            <h2 style="margin:0; font-size: 1.2rem;">🗣️ 대화 스크립트 (Dialogue Scripts)</h2>
            <p style="margin: 0.3rem 0 0 0; font-size: 0.8rem; opacity: 0.9;">식당/카페 필수 한국어 회화 모음</p>
          </div>
          <div style="font-size: 2rem;">💬</div>
        </div>

      </section>`;

const replacement = `      <!-- Banner Section -->
      <section class="section-container" style="padding-top: 1rem; padding-bottom: 0; display: flex; flex-direction: column; gap: 0.8rem;">
        
        <!-- Top Row: Kiosk Master -->
        <div style="background: #FF7B82; border-radius: 1.2rem; padding: 1.2rem 1.5rem; color: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 123, 130, 0.3);" onclick="app.goKioskTutorial()">
          <div>
            <h2 style="margin:0; font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem;">📱 Kiosk Master</h2>
            <p style="margin: 0.3rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">Practice like real!</p>
          </div>
          <div style="font-size: 2rem; animation: pulse 2s infinite;">👆</div>
        </div>
        
        <!-- Bottom Row: Scripts & Translate -->
        <div style="display: flex; gap: 0.8rem;">
          <!-- Scripts -->
          <div style="flex: 1; background: #00CA82; border-radius: 1.2rem; padding: 1.5rem 1rem; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 202, 130, 0.3); text-align: center;" onclick="app.openModal('scriptModal')">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🗣️</div>
            <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.2rem;">Scripts</div>
            <div style="font-size: 0.85rem; font-weight: 600;">Scripts</div>
          </div>
          
          <!-- Google Translate -->
          <a href="https://translate.google.com/" target="_blank" style="flex: 1; text-decoration: none; background: #6E9CFA; border-radius: 1.2rem; padding: 1.5rem 1rem; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 15px rgba(110, 156, 250, 0.3); text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌐</div>
            <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.2rem;">Translator</div>
            <div style="font-size: 0.85rem; font-weight: 600;">Translate</div>
          </a>
        </div>
      </section>`;

if (html.includes('<!-- Top Row: Kiosk & Translate -->')) {
  html = html.replace(target, replacement);
  fs.writeFileSync('index.html', html);
  console.log('Fixed index.html Banner Section!');
} else {
  console.log('Target not found in index.html');
}
