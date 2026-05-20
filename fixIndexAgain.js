const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `        </select>
      </div>
    </div>`;

const replacement = `        </select>
      </div>
    </div>
  </header>

  <main>
    <!-- Main View -->
    <div id="main-view" class="view active">
      
      <!-- Banner Section -->
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
            <div style="font-size: 0.85rem; font-weight: 600; opacity: 0.9;">Scripts</div>
          </div>
          
          <!-- Google Translate -->
          <a href="https://translate.google.com/" target="_blank" style="flex: 1; text-decoration: none; background: #6E9CFA; border-radius: 1.2rem; padding: 1.5rem 1rem; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 15px rgba(110, 156, 250, 0.3); text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌐</div>
            <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.2rem;">Translator</div>
            <div style="font-size: 0.85rem; font-weight: 600; opacity: 0.9;">Translate</div>
          </a>
        </div>
      </section>

      <!-- Top 3 Section -->
      <section class="section-container" style="padding-bottom: 0;">
        <h2 class="section-title">🔥 <span data-i18n="top3_title">This Week's Top 3</span></h2>`;

html = html.replace(target, replacement);
fs.writeFileSync('index.html', html);
console.log('Fixed index.html Banner Section!');
