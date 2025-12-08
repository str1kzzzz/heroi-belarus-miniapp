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
      favoriteHeroes: new Set(),
      searchResults: [],
      currentHero: null,
      quizQuestions: [],
      currentQuestionIndex: 0,
      quizScore: 0,
      quizAnswers: [],
      imageCache: new Map()
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
        <div class="modal-header">
          <h2>Вітаем у Героях Беларусі!</h2>
          <button class="modal-close" id="closeWelcomeModal">✕</button>
        </div>
        <div class="welcome-content">
          <div class="welcome-header">
            <div class="welcome-logo">🇧🇾</div>
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
              <span class="feature-icon">🧠</span>
              <span>Правярайце веды ў тэсце (15-20 пытанняў)</span>
            </div>
            <div class="feature">
              <span class="feature-icon">❤️</span>
              <span>Дадавайце герояў да ўлюбёных</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span>Сочыце за сваёй статыстыкай</span>
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

    // Add event listener for close button
    document.getElementById('closeWelcomeModal').addEventListener('click', () => {
      const userKey = `belarusHeroes_${this.user.id}`;
      localStorage.setItem(`${userKey}_visited`, 'true');
      document.body.removeChild(modal);
      this.renderApp();
      this.setupEventListeners();
      this.showView(this.currentView);
    });

    // Add event listener for overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        const userKey = `belarusHeroes_${this.user.id}`;
        localStorage.setItem(`${userKey}_visited`, 'true');
        document.body.removeChild(modal);
        this.renderApp();
        this.setupEventListeners();
        this.showView(this.currentView);
      }
    });

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
      const heroesResponse = await fetch('data/heroes.json');
      if (!heroesResponse.ok) {
        throw new Error(`Failed to load heroes: ${heroesResponse.status}`);
      }
      this.heroes = await heroesResponse.json();

      // Load facts data
      const factsResponse = await fetch('data/facts.json');
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
        this.favoriteHeroes = new Set(data.favoriteHeroes || []);
        this.currentView = data.currentView || 'study';

        // Always use dark theme
      } else {
        // New user - add some default heroes
        this.studiedHeroes.add(1); // Франциск Скорина
        this.studiedHeroes.add(3); // Янка Купала

        // Always use dark theme
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
        favoriteHeroes: Array.from(this.favoriteHeroes),
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
    this.addEvent('#quizTab', 'click', () => this.showView('quiz'));
    this.addEvent('#compareTab', 'click', () => this.showView('compare'));
    this.addEvent('#statsTab', 'click', () => this.showView('stats'));
    this.addEvent('#profileTab', 'click', () => this.showView('profile'));


    // Search functionality
    this.addEvent('#searchInput', 'input', (e) => this.handleSearch(e.target.value));

    // Random fact button
    this.addEvent('#getRandomFact', 'click', () => this.showRandomFact());

    // Quiz functionality
    this.addEvent('#startQuiz', 'click', () => this.startQuiz());
    this.addEvent('#nextQuestion', 'click', () => this.nextQuestion());
    this.addEvent('#restartQuiz', 'click', () => this.restartQuiz());

    // Comparison functionality
    this.addEvent('#hero1Select', 'change', () => this.updateComparison());
    this.addEvent('#hero2Select', 'change', () => this.updateComparison());

    // Timeline functionality
    this.addEvent('#timelineTab', 'click', () => this.showView('timeline'));

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

      if (e.target.classList.contains('favorite-btn')) {
        const heroId = parseInt(e.target.dataset.heroId);
        this.toggleFavorite(heroId);
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
        <button id="quizTab" class="nav-tab" data-view="quiz">
          <span class="nav-icon">🧠</span>
          <span>Тэст</span>
        </button>
        <button id="compareTab" class="nav-tab" data-view="compare">
          <span class="nav-icon">⚖️</span>
          <span>Параўнанне</span>
        </button>
        <button id="timelineTab" class="nav-tab" data-view="timeline">
          <span class="nav-icon">⏰</span>
          <span>Храналогія</span>
        </button>
        <button id="statsTab" class="nav-tab" data-view="stats">
          <span class="nav-icon">📊</span>
          <span>Статыстыка</span>
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

        <div id="quizView" class="view">
          <div class="view-header">
            <h2>Праверце свае веды</h2>
          </div>
          <div class="quiz-container">
            <div id="quizStart" class="quiz-start">
              <p>Пройдзіце тэст па беларускіх героях!<br><small>15-20 выпадковых пытанняў розных тыпаў</small></p>
              <button id="startQuiz" class="btn-primary">Пачаць тэст</button>
            </div>
            <div id="quizQuestion" class="quiz-question" style="display: none;">
              <div class="question-counter">Пытанне <span id="questionNumber">1</span> з <span id="totalQuestions">15-20</span></div>
              <div class="question-text" id="questionText"></div>
              <div class="answer-options" id="answerOptions"></div>
              <div class="quiz-actions">
                <button id="nextQuestion" class="btn-primary" style="display: none;">Наступнае пытанне</button>
              </div>
            </div>
            <div id="quizResults" class="quiz-results" style="display: none;">
              <h3>Вынікі тэсту</h3>
              <div class="quiz-score">
                <div class="score-number" id="finalScore">0/10</div>
                <div class="score-percentage" id="scorePercentage">0%</div>
              </div>
              <div class="quiz-feedback" id="quizFeedback"></div>
              <button id="restartQuiz" class="btn-primary">Прайсці тэст яшчэ раз</button>
            </div>
          </div>
        </div>

        <div id="compareView" class="view">
          <div class="view-header">
            <h2>Параўнанне герояў</h2>
          </div>
          <div class="compare-container">
            <div class="hero-selector">
              <div class="selector-section">
                <h3>Выберыце першага героя</h3>
                <select id="hero1Select" class="hero-select">
                  <option value="">-- Выберыце героя --</option>
                </select>
              </div>
              <div class="selector-section">
                <h3>Выберыце другога героя</h3>
                <select id="hero2Select" class="hero-select">
                  <option value="">-- Выберыце героя --</option>
                </select>
              </div>
            </div>
            <div id="comparisonResult" class="comparison-result" style="display: none;">
              <div class="comparison-grid">
                <div class="comparison-hero" id="hero1Comparison"></div>
                <div class="comparison-divider">
                  <div class="vs-badge">VS</div>
                </div>
                <div class="comparison-hero" id="hero2Comparison"></div>
              </div>
            </div>
          </div>
        </div>

        <div id="timelineView" class="view">
          <div class="view-header">
            <h2>Храналогія герояў Беларусі</h2>
            <p>Ад старажытных часоў да нашых дзён</p>
          </div>
          <div class="timeline-container">
            <div id="timelineContent" class="timeline-content"></div>
          </div>
        </div>

        <div id="statsView" class="view">
          <div class="view-header">
            <h2>Ваша статыстыка</h2>
          </div>
          <div class="stats-container">
            <div class="stats-overview">
              <div class="stat-card-large">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                  <div class="stat-number-large" id="totalStudied">0</div>
                  <div class="stat-label-large">Вывучана герояў</div>
                  <div class="stat-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" id="studiedProgress"></div>
                    </div>
                    <span class="progress-text" id="studiedProgressText">0%</span>
                  </div>
                </div>
              </div>

              <div class="stat-card-large">
                <div class="stat-icon">❤️</div>
                <div class="stat-content">
                  <div class="stat-number-large" id="totalFavorites">0</div>
                  <div class="stat-label-large">Улюбёных герояў</div>
                  <div class="stat-subtext" id="favoritesPercentage">0% ад вывучаных</div>
                </div>
              </div>

              <div class="stat-card-large">
                <div class="stat-icon">🧠</div>
                <div class="stat-content">
                  <div class="stat-number-large" id="totalQuizzes">0</div>
                  <div class="stat-label-large">Пройдзена тэстаў</div>
                  <div class="stat-subtext" id="averageScore">Сярэдні бал: 0%</div>
                </div>
              </div>

              <div class="stat-card-large">
                <div class="stat-icon">💬</div>
                <div class="stat-content">
                  <div class="stat-number-large" id="totalOpinions">0</div>
                  <div class="stat-label-large">Дададзена меркаванняў</div>
                  <div class="stat-subtext" id="opinionsPerHero">0 на героя</div>
                </div>
              </div>
            </div>

            <div class="stats-details">
              <div class="stats-section">
                <h3>Прагрэс па сферах</h3>
                <div id="fieldProgress" class="field-progress-list"></div>
              </div>

              <div class="stats-section">
                <h3>Гісторыя тэстаў</h3>
                <div id="quizHistory" class="quiz-history-list"></div>
              </div>

              <div class="stats-section">
                <h3>Дасягненні</h3>
                <div id="achievements" class="achievements-list"></div>
              </div>
            </div>
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
                <div class="stat-number">${this.favoriteHeroes.size}</div>
                <div class="stat-label">Улюбёных герояў</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${this.getQuizStats().totalQuizzes}</div>
                <div class="stat-label">Пройдзена тэстаў</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${this.getQuizStats().averageScore}%</div>
                <div class="stat-label">Сярэдні бал</div>
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
    this.renderCompareView();
    this.renderTimelineView();
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

  renderSearchView() {
    // This method is called when search view needs to be re-rendered
    // The search results are already handled by handleSearch method
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
            const isFavorite = this.favoriteHeroes.has(hero.id);
            return `
              <div class="hero-card ${isStudied ? 'studied' : ''}" data-hero-id="${hero.id}">
                <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" class="hero-image" data-hero-id="${hero.id}">
                <div class="hero-info">
                  <h4 class="hero-name">${hero.name}</h4>
                  <p class="hero-years">${hero.years}</p>
                  <p class="hero-field">${hero.field}</p>
                </div>
                <div class="hero-actions">
                  <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-hero-id="${hero.id}" title="${isFavorite ? 'Выдаліць з улюбёных' : 'Дадаць да ўлюбёных'}">
                    ${isFavorite ? '❤️' : '🤍'}
                  </button>
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

    // Load images for all hero cards
    container.querySelectorAll('.hero-image').forEach(img => {
      const heroId = parseInt(img.dataset.heroId);
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero) {
        this.loadHeroImage(hero, img);
      }
    });
  }

  renderSearchView() {
    // This method is called when search view needs to be re-rendered
    // The search results are already handled by handleSearch method
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
          const isFavorite = this.favoriteHeroes.has(hero.id);
          return `
            <div class="hero-card ${isStudied ? 'studied' : ''}" data-hero-id="${hero.id}">
              <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" class="hero-image" data-hero-id="${hero.id}">
              <div class="hero-info">
                <h4 class="hero-name">${hero.name}</h4>
                <p class="hero-years">${hero.years}</p>
                <p class="hero-field">${hero.field}</p>
              </div>
              <div class="hero-actions">
                <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-hero-id="${hero.id}" title="${isFavorite ? 'Выдаліць з улюбёных' : 'Дадаць да ўлюбёных'}">
                  ${isFavorite ? '❤️' : '🤍'}
                </button>
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

    // Load images for search results
    resultsContainer.querySelectorAll('.hero-image').forEach(img => {
      const heroId = parseInt(img.dataset.heroId);
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero) {
        this.loadHeroImage(hero, img);
      }
    });
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
    const container = document.getElementById('studiedHeroesList');
    if (!container) return;

    const studiedHeroes = Array.from(this.studiedHeroes)
      .map(id => this.heroes.find(h => h.id === id))
      .filter(h => h);

    const favoriteHeroes = Array.from(this.favoriteHeroes)
      .map(id => this.heroes.find(h => h.id === id))
      .filter(h => h);

    let html = '';

    // Favorites section
    if (favoriteHeroes.length > 0) {
      html += `
        <div class="favorites-section">
          <h3>❤️ Улюбёныя героі</h3>
          <div class="studied-heroes-grid">
            ${favoriteHeroes.map(hero => {
              const isStudied = this.studiedHeroes.has(hero.id);
              return `
                <div class="hero-card ${isStudied ? 'studied' : ''}" data-hero-id="${hero.id}">
                  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" class="hero-image" data-hero-id="${hero.id}">
                  <div class="hero-info">
                    <h4 class="hero-name">${hero.name}</h4>
                    <p class="hero-years">${hero.years}</p>
                    <p class="hero-field">${hero.field}</p>
                  </div>
                  <div class="hero-actions">
                    <button class="favorite-btn favorited" data-hero-id="${hero.id}" title="Выдаліць з улюбёных">
                      ❤️
                    </button>
                    <button class="add-opinion-btn btn-secondary" data-hero-id="${hero.id}">Дадаць меркаванне</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Studied heroes section
    if (studiedHeroes.length > 0) {
      html += `
        <div class="studied-section">
          <h3>📚 Вывучаныя героі</h3>
          <div class="studied-heroes-grid">
            ${studiedHeroes.map(hero => {
              const isFavorite = this.favoriteHeroes.has(hero.id);
              return `
                <div class="hero-card studied" data-hero-id="${hero.id}">
                  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" class="hero-image" data-hero-id="${hero.id}">
                  <div class="hero-info">
                    <h4 class="hero-name">${hero.name}</h4>
                    <p class="hero-years">${hero.years}</p>
                    <p class="hero-field">${hero.field}</p>
                  </div>
                  <div class="hero-actions">
                    <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-hero-id="${hero.id}" title="${isFavorite ? 'Выдаліць з улюбёных' : 'Дадаць да ўлюбёных'}">
                      ${isFavorite ? '❤️' : '🤍'}
                    </button>
                    <button class="add-opinion-btn btn-secondary" data-hero-id="${hero.id}">Дадаць меркаванне</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (html === '') {
      html = '<p class="no-heroes">Вы яшчэ не вывучылі ніводнага героя</p>';
    }

    container.innerHTML = html;

    // Load images for profile heroes
    container.querySelectorAll('.hero-image').forEach(img => {
      const heroId = parseInt(img.dataset.heroId);
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero) {
        this.loadHeroImage(hero, img);
      }
    });
  }

  renderStatsView() {
    // Overview stats
    const totalHeroes = this.heroes.length;
    const studiedCount = this.studiedHeroes.size;
    const favoriteCount = this.favoriteHeroes.size;
    const quizStats = this.getQuizStats();
    const opinionCount = Object.keys(this.heroOpinions).length;

    document.getElementById('totalStudied').textContent = studiedCount;
    document.getElementById('totalFavorites').textContent = favoriteCount;
    document.getElementById('totalQuizzes').textContent = quizStats.totalQuizzes;
    document.getElementById('totalOpinions').textContent = opinionCount;

    // Progress calculations
    const studiedPercentage = totalHeroes > 0 ? Math.round((studiedCount / totalHeroes) * 100) : 0;
    document.getElementById('studiedProgress').style.width = `${studiedPercentage}%`;
    document.getElementById('studiedProgressText').textContent = `${studiedPercentage}%`;

    const favoritesPercentage = studiedCount > 0 ? Math.round((favoriteCount / studiedCount) * 100) : 0;
    document.getElementById('favoritesPercentage').textContent = `${favoritesPercentage}% ад вывучаных`;

    document.getElementById('averageScore').textContent = `Сярэдні бал: ${quizStats.averageScore}%`;

    const opinionsPerHero = studiedCount > 0 ? (opinionCount / studiedCount).toFixed(1) : 0;
    document.getElementById('opinionsPerHero').textContent = `${opinionsPerHero} на героя`;

    // Field progress
    this.renderFieldProgress();

    // Quiz history
    this.renderQuizHistory();

    // Achievements
    this.renderAchievements();
  }

  renderFieldProgress() {
    const container = document.getElementById('fieldProgress');
    if (!container) return;

    // Group heroes by field
    const fieldStats = {};
    this.heroes.forEach(hero => {
      if (!fieldStats[hero.category]) {
        fieldStats[hero.category] = { total: 0, studied: 0 };
      }
      fieldStats[hero.category].total++;
      if (this.studiedHeroes.has(hero.id)) {
        fieldStats[hero.category].studied++;
      }
    });

    const html = Object.entries(fieldStats).map(([field, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.studied / stats.total) * 100) : 0;
      return `
        <div class="field-progress-item">
          <div class="field-name">${field}</div>
          <div class="field-stats">${stats.studied}/${stats.total}</div>
          <div class="field-progress-bar">
            <div class="field-progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="field-percentage">${percentage}%</div>
        </div>
      `;
    }).join('');

    container.innerHTML = html || '<p class="no-data">Няма даных па сферах</p>';
  }

  renderQuizHistory() {
    const container = document.getElementById('quizHistory');
    if (!container) return;

    try {
      const userKey = `belarusHeroes_${this.user.id}`;
      const saved = localStorage.getItem(userKey);
      const data = saved ? JSON.parse(saved) : {};
      const quizResults = data.quizResults || [];

      if (quizResults.length === 0) {
        container.innerHTML = '<p class="no-data">Вы яшчэ не праходзілі тэсты</p>';
        return;
      }

      // Show last 5 quiz results
      const recentResults = quizResults.slice(-5).reverse();
      const html = recentResults.map((quiz, index) => {
        const date = new Date(quiz.date).toLocaleDateString('be-BY');
        const scoreClass = quiz.percentage >= 80 ? 'excellent' :
                          quiz.percentage >= 60 ? 'good' :
                          quiz.percentage >= 40 ? 'average' : 'poor';
        return `
          <div class="quiz-history-item">
            <div class="quiz-date">${date}</div>
            <div class="quiz-score ${scoreClass}">${quiz.score}/${quiz.totalQuestions} (${quiz.percentage}%)</div>
          </div>
        `;
      }).join('');

      container.innerHTML = html;
    } catch (e) {
      console.warn('Failed to render quiz history:', e);
      container.innerHTML = '<p class="no-data">Памылка загрузкі гісторыі</p>';
    }
  }

  renderAchievements() {
    const container = document.getElementById('achievements');
    if (!container) return;

    const achievements = [];

    // Study achievements
    if (this.studiedHeroes.size >= 1) {
      achievements.push({
        icon: '🎓',
        title: 'Першы крок',
        description: 'Вывучылі першага героя',
        unlocked: true
      });
    }

    if (this.studiedHeroes.size >= 5) {
      achievements.push({
        icon: '📚',
        title: 'Пачатковец',
        description: 'Вывучылі 5 герояў',
        unlocked: true
      });
    }

    if (this.studiedHeroes.size >= 10) {
      achievements.push({
        icon: '🎯',
        title: 'Эксперт',
        description: 'Вывучылі 10 герояў',
        unlocked: true
      });
    }

    if (this.studiedHeroes.size >= this.heroes.length) {
      achievements.push({
        icon: '🏆',
        title: 'Майстар',
        description: 'Вывучылі ўсіх герояў',
        unlocked: true
      });
    }

    // Quiz achievements
    const quizStats = this.getQuizStats();
    if (quizStats.totalQuizzes >= 1) {
      achievements.push({
        icon: '🧠',
        title: 'Тэст пройдзены',
        description: 'Прайшлі першы тэст',
        unlocked: true
      });
    }

    if (quizStats.averageScore >= 80) {
      achievements.push({
        icon: '⭐',
        title: 'Выдатнік',
        description: 'Сярэдні бал тэстаў 80%+',
        unlocked: true
      });
    }

    // Favorite achievements
    if (this.favoriteHeroes.size >= 3) {
      achievements.push({
        icon: '❤️',
        title: 'Любімчык',
        description: 'Дадалі 3 герояў да ўлюбёных',
        unlocked: true
      });
    }

    // Opinion achievements
    if (Object.keys(this.heroOpinions).length >= 3) {
      achievements.push({
        icon: '💬',
        title: 'Каментатар',
        description: 'Дадалі 3 меркаванні',
        unlocked: true
      });
    }

    if (achievements.length === 0) {
      container.innerHTML = '<p class="no-data">Вы яшчэ не атрымалі дасягненняў</p>';
      return;
    }

    const html = achievements.map(achievement => `
      <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  renderCompareView() {
    const hero1Select = document.getElementById('hero1Select');
    const hero2Select = document.getElementById('hero2Select');

    if (!hero1Select || !hero2Select) return;

    // Populate hero selects
    const options = this.heroes.map(hero => `
      <option value="${hero.id}">${hero.name}</option>
    `).join('');

    hero1Select.innerHTML = '<option value="">-- Выберыце героя --</option>' + options;
    hero2Select.innerHTML = '<option value="">-- Выберыце героя --</option>' + options;
  }

  updateComparison() {
    const hero1Id = document.getElementById('hero1Select').value;
    const hero2Id = document.getElementById('hero2Select').value;
    const resultContainer = document.getElementById('comparisonResult');

    if (!hero1Id || !hero2Id) {
      resultContainer.style.display = 'none';
      return;
    }

    const hero1 = this.heroes.find(h => h.id == hero1Id);
    const hero2 = this.heroes.find(h => h.id == hero2Id);

    if (!hero1 || !hero2) {
      resultContainer.style.display = 'none';
      return;
    }

    const hero1Html = this.renderComparisonHero(hero1, 1);
    const hero2Html = this.renderComparisonHero(hero2, 2);

    document.getElementById('hero1Comparison').innerHTML = hero1Html;
    document.getElementById('hero2Comparison').innerHTML = hero2Html;

    resultContainer.style.display = 'block';

    // Load images
    const hero1Img = document.getElementById('comparisonHero1Image');
    const hero2Img = document.getElementById('comparisonHero2Image');

    if (hero1Img) this.loadHeroImage(hero1, hero1Img);
    if (hero2Img) this.loadHeroImage(hero2, hero2Img);
  }

  renderComparisonHero(hero, position) {
    const isStudied = this.studiedHeroes.has(hero.id);
    const isFavorite = this.favoriteHeroes.has(hero.id);

    return `
      <div class="comparison-hero-card">
        <div class="comparison-hero-header">
          <h3>${hero.name}</h3>
          <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-hero-id="${hero.id}" title="${isFavorite ? 'Выдаліць з улюбёных' : 'Дадаць да ўлюбёных'}">
            ${isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="comparison-hero-image">
          <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" id="comparisonHero${position}Image">
        </div>

        <div class="comparison-hero-info">
          <div class="comparison-meta">
            <div class="comparison-meta-item">
              <span class="meta-label">Гады:</span>
              <span class="meta-value">${hero.years}</span>
            </div>
            <div class="comparison-meta-item">
              <span class="meta-label">Сфера:</span>
              <span class="meta-value">${hero.field}</span>
            </div>
            <div class="comparison-meta-item">
              <span class="meta-label">Катэгорыя:</span>
              <span class="meta-value">${hero.category}</span>
            </div>
            <div class="comparison-meta-item">
              <span class="meta-label">Статус:</span>
              <span class="meta-value ${isStudied ? 'studied-status' : 'not-studied-status'}">${isStudied ? 'Вывучаны' : 'Не вывучаны'}</span>
            </div>
          </div>

          <div class="comparison-fact">
            <h4>Цікавы факт:</h4>
            <p>${hero.fact}</p>
          </div>

          ${hero.bio ? `
            <div class="comparison-bio">
              <h4>Біяграфія:</h4>
              <p>${hero.bio.substring(0, 150)}${hero.bio.length > 150 ? '...' : ''}</p>
            </div>
          ` : ''}

          <div class="comparison-actions">
            <button class="btn-secondary learn-more-btn" data-hero-id="${hero.id}">Падрабязней</button>
            ${!isStudied ? `<button class="btn-primary study-hero-btn" data-hero-id="${hero.id}">Вывучыць</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderTimelineView() {
    const container = document.getElementById('timelineContent');
    if (!container) return;

    // Sort heroes by birth year
    const sortedHeroes = [...this.heroes].sort((a, b) => {
      const yearA = this.extractBirthYear(a.years);
      const yearB = this.extractBirthYear(b.years);
      return yearA - yearB;
    });

    // Group heroes by century
    const centuries = {};
    sortedHeroes.forEach(hero => {
      const birthYear = this.extractBirthYear(hero.years);
      const century = Math.floor(birthYear / 100) * 100;

      if (!centuries[century]) {
        centuries[century] = [];
      }
      centuries[century].push(hero);
    });

    const html = Object.entries(centuries).map(([century, heroes]) => `
      <div class="timeline-century">
        <div class="century-header">
          <h3>${this.getCenturyName(century)}</h3>
          <div class="century-line"></div>
        </div>
        <div class="timeline-events">
          ${heroes.map(hero => this.renderTimelineHero(hero)).join('')}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    // Load images for timeline heroes
    container.querySelectorAll('.timeline-hero-image img').forEach(img => {
      const heroId = parseInt(img.dataset.heroId);
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero) {
        this.loadHeroImage(hero, img);
      }
    });
  }

  extractBirthYear(yearsString) {
    // Extract birth year from strings like "ок. 1490 — ок. 1551" or "1838 — 1864"
    const match = yearsString.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 1800; // Default fallback
  }

  getCenturyName(century) {
    const centuryNames = {
      1400: 'XV стагоддзе',
      1500: 'XVI стагоддзе',
      1600: 'XVII стагоддзе',
      1700: 'XVIII стагоддзе',
      1800: 'XIX стагоддзе',
      1900: 'XX стагоддзе',
      2000: 'XXI стагоддзе'
    };
    return centuryNames[century] || `${century} стагоддзе`;
  }

  renderTimelineHero(hero) {
    const isStudied = this.studiedHeroes.has(hero.id);
    const isFavorite = this.favoriteHeroes.has(hero.id);
    const birthYear = this.extractBirthYear(hero.years);

    return `
      <div class="timeline-event ${isStudied ? 'studied' : ''}" data-hero-id="${hero.id}">
        <div class="timeline-marker">
          <div class="timeline-dot"></div>
        </div>
        <div class="timeline-content">
          <div class="timeline-hero-card">
            <div class="timeline-hero-header">
              <div class="timeline-hero-year">${birthYear}</div>
              <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-hero-id="${hero.id}" title="${isFavorite ? 'Выдаліць з улюбёных' : 'Дадаць да ўлюбёных'}">
                ${isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            <div class="timeline-hero-image">
              <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" data-hero-id="${hero.id}">
            </div>

            <div class="timeline-hero-info">
              <h4 class="timeline-hero-name">${hero.name}</h4>
              <p class="timeline-hero-field">${hero.field}</p>
              <p class="timeline-hero-years">${hero.years}</p>
              <div class="timeline-hero-status">
                ${isStudied ? '<span class="studied-badge">✓ Вывучаны</span>' : '<span class="not-studied-badge">Не вывучаны</span>'}
              </div>
            </div>

            <div class="timeline-hero-actions">
              <button class="btn-secondary learn-more-btn" data-hero-id="${hero.id}">Пазнаць больш</button>
              ${!isStudied ? `<button class="btn-primary study-hero-btn" data-hero-id="${hero.id}">Вывучыць</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showHeroDetail(heroId) {
    const hero = this.heroes.find(h => h.id === heroId);
    if (!hero) return;

    const isStudied = this.studiedHeroes.has(heroId);
    const isFavorite = this.favoriteHeroes.has(heroId);
    const opinions = this.heroOpinions[heroId] || [];

    document.getElementById('heroModalTitle').textContent = hero.name;
    document.getElementById('heroModalBody').innerHTML = `
      <div class="hero-detail">
        <div class="hero-detail-image">
          <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='12' fill='%23666' text-anchor='middle' dy='.3em'>Загрузка...</text></svg>" alt="${hero.name}" id="heroDetailImage">
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
          <div class="hero-actions">
            <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-hero-id="${heroId}" title="${isFavorite ? 'Выдаліць з улюбёных' : 'Дадаць да ўлюбёных'}">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
            ${isStudied ? `
              <button class="add-opinion-btn btn-secondary" data-hero-id="${heroId}">Дадаць меркаванне</button>
            ` : `
              <button class="study-hero-btn btn-primary" data-hero-id="${heroId}">Вывучыць гэтага героя</button>
            `}
          </div>
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

    // Load hero image
    const heroImage = document.getElementById('heroDetailImage');
    if (heroImage) {
      this.loadHeroImage(hero, heroImage);
    }
  }

  studyHero(heroId) {
    this.studiedHeroes.add(heroId);
    this.saveUserData();
    this.renderStudyView();
    this.renderProfileView();
    this.showHeroDetail(heroId);
    this.showToast('✅ Герой дададзены да вывучаных!');
  }

  toggleFavorite(heroId) {
    if (this.favoriteHeroes.has(heroId)) {
      this.favoriteHeroes.delete(heroId);
      this.showToast('💔 Выдалена з улюбёных');
    } else {
      this.favoriteHeroes.add(heroId);
      this.showToast('❤️ Дададзена да ўлюбёных');
    }
    this.saveUserData();
    this.renderStudyView();
    this.renderSearchView();
    this.renderProfileView();
    this.showHeroDetail(heroId);
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

  // Quiz functionality
  generateQuizQuestions() {
    const questions = [];
    const usedHeroes = new Set();

    // Generate different types of questions
    const questionTypes = [
      this.generateNameQuestion.bind(this),
      this.generateFieldQuestion.bind(this),
      this.generateYearQuestion.bind(this),
      this.generateFactQuestion.bind(this),
      this.generateCategoryQuestion.bind(this),
      this.generateBioQuestion.bind(this)
    ];

    // Generate 15-20 random questions
    const targetQuestions = Math.floor(Math.random() * 6) + 15; // 15-20 questions

    while (questions.length < targetQuestions && usedHeroes.size < this.heroes.length) {
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const question = questionType(usedHeroes);
      if (question) {
        questions.push(question);
      }
    }

    // Shuffle the questions for more randomness
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions;
  }

  generateNameQuestion(usedHeroes) {
    const availableHeroes = this.heroes.filter(h => !usedHeroes.has(h.id));
    if (availableHeroes.length === 0) return null;

    const correctHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    usedHeroes.add(correctHero.id);

    const wrongHeroes = this.heroes.filter(h => h.id !== correctHero.id)
      .sort(() => Math.random() - 0.5).slice(0, 3);

    const options = [correctHero.name, ...wrongHeroes.map(h => h.name)]
      .sort(() => Math.random() - 0.5);

    return {
      question: `Хто з гэтых герояў быў ${correctHero.field.toLowerCase()}?`,
      options: options,
      correctAnswer: correctHero.name,
      heroId: correctHero.id
    };
  }

  generateFieldQuestion(usedHeroes) {
    const availableHeroes = this.heroes.filter(h => !usedHeroes.has(h.id));
    if (availableHeroes.length === 0) return null;

    const correctHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    usedHeroes.add(correctHero.id);

    const fields = [...new Set(this.heroes.map(h => h.field))];
    const wrongFields = fields.filter(f => f !== correctHero.field)
      .sort(() => Math.random() - 0.5).slice(0, 3);

    const options = [correctHero.field, ...wrongFields]
      .sort(() => Math.random() - 0.5);

    return {
      question: `У якой сферы працаваў ${correctHero.name}?`,
      options: options,
      correctAnswer: correctHero.field,
      heroId: correctHero.id
    };
  }

  generateYearQuestion(usedHeroes) {
    const availableHeroes = this.heroes.filter(h => !usedHeroes.has(h.id));
    if (availableHeroes.length === 0) return null;

    const correctHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    usedHeroes.add(correctHero.id);

    // Generate some wrong year ranges
    const correctYears = correctHero.years;
    const wrongYears = [];
    const baseYear = parseInt(correctYears.split('-')[0]) || 1800;

    for (let i = 0; i < 3; i++) {
      const offset = (Math.random() - 0.5) * 100;
      const wrongYear = Math.max(1700, Math.min(2000, baseYear + offset));
      wrongYears.push(`${Math.floor(wrongYear)}-${Math.floor(wrongYear) + 50}`);
    }

    const options = [correctYears, ...wrongYears]
      .sort(() => Math.random() - 0.5);

    return {
      question: `У якія гады жыў ${correctHero.name}?`,
      options: options,
      correctAnswer: correctYears,
      heroId: correctHero.id
    };
  }

  generateFactQuestion(usedHeroes) {
    const availableHeroes = this.heroes.filter(h => !usedHeroes.has(h.id));
    if (availableHeroes.length === 0) return null;

    const correctHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    usedHeroes.add(correctHero.id);

    const wrongFacts = this.heroes.filter(h => h.id !== correctHero.id)
      .map(h => h.fact).sort(() => Math.random() - 0.5).slice(0, 3);

    const options = [correctHero.fact, ...wrongFacts]
      .sort(() => Math.random() - 0.5);

    return {
      question: `Які цікавы факт звязаны з ${correctHero.name}?`,
      options: options,
      correctAnswer: correctHero.fact,
      heroId: correctHero.id
    };
  }

  generateCategoryQuestion(usedHeroes) {
    const availableHeroes = this.heroes.filter(h => !usedHeroes.has(h.id));
    if (availableHeroes.length === 0) return null;

    const correctHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    usedHeroes.add(correctHero.id);

    const categories = [...new Set(this.heroes.map(h => h.category))];
    const wrongCategories = categories.filter(c => c !== correctHero.category)
      .sort(() => Math.random() - 0.5).slice(0, 3);

    const options = [correctHero.category, ...wrongCategories]
      .sort(() => Math.random() - 0.5);

    return {
      question: `У якой катэгорыі працаваў ${correctHero.name}?`,
      options: options,
      correctAnswer: correctHero.category,
      heroId: correctHero.id
    };
  }

  generateBioQuestion(usedHeroes) {
    const availableHeroes = this.heroes.filter(h => h.bio && !usedHeroes.has(h.id));
    if (availableHeroes.length === 0) return null;

    const correctHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
    usedHeroes.add(correctHero.id);

    // Create multiple choice from bio snippets
    const bioSnippet = correctHero.bio.length > 100 ?
      correctHero.bio.substring(0, 100) + '...' :
      correctHero.bio;

    // Get wrong answers from other heroes' bios
    const wrongBios = this.heroes.filter(h => h.id !== correctHero.id && h.bio)
      .map(h => h.bio.length > 100 ? h.bio.substring(0, 100) + '...' : h.bio)
      .sort(() => Math.random() - 0.5).slice(0, 3);

    const options = [bioSnippet, ...wrongBios]
      .sort(() => Math.random() - 0.5);

    return {
      question: `Якая біяграфія адпавядае ${correctHero.name}?`,
      options: options,
      correctAnswer: bioSnippet,
      heroId: correctHero.id
    };
  }

  startQuiz() {
    this.quizQuestions = this.generateQuizQuestions();
    this.currentQuestionIndex = 0;
    this.quizScore = 0;
    this.quizAnswers = [];

    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizQuestion').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';

    this.showQuestion();
  }

  showQuestion() {
    const question = this.quizQuestions[this.currentQuestionIndex];
    if (!question) return;

    document.getElementById('questionNumber').textContent = this.currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = this.quizQuestions.length;
    document.getElementById('questionText').textContent = question.question;

    const optionsContainer = document.getElementById('answerOptions');
    optionsContainer.innerHTML = question.options.map((option, index) => `
      <button class="answer-option" data-index="${index}">${option}</button>
    `).join('');

    // Add event listeners for answer options
    optionsContainer.querySelectorAll('.answer-option').forEach(button => {
      button.addEventListener('click', (e) => this.selectAnswer(parseInt(e.target.dataset.index)));
    });

    document.getElementById('nextQuestion').style.display = 'none';
  }

  selectAnswer(selectedIndex) {
    const question = this.quizQuestions[this.currentQuestionIndex];
    const selectedAnswer = question.options[selectedIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      this.quizScore++;
    }

    this.quizAnswers.push({
      question: question.question,
      selectedAnswer: selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      heroId: question.heroId
    });

    // Show feedback
    const options = document.querySelectorAll('.answer-option');
    options.forEach((option, index) => {
      option.disabled = true;
      if (question.options[index] === question.correctAnswer) {
        option.classList.add('correct');
      } else if (index === selectedIndex && !isCorrect) {
        option.classList.add('incorrect');
      }
    });

    document.getElementById('nextQuestion').style.display = 'block';
  }

  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.quizQuestions.length) {
      this.showQuizResults();
    } else {
      this.showQuestion();
    }
  }

  showQuizResults() {
    document.getElementById('quizQuestion').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';

    const percentage = Math.round((this.quizScore / this.quizQuestions.length) * 100);

    document.getElementById('finalScore').textContent = `${this.quizScore}/${this.quizQuestions.length}`;
    document.getElementById('scorePercentage').textContent = `${percentage}%`;

    let feedback = '';
    const totalQuestions = this.quizQuestions.length;

    if (percentage >= 90) {
      feedback = `Выдатна! Вы сапраўдны эксперт па беларускіх героях! 🏆 (${this.quizScore}/${totalQuestions})`;
    } else if (percentage >= 75) {
      feedback = `Добрая работа! Вы добра ведаеце гісторыю Беларусі! 👍 (${this.quizScore}/${totalQuestions})`;
    } else if (percentage >= 60) {
      feedback = `Нядрэнна! Ёсць над чым працаваць, але вы на правільным шляху! 📚 (${this.quizScore}/${totalQuestions})`;
    } else if (percentage >= 40) {
      feedback = `Патрэбна больш вывучэння! Спрабуйце яшчэ раз. 💪 (${this.quizScore}/${totalQuestions})`;
    } else {
      feedback = `Працягвайце вывучаць! Беларуская гісторыя поўная цікавых герояў! 📖 (${this.quizScore}/${totalQuestions})`;
    }

    document.getElementById('quizFeedback').textContent = feedback;

    // Save quiz results
    this.saveQuizResults();
  }

  saveQuizResults() {
    try {
      const userKey = `belarusHeroes_${this.user.id}`;
      const saved = localStorage.getItem(userKey);
      const data = saved ? JSON.parse(saved) : {};

      if (!data.quizResults) {
        data.quizResults = [];
      }

      data.quizResults.push({
        date: new Date().toISOString(),
        score: this.quizScore,
        totalQuestions: this.quizQuestions.length,
        percentage: Math.round((this.quizScore / this.quizQuestions.length) * 100),
        answers: this.quizAnswers
      });

      // Keep only last 10 quiz results
      if (data.quizResults.length > 10) {
        data.quizResults = data.quizResults.slice(-10);
      }

      localStorage.setItem(userKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save quiz results:', e);
    }
  }

  restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
  }

  getQuizStats() {
    try {
      const userKey = `belarusHeroes_${this.user.id}`;
      const saved = localStorage.getItem(userKey);
      const data = saved ? JSON.parse(saved) : {};

      const quizResults = data.quizResults || [];
      const totalQuizzes = quizResults.length;

      if (totalQuizzes === 0) {
        return { totalQuizzes: 0, averageScore: 0 };
      }

      const totalScore = quizResults.reduce((sum, quiz) => sum + quiz.percentage, 0);
      const averageScore = Math.round(totalScore / totalQuizzes);

      return { totalQuizzes, averageScore };
    } catch (e) {
      console.warn('Failed to get quiz stats:', e);
      return { totalQuizzes: 0, averageScore: 0 };
    }
  }

  // Smart image loading with fallback
  loadHeroImage(hero, imgElement) {
    const cacheKey = `hero_${hero.id}`;
    const cachedImage = this.imageCache.get(cacheKey);

    if (cachedImage) {
      imgElement.src = cachedImage;
      return;
    }

    // Try external image first
    if (hero.image && hero.image.startsWith('http')) {
      const testImage = new Image();
      testImage.onload = () => {
        // External image loaded successfully
        this.imageCache.set(cacheKey, hero.image);
        imgElement.src = hero.image;
      };
      testImage.onerror = () => {
        // External image failed, use local fallback
        this.loadLocalFallback(hero, imgElement, cacheKey);
      };
      testImage.src = hero.image;
    } else {
      // Use local image or fallback
      this.loadLocalFallback(hero, imgElement, cacheKey);
    }
  }

  loadLocalFallback(hero, imgElement, cacheKey) {
    // Try the actual image path from hero data
    let imagePath = hero.image;

    // If it's not an external URL, ensure it's a proper local path
    if (!imagePath.startsWith('http')) {
      // If it doesn't start with 'images/', add it
      if (!imagePath.startsWith('images/')) {
        imagePath = `images/${imagePath}`;
      }
    }

    const localImage = new Image();
    localImage.onload = () => {
      this.imageCache.set(cacheKey, imagePath);
      imgElement.src = imagePath;
    };
    localImage.onerror = () => {
      // Local image not found, try alternative extensions or use placeholder
      if (!imagePath.startsWith('http')) {
        this.tryAlternativeExtensions(hero, imgElement, cacheKey);
      } else {
        // External image failed, use placeholder
        const fallbackSrc = this.generateHeroPlaceholder(hero);
        this.imageCache.set(cacheKey, fallbackSrc);
        imgElement.src = fallbackSrc;
      }
    };
    localImage.src = imagePath;
  }

  tryAlternativeExtensions(hero, imgElement, cacheKey) {
    // Try different extensions for local images
    const baseName = hero.image.replace('images/', '').split('.')[0];
    const extensions = ['.jpg', '.JPG', '.png', '.webp', '.svg'];

    let triedCount = 0;

    const tryNextExtension = () => {
      if (triedCount >= extensions.length) {
        // All extensions failed, use placeholder
        const fallbackSrc = this.generateHeroPlaceholder(hero);
        this.imageCache.set(cacheKey, fallbackSrc);
        imgElement.src = fallbackSrc;
        return;
      }

      const ext = extensions[triedCount];
      triedCount++;

      const testPath = `images/${baseName}${ext}`;
      const testImg = new Image();

      testImg.onload = () => {
        this.imageCache.set(cacheKey, testPath);
        imgElement.src = testPath;
      };

      testImg.onerror = tryNextExtension;
      testImg.src = testPath;
    };

    tryNextExtension();
  }

  generateHeroPlaceholder(hero) {
    // Generate SVG placeholder with hero initials
    const initials = hero.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="bg_${hero.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e1e1e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2a2a2a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg_${hero.id})"/>
      <circle cx="100" cy="75" r="25" fill="#666" stroke="#999" stroke-width="2"/>
      <rect x="75" y="110" width="50" height="35" rx="5" fill="#666"/>
      <text x="100" y="165" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#e6e6e6" text-anchor="middle">${initials}</text>
      <text x="100" y="180" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="middle">${hero.years}</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
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