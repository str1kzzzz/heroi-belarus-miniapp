// Belarusian Heroes App - Clean Implementation
class BelarusHeroesApp {
  constructor() {
    // Initialize properties efficiently
    Object.assign(this, {
      heroes: [],
      facts: [],
      favorites: new Set(),
      currentIndex: 0,
      isSwiping: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      swipeThreshold: 80,
      verticalSwipeThreshold: 100,
      searchTimeout: null,
      performanceMarks: new Map()
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

  async init() {
    try {
      // Show loading state
      this.showLoadingState();

      // Load data asynchronously
      await this.loadData();

      // Initialize app after data is loaded
      this.shuffleHeroes();
      this.loadFavorites();
      this.setupEventListeners();
      this.renderCards();
      this.updateProgress();
      this.showInstructions();

      // Hide loading state
      this.hideLoadingState();

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
      // Fallback to minimal data
      this.heroes = [{
        id: 1,
        name: "Памылка загрузкі",
        years: "",
        field: "Спробуйце перазагрузіць старонку",
        category: "Памылка",
        fact: "Не ўдалося загрузіць даныя герояў",
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50' y='50' font-family='Arial' font-size='8' fill='%23666' text-anchor='middle' dy='.3em'>Error</text></svg>"
      }];
      this.facts = [];
    }
  }

  setupEventListeners() {
    // Menu button
    this.addEvent('#menuBtn', 'click', () => this.showModal('menuModal'));

    // Action buttons
    this.addEvent('#dislikeBtn', 'click', () => this.dislike());
    this.addEvent('#likeBtn', 'click', () => this.like());
    this.addEvent('#favoriteBtn', 'click', () => this.favorite());

    // Modal close buttons
    this.addEvent('#closeModal', 'click', () => this.hideModal('detailModal'));
    this.addEvent('#closeMenuBtn', 'click', () => this.hideModal('menuModal'));
    this.addEvent('#closeFavoritesBtn', 'click', () => this.hideModal('favoritesModal'));
    this.addEvent('#closeSearchBtn', 'click', () => this.hideModal('searchModal'));
    this.addEvent('#closeStatsBtn', 'click', () => this.hideModal('statsModal'));
    this.addEvent('#closeRandomBtn', 'click', () => this.hideModal('randomModal'));
    this.addEvent('#closeInstructions', 'click', () => this.hideModal('instructionsModal'));

    // Modal actions
    this.addEvent('#shareDetailBtn', 'click', () => this.share());
    this.addEvent('#closeDetailBtn', 'click', () => this.hideModal('detailModal'));
    this.addEvent('#anotherRandomBtn', 'click', () => this.showRandomHero());
    this.addEvent('#startExploring', 'click', () => this.hideModal('instructionsModal'));

    // Menu items
    this.addEvent('#favoritesBtn', 'click', () => this.showFavorites());
    this.addEvent('#searchBtn', 'click', () => this.showSearch());
    this.addEvent('#statsBtn', 'click', () => this.showStats());
    this.addEvent('#randomBtn', 'click', () => this.showRandomHero());
    this.addEvent('#resetAppBtn', 'click', () => this.reset());
    this.addEvent('#aboutAppBtn', 'click', () => this.showAbout());

    // Reset button
    this.addEvent('#resetBtn', 'click', () => this.reset());

    // Search
    this.addEvent('#searchInput', 'input', (e) => this.performSearch(e.target.value));

    // Touch events
    this.setupTouchEvents();

    // Modal overlay
    this.addEvent('#modalOverlay', 'click', () => this.hideAllModals());
  }

  addEvent(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  setupTouchEvents() {
    const stack = document.getElementById('cardsStack');
    if (!stack) return;

    // Use passive listeners where possible for better performance
    stack.addEventListener('mousedown', (e) => this.handleStart(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e), { passive: true });
    document.addEventListener('mouseup', (e) => this.handleEnd(e));

    stack.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleEnd(e), { passive: true });

    // Prevent context menu on long press
    stack.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleStart(e) {
    if (this.currentIndex >= this.heroes.length) return;

    this.isSwiping = true;
    const point = e.type.includes('mouse') ? e : e.touches[0];
    this.startX = point.clientX;
    this.startY = point.clientY;

    const card = this.getCurrentCard();
    if (card) {
      card.classList.add('dragging');
    }

    e.preventDefault();
  }

  handleMove(e) {
    if (!this.isSwiping || this.currentIndex >= this.heroes.length) return;

    const point = e.type.includes('mouse') ? e : e.touches[0];
    this.currentX = point.clientX - this.startX;
    this.currentY = point.clientY - this.startY;

    const card = this.getCurrentCard();
    if (card) {
      const rotate = this.currentX * 0.1;
      const scale = Math.max(0.95, 1 - Math.abs(this.currentX) * 0.001);
      card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotate}deg) scale(${scale})`;
    }

    e.preventDefault();
  }

  handleEnd(e) {
    if (!this.isSwiping || this.currentIndex >= this.heroes.length) return;

    this.isSwiping = false;
    const card = this.getCurrentCard();

    if (card) {
      card.classList.remove('dragging');

      // Determine swipe direction
      if (Math.abs(this.currentY) > this.verticalSwipeThreshold) {
        if (this.currentY < 0) {
          this.showDetails();
        } else {
          this.favorite();
        }
      } else if (Math.abs(this.currentX) > this.swipeThreshold) {
        if (this.currentX > 0) {
          this.dislike();
        } else {
          this.like();
        }
      } else {
        this.resetCard();
      }
    }

    this.currentX = 0;
    this.currentY = 0;
  }


  resetCard() {
    const card = this.getCurrentCard();
    if (card) {
      card.style.transform = '';
      card.classList.remove('exiting-left', 'exiting-right', 'exiting-up', 'exiting-down', 'dragging');
    }
  }

  renderCards() {
    const startTime = performance.now();
    const stack = document.getElementById('cardsStack');
    if (!stack) return;

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // Only render the current card
    if (this.currentIndex < this.heroes.length) {
      const hero = this.heroes[this.currentIndex];
      const card = this.createCard(hero);
      card.classList.add('entering');
      fragment.appendChild(card);
    }

    // Clear and append in one operation
    stack.innerHTML = '';
    stack.appendChild(fragment);

    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // Log if rendering takes more than one frame
      console.warn(`Card render took ${renderTime.toFixed(2)}ms`);
    }
  }

  createCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Карточка героя ${hero.name}`);

    // Image container with loading state
    const imageContainer = document.createElement('div');
    imageContainer.className = 'hero-image-container';

    // Loading placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-content">
        <div class="placeholder-icon">📷</div>
        <div class="placeholder-text">Загрузка...</div>
      </div>
    `;
    imageContainer.appendChild(placeholder);

    // Optimized image loading
    const img = document.createElement('img');
    img.className = 'hero-image';
    img.alt = `Фотография ${hero.name}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    // Preload critical images
    if (this.currentIndex === 0) {
      img.loading = 'eager';
    }

    // Enhanced error handling with multiple fallbacks
    const loadImage = (src, fallbackIndex = 0) => {
      const fallbacks = [
        src,
        `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name.split(' ').map(n => n[0]).join('')}</text></svg>`,
        `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e0e0e0"/><circle cx="50" cy="35" r="15" fill="%23ccc"/><rect x="35" y="55" width="30" height="25" fill="%23ccc"/></svg>`
      ];

      img.src = fallbacks[fallbackIndex];

      img.onload = () => {
        placeholder.style.display = 'none';
        img.style.opacity = '1';
      };

      img.onerror = () => {
        if (fallbackIndex < fallbacks.length - 1) {
          loadImage(fallbacks[fallbackIndex + 1], fallbackIndex + 1);
        } else {
          placeholder.innerHTML = `
            <div class="placeholder-content">
              <div class="placeholder-icon">❌</div>
              <div class="placeholder-text">Не загрузилась</div>
            </div>
          `;
        }
      };
    };

    loadImage(hero.image);
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    imageContainer.appendChild(img);

    // Content with better structure
    const content = document.createElement('div');
    content.className = 'card-content';

    const name = document.createElement('h3');
    name.className = 'card-name';
    name.textContent = hero.name;
    name.setAttribute('aria-label', `Имя героя: ${hero.name}`);

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML = `<time>${hero.years}</time> • <span>${hero.field}</span>`;
    meta.setAttribute('aria-label', `Годы жизни и профессия: ${hero.years}, ${hero.field}`);

    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = hero.fact;
    description.setAttribute('aria-label', `Описание: ${hero.fact}`);

    content.appendChild(name);
    content.appendChild(meta);
    content.appendChild(description);

    card.appendChild(imageContainer);
    card.appendChild(content);

    return card;
  }

  getCurrentCard() {
    const stack = document.getElementById('cardsStack');
    return stack ? stack.firstElementChild : null;
  }

  like() {
    if (this.currentIndex >= this.heroes.length) return;

    this.animateCard('exiting-left');
    this.showFeedback('❤️');
    setTimeout(() => this.nextCard(), 600);
  }

  dislike() {
    if (this.currentIndex >= this.heroes.length) return;

    this.animateCard('exiting-right');
    this.showFeedback('👎');
    setTimeout(() => this.nextCard(), 600);
  }

  favorite() {
    if (this.currentIndex >= this.heroes.length) return;

    const hero = this.heroes[this.currentIndex];
    this.favorites.add(hero.id);
    this.saveFavorites();
    this.updateFavoritesCount();

    this.animateCard('exiting-down');
    this.showFeedback('⭐');
    this.showToast(`✅ ${hero.name} даданы ў закладкі`);
    setTimeout(() => this.nextCard(), 600);
  }

  showDetails() {
    if (this.currentIndex >= this.heroes.length) return;

    const hero = this.heroes[this.currentIndex];
    this.showDetailModal(hero);

    const card = this.getCurrentCard();
    if (card) {
      card.classList.add('exiting-up');
      setTimeout(() => this.resetCard(), 600);
    }
  }

  animateCard(direction) {
    const card = this.getCurrentCard();
    if (card) {
      card.classList.add(direction);
    }
  }

  nextCard() {
    this.currentIndex++;
    this.updateProgress();

    if (this.currentIndex >= this.heroes.length) {
      this.showEmptyState();
    } else {
      this.renderCards();
    }
  }

  updateProgress() {
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');

    if (fill && text) {
      // Cap progress at 100% and currentIndex at heroes.length
      const cappedIndex = Math.min(this.currentIndex, this.heroes.length);
      const progress = (cappedIndex / this.heroes.length) * 100;
      fill.style.width = `${Math.min(progress, 100)}%`;
      text.textContent = `${cappedIndex}/${this.heroes.length}`;
    }
  }

  updateFavoritesCount() {
    const badge = document.querySelector('#favoritesBtn .badge');
    if (badge) {
      badge.textContent = this.favorites.size;
    }
  }

  showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('cardsStack').classList.add('hidden');
    this.disableActionButtons();
  }

  hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('cardsStack').classList.remove('hidden');
    this.enableActionButtons();
  }

