// Belarusian Heroes Learning Platform
class BelarusHeroesApp {
  constructor() {
    // Initialize properties
    Object.assign(this, {
      heroes: [],
      facts: [],
      user: null,
      currentView: 'study',
      studiedHeroes: new Set(),
      heroOpinions: {},
      searchResults: [],
      currentHero: null
    });

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  startPerformanceMonitoring() {
    if ('performance' in window && 'mark' in performance) {
      performance.mark('app-init-start');
    }
  }

  endPerformanceMonitoring() {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      try {
        performance.mark('app-init-end');
        performance.measure('app-initialization', 'app-init-start', 'app-init-end');
        const measure = performance.getEntriesByName('app-initialization')[0];
        console.log(`App initialized in ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        console.warn('Performance monitoring failed:', e);
      }
    }
  }

  authenticateUser() {
    // Check if running in Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      const initData = webApp.initDataUnsafe;

      if (initData && initData.user) {
        this.user = {
          id: initData.user.id,
          firstName: initData.user.first_name,
          lastName: initData.user.last_name,
          username: initData.user.username,
          photoUrl: initData.user.photo_url
        };
        console.log('User authenticated:', this.user);
        return true;
      }
    }

    // Fallback for development
    console.warn('Not running in Telegram Web App, using demo user');
    this.user = {
      id: 'demo',
      firstName: 'Demo',
      lastName: 'User',
      username: 'demo_user'
    };
    return true;
  }

  checkFirstVisit() {
    const userKey = `belarusHeroes_${this.user.id}`;
    const hasVisited = localStorage.getItem(`${userKey}_visited`);
    return !hasVisited;
  }

  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal welcome-modal active">
        <div class="welcome-content">
          <div class="welcome-header">
            <div class="welcome-logo">🇧🇾</div>
            <h1>Вітаем у Героях Беларусі!</h1>
            <p>Інтэрактыўная платформа для вывучэння гісторыі Беларусі</p>
          </div>

          <div class="welcome-user-info">
            <div class="user-avatar">
              ${this.user.photoUrl ? `<img src="${this.user.photoUrl}" alt="Avatar">` : '👤'}
            </div>
            <div class="user-details">
              <h3>${this.user.firstName} ${this.user.lastName || ''}</h3>
              <p>@${this.user.username || 'telegram_user'}</p>
            </div>
          </div>

          <div class="welcome-features">
            <div class="feature">
              <span class="feature-icon">📚</span>
              <span>Вывучай герояў па сферах</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔍</span>
              <span>Шукай і адкрывай новых герояў</span>
            </div>
            <div class="feature">
              <span class="feature-icon">💡</span>
              <span>Чытай цікавыя факты</span>
            </div>
            <div class="feature">
              <span class="feature-icon">💬</span>
              <span>Дадавай свае меркаванні</span>
            </div>
          </div>

          <button id="startAppBtn" class="btn-primary welcome-btn">
            Пачаць падарожжа! 🚀
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listener for start button
    document.getElementById('startAppBtn').addEventListener('click', () => {
      const userKey = `belarusHeroes_${this.user.id}`;
      localStorage.setItem(`${userKey}_visited`, 'true');
      document.body.removeChild(modal);
      this.renderApp();
      this.setupEventListeners();
      this.showView(this.currentView);
    });
  }

  async init() {
    try {
      // Show loading state
      this.showLoadingState();

      // Authenticate user first
      if (!this.authenticateUser()) {
        throw new Error('Authentication failed');
      }

      // Load data asynchronously
      await this.loadData();

      // Load user data
      this.loadUserData();

      // Hide loading state
      this.hideLoadingState();

      // Check if first visit
      if (this.checkFirstVisit()) {
        this.showWelcomeModal();
      } else {
        this.renderApp();
        this.setupEventListeners();
        this.showView(this.currentView);
      }

      // End performance monitoring
      this.endPerformanceMonitoring();

    } catch (error) {
      console.error('Error initializing app:', error);
      this.showToast('❌ Памылка ініцыялізацыі прыкладання', 5000);
      this.endPerformanceMonitoring();
    }
  }

  async loadData() {
    try {
      // Load heroes data
      const heroesResponse = await fetch('heroes.json');
      if (!heroesResponse.ok) {
        throw new Error(`Failed to load heroes: ${heroesResponse.status}`);
      }
      this.heroes = await heroesResponse.json();

      // Load facts data
      const factsResponse = await fetch('facts.json');
      if (!factsResponse.ok) {
        throw new Error(`Failed to load facts: ${factsResponse.status}`);
      }
      this.facts = await factsResponse.json();

      console.log(`Loaded ${this.heroes.length} heroes and ${this.facts.length} facts`);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('❌ Памылка загрузкі даных', 5000);
      // Fallback data
      this.heroes = [];
      this.facts = [];
    }
  }

  loadUserData() {
    try {
      const userKey = `belarusHeroes_${this.user.id}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.studiedHeroes = new Set(data.studiedHeroes || []);
        this.heroOpinions = data.heroOpinions || {};
        this.currentView = data.currentView || 'study';
      } else {
        // New user - add some default heroes
        this.studiedHeroes.add(1); // Франциск Скорина
        this.studiedHeroes.add(3); // Янка Купала
      }
    } catch (e) {
      console.warn('Failed to load user data:', e);
      // Fallback
      this.studiedHeroes.add(1);
      this.studiedHeroes.add(3);
    }
  }

  saveUserData() {
    try {
      const userKey = `belarusHeroes_${this.user.id}`;
      const data = {
        studiedHeroes: Array.from(this.studiedHeroes),
        heroOpinions: this.heroOpinions,
        currentView: this.currentView
      };
      localStorage.setItem(userKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save user data:', e);
    }
  }

  setupEventListeners() {
    // Navigation tabs
    this.addEvent('#studyTab', 'click', () => this.showView('study'));
    this.addEvent('#searchTab', 'click', () => this.showView('search'));
    this.addEvent('#randomTab', 'click', () => this.showView('random'));
    this.addEvent('#profileTab', 'click', () => this.showView('profile'));

    // Search functionality
    this.addEvent('#searchInput', 'input', (e) => this.handleSearch(e.target.value));

    // Random fact button
    this.addEvent('#getRandomFact', 'click', () => this.showRandomFact());

    // Hero actions
    document.addEventListener('click', (e) => {
      const heroCard = e.target.closest('.hero-card');
      if (heroCard) {
        const heroId = parseInt(heroCard.dataset.heroId);
        this.showHeroDetail(heroId);
        return;
      }

      if (e.target.classList.contains('study-hero-btn')) {
        const heroId = parseInt(e.target.dataset.heroId);
        this.studyHero(heroId);
        return;
      }

      if (e.target.classList.contains('add-opinion-btn')) {
        const heroId = parseInt(e.target.dataset.heroId);
        this.showAddOpinionModal(heroId);
        return;
      }

      if (e.target.classList.contains('learn-more-btn')) {
        const heroId = parseInt(e.target.dataset.heroId);
        this.showHeroDetail(heroId);
        return;
      }
    });

    // Opinion form
    this.addEvent('#submitOpinion', 'click', () => this.submitOpinion());
    this.addEvent('#cancelOpinion', 'click', () => this.hideModal('opinionModal'));

    // Modal close buttons
    this.addEvent('#closeHeroModal', 'click', () => this.hideModal('heroModal'));

    // Modal overlay
    this.addEvent('#modalOverlay', 'click', () => this.hideAllModals());
  }

  addEvent(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="logo">🇧🇾</div>
          <div class="title-section">
            <h1>Героі Беларусі</h1>
            <p>Вывучай і пазнавай</p>
          </div>
          <div class="user-info">
            <span class="user-name">${this.user.firstName}</span>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="nav-tabs">
        <button id="studyTab" class="nav-tab active" data-view="study">
          <span class="nav-icon">📚</span>
          <span>Вывучэнне</span>
        </button>
        <button id="searchTab" class="nav-tab" data-view="search">
          <span class="nav-icon">🔍</span>
          <span>Пошук</span>
        </button>
        <button id="randomTab" class="nav-tab" data-view="random">
          <span class="nav-icon">💡</span>
          <span>Факты</span>
        </button>
        <button id="profileTab" class="nav-tab" data-view="profile">
          <span class="nav-icon">👤</span>
          <span>Профіль</span>
        </button>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <div id="studyView" class="view active">
          <div class="view-header">
            <h2>Вывучай герояў па сферах</h2>
          </div>
          <div id="fieldsContainer" class="fields-container"></div>
        </div>

        <div id="searchView" class="view">
          <div class="view-header">
            <h2>Пошук герояў</h2>
            <div class="search-container">
              <input type="text" id="searchInput" placeholder="Увядзіце імя героя або сферу...">
            </div>
          </div>
          <div id="searchResults" class="search-results"></div>
        </div>

        <div id="randomView" class="view">
          <div class="view-header">
            <h2>Цікавыя факты</h2>
          </div>
          <div class="random-fact-container">
            <button id="getRandomFact" class="btn-primary">Атрымаць выпадковы факт</button>
            <div id="randomFactDisplay" class="fact-display"></div>
          </div>
        </div>

        <div id="profileView" class="view">
          <div class="view-header">
            <h2>Ваш профіль</h2>
          </div>
          <div class="profile-content">
            <div class="profile-stats">
              <div class="stat-card">
                <div class="stat-number">${this.studiedHeroes.size}</div>
                <div class="stat-label">Вывучана герояў</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${Object.keys(this.heroOpinions).length}</div>
                <div class="stat-label">Дададзена меркаванняў</div>
              </div>
            </div>
            <div id="studiedHeroesList" class="studied-heroes-list"></div>
          </div>
        </div>
      </main>

      <!-- Modals -->
      <div class="modal-overlay" id="modalOverlay"></div>

      <!-- Hero Detail Modal -->
      <div class="modal" id="heroModal">
        <div class="modal-header">
          <h2 id="heroModalTitle"></h2>
          <button class="modal-close" id="closeHeroModal">✕</button>
        </div>
        <div class="modal-body" id="heroModalBody"></div>
      </div>

      <!-- Add Opinion Modal -->
      <div class="modal" id="opinionModal">
        <div class="modal-header">
          <h2>Дадаць меркаванне</h2>
          <button class="modal-close" id="cancelOpinion">✕</button>
        </div>
        <div class="modal-body">
          <textarea id="opinionText" placeholder="Напішыце ваша меркаванне пра гэтага героя..." rows="4"></textarea>
          <div class="modal-footer">
            <button id="submitOpinion" class="btn-primary">Дадаць</button>
          </div>
        </div>
      </div>
    `;

    this.renderStudyView();
    this.renderProfileView();
  }

  showView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.getElementById(`${viewName}Tab`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    this.currentView = viewName;
    this.saveUserData();

    // Special handling for views
    if (viewName === 'search') {
      document.getElementById('searchInput').focus();
    }
  }

  renderStudyView() {
    const container = document.getElementById('fieldsContainer');
    if (!container) return;

    // Group heroes by field
    const fields = {};
    this.heroes.forEach(hero => {
      if (!fields[hero.category]) {
        fields[hero.category] = [];
      }
      fields[hero.category].push(hero);
    });

    container.innerHTML = Object.entries(fields).map(([field, heroes]) => `
      <div class="field-section">
        <h3 class="field-title">${field}</h3>
        <div class="heroes-grid">
          ${heroes.map(hero => {
            const isStudied = this.studiedHeroes.has(hero.id);
            return `
              <div class="hero-card ${isStudied ? 'studied' : ''}" data-hero-id="${hero.id}">
                <img src="${hero.image}" alt="${hero.name}" class="hero-image" onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name.split(' ').map(n => n[0]).join('')}</text></svg>'">
                <div class="hero-info">
                  <h4 class="hero-name">${hero.name}</h4>
                  <p class="hero-years">${hero.years}</p>
                  <p class="hero-field">${hero.field}</p>
                </div>
                <div class="hero-actions">
                  ${isStudied ?
                    '<span class="studied-badge">✓ Вывучаны</span>' :
                    `<button class="study-hero-btn btn-secondary" data-hero-id="${hero.id}">Вывучыць</button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  handleSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (!query.trim()) {
      resultsContainer.innerHTML = '<p class="no-results">Увядзіце тэкст для пошуку</p>';
      return;
    }

    const filteredHeroes = this.heroes.filter(hero =>
      hero.name.toLowerCase().includes(query.toLowerCase()) ||
      hero.field.toLowerCase().includes(query.toLowerCase()) ||
      hero.category.toLowerCase().includes(query.toLowerCase()) ||
      hero.fact.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredHeroes.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">Героі не знойдзены</p>';
      return;
    }

    resultsContainer.innerHTML = `
      <div class="search-results-grid">
        ${filteredHeroes.map(hero => {
          const isStudied = this.studiedHeroes.has(hero.id);
          return `
            <div class="hero-card ${isStudied ? 'studied' : ''}" data-hero-id="${hero.id}">
              <img src="${hero.image}" alt="${hero.name}" class="hero-image" onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name.split(' ').map(n => n[0]).join('')}</text></svg>'">
              <div class="hero-info">
                <h4 class="hero-name">${hero.name}</h4>
                <p class="hero-years">${hero.years}</p>
                <p class="hero-field">${hero.field}</p>
              </div>
              <div class="hero-actions">
                ${isStudied ?
                  '<span class="studied-badge">✓ Вывучаны</span>' :
                  `<button class="study-hero-btn btn-secondary" data-hero-id="${hero.id}">Вывучыць</button>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  showRandomFact() {
    const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
    const display = document.getElementById('randomFactDisplay');

    if (fact && display) {
      const hero = this.heroes.find(h => h.id === fact.id);
      display.innerHTML = `
        <div class="fact-card">
          <div class="fact-hero">${fact.name}</div>
          <div class="fact-text">${fact.fact}</div>
          ${hero ? `<button class="btn-secondary learn-more-btn" data-hero-id="${hero.id}">Пазнаць больш</button>` : ''}
        </div>
      `;
    }
  }

  renderProfileView() {
    const list = document.getElementById('studiedHeroesList');
    if (!list) return;

    const studiedHeroes = Array.from(this.studiedHeroes)
      .map(id => this.heroes.find(h => h.id === id))
      .filter(h => h);

    if (studiedHeroes.length === 0) {
      list.innerHTML = '<p class="no-heroes">Вы яшчэ не вывучылі ніводнага героя</p>';
      return;
    }

    list.innerHTML = `
      <h3>Вывучаныя героі</h3>
      <div class="studied-heroes-grid">
        ${studiedHeroes.map(hero => `
          <div class="hero-card studied" data-hero-id="${hero.id}">
            <img src="${hero.image}" alt="${hero.name}" class="hero-image" onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name.split(' ').map(n => n[0]).join('')}</text></svg>'">
            <div class="hero-info">
              <h4 class="hero-name">${hero.name}</h4>
              <p class="hero-years">${hero.years}</p>
              <p class="hero-field">${hero.field}</p>
            </div>
            <div class="hero-actions">
              <button class="add-opinion-btn btn-secondary" data-hero-id="${hero.id}">Дадаць меркаванне</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  showHeroDetail(heroId) {
    const hero = this.heroes.find(h => h.id === heroId);
    if (!hero) return;

    const isStudied = this.studiedHeroes.has(heroId);
    const opinions = this.heroOpinions[heroId] || [];

    document.getElementById('heroModalTitle').textContent = hero.name;
    document.getElementById('heroModalBody').innerHTML = `
      <div class="hero-detail">
        <div class="hero-detail-image">
          <img src="${hero.image}" alt="${hero.name}" onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle" dy=".3em">🖼️</text></svg>'">
        </div>
        <div class="hero-detail-info">
          <div class="hero-meta">
            <span class="hero-years">${hero.years}</span>
            <span class="hero-field">${hero.field}</span>
            <span class="hero-category">${hero.category}</span>
          </div>
          ${hero.bio ? `
            <div class="hero-bio">
              <h4>Біяграфія:</h4>
              <p>${hero.bio}</p>
            </div>
          ` : ''}
          <div class="hero-fact">
            <h4>Цікавы факт:</h4>
            <p>${hero.fact}</p>
          </div>
          ${isStudied ? `
            <div class="hero-actions">
              <button class="add-opinion-btn btn-secondary" data-hero-id="${heroId}">Дадаць меркаванне</button>
            </div>
          ` : `
            <div class="hero-actions">
              <button class="study-hero-btn btn-primary" data-hero-id="${heroId}">Вывучыць гэтага героя</button>
            </div>
          `}
        </div>
        ${opinions.length > 0 ? `
          <div class="hero-opinions">
            <h4>Меркаванні карыстальнікаў:</h4>
            ${opinions.map(opinion => `
              <div class="opinion-item">
                <div class="opinion-author">${opinion.author}</div>
                <div class="opinion-text">${opinion.text}</div>
                <div class="opinion-date">${new Date(opinion.date).toLocaleDateString('be-BY')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    this.showModal('heroModal');
  }

  studyHero(heroId) {
    this.studiedHeroes.add(heroId);
    this.saveUserData();
    this.renderStudyView();
    this.renderProfileView();
    this.showHeroDetail(heroId);
    this.showToast('✅ Герой дададзены да вывучаных!');
  }

  showAddOpinionModal(heroId) {
    this.currentHero = heroId;
    document.getElementById('opinionText').value = '';
    this.showModal('opinionModal');
  }

  submitOpinion() {
    const text = document.getElementById('opinionText').value.trim();
    if (!text) {
      this.showToast('❌ Увядзіце тэкст меркавання');
      return;
    }

    if (!this.heroOpinions[this.currentHero]) {
      this.heroOpinions[this.currentHero] = [];
    }

    this.heroOpinions[this.currentHero].push({
      author: this.user.firstName,
      text: text,
      date: new Date().toISOString()
    });

    this.saveUserData();
    this.hideModal('opinionModal');
    this.showHeroDetail(this.currentHero);
    this.showToast('✅ Меркаванне дададзена!');
  }

  // Modal management
  showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
  }

  hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.getElementById('modalOverlay').classList.remove('active');
  }

  showLoadingState() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Загружаем...</p>
      </div>
    `;
  }

  hideLoadingState() {
    // Will be replaced by renderApp
  }

  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-in reverse';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  try {
    window.app = new BelarusHeroesApp();
    await window.app.init();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});