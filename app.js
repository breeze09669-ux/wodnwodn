const app = {
  data: [],
  scripts: [],
  currentCategory: 'All',
  currentLocation: 'All',
  currentLang: 'en',
  currentTheme: 'light',
  currentReviewFilter: null,
  
  kioskState: {
    character: null,
    mode: null,
    step: 0,
    cartTotal: 0
  },
  
  characters: [
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
  },

  init() {
    // 저장된 캐릭터 불러오기
    const storedChars = localStorage.getItem('kiosk_chars_v10');
    if (storedChars) {
      this.characters = JSON.parse(storedChars);
    }

    // Force reload with latest v10 format to ensure data structure matches
    const stored = localStorage.getItem("restaurants_v10");
    if (!stored) {
      this.data = JSON.parse(JSON.stringify(mockRestaurants));
      this.saveData();
    } else {
      this.data = JSON.parse(stored);
    }
    
    this.scripts = mockScripts;

    document.querySelectorAll('#category-filters .category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#category-filters .category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentCategory = e.target.dataset.category;
        this.renderRestaurants();
      });
    });

    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme_preference") || 'light';
    document.getElementById('theme-select').value = savedTheme;
    this.changeTheme(savedTheme);

    this.changeLanguage(this.currentLang);
  },

  saveData() {
    localStorage.setItem("restaurants_v10", JSON.stringify(this.data));
  },

  saveCharacters() {
    localStorage.setItem('kiosk_chars_v10', JSON.stringify(this.characters));
  },

  changeTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("theme_preference", theme);
  },

  changeLanguage(lang) {
    this.currentLang = lang;
    
    // Update static texts
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Re-render
    if (document.getElementById('detail-view').classList.contains('active')) {
      const activeRestId = parseInt(document.getElementById('detail-content').dataset.currentId);
      this.goDetail(activeRestId, false);
    } else {
      this.renderHome();
    }
  },

  getTranslation(key) {
    return translations[this.currentLang][key] || translations['en'][key];
  },

  getAverageRating(restaurant) {
    if (!restaurant.reviews || restaurant.reviews.length === 0) return 0;
    const sum = restaurant.reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / restaurant.reviews.length).toFixed(1);
  },

  renderHome() {
    this.renderTop3();
    this.renderRestaurants();
  },

  renderTop3() {
    const sorted = [...this.data].sort((a, b) => b.hearts - a.hearts).slice(0, 3);
    const container = document.getElementById('top3-container');
    container.innerHTML = sorted.map((r, index) => {
      const avg = this.getAverageRating(r);
      const locText = r.locationType ? this.getTranslation('loc_' + r.locationType.replace('-', '_')) : '';
      return `
      <div class="card" style="min-width: 250px; flex-shrink: 0; flex-direction: column;" onclick="app.goDetail(${r.id})">
        <img src="${r.coverImage}" class="card-img" style="height: 120px; width: 100%; object-fit: cover;" alt="cover">
        <div class="card-content">
          <div class="card-title">${r.name_ko} ${r.emoji}</div>
          <div style="font-size: 0.8rem; color: var(--primary); margin-bottom: 0.2rem;">${locText}</div>
          <div class="card-hours" style="font-size: 0.75rem; color: var(--text-secondary);">🕒 ${r.hours || '미등록'} ${r.breakTime ? `(Break: ${r.breakTime})` : ''}</div>
          <div class="card-meta">
            <span>${this.getTranslation('cat_' + r.category.toLowerCase()) || r.category}</span>
            <span>❤️ ${r.hearts}</span>
            <span class="rating-badge">⭐ ${avg}</span>
          </div>
        </div>
      </div>
    `}).join('');
  },

  changeLocation(loc) {
    this.currentLocation = loc;
    document.querySelectorAll('#location-filters .category-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.location === loc) btn.classList.add('active');
    });
    this.renderRestaurants();
  },

  renderRestaurants() {
    const grid = document.getElementById('restaurants-grid');
    let filtered = this.data;
    if (this.currentCategory !== 'All') {
      filtered = filtered.filter(r => r.category === this.currentCategory);
    }
    if (this.currentLocation !== 'All') {
      filtered = filtered.filter(r => r.locationType === this.currentLocation);
    }
    grid.innerHTML = filtered.map(r => {
      const avg = this.getAverageRating(r);
      const locText = r.locationType ? this.getTranslation('loc_' + r.locationType.replace('-', '_')) : '';
      return `
      <div class="card" onclick="app.goDetail(${r.id})">
        <img src="${r.coverImage}" class="card-img" alt="thumbnail">
        <div class="card-content">
          <div class="card-title">${r.name_ko} ${r.emoji}</div>
          <div style="font-size: 0.8rem; color: var(--primary); margin-bottom: 0.2rem;">${locText}</div>
          <div class="card-hours" style="font-size: 0.75rem; color: var(--text-secondary);">🕒 ${r.hours || '미등록'} ${r.breakTime ? `(Break: ${r.breakTime})` : ''}</div>
          <div class="card-meta">
            <span>${this.getTranslation('cat_' + r.category.toLowerCase()) || r.category}</span>
            <span>❤️ ${r.hearts}</span>
            <span class="rating-badge">⭐ ${avg}</span>
          </div>
        </div>
      </div>
    `}).join('');
  },

  goHome(e) {
    if (e) e.preventDefault();
    document.getElementById('detail-view').classList.remove('active');
    document.getElementById('add-view').classList.remove('active');
    document.getElementById('kiosk-view').classList.remove('active');
    document.getElementById('main-view').classList.add('active');
    window.scrollTo(0, 0);
    this.renderHome();
  },

  goDetail(id, scrollToTop = true) {
    this.currentReviewFilter = null;
    const restaurant = this.data.find(r => r.id === id);
    if (!restaurant) return;

    document.getElementById('main-view').classList.remove('active');
    document.getElementById('detail-view').classList.add('active');
    
    if (scrollToTop) window.scrollTo(0, 0);

    const detailContent = document.getElementById('detail-content');
    detailContent.dataset.currentId = id;
    
    const isLiked = localStorage.getItem(`liked_v10_${id}`) === 'true';
    const heartText = isLiked ? '❤️ Liked' : '🤍 Like';
    const avgRating = this.getAverageRating(restaurant);

    let html = `
      <img src="${restaurant.coverImage}" class="detail-cover" alt="cover">
      <div class="detail-header">
        <h1 class="detail-title">${restaurant.name_ko} ${restaurant.emoji}</h1>
        <div class="detail-address">
          <span>${restaurant.address}</span>
          <span class="rating-badge" style="font-size: 1rem;">⭐ ${avgRating}</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">
          🕒 ${restaurant.hours || '미등록'} ${restaurant.breakTime ? `(Break: ${restaurant.breakTime})` : ''}
        </div>
        <div class="detail-actions">
          <button class="btn btn-outline" style="flex:1;" onclick="app.toggleHeart(${id})">
            ${heartText} (${restaurant.hearts})
          </button>
        </div>
        <div class="detail-actions" style="margin-top:0.5rem; gap:0.5rem;">
          ${(restaurant.mapNaver || restaurant.addressLink) ? `<a href="${restaurant.mapNaver || restaurant.addressLink}" target="_blank" class="btn btn-outline" style="flex:1; border-color:#03c75a; color:#03c75a;">📍 Naver Map</a>` : ''}
          ${restaurant.mapGoogle ? `<a href="${restaurant.mapGoogle}" target="_blank" class="btn btn-outline" style="flex:1; border-color:#4285F4; color:#4285F4;">🗺️ Google Map</a>` : ''}
        </div>
      </div>

      <div class="section-container" style="padding-top:0;">
        <button class="btn btn-primary" onclick="app.openModal('${restaurant.category}')">${this.getTranslation('open_scripts')}</button>
        <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
          <button class="btn btn-outline" style="flex:1;" onclick="app.openPasswordPrompt('edit', ${id})">⚙️ 수정 (Edit)</button>
          <button class="btn btn-outline" style="flex:1;" onclick="app.goHome()">${this.getTranslation('back_to_list')}</button>
        </div>
      </div>

      <div class="section-container">
        <h2 class="section-title">🍽️ ${this.getTranslation('menu_title')}</h2>
        ${restaurant.menu.map(m => `
          <div class="menu-item">
            <div class="menu-info">
              <div class="menu-name">${m.name}</div>
              <div class="menu-desc">${m.desc && m.desc[this.currentLang] ? m.desc[this.currentLang] : (m.desc && m.desc['en'] ? m.desc['en'] : '')}</div>
              <div class="menu-price">${m.price}</div>
            </div>
            ${m.image ? `<img src="${m.image}" class="menu-img">` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section-container">
        <h2 class="section-title">💬 ${this.getTranslation('reviews_title')}</h2>
        
        <div style="background:var(--surface); padding:1rem; border-radius:var(--radius); box-shadow:var(--card-shadow); margin-bottom:1.5rem;">
          <div class="form-group" style="text-align: center;">
            <label style="display:block; margin-bottom:0.5rem;">${this.getTranslation('rating_label')}</label>
            <div class="star-rating-input" id="review-rating-stars" style="justify-content: center;">
              <span data-val="1" onclick="app.setReviewRating(1)" class="active">★</span>
              <span data-val="2" onclick="app.setReviewRating(2)" class="active">★</span>
              <span data-val="3" onclick="app.setReviewRating(3)" class="active">★</span>
              <span data-val="4" onclick="app.setReviewRating(4)" class="active">★</span>
              <span data-val="5" onclick="app.setReviewRating(5)" class="active">★</span>
            </div>
            <input type="hidden" id="review-rating" value="5">
          </div>
          
          <div class="form-group">
            <label>${this.getTranslation('food_label')}</label>
            <select id="review-food" class="form-control">
              ${restaurant.menu.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <textarea id="review-input" class="form-control" placeholder="${this.getTranslation('review_placeholder')}"></textarea>
          </div>
          
          <button class="btn btn-primary" onclick="app.submitReview(${restaurant.id})">${this.getTranslation('post_review')}</button>
          <p id="review-error" style="color: var(--primary); font-size: 0.85rem; margin-top: 0.8rem; display: none;"></p>
        </div>
        
        <div id="review-filter-buttons" style="display:flex; gap:0.5rem; overflow-x:auto; margin-bottom:1rem; padding-bottom:0.5rem; scrollbar-width:none;">
          <button class="category-btn review-filter-btn active" data-rating="all" onclick="app.filterReviews(${id}, null)">All</button>
          <button class="category-btn review-filter-btn" data-rating="5" onclick="app.filterReviews(${id}, 5)">5 ⭐</button>
          <button class="category-btn review-filter-btn" data-rating="4" onclick="app.filterReviews(${id}, 4)">4 ⭐</button>
          <button class="category-btn review-filter-btn" data-rating="3" onclick="app.filterReviews(${id}, 3)">3 ⭐</button>
          <button class="category-btn review-filter-btn" data-rating="2" onclick="app.filterReviews(${id}, 2)">2 ⭐</button>
          <button class="category-btn review-filter-btn" data-rating="1" onclick="app.filterReviews(${id}, 1)">1 ⭐</button>
          <button class="category-btn review-filter-btn" data-rating="0" onclick="app.filterReviews(${id}, 0)">0 ⭐</button>
        </div>
        
        <div id="reviews-list-container"></div>
      </div>
    `;

    detailContent.innerHTML = html;
    this.renderReviewsList(id);
  },

  filterReviews(id, rating) {
    if (this.currentReviewFilter === rating) {
      this.currentReviewFilter = null;
    } else {
      this.currentReviewFilter = rating;
    }
    this.renderReviewsList(id);
  },

  renderReviewsList(id) {
    const restaurant = this.data.find(r => r.id === id);
    if (!restaurant) return;
    
    let filteredReviews = restaurant.reviews;
    if (this.currentReviewFilter !== null) {
      filteredReviews = restaurant.reviews.filter(r => r.rating === this.currentReviewFilter);
    }
    
    const container = document.getElementById('reviews-list-container');
    if (!container) return;
    
    if (filteredReviews.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:2rem 0;">리뷰가 없습니다. (No reviews yet)</p>`;
    } else {
      container.innerHTML = filteredReviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="review-author">${r.author} <span style="color:#ffc107;">${'⭐'.repeat(r.rating)}</span></div>
            <div class="review-date">${r.date}</div>
          </div>
          <div class="review-food">🍴 ${r.food}</div>
          <div class="review-text">${r.text}</div>
        </div>
      `).join('');
    }
    
    document.querySelectorAll('.review-filter-btn').forEach(btn => {
      btn.classList.remove('active');
      const rating = btn.dataset.rating;
      if (
        (rating === 'all' && this.currentReviewFilter === null) || 
        (rating !== 'all' && parseInt(rating) === this.currentReviewFilter)
      ) {
        btn.classList.add('active');
      }
    });
  },

  setReviewRating(val) {
    document.getElementById('review-rating').value = val;
    const stars = document.querySelectorAll('#review-rating-stars span');
    stars.forEach((star, index) => {
      if (index < val) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  },

  toggleHeart(id) {
    const restaurant = this.data.find(r => r.id === id);
    const isLiked = localStorage.getItem(`liked_v10_${id}`) === 'true';

    if (isLiked) {
      restaurant.hearts -= 1;
      localStorage.setItem(`liked_v10_${id}`, 'false');
    } else {
      restaurant.hearts += 1;
      localStorage.setItem(`liked_v10_${id}`, 'true');
    }

    this.saveData();
    this.goDetail(id, false); 
  },

  submitReview(id) {
    const input = document.getElementById('review-input');
    const ratingSelect = document.getElementById('review-rating');
    const foodSelect = document.getElementById('review-food');
    const errorMsg = document.getElementById('review-error');
    
    const text = input.value.trim();
    const rating = parseInt(ratingSelect.value, 10);
    const food = foodSelect.value;

    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 10) {
      errorMsg.textContent = this.currentLang === 'ko' ? "10단어 이상 입력해주세요." : "Please write at least 10 words.";
      errorMsg.style.display = 'block';
      return;
    }

    errorMsg.style.display = 'none';
    const restaurant = this.data.find(r => r.id === id);
    
    restaurant.reviews.unshift({
      author: "Student User",
      text: text,
      date: new Date().toISOString().split('T')[0],
      rating: rating,
      food: food
    });

    this.saveData();
    this.goDetail(id, false);
  },

  openModal(category) {
    const scriptContent = document.getElementById('script-content');
    const filtersContainer = document.getElementById('script-category-filters');
    
    const categories = ['Ordering', 'Dining In', 'Allergies', 'Payment'];
    if (!this.currentScriptCategory) this.currentScriptCategory = categories[0];
    
    // Render Filters
    if (filtersContainer) {
      filtersContainer.innerHTML = categories.map(cat => 
        `<button class="script-pill ${this.currentScriptCategory === cat ? 'active' : ''}" onclick="app.changeScriptCategory('${cat}')">${cat}</button>`
      ).join('');
    }
    
    // Helper function to map category string to group
    const catMap = { 'Ordering': 'When Ordering', 'Dining In': 'Dining In', 'Allergies': 'Allergies / Special Requests', 'Payment': 'Payment' };
    const targetGroupNameEn = catMap[this.currentScriptCategory];
    
    const filteredScripts = this.scripts.filter(group => group.situation['en'] === targetGroupNameEn);
    
    scriptContent.innerHTML = filteredScripts.map(group => {
      return group.scripts.map(s => {
        const translatedEn = s['en'] || s[this.currentLang] || '';
        return `
        <div class="script-list-item">
          <div>
            <div class="script-ko-text">${s.ko}</div>
            <div class="script-pronun">${s.pronunciation || ''}</div>
            <div class="script-en-text">${translatedEn}</div>
          </div>
          <div class="script-speaker" onclick="app.speak('${s.ko}')">🔊</div>
        </div>
      `}).join('');
    }).join('');

    document.getElementById('script-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('script-modal').classList.remove('active');
  },

  openPasswordPrompt(mode = 'add', id = null) {
    this.adminMode = mode;
    this.adminEditId = id;
    document.getElementById('admin-password').value = '';
    document.getElementById('password-error').style.display = 'none';
    document.getElementById('password-modal').classList.add('active');
  },

  closePasswordPrompt() {
    document.getElementById('password-modal').classList.remove('active');
  },

  verifyPassword() {
    const pwd = document.getElementById('admin-password').value;
    if (pwd === '0505') {
      this.closePasswordPrompt();
      this.showForm(this.adminMode, this.adminEditId);
    } else {
      document.getElementById('password-error').style.display = 'block';
    }
  },

  showForm(mode, id) {
    document.getElementById('main-view').classList.remove('active');
    document.getElementById('detail-view').classList.remove('active');
    document.getElementById('add-view').classList.add('active');
    
    document.getElementById('form-title').innerHTML = mode === 'edit' ? '⚙️ Edit Restaurant' : '➕ Add New Restaurant';
    document.getElementById('menu-list-container').innerHTML = ''; // clear menus
    document.getElementById('cover-preview').style.display = 'none';
    document.getElementById('cover-preview').removeAttribute('src');
    document.getElementById('add-cover-url').value = '';

    if (mode === 'edit' && id) {
      const restaurant = this.data.find(r => r.id === id);
      if (restaurant) {
        document.getElementById('add-name').value = restaurant.name_ko;
        document.getElementById('add-category').value = restaurant.category;
        document.getElementById('add-location').value = restaurant.locationType || 'in-campus';
        document.getElementById('add-address').value = restaurant.address;
        document.getElementById('add-hours').value = restaurant.hours || '';
        document.getElementById('add-breaktime').value = restaurant.breakTime || '';
        document.getElementById('add-maplink-naver').value = restaurant.mapNaver || restaurant.addressLink || '';
        document.getElementById('add-maplink-google').value = restaurant.mapGoogle || '';
        document.getElementById('delete-restaurant-btn').style.display = 'block';
        
        // cover image setup
        if (restaurant.coverImage) {
          const img = document.getElementById('cover-preview');
          img.src = restaurant.coverImage;
          img.style.display = 'block';
          document.getElementById('add-cover-url').value = restaurant.coverImage;
        }

        // populate menus
        if (restaurant.menu && restaurant.menu.length > 0) {
          restaurant.menu.forEach(m => {
            this.addMenuField(m);
          });
        } else {
          this.addMenuField();
        }
      }
    } else {
      // Add mode: Reset form fields
      document.getElementById('add-name').value = '';
      document.getElementById('add-category').value = 'Restaurant';
      document.getElementById('add-location').value = 'in-campus';
      document.getElementById('add-address').value = '';
      document.getElementById('add-hours').value = '';
      document.getElementById('add-breaktime').value = '';
      document.getElementById('add-maplink-naver').value = '';
      document.getElementById('add-maplink-google').value = '';
      document.getElementById('scrape-url').value = '';
      document.getElementById('delete-restaurant-btn').style.display = 'none';
      document.getElementById('add-cover').value = '';
      if(document.getElementById('cover-ai-msg')) document.getElementById('cover-ai-msg').style.display = 'none';
      this.addMenuField(); // minimum 1 menu field
    }
    window.scrollTo(0, 0);
  },

  handleImageUrl(url, previewId) {
    if (!url) return;
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.src = url;
      preview.style.display = 'block';
    }
  },

  handleImageUpload(event, previewId, msgId = null) {
    const file = event.target.files[0];
    if (!file) return;

    if (msgId) {
      const msgEl = document.getElementById(msgId);
      if (msgEl) msgEl.style.display = 'none';
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize logic (max width 600px)
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 600;
        
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const preview = document.getElementById(previewId);
        if (preview) {
          preview.src = dataUrl;
          preview.style.display = 'block';
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  addMenuField(menuData = null) {
    const container = document.getElementById('menu-list-container');
    const menuId = 'menu-' + Date.now() + Math.floor(Math.random() * 1000);
    
    const name = menuData ? menuData.name : '';
    const price = menuData ? menuData.price : '';
    const desc = menuData && menuData.desc ? (menuData.desc.ko || menuData.desc.en) : '';
    const imgSrc = menuData && menuData.image ? menuData.image : '';
    const imgDisplay = imgSrc ? 'block' : 'none';

    const div = document.createElement('div');
    div.className = 'dynamic-menu-box';
    div.id = menuId;

    div.innerHTML = `
      <button class="remove-menu-btn" onclick="app.removeMenuField('${menuId}')">✕</button>
      <div class="form-group">
        <label>메뉴 이름 (Menu Name)</label>
        <input type="text" class="form-control menu-name-input" placeholder="예: 김치찌개" value="${name}">
      </div>
      <div class="form-group">
        <label>가격 (Price)</label>
        <input type="text" class="form-control menu-price-input" placeholder="예: 8,000원" value="${price}">
      </div>
      <div class="form-group">
        <label>설명 (Description)</label>
        <input type="text" class="form-control menu-desc-input" placeholder="예: 매콤한 김치찌개" value="${desc}">
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>메뉴 사진 (Menu Image)</label>
        <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
          <input type="text" class="form-control menu-img-url-input" placeholder="이미지 URL 주소 붙여넣기" value="${imgSrc}" onchange="app.handleImageUrl(this.value, 'preview-${menuId}')">
          <span style="display:flex; align-items:center; font-size:0.9rem; color:var(--text-secondary);">또는</span>
          <input type="file" class="form-control" accept="image/*" onchange="app.handleImageUpload(event, 'preview-${menuId}')" style="width:auto;">
        </div>
        <img id="preview-${menuId}" class="menu-img-preview" src="${imgSrc}" style="display:${imgDisplay}; width:100px; height:100px; object-fit:cover; margin-top:0.5rem; border-radius:8px;">
      </div>
    `;
    container.appendChild(div);
  },

  removeMenuField(menuId) {
    const el = document.getElementById(menuId);
    if (el) el.remove();
  },

  // 백엔드 연동 URL 스크래핑 함수 (Gemini API 연동)
  async scrapeDataFromUrl() {
    const query = document.getElementById('scrape-url').value.trim();
    if (!query) {
      alert("URL이나 가게 이름을 먼저 입력해주세요!");
      return;
    }

    const btn = document.getElementById('scrape-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ 진짜 사진과 메뉴 검색 중...";
    btn.disabled = true;

    try {
      const apiKey = ""; // Canvas 환경에서 런타임에 자동으로 주입됩니다.
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      
      const promptText = `
        입력값(URL 또는 가게 이름): "${query}"
        당신은 데이터 수집 전문가입니다. 사용자가 입력한 네이버 플레이스 URL 또는 가게 이름을 바탕으로 해당 음식점/카페의 최신 상세 정보를 찾아주세요. 
        만약 URL이 입력되었다면, 반드시 해당 URL의 네이버 플레이스 정보를 정확히 타겟팅하여 탐색하세요.
        이 작업의 절대적인 핵심은 네이버 플레이스 '메뉴' 탭에 등록된 **모든 메뉴를 단 하나도 빠짐없이 100% 긁어오는 것**입니다.
        
        *매우 중요한 메뉴 수집 규칙*: 
        AI 모델이 임 임의로 메뉴를 3~4개만 요약하거나 생략하는 것을 엄격히 금지합니다. 모든 메뉴를 찾아 배열에 넣으세요.
        
        *사진 처리 및 추출 규칙 (핵심)*: 
        - 네이버 플레이스 자체의 내부 이미지는 보안상 외부에서 엑스박스(깨짐)가 뜹니다.
        - 따라서 가게 대표 사진(coverImageUrl) 및 개별 메뉴 사진(imageUrl)은 해당 가게의 **'네이버 블로그 리뷰', '티스토리', '뉴스 기사' 등 웹에 공개된 실제 방문자들의 사진 원본 URL(http 또는 https로 시작하고 .jpg, .png 등으로 끝나는 정상 링크)**을 구글 검색으로 찾아서 가져오세요.
        - 가짜 생성 AI 이미지(pollinations 등)는 절대 금지합니다. 실제 사진 링크를 도저히 찾을 수 없다면 차라리 빈 문자열("")로 두세요.
        
        필수 포함 정보:
        1. name: 네이버 플레이스 기준 정확한 상호명
        2. address: 네이버 플레이스 기준 상세 주소
        3. hours: 영업시간 및 휴무일 (네이버 플레이스 정보 텍스트 그대로)
        4. breakTime: 브레이크 타임 (없으면 "")
        5. naverMapUrl: 해당 가게의 네이버 플레이스 URL
        6. googleMapUrl: 구글 지도 검색 링크
        7. coverImageUrl: 웹(블로그 등)상에 존재하는 실제 가게 외부/내부 원본 사진 URL
        8. menus: 모든 메뉴 목록 (배열). (경고: 절대 생략 금지)
           - name: 메뉴명
           - price: 가격
           - imageUrl: 웹(블로그 등)상에 존재하는 실제 해당 메뉴의 원본 사진 URL (없으면 "")
      `;

      // Gemini 2.5 Flash 모델에 Google 검색 도구와 JSON 스키마를 함께 요청
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              address: { type: "STRING" },
              hours: { type: "STRING" },
              breakTime: { type: "STRING" },
              naverMapUrl: { type: "STRING" },
              googleMapUrl: { type: "STRING" },
              coverImageUrl: { type: "STRING" },
              menus: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    price: { type: "STRING" },
                    imageUrl: { type: "STRING" }
                  }
                }
              }
            },
            required: ["name", "address", "hours", "naverMapUrl", "googleMapUrl", "coverImageUrl", "menus"]
          }
        }
      };

      // 지수 백오프 기반 재시도 로직
      const fetchWithRetry = async (url, options, retries = 5) => {
        const delays = [1000, 2000, 4000, 8000, 16000];
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delays[i]));
          }
        }
      };

      const result = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error("Gemini API 응답이 비어있습니다.");

      const data = JSON.parse(textResponse);

      // 폼 데이터에 결과 채우기
      document.getElementById('add-name').value = data.name || "";
      document.getElementById('add-address').value = data.address || "";
      document.getElementById('add-hours').value = data.hours || "";
      document.getElementById('add-breaktime').value = data.breakTime || "";
      document.getElementById('add-maplink-naver').value = data.naverMapUrl || "";
      document.getElementById('add-maplink-google').value = data.googleMapUrl || "";
      
      const coverPreview = document.getElementById('cover-preview');
      if (data.coverImageUrl) {
        document.getElementById('add-cover-url').value = data.coverImageUrl;
        coverPreview.src = data.coverImageUrl;
        coverPreview.style.display = 'block';
      }

      // 메뉴 리스트 초기화 후 동적 추가
      document.getElementById('menu-list-container').innerHTML = '';
      if (data.menus && data.menus.length > 0) {
        data.menus.forEach(m => {
          this.addMenuField({
            name: m.name || "",
            price: m.price || "-",
            desc: { ko: "", en: "" },
            image: m.imageUrl || ""
          });
        });
      } else {
        this.addMenuField();
      }

      alert("✨ 스크래핑 성공! 네이버 지도를 기반으로 가게 정보와 메뉴를 모두 불러왔습니다.");

    } catch (error) {
      alert("❌ 정보 가져오기에 실패했습니다. (Gemini API 호출 오류)");
      console.error(error);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  submitRestaurant() {
    const name = document.getElementById('add-name').value.trim();
    if (!name) {
      alert("가게 이름을 입력해주세요.");
      return;
    }

    const category = document.getElementById('add-category').value;
    const locationType = document.getElementById('add-location').value;
    const address = document.getElementById('add-address').value.trim();
    const hours = document.getElementById('add-hours').value.trim();
    const breakTime = document.getElementById('add-breaktime').value.trim();
    const mapNaver = document.getElementById('add-maplink-naver').value.trim();
    const mapGoogle = document.getElementById('add-maplink-google').value.trim();
    
    const coverPreview = document.getElementById('cover-preview');
    let coverImage = coverPreview.src;
    if (!coverImage || coverImage.endsWith('#') || coverPreview.style.display === 'none') {
      coverImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";
    }

    const menus = [];
    document.querySelectorAll('.dynamic-menu-box').forEach(box => {
      const mName = box.querySelector('.menu-name-input').value.trim();
      const mPrice = box.querySelector('.menu-price-input').value.trim();
      const mDesc = box.querySelector('.menu-desc-input').value.trim();
      const mImgEl = box.querySelector('.menu-img-preview');
      let mImg = mImgEl ? mImgEl.src : '';
      if (mImgEl && mImgEl.style.display === 'none') mImg = '';

      if (mName) {
        menus.push({
          name: mName,
          price: mPrice || "-",
          desc: { ko: mDesc, en: mDesc, uz: mDesc, ur: mDesc },
          image: mImg || ""
        });
      }
    });

    if (this.adminMode === 'edit' && this.adminEditId) {
      const restaurant = this.data.find(r => r.id === this.adminEditId);
      if (restaurant) {
        restaurant.name_ko = name;
        restaurant.name_en = name;
        restaurant.category = category;
        restaurant.locationType = locationType;
        restaurant.emoji = category === 'Cafe' ? '☕' : (category === 'Restaurant' ? '🍲' : '🏪');
        restaurant.address = address || "주소 미상";
        restaurant.hours = hours;
        restaurant.breakTime = breakTime;
        restaurant.mapNaver = mapNaver;
        restaurant.mapGoogle = mapGoogle;
        
        if (coverImage && coverImage !== window.location.href) {
          restaurant.coverImage = coverImage;
        }

        restaurant.menu = menus;
        alert("가게 정보가 성공적으로 수정되었습니다!");
      }
    } else {
      const newId = Date.now();
      const newRest = {
        id: newId,
        name_ko: name,
        name_en: name,
        category: category,
        locationType: locationType,
        reviewCount: 0,
        hearts: 0,
        emoji: category === 'Cafe' ? '☕' : (category === 'Restaurant' ? '🍲' : '🏪'),
        coverImage: coverImage,
        address: address || "주소 미상",
        hours: hours,
        breakTime: breakTime,
        mapNaver: mapNaver,
        mapGoogle: mapGoogle,
        menu: menus,
        reviews: []
      };
      this.data.unshift(newRest);
      alert("가게가 성공적으로 등록되었습니다!");
    }

    this.saveData();
    this.goHome();
  },

  deleteRestaurant() {
    if (!this.adminEditId) return;
    if (confirm("정말로 이 가게를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      this.data = this.data.filter(r => r.id !== this.adminEditId);
      this.saveData();
      alert("가게가 성공적으로 삭제되었습니다.");
      this.goHome();
    }
  },

  // --- Kiosk Master Functions ---

  startScriptQuiz() {
    this.closeModal();
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('quiz-view').classList.add('active');
    
    // Flatten scripts
    const allQuestions = [];
    this.scripts.forEach(group => {
      group.scripts.forEach(s => {
        allQuestions.push({
          situation: group.situation[this.currentLang] || group.situation['en'],
          ko: s.ko,
          en: s[this.currentLang] || s['en'],
          wrong1: "잘못된 선택지 1 (Wrong Option)",
          wrong2: "잘못된 선택지 2 (Wrong Option)"
        });
      });
    });

    // Make options for each question using other scripts
    allQuestions.forEach(q => {
      const others = allQuestions.filter(o => o.ko !== q.ko);
      const shuffledOthers = others.sort(() => 0.5 - Math.random());
      q.options = [q.ko, shuffledOthers[0].ko, shuffledOthers[1].ko].sort(() => 0.5 - Math.random());
      q.correctIndex = q.options.indexOf(q.ko);
    });

    // Pick 5 random questions
    this.scriptQuizState.questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    this.scriptQuizState.currentIndex = 0;
    this.scriptQuizState.score = 0;
    this.scriptQuizState.isAnswered = false;

    this.renderScriptQuiz();
  },

  renderScriptQuiz() {
    const container = document.getElementById('quiz-content');
    const state = this.scriptQuizState;

    if (state.currentIndex >= state.questions.length) {
      container.innerHTML = `
        <div class="section-container" style="text-align:center; padding-top:2rem;">
          <h2 style="color:var(--primary); font-size:2rem; margin-bottom:1rem;">Quiz Complete! 🎉</h2>
          <div style="font-size:4rem; margin-bottom:1rem;">${state.score >= 4 ? '🏆' : '👏'}</div>
          <p style="font-size:1.2rem; margin-bottom:2rem;">Your Score: <strong>${state.score} / ${state.questions.length}</strong></p>
          <button class="btn btn-primary" style="width:100%; padding:1rem;" onclick="app.goHome()">Back to Home</button>
        </div>
      `;
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

    container.innerHTML = `
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
            <div class="question-en">"${q.en}"</div>
          </div>
        </div>

        <div class="quiz-options">
          ${q.options.map((opt, idx) => `
            <div class="quiz-option-btn" id="quiz-opt-${idx}" onclick="app.checkScriptQuizAnswer(${idx}, ${q.correctIndex}, this)">
              <div class="quiz-option-ko">${opt}</div>
              <div class="quiz-option-pronun">${getPro(opt)}</div>
            </div>
          `).join('')}
        </div>
        
        <div id="quiz-feedback" style="text-align:center; margin-top:1.5rem; min-height:80px;"></div>
      </div>
    `;
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
  },

  nextScriptQuizQuestion() {
    this.scriptQuizState.isAnswered = false;
    this.scriptQuizState.currentIndex++;
    this.renderScriptQuiz();
  },

  goKioskTutorial() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('kiosk-view').classList.add('active');
    this.kioskState.character = null;
    this.kioskState.mode = null;
    this.renderCharacterSelect();
    window.scrollTo(0, 0);
  },

  // 사진 직접 업로드 및 변경 함수 추가
  updateCharacterImage(event, id) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 이미지 크기 최적화 (가로세로 300px 이내)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/png');
        
        // 데이터 업데이트 후 저장 및 렌더링
        const char = this.characters.find(c => c.id === id);
        if (char) {
          char.img1 = dataUrl;
          char.img2 = dataUrl;
          this.saveCharacters();
          this.renderCharacterSelect();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  renderCharacterSelect() {
    const container = document.getElementById('kiosk-content');
    container.innerHTML = `
      <div class="section-container">
        <button class="btn btn-outline" style="margin-bottom:1rem;" onclick="app.goHome()">⬅️ Back to Home</button>
        <h2 class="section-title">👤 캐릭터 선택 (Choose Character)</h2>
        <p style="color:var(--text-secondary);">함께 키오스크를 연습할 친구를 골라주세요!</p>
        <div class="character-grid">
          ${this.characters.map(c => `
            <div class="character-card" style="position:relative;">
              <img src="${c.img1}" class="character-img" alt="${c.name}" onclick="app.selectCharacter('${c.id}')" onerror="this.src='https://ui-avatars.com/api/?name=${c.name}&background=random&color=fff&size=120'">
              <h3 style="margin:0; font-size:1.1rem; cursor:pointer;" onclick="app.selectCharacter('${c.id}')">${c.name}</h3>
              <label class="btn btn-outline" style="font-size:0.75rem; padding:0.3rem 0.6rem; margin-top:0.8rem; display:inline-block; cursor:pointer; width:100%; border-color:#ddd;">
                📷 내 사진으로 변경
                <input type="file" accept="image/*" style="display:none;" onchange="app.updateCharacterImage(event, '${c.id}')">
              </label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  selectCharacter(id) {
    this.kioskState.character = this.characters.find(c => c.id === id);
    this.renderModeSelect();
  },

  renderModeSelect() {
    const char = this.kioskState.character;
    const container = document.getElementById('kiosk-content');
    container.innerHTML = `
      <div class="section-container">
        <button class="btn btn-outline" style="margin-bottom:1rem;" onclick="app.renderCharacterSelect()">⬅️ 캐릭터 다시 선택</button>
        <div style="text-align:center; margin-bottom:2rem;">
          <img src="${char.img1}" style="width:100px; height:100px; object-fit:contain;" alt="${char.name}" onerror="this.src='https://ui-avatars.com/api/?name=${char.name}&background=random&color=fff&size=100'">
          <h2 class="section-title" style="margin-top:0.5rem;">${char.name}와(과) 함께합니다!</h2>
        </div>
        
        <h3 style="margin-bottom:1rem;">모드를 선택하세요</h3>
        <button class="mode-btn" onclick="app.startKioskInteractive('learn')">
          📖 학습 모드 (Learning Mode)<br>
          <span style="font-size:0.9rem; font-weight:normal; color:var(--text-secondary);">가상 키오스크를 직접 터치하며 깜빡이는 힌트를 따라 주문을 배웁니다.</span>
        </button>
        <button class="mode-btn" onclick="app.startKioskInteractive('challenge')">
          🎮 챌린지 모드 (Challenge Mode)<br>
          <span style="font-size:0.9rem; font-weight:normal; color:var(--text-secondary);">힌트 없이 스스로 미션을 확인하고 실제처럼 주문해봅시다.</span>
        </button>
      </div>
    `;
  },

  
  
  
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
      text = text.replace(`{${i}}`, arg);
    });
    return text;
  },

  startKioskInteractive(mode) {
    this.kioskState.mode = mode;
    this.kioskState.step = 0;
    this.kioskState.cartTotal = 0;
    
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

    this.renderKioskInteractive();
  },

  renderKioskInteractive() {
    const container = document.getElementById('kiosk-content');
    const char = this.kioskState.character;
    const mode = this.kioskState.mode;
    const step = this.kioskState.step;
    const sc = this.kioskState.scenario;

    if (step >= 4) {
      container.innerHTML = `
        <div class="section-container" style="text-align:center; padding-top:3rem;">
          <h1 style="color:var(--primary); font-size:2.5rem; margin-bottom:1rem;">${this.getKioskText('success')}</h1>
          <img src="${char.img2}" style="width:200px; height:200px; object-fit:contain; animation: fadeIn 0.5s;" alt="${char.name}">
          <h2 style="margin:1rem 0;">${this.getKioskText('orderNum')}</h2>
          <p style="color:var(--text-secondary); margin-bottom:2rem;">${this.getKioskText('receipt')}</p>
          <button class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.1rem;" onclick="app.goHome()">${this.getKioskText('goHome')}</button>
        </div>
      `;
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
      kioskInnerHtml = `
        <div class="kiosk-screen-home">
          <div class="kiosk-header">${this.getKioskText('kioskTitle')}</div>
          <div class="kiosk-half-btn" id="kiosk-btn-eatin" onclick="app.handleKioskAction('eatin', '${currentStep.action}')">
            🍽️ ${this.getKioskText('eatin')}<br><span style="font-size:1rem; font-weight:normal;">Eat-in</span>
          </div>
          <div class="kiosk-half-btn" id="kiosk-btn-takeout" onclick="app.handleKioskAction('takeout', '${currentStep.action}')">
            🛍️ ${this.getKioskText('takeout')}<br><span style="font-size:1rem; font-weight:normal;">Take-out</span>
          </div>
        </div>
      `;
    } else if (step === 1) {
      kioskInnerHtml = `
        <div class="kiosk-screen-menu">
          <div class="kiosk-header">${this.getKioskText('selectMenu')}</div>
          <div class="kiosk-category-tabs">
            <div class="kiosk-tab">추천/세트</div>
            <div class="kiosk-tab active">분식류</div>
            <div class="kiosk-tab">사이드</div>
          </div>
          <div class="kiosk-menu-grid">
            <div class="kiosk-menu-item" id="kiosk-item-kimbap" onclick="app.handleKioskAction('add_kimbap', '${currentStep.action}')">
              <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=150&q=80">
              <div style="font-weight:bold;">${this.getKioskText('add_kimbap')}</div>
              <div style="color:var(--primary);">3,500원</div>
            </div>
            <div class="kiosk-menu-item" id="kiosk-item-tteokbokki" onclick="app.handleKioskAction('add_tteokbokki', '${currentStep.action}')">
              <img src="https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=150&q=80">
              <div style="font-weight:bold;">${this.getKioskText('add_tteokbokki')}</div>
              <div style="color:var(--primary);">4,500원</div>
            </div>
          </div>
          <div class="kiosk-cart">
            <div style="font-size:0.9rem; margin-bottom:0.5rem;">${this.getKioskText('cartCount', '0')}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold;">
              ${this.getKioskText('cartTotal')}: <span style="color:var(--primary);">0원</span>
            </div>
            <button class="kiosk-btn-pay" style="opacity:0.5;">${this.getKioskText('payBtn')} (0)</button>
          </div>
        </div>
      `;
    } else if (step === 2) {
      kioskInnerHtml = `
        <div class="kiosk-screen-menu">
          <div class="kiosk-header">${this.getKioskText('selectMenu')}</div>
          <div class="kiosk-menu-grid">
            <div class="kiosk-menu-item">
              <img src="${sc.menu === 'add_kimbap' ? 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=150&q=80'}">
              <div style="font-weight:bold;">${tMenu}</div>
              <div style="color:var(--primary);">${sc.price.toLocaleString()}원</div>
            </div>
          </div>
          <div class="kiosk-cart">
            <div style="font-size:0.9rem; margin-bottom:0.5rem;">${this.getKioskText('cartCount', '1')}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold;">
              ${tMenu} x 1
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; margin-top:0.5rem; border-top:1px solid #ddd; padding-top:0.5rem;">
              ${this.getKioskText('cartTotal')}: <span style="color:var(--primary);">${sc.price.toLocaleString()}원</span>
            </div>
            <button class="kiosk-btn-pay" id="kiosk-btn-pay" onclick="app.handleKioskAction('pay_button', '${currentStep.action}')">${this.getKioskText('payBtn')} (1)</button>
          </div>
        </div>
      `;
    } else if (step === 3) {
      kioskInnerHtml = `
        <div class="kiosk-screen-home">
          <div class="kiosk-header">${this.getKioskText('selectPay')}</div>
          <div style="text-align:center; padding:1rem; font-weight:bold; font-size:1.2rem; color:var(--primary);">
            ${this.getKioskText('cartTotal')}: ${sc.price.toLocaleString()}원
          </div>
          <div class="kiosk-half-btn" id="kiosk-btn-card" onclick="app.handleKioskAction('credit_card', '${currentStep.action}')">💳 ${this.getKioskText('credit_card')}</div>
          <div class="kiosk-half-btn" id="kiosk-btn-cash" onclick="app.handleKioskAction('cash', '${currentStep.action}')">💵 ${this.getKioskText('cash')}</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="section-container">
        <button class="btn btn-outline" style="margin-bottom:1rem;" onclick="app.goHome()">${this.getKioskText('quit')}</button>
        <div class="dialogue-bubble" style="width:100%; max-width:400px; display:flex; gap:1rem; align-items:center;">
          <img id="kiosk-char-img" src="${char.img1}" style="width:50px; height:50px; object-fit:contain;" alt="${char.name}">
          <div id="kiosk-feedback">${currentStep.text}</div>
        </div>
        <div class="kiosk-container">${kioskInnerHtml}</div>
      </div>
    `;

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