  showEmptyState() {
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('cardsStack').classList.add('hidden');
    this.disableActionButtons();
  }

  hideEmptyState() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('cardsStack').classList.remove('hidden');
    this.enableActionButtons();
  }

  disableActionButtons() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(button => {
      button.disabled = true;
      button.style.opacity = '0.5';
      button.style.pointerEvents = 'none';
    });
  }

  enableActionButtons() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(button => {
      button.disabled = false;
      button.style.opacity = '';
      button.style.pointerEvents = '';
    });
  }

  shuffleHeroes() {
    for (let i = this.heroes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.heroes[i], this.heroes[j]] = [this.heroes[j], this.heroes[i]];
    }
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById('modalOverlay').classList.remove('hidden');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById('modalOverlay').classList.add('hidden');
  }

  hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
    document.getElementById('modalOverlay').classList.add('hidden');
  }

  showDetailModal(hero) {
    const modal = document.getElementById('detailModal');
    const image = modal.querySelector('.hero-image img');
    const name = modal.querySelector('.hero-content h2');
    const meta = modal.querySelector('.hero-meta');
    const description = modal.querySelector('.hero-description');

    if (image && name && meta && description) {
      image.src = hero.image;
      image.alt = hero.name;
      name.textContent = hero.name;
      meta.textContent = `${hero.years} • ${hero.field}`;

      const extraFact = this.getExtraFact(hero.name);
      description.innerHTML = `<p>${hero.fact}</p>${extraFact ? `<div style="margin-top: 16px; padding: 16px; background: rgba(0,0,0,0.05); border-radius: 8px;"><strong>📌 Дадатковы факт:</strong><br>${extraFact.fact}</div>` : ''}`;
    }

    this.showModal('detailModal');
  }

  showFavorites() {
    this.hideModal('menuModal');

    const modal = document.getElementById('favoritesModal');
    const list = modal.querySelector('.favorites-list');
    const empty = modal.querySelector('.empty-favorites');

    list.innerHTML = '';

    if (this.favorites.size === 0) {
      list.classList.add('hidden');
      empty.classList.remove('hidden');
    } else {
      list.classList.remove('hidden');
      empty.classList.add('hidden');

      this.favorites.forEach(heroId => {
        const hero = this.heroes.find(h => h.id === heroId);
        if (hero) {
          const item = document.createElement('div');
          item.className = 'favorite-item';

          const img = document.createElement('img');
          img.className = 'favorite-image';
          img.src = hero.image;
          img.alt = hero.name;
          img.onerror = () => {
            img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
          };

          const info = document.createElement('div');
          info.className = 'favorite-info';
          info.innerHTML = `
            <div class="favorite-name">${hero.name}</div>
            <div class="favorite-meta">${hero.years} • ${hero.field}</div>
          `;

          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-favorite';
          removeBtn.textContent = '✕';
          removeBtn.onclick = () => this.removeFavorite(hero.id);

          item.appendChild(img);
          item.appendChild(info);
          item.appendChild(removeBtn);

          item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-favorite')) {
              this.showDetailModal(hero);
              this.hideModal('favoritesModal');
            }
          });

          list.appendChild(item);
        }
      });
    }

    this.showModal('favoritesModal');
  }

  removeFavorite(heroId) {
    this.favorites.delete(heroId);
    this.saveFavorites();
    this.updateFavoritesCount();
    this.showFavorites();
    this.showToast('🗑️ Выдалена з закладак');
  }

  showSearch() {
    this.hideModal('menuModal');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    this.showModal('searchModal');
    document.getElementById('searchInput').focus();
  }

  performSearch(query) {
    // Debounce search for better performance
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this._executeSearch(query);
    }, 150);
  }

  _executeSearch(query) {
    const startTime = performance.now();
    const results = document.getElementById('searchResults');
    if (!results) return;

    if (query.length < 2) {
      results.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 20px;">Пачніце ўводзіць імя героя...</p>';
      return;
    }

    // Use more efficient search with early returns
    const queryLower = query.toLowerCase();
    const filtered = this.heroes.filter(hero =>
      hero.name.toLowerCase().includes(queryLower) ||
      hero.field.toLowerCase().includes(queryLower) ||
      hero.category.toLowerCase().includes(queryLower)
    );

    if (filtered.length === 0) {
      results.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 20px;">Героі не знойдзены</p>';
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    filtered.forEach(hero => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `Выбрать героя ${hero.name}`);

      const img = document.createElement('img');
      img.src = hero.image;
      img.alt = hero.name;
      img.className = 'search-result-image';
      img.loading = 'lazy';
      img.onerror = () => {
        img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name.split(' ').map(n => n[0]).join('')}</text></svg>`;
      };

      const info = document.createElement('div');
      info.className = 'search-result-info';
      info.innerHTML = `
        <div class="search-result-name">${this._highlightText(hero.name, query)}</div>
        <div class="search-result-meta">${hero.years} • ${hero.field}</div>
      `;

      item.appendChild(img);
      item.appendChild(info);

      item.addEventListener('click', () => {
        this.showDetailModal(hero);
        this.hideModal('searchModal');
      });

      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });

      fragment.appendChild(item);
    });

    results.innerHTML = '';
    results.appendChild(fragment);

    const searchTime = performance.now() - startTime;
    if (searchTime > 50) { // Log slow searches
      console.warn(`Search took ${searchTime.toFixed(2)}ms for query: "${query}"`);
    }
  }

  _highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  showStats() {
    this.hideModal('menuModal');

    const content = document.querySelector('#statsModal .modal-body');
    const totalHeroes = this.heroes.length;
    const viewedHeroes = this.currentIndex;
    const favoriteCount = this.favorites.size;
    const categories = {};

    this.heroes.forEach(hero => {
      categories[hero.category] = (categories[hero.category] || 0) + 1;
    });

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
        <h2>Ваша статыстыка</h2>
      </div>

      <div style="display: grid; gap: 16px; margin-bottom: 32px;">
        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200);">
          <div style="font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">${viewedHeroes}</div>
          <div style="color: var(--gray-600);">Прагледжана герояў</div>
        </div>

        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200);">
          <div style="font-size: 24px; font-weight: 700; color: var(--warning); margin-bottom: 8px;">${favoriteCount}</div>
          <div style="color: var(--gray-600);">У закладках</div>
        </div>

        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200);">
          <div style="font-size: 24px; font-weight: 700; color: var(--secondary); margin-bottom: 8px;">${totalHeroes}</div>
          <div style="color: var(--gray-600);">Усяго герояў</div>
        </div>
      </div>

      <div>
        <h3 style="margin-bottom: 16px; color: var(--gray-900);">Героі па катэгорыях:</h3>
        ${Object.entries(categories).map(([category, count]) =>
          `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-200);">
            <span style="color: var(--gray-700);">${category}</span>
            <span style="font-weight: 600; color: var(--gray-900);">${count}</span>
          </div>`
        ).join('')}
      </div>
    `;

    this.showModal('statsModal');
  }

  showRandomHero() {
    this.hideModal('menuModal');

    const randomHero = this.heroes[Math.floor(Math.random() * this.heroes.length)];
    const content = document.querySelector('#randomModal .modal-body');

    content.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 120px; height: 120px; margin: 0 auto 16px; border-radius: 16px; overflow: hidden; background: var(--gray-100);">
          <img src="${randomHero.image}" alt="${randomHero.name}"
                style="width: 100%; height: 100%; object-fit: cover;"
                onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${randomHero.name}</text></svg>'">
        </div>
        <h2 style="margin-bottom: 8px;">${randomHero.name}</h2>
        <div style="color: var(--gray-600); margin-bottom: 16px;">${randomHero.years} • ${randomHero.field}</div>
        <p style="line-height: 1.6; color: var(--gray-700); margin: 0;">${randomHero.fact}</p>
      </div>
    `;

    this.showModal('randomModal');
  }

  showAbout() {
    this.hideModal('menuModal');

    const aboutHero = {
      id: 'about',
      name: 'Аб праекце',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23c8102e"/><text x="50" y="50" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">🇧🇾</text></svg>',
      years: '2024',
      field: 'Гісторыя і культура',
      category: 'Адукацыя',
      fact: 'Гэты праект прысвечаны памяці герояў Беларусі. Свайпайце карткі, каб адкрываць гісторыі: управа - прапусціць, улева - падабаецца, уверх - падрабязнасці, уніз - у закладкі.'
    };

    this.showDetailModal(aboutHero);
  }

  showInstructions() {
    if (localStorage.getItem('instructionsShown')) return;

    this.showModal('instructionsModal');
    localStorage.setItem('instructionsShown', 'true');
  }

  reset() {
    this.currentIndex = 0;
    this.shuffleHeroes();
    this.hideAllModals();
    this.hideEmptyState();
    this.renderCards();
    this.updateProgress();
    this.showToast('🔀 Героі перамешаны! Пачалі нанова!');
  }

  getExtraFact(heroName) {
    if (!this.facts) return null;
    const heroFacts = this.facts.filter(f => f.name === heroName);
    return heroFacts.length > 0 ? heroFacts[Math.floor(Math.random() * heroFacts.length)] : null;
  }

  share() {
    const hero = this.heroes[this.currentIndex];
    if (!hero) return;

    const text = `🇧🇾 ${hero.name}\n${hero.years}\n${hero.fact}\n\n#ГероіБеларусі`;

    if (navigator.share) {
      navigator.share({ title: 'Герой Беларусі', text }).catch(() => {
        this.copyToClipboard(text);
      });
    } else {
      this.copyToClipboard(text);
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
      () => this.showToast('📋 Тэкст скапіяваны!'),
      () => this.showToast('Скапіруйце тэкст:\n\n' + text)
    );
  }

  showFeedback(icon) {
    const feedback = document.createElement('div');
    feedback.className = 'success-feedback';
    feedback.textContent = icon;
    document.body.appendChild(feedback);

    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 600);
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

  loadFavorites() {
    try {
      const saved = localStorage.getItem('belarusHeroesFavorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load favorites:', e);
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem('belarusHeroesFavorites', JSON.stringify([...this.favorites]));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
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