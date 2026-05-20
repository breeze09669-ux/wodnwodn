const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

const newMethods = `
  getKioskText(key, ...args) {
    const texts = {
      ko: {
        eatin: '매장 식사', takeout: '포장 주문',
        add_kimbap: '야채김밥', add_tteokbokki: '떡볶이',
        credit_card: '신용카드', cash: '현금',
        learn_step0: "안녕하세요! 주문을 시작해볼까요? 화면에서 <strong style='color:var(--primary)'>'{0}'</strong> 버튼을 눌러주세요.",
        chal_step0: "미션: <strong>{0}</strong>으로 <strong>{1}</strong>를 <strong>{2}</strong>로 결제하세요.",
        learn_step1: "메뉴판이 나왔어요. 메뉴 중 <strong style='color:var(--primary)'>'{0}'</strong>를 찾아보고 눌러보세요.",
        chal_step1: "미션: <strong>{0}</strong>를 찾아 장바구니에 담으세요.",
        learn_step2: "장바구니에 {0}이(가) 담겼습니다! 아래쪽의 <strong style='color:var(--primary)'>'결제하기'</strong> 버튼을 누르세요.",
        chal_step2: "미션: 장바구니를 확인하고 <strong>결제하기</strong>를 누르세요.",
        learn_step3: "마지막이에요. <strong style='color:var(--primary)'>'{0}'</strong>를 선택하여 결제를 완료하세요.",
        chal_step3: "미션: <strong>{0}</strong>로 결제를 진행하세요.",
        success: "🎉 결제 완료! 🎉",
        orderNum: "주문번호: 104번",
        receipt: "영수증을 챙겨가세요. 참 잘하셨습니다!",
        goHome: "홈으로 돌아가기",
        quit: "⬅️ 그만하기",
        kioskTitle: "가상 식당 키오스크",
        selectMenu: "메뉴 선택",
        selectPay: "결제 수단 선택",
        cartTotal: "총 결제금액",
        payBtn: "결제하기",
        cartCount: "장바구니 {0}개",
        goodJob: "참 잘했어요! 딩동댕~ 🎵",
        wrongLearn: "앗, 거기가 아니에요. 힌트 영역을 잘 보고 다시 눌러보세요!",
        wrongChal: "앗, 거기가 아니에요. 다시 한번 잘 찾아볼까요?"
      },
      en: {
        eatin: 'Eat-in', takeout: 'Take-out',
        add_kimbap: 'Vegetable Kimbap', add_tteokbokki: 'Tteokbokki',
        credit_card: 'Credit Card', cash: 'Cash',
        learn_step0: "Hello! Let's order. Click the <strong style='color:var(--primary)'>'{0}'</strong> button.",
        chal_step0: "Mission: Order <strong>{1}</strong> for <strong>{0}</strong> and pay with <strong>{2}</strong>.",
        learn_step1: "Here's the menu. Find and click <strong style='color:var(--primary)'>'{0}'</strong>.",
        chal_step1: "Mission: Find <strong>{0}</strong> and add it to cart.",
        learn_step2: "{0} is in your cart! Click the <strong style='color:var(--primary)'>'Pay'</strong> button.",
        chal_step2: "Mission: Check your cart and click <strong>Pay</strong>.",
        learn_step3: "Final step. Select <strong style='color:var(--primary)'>'{0}'</strong> to complete payment.",
        chal_step3: "Mission: Proceed payment with <strong>{0}</strong>.",
        success: "🎉 Payment Complete! 🎉",
        orderNum: "Order No: 104",
        receipt: "Please take your receipt. Great job!",
        goHome: "Go to Home",
        quit: "⬅️ Quit",
        kioskTitle: "Virtual Kiosk",
        selectMenu: "Select Menu",
        selectPay: "Select Payment",
        cartTotal: "Total Amount",
        payBtn: "Pay",
        cartCount: "Cart: {0}",
        goodJob: "Excellent! Correct~ 🎵",
        wrongLearn: "Oops, not there. Check the hint and try again!",
        wrongChal: "Oops, wrong button. Try finding it again!"
      }
    };
    const lang = this.currentLang === 'ko' ? 'ko' : 'en';
    let text = texts[lang][key] || texts['en'][key] || key;
    args.forEach((arg, i) => {
      text = text.replace(\`{\${i}}\`, arg);
    });
    return text;
  },

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
      container.innerHTML = \`
        <div class="section-container" style="text-align:center; padding-top:3rem;">
          <h1 style="color:var(--primary); font-size:2.5rem; margin-bottom:1rem;">\${this.getKioskText('success')}</h1>
          <img src="\${char.img2}" style="width:200px; height:200px; object-fit:contain; animation: fadeIn 0.5s;" alt="\${char.name}">
          <h2 style="margin:1rem 0;">\${this.getKioskText('orderNum')}</h2>
          <p style="color:var(--text-secondary); margin-bottom:2rem;">\${this.getKioskText('receipt')}</p>
          <button class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.1rem;" onclick="app.goHome()">\${this.getKioskText('goHome')}</button>
        </div>
      \`;
      return;
    }

    const tDining = this.getKioskText(sc.dining);
    const tMenu = this.getKioskText(sc.menu);
    const tPayment = this.getKioskText(sc.payment);

    const stepsData = [
      {
        action: sc.dining,
        text: mode === 'learn' 
          ? this.getKioskText('learn_step0', tDining)
          : this.getKioskText('chal_step0', tDining, tMenu, tPayment),
        highlightId: sc.dining === 'eatin' ? 'kiosk-btn-eatin' : 'kiosk-btn-takeout'
      },
      {
        action: sc.menu,
        text: mode === 'learn'
          ? this.getKioskText('learn_step1', tMenu)
          : this.getKioskText('chal_step1', tMenu),
        highlightId: sc.menu === 'add_kimbap' ? 'kiosk-item-kimbap' : 'kiosk-item-tteokbokki'
      },
      {
        action: 'pay_button',
        text: mode === 'learn'
          ? this.getKioskText('learn_step2', tMenu)
          : this.getKioskText('chal_step2'),
        highlightId: 'kiosk-btn-pay'
      },
      {
        action: sc.payment,
        text: mode === 'learn'
          ? this.getKioskText('learn_step3', tPayment)
          : this.getKioskText('chal_step3', tPayment),
        highlightId: sc.payment === 'credit_card' ? 'kiosk-btn-card' : 'kiosk-btn-cash'
      }
    ];

    const currentStep = stepsData[step];
    let kioskInnerHtml = '';

    if (step === 0) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-home">
          <div class="kiosk-header">\${this.getKioskText('kioskTitle')}</div>
          <div class="kiosk-half-btn" id="kiosk-btn-eatin" onclick="app.handleKioskAction('eatin', '\${currentStep.action}')">
            🍽️ \${this.getKioskText('eatin')}<br><span style="font-size:1rem; font-weight:normal;">Eat-in</span>
          </div>
          <div class="kiosk-half-btn" id="kiosk-btn-takeout" onclick="app.handleKioskAction('takeout', '\${currentStep.action}')">
            🛍️ \${this.getKioskText('takeout')}<br><span style="font-size:1rem; font-weight:normal;">Take-out</span>
          </div>
        </div>
      \`;
    } else if (step === 1) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-menu">
          <div class="kiosk-header">\${this.getKioskText('selectMenu')}</div>
          <div class="kiosk-category-tabs">
            <div class="kiosk-tab">추천/세트</div>
            <div class="kiosk-tab active">분식류</div>
            <div class="kiosk-tab">사이드</div>
          </div>
          <div class="kiosk-menu-grid">
            <div class="kiosk-menu-item" id="kiosk-item-kimbap" onclick="app.handleKioskAction('add_kimbap', '\${currentStep.action}')">
              <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=150&q=80">
              <div style="font-weight:bold;">\${this.getKioskText('add_kimbap')}</div>
              <div style="color:var(--primary);">3,500원</div>
            </div>
            <div class="kiosk-menu-item" id="kiosk-item-tteokbokki" onclick="app.handleKioskAction('add_tteokbokki', '\${currentStep.action}')">
              <img src="https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=150&q=80">
              <div style="font-weight:bold;">\${this.getKioskText('add_tteokbokki')}</div>
              <div style="color:var(--primary);">4,500원</div>
            </div>
          </div>
          <div class="kiosk-cart">
            <div style="font-size:0.9rem; margin-bottom:0.5rem;">\${this.getKioskText('cartCount', '0')}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold;">
              \${this.getKioskText('cartTotal')}: <span style="color:var(--primary);">0원</span>
            </div>
            <button class="kiosk-btn-pay" style="opacity:0.5;">\${this.getKioskText('payBtn')} (0)</button>
          </div>
        </div>
      \`;
    } else if (step === 2) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-menu">
          <div class="kiosk-header">\${this.getKioskText('selectMenu')}</div>
          <div class="kiosk-menu-grid">
            <div class="kiosk-menu-item">
              <img src="\${sc.menu === 'add_kimbap' ? 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=150&q=80'}">
              <div style="font-weight:bold;">\${tMenu}</div>
              <div style="color:var(--primary);">\${sc.price.toLocaleString()}원</div>
            </div>
          </div>
          <div class="kiosk-cart">
            <div style="font-size:0.9rem; margin-bottom:0.5rem;">\${this.getKioskText('cartCount', '1')}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold;">
              \${tMenu} x 1
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; margin-top:0.5rem; border-top:1px solid #ddd; padding-top:0.5rem;">
              \${this.getKioskText('cartTotal')}: <span style="color:var(--primary);">\${sc.price.toLocaleString()}원</span>
            </div>
            <button class="kiosk-btn-pay" id="kiosk-btn-pay" onclick="app.handleKioskAction('pay_button', '\${currentStep.action}')">\${this.getKioskText('payBtn')} (1)</button>
          </div>
        </div>
      \`;
    } else if (step === 3) {
      kioskInnerHtml = \`
        <div class="kiosk-screen-home">
          <div class="kiosk-header">\${this.getKioskText('selectPay')}</div>
          <div style="text-align:center; padding:1rem; font-weight:bold; font-size:1.2rem; color:var(--primary);">
            \${this.getKioskText('cartTotal')}: \${sc.price.toLocaleString()}원
          </div>
          <div class="kiosk-half-btn" id="kiosk-btn-card" onclick="app.handleKioskAction('credit_card', '\${currentStep.action}')">💳 \${this.getKioskText('credit_card')}</div>
          <div class="kiosk-half-btn" id="kiosk-btn-cash" onclick="app.handleKioskAction('cash', '\${currentStep.action}')">💵 \${this.getKioskText('cash')}</div>
        </div>
      \`;
    }

    container.innerHTML = \`
      <div class="section-container">
        <button class="btn btn-outline" style="margin-bottom:1rem;" onclick="app.goHome()">\${this.getKioskText('quit')}</button>
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
      feedback.innerHTML = this.getKioskText('goodJob');
      
      const buttons = document.querySelectorAll('.kiosk-half-btn, .kiosk-menu-item, .kiosk-btn-pay');
      buttons.forEach(b => b.style.pointerEvents = 'none');

      setTimeout(() => {
        this.kioskState.step++;
        this.renderKioskInteractive();
      }, 1500);
    } else {
      img.src = char.img1;
      feedback.style.color = '#ff4757';
      feedback.innerHTML = this.getKioskText(this.kioskState.mode === 'learn' ? 'wrongLearn' : 'wrongChal');
      
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
  console.log('Successfully added kiosk language support to app.js');
} else {
  console.error('Could not find startKioskInteractive function');
}
