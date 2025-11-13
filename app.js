// app.js - ULTIMATE LIQUID GLASS EXPERIENCE
class BelarusHeroesApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.heroes = [];
    this.facts = [];
    this.currentCategory = null;
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Premium Belarus Heroes App...');
    
    // Initialize Telegram WebApp
    this.initTelegram();
    
    // Load data
    await this.loadData();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderCategoriesAndHeroes();
    
    console.log('✅ App initialized successfully');
  }

  initTelegram() {
    if (this.tg) {
      try {
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        
        // Handle theme changes
        this.tg.onEvent('themeChanged', () => {
          document.body.className = this.tg.colorScheme;
        });
        
        // Handle back button
        this.tg.onEvent('backButtonClicked', () => {
          if (this.isModalOpen()) {
            this.closeModal();
            return false;
          }
          return true;
        });
        
        console.log('✅ Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ Telegram init failed:', error);
      }
    }
  }

  async loadData() {
    try {
      // Load heroes
      const heroesResponse = await fetch('./heroes.json');
      if (heroesResponse.ok) {
        this.heroes = await heroesResponse.json();
        console.log(`✅ Loaded ${this.heroes.length} heroes`);
      } else {
        throw new Error('Failed to load heroes');
      }
      
      // Load facts
      const factsResponse = await fetch('./facts.json');
      if (factsResponse.ok) {
        this.facts = await factsResponse.json();
        console.log(`✅ Loaded ${this.facts.length} facts`);
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      this.useFallbackData();
    }
  }

  useFallbackData() {
    this.heroes = [
      {
        "id": 1,
        "name": "Франциск Скорина",
        "years": "ок. 1490 — ок. 1551",
        "field": "Просветитель, первопечатник",
        "category": "Культура",
        "fact": "Франциск Скорина напечатал первую книгу на белорусской земле в 1517 году — «Псалтыр».",
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop"
      },
      {
        "id": 2,
        "name": "Кастусь Калиновский",
        "years": "1838 — 1864",
        "field": "Революционер, публицист",
        "category": "История",
        "fact": "Калиновский был одним из лидеров восстания 1863 года против Российской империи.",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
      }
    ];
    
    this.facts = [
      {"id": 1, "name": "Франциск Скорина", "fact": "Первый белорусский книгопечатник издал «Псалтыр» в Праге в 1517 году."},
      {"id": 2, "name": "Кастусь Калиновский", "fact": "Его письма «Мужыцкая праўда» стали символом борьбы за свободу."}
    ];
    
    console.log('🔄 Using fallback data');
  }

  setupEventListeners() {
    // Main buttons
    this.on('#startBtn', 'click', () => this.renderCategoriesAndHeroes());
    this.on('#aboutBtn', 'click', () => this.showAboutModal());
    this.on('#refreshBtn', 'click', () => location.reload());
    this.on('#closeModal', 'click', () => this.closeModal());
    this.on('#shareBtn', 'click', () => this.shareCurrentHero());
    
    // Modal backdrop click
    this.on('#heroModal', 'click', (e) => {
      if (e.target.id === 'heroModal') this.closeModal();
    });
  }

  on(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  getCategories() {
    return [...new Set(this.heroes.map(hero => hero.category).filter(Boolean))];
  }

  renderCategoriesAndHeroes() {
    const categories = this.getCategories();
    const categoriesContainer = document.getElementById('categories');
    const heroesGrid = document.getElementById('heroesGrid');
    
    if (!categoriesContainer || !heroesGrid) return;
    
    // Render categories
    categoriesContainer.innerHTML = categories.map((category, index) => `
      <button class="cat-btn ${index === 0 ? 'active' : ''}" 
              onclick="app.selectCategory('${category}')">
        ${category}
      </button>
    `).join('') + `
      <button class="cat-btn" onclick="app.showRandomFact()">
        🎲 Выпадковы факт
      </button>
    `;
    
    // Show first category
    if (categories.length > 0) {
      this.currentCategory = categories[0];
      this.renderHeroes(this.currentCategory);
    }
    
    // Update start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.innerHTML = '<span class="btn-sparkle">🔄</span>Абнавіць';
    }
  }

  selectCategory(category) {
    this.currentCategory = category;
    
    // Update active state
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    this.renderHeroes(category);
  }

  renderHeroes(category) {
    const heroesGrid = document.getElementById('heroesGrid');
    if (!heroesGrid) return;
    
    const categoryHeroes = this.heroes.filter(hero => hero.category === category);
    
    if (categoryHeroes.length === 0) {
      heroesGrid.innerHTML = `
        <div class="card premium-glass" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p>Нічога не знойдзена для "${category}"</p>
        </div>
      `;
      return;
    }
    
    heroesGrid.innerHTML = categoryHeroes.map(hero => `
      <div class="card premium-glass" onclick="app.showHeroModal(${hero.id})">
        <img class="thumb" src="${hero.image}" alt="${hero.name}" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23f0f0f0\"/><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"10\" fill=\"%23666\" text-anchor=\"middle\" dy=\".3em\">${hero.name}</text></svg>'">
        <h3>${hero.name}</h3>
        <p class="card-meta">${hero.years} • ${hero.field}</p>
        <p>${hero.fact.substring(0, 100)}...</p>
        <div class="card-actions">
          <button class="btn-ghost glass-ghost" onclick="event.stopPropagation(); app.showHeroModal(${hero.id})">
            <span class="btn-icon">📖</span>Дэталі
          </button>
        </div>
      </div>
    `).join('');
  }

  showHeroModal(heroId) {
    const hero = this.heroes.find(h => h.id === heroId);
    if (!hero) return;
    
    const modal = document.getElementById('heroModal');
    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalMeta = document.getElementById('modalMeta');
    const modalDesc = document.getElementById('modalDesc');
    
    if (!modal || !modalImg || !modalName || !modalMeta || !modalDesc) return;
    
    // Set content
    modalImg.src = hero.image;
    modalImg.alt = hero.name;
    modalName.textContent = hero.name;
    modalMeta.innerHTML = `
      <div>${hero.years}</div>
      <div>${hero.field} • ${hero.category}</div>
    `;
    
    // Get additional fact
    const additionalFact = this.getRandomFactForHero(hero.name);
    modalDesc.innerHTML = `
      <p>${hero.fact}</p>
      ${additionalFact ? `
        <div style="margin-top: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid var(--accent-primary);">
          <strong>📌 Дадатковы факт:</strong>
          <p style="margin: 8px 0 0; color: var(--text-secondary);">${additionalFact.fact}</p>
        </div>
      ` : ''}
    `;
    
    // Store current hero for sharing
    modal.dataset.currentHero = heroId;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Show Telegram back button
    if (this.tg && this.tg.BackButton) {
      this.tg.BackButton.show();
      this.tg.BackButton.onClick(() => this.closeModal());
    }
  }

  showAboutModal() {
    this.showHeroModal({
      id: 'about',
      name: 'Аб праекце',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">🇧🇾</text></svg>',
      years: '2024',
      field: 'Гісторыя і культура',
      category: 'Адукацыя',
      fact: 'Гэты праект прысвечаны памяці герояў Беларусі. Мы хочам захаваць і перадаць гісторыю подзвігаў нашых суайчыннікаў. Выкарыстоўвайце кнопку "🎲 Выпадковы факт" для адкрыцця цікавых фактаў!'
    });
  }

  showRandomFact() {
    if (this.facts.length === 0) return;
    
    const randomFact = this.facts[Math.floor(Math.random() * this.facts.length)];
    const hero = this.heroes.find(h => h.name === randomFact.name);
    
    this.showHeroModal({
      id: 'random-fact',
      name: `📚 ${randomFact.name}`,
      image: hero?.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">💡</text></svg>',
      years: hero?.years || '',
      field: 'Цікавы факт',
      category: 'Факт',
      fact: randomFact.fact
    });
  }

  getRandomFactForHero(heroName) {
    const heroFacts = this.facts.filter(fact => fact.name === heroName);
    return heroFacts.length > 0 ? heroFacts[Math.floor(Math.random() * heroFacts.length)] : null;
  }

  closeModal() {
    const modal = document.getElementById('heroModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    
    if (this.tg && this.tg.BackButton) {
      this.tg.BackButton.hide();
    }
  }

  isModalOpen() {
    const modal = document.getElementById('heroModal');
    return modal && !modal.classList.contains('hidden');
  }

  shareCurrentHero() {
    const modal = document.getElementById('heroModal');
    const heroId = modal?.dataset.currentHero;
    const hero = this.heroes.find(h => h.id == heroId);
    
    if (!hero) return;
    
    const shareText = `🇧🇾 ${hero.name}\n${hero.years}\n${hero.fact}\n\n#ГероіБеларусі`;
    
    if (this.tg) {
      try {
        this.tg.showPopup({
          title: 'Падзяліцца',
          message: `Хочаце падзяліцца інфармацыяй пра ${hero.name}?`,
          buttons: [
            {id: 'copy', type: 'default', text: '📋 Скапіяваць'},
            {id: 'close', type: 'cancel', text: '✕ Адмяніць'}
          ]
        }, (buttonId) => {
          if (buttonId === 'copy') {
            navigator.clipboard.writeText(shareText).then(
              () => this.showNotification('Тэкст скапіяваны! 🎉'),
              () => this.showNotification('Памылка капіравання 😔')
            );
          }
        });
      } catch (error) {
        this.fallbackShare(shareText);
      }
    } else {
      this.fallbackShare(shareText);
    }
  }

  fallbackShare(text) {
    if (navigator.share) {
      navigator.share({
        title: 'Герой Беларусі',
        text: text
      }).catch(() => {
        this.copyToClipboard(text);
      });
    } else {
      this.copyToClipboard(text);
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
      () => this.showNotification('Тэкст скапіяваны! 📋'),
      () => this.showNotification('Скапіруйце тэкст:\n\n' + text)
    );
  }

  showNotification(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      padding: 16px 24px;
      border-radius: 16px;
      font-weight: 500;
      z-index: 10000;
      text-align: center;
      box-shadow: var(--glass-shadow);
      animation: toastIn 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes toastIn {
    from { opacity: 0; transform: translate(-50%, -40%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translate(-50%, -50%); }
    to { opacity: 0; transform: translate(-50%, -60%); }
  }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new BelarusHeroesApp();
});

// Make app globally available
window.app = app;