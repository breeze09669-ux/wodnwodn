const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

const newMethods = `
  kioskScenarios: [
    { id: 1, dining: 'eatin', diningName: '매장 식사', menu: 'add_kimbap', menuName: '야채김밥', payment: 'credit_card', paymentName: '신용카드', price: 3500 },
    { id: 2, dining: 'takeout', diningName: '포장 주문', menu: 'add_tteokbokki', menuName: '떡볶이', payment: 'cash', paymentName: '현금', price: 4500 },
    { id: 3, dining: 'eatin', diningName: '매장 식사', menu: 'add_tteokbokki', menuName: '떡볶이', payment: 'credit_card', paymentName: '신용카드', price: 4500 },
    { id: 4, dining: 'takeout', diningName: '포장 주문', menu: 'add_kimbap', menuName: '야채김밥', payment: 'cash', paymentName: '현금', price: 3500 }
  ],

  startKioskInteractive(mode) {
    this.kioskState.mode = mode;
    this.kioskState.step = 0;
    this.kioskState.cartTotal = 0;
    const randomIndex = Math.floor(Math.random() * this.kioskScenarios.length);
    this.kioskState.scenario = this.kioskScenarios[randomIndex];
    this.renderKioskInteractive();
  },

  renderKioskInteractive() {
    const container = document.getElementById('kiosk-content');
    const char = this.kioskState.character;
    const mode = this.kioskState.mode;
    const step = this.kioskState.step;
    const sc = this.kioskState.scenario;

    if (step >= 4) {
      // Mission Clear
      container.innerHTML = \`
        <div class="section-container" style="text-align:center; padding-top:3rem;">
          <h1 style="color:var(--primary); font-size:2.5rem; margin-bottom:1rem;">🎉 결제 완료! 🎉</h1>
          <img src="\${char.img2}" style="width:200px; height:200px; object-fit:contain; animation: fadeIn 0.5s;" alt="\${char.name}">
          <h2 style="margin:1rem 0;">주문번호: 104번</h2>
          <p style="color:var(--text-secondary); margin-bottom:2rem;">영수증을 챙겨가세요. 참 잘하셨습니다!</p>
          <button class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.1rem;" onclick="app.goHome()">홈으로 돌아가기</button>
        </div>
      \`;
      return;
    }

    const stepsData = [
      {
        action: sc.dining,
        text: mode === 'learn' 
          ? \`안녕하세요! 주문을 시작해볼까요? 화면에서 <strong style='color:var(--primary)'>'\${sc.diningName}'</strong> 버튼을 눌러주세요.\` 
          : \`미션: <strong>\${sc.diningName}</strong>으로 <strong>\${sc.menuName}</strong>를 <strong>\${sc.paymentName}</strong>로 결제하세요.\`,
        highlightId: sc.dining === 'eatin' ? 'kiosk-btn-eatin' : 'kiosk-btn-takeout'
      },
      {
        action: sc.menu,
        text: mode === 'learn'
          ? \`메뉴판이 나왔어요. 메뉴 중 <strong style='color:var(--primary)'>'\${sc.menuName}'</strong>를 찾아보고 눌러보세요.\`
          : \`미션: <strong>\${sc.menuName}</strong>를 찾아 장바구니에 담으세요.\`,
        highlightId: sc.menu === 'add_kimbap' ? 'kiosk-item-kimbap' : 'kiosk-item-tteokbokki'
      },
      {
        action: 'pay_button',
        text: mode === 'learn'
          ? \`장바구니에 \${sc.menuName}이(가) 담겼습니다! 아래쪽의 <strong style='color:var(--primary)'>'결제하기'</strong> 버튼을 누르세요.\`
          : \`미션: 장바구니를 확인하고 <strong>결제하기</strong>를 누르세요.\`,
        highlightId: 'kiosk-btn-pay'
      },
      {
        action: sc.payment,
        text: mode === 'learn'
          ? \`마지막이에요. <strong style='color:var(--primary)'>'\${sc.paymentName}'</strong>를 선택하여 결제를 완료하세요.\`
          : \`미션: <strong>\${sc.paymentName}</strong>로 결제를 진행하세요.\`,
        highlightId: sc.payment === 'credit_card' ? 'kiosk-btn-card' : 'kiosk-btn-cash'
      }
    ];

    const currentStep = stepsData[step];
    let kioskInnerHtml = '';

    if (step === 0) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-home">
          <div class="kiosk-header">가상 식당 키오스크</div>
          <div class="kiosk-half-btn" id="kiosk-btn-eatin" onclick="app.handleKioskAction('eatin', '\${currentStep.action}')">
            🍽️ 매장 식사<br><span style="font-size:1rem; font-weight:normal;">Eat-in</span>
          </div>
          <div class="kiosk-half-btn" id="kiosk-btn-takeout" onclick="app.handleKioskAction('takeout', '\${currentStep.action}')">
            🛍️ 포장하기<br><span style="font-size:1rem; font-weight:normal;">Take-out</span>
          </div>
        </div>
      \`;
    } else if (step === 1) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-menu">
          <div class="kiosk-header">메뉴 선택</div>
          <div class="kiosk-category-tabs">
            <div class="kiosk-tab">추천/세트</div>
            <div class="kiosk-tab active">분식류</div>
            <div class="kiosk-tab">사이드</div>
          </div>
          <div class="kiosk-menu-grid">
            <div class="kiosk-menu-item" id="kiosk-item-kimbap" onclick="app.handleKioskAction('add_kimbap', '\${currentStep.action}')">
              <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=150&q=80">
              <div style="font-weight:bold;">야채김밥</div>
              <div style="color:var(--primary);">3,500원</div>
            </div>
            <div class="kiosk-menu-item" id="kiosk-item-tteokbokki" onclick="app.handleKioskAction('add_tteokbokki', '\${currentStep.action}')">
              <img src="https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=150&q=80">
              <div style="font-weight:bold;">떡볶이</div>
              <div style="color:var(--primary);">4,500원</div>
            </div>
          </div>
          <div class="kiosk-cart">
            <div style="font-size:0.9rem; margin-bottom:0.5rem;">장바구니 0개</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold;">
              총 결제금액: <span style="color:var(--primary);">0원</span>
            </div>
            <button class="kiosk-btn-pay" style="opacity:0.5;">결제하기 (0)</button>
          </div>
        </div>
      \`;
    } else if (step === 2) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-menu">
          <div class="kiosk-header">메뉴 선택</div>
          <div class="kiosk-menu-grid">
            <div class="kiosk-menu-item">
              <img src="\${sc.menu === 'add_kimbap' ? 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=150&q=80'}">
              <div style="font-weight:bold;">\${sc.menuName}</div>
              <div style="color:var(--primary);">\${sc.price.toLocaleString()}원</div>
            </div>
          </div>
          <div class="kiosk-cart">
            <div style="font-size:0.9rem; margin-bottom:0.5rem;">장바구니 1개</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold;">
              \${sc.menuName} x 1
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; margin-top:0.5rem; border-top:1px solid #ddd; padding-top:0.5rem;">
              총 결제금액: <span style="color:var(--primary);">\${sc.price.toLocaleString()}원</span>
            </div>
            <button class="kiosk-btn-pay" id="kiosk-btn-pay" onclick="app.handleKioskAction('pay_button', '\${currentStep.action}')">결제하기 (1)</button>
          </div>
        </div>
      \`;
    } else if (step === 3) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-home">
          <div class="kiosk-header">결제 수단 선택</div>
          <div style="text-align:center; padding:1rem; font-weight:bold; font-size:1.2rem; color:var(--primary);">
            총 결제금액: \${sc.price.toLocaleString()}원
          </div>
          <div class="kiosk-half-btn" id="kiosk-btn-card" onclick="app.handleKioskAction('credit_card', '\${currentStep.action}')">💳 신용카드</div>
          <div class="kiosk-half-btn" id="kiosk-btn-cash" onclick="app.handleKioskAction('cash', '\${currentStep.action}')">💵 현금</div>
        </div>
      \`;
    }

    container.innerHTML = \`
      <div class="section-container">
        <button class="btn btn-outline" style="margin-bottom:1rem;" onclick="app.goHome()">⬅️ 그만하기</button>
        <div class="dialogue-bubble" style="width:100%; max-width:400px; display:flex; gap:1rem; align-items:center;">
          <img id="kiosk-char-img" src="\${char.img1}" style="width:50px; height:50px; object-fit:contain;" alt="\${char.name}">
          <div id="kiosk-feedback">\${currentStep.text}</div>
        </div>
        <div class="kiosk-container">\${kioskInnerHtml}</div>
      </div>
    \`;

    if (mode === 'learn' && currentStep.highlightId) {
      setTimeout(() => {
        const el = document.getElementById(currentStep.highlightId);
        if (el) el.classList.add('highlight-target');
      }, 50);
    }
  },

  handleKioskAction(userAction, correctAction) {
    const feedback = document.getElementById('kiosk-feedback');
    const img = document.getElementById('kiosk-char-img');
    const char = this.kioskState.character;

    if (userAction === correctAction) {
      img.src = char.img2;
      feedback.style.color = '#03c75a';
      feedback.innerHTML = "참 잘했어요! 딩동댕~ 🎵";
      
      const buttons = document.querySelectorAll('.kiosk-half-btn, .kiosk-menu-item, .kiosk-btn-pay');
      buttons.forEach(b => b.style.pointerEvents = 'none');

      setTimeout(() => {
        this.kioskState.step++;
        this.renderKioskInteractive();
      }, 1500);
    } else {
      img.src = char.img1;
      feedback.style.color = '#ff4757';
      feedback.innerHTML = "앗, 거기가 아니에요. 다시 한번 잘 찾아볼까요?";
      
      const el = document.getElementById(userAction === 'eatin' ? 'kiosk-btn-eatin' : (userAction === 'takeout' ? 'kiosk-btn-takeout' : (userAction === 'add_kimbap' ? 'kiosk-item-kimbap' : (userAction === 'add_tteokbokki' ? 'kiosk-item-tteokbokki' : (userAction === 'cash' ? 'kiosk-btn-cash' : 'kiosk-btn-card')))));
      if (el) {
        el.style.animation = 'shake 0.4s';
        setTimeout(() => el.style.animation = '', 400);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
`;

const startIndex = code.indexOf('startKioskInteractive(mode) {');
if (startIndex !== -1) {
  code = code.substring(0, startIndex) + newMethods;
  fs.writeFileSync('app.js', code);
  console.log('Successfully updated app.js');
} else {
  console.error('Could not find startKioskInteractive function');
}
