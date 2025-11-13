// app.js - TINDER-STYLE SWIPE INTERFACE
class SwipeHeroesApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.heroes = [];
    this.favorites = new Set();
    this.currentIndex = 0;
    this.isSwiping = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.swipeThreshold = 50;
    this.verticalSwipeThreshold = 80;
    
    this.init();
  }

  async init() {
    console.log('🎯 Initializing Swipe Heroes App...');
    
    // Initialize Telegram WebApp
    this.initTelegram();
    
    // Load data
    await this.loadData();
    
    // Load favorites from localStorage
    this.loadFavorites();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize UI
    this.initializeUI();
    
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
        
        console.log('✅ Telegram WebApp initialized');
      } catch (error) {
        console.warn('⚠️ Telegram init failed:', error);
      }
    }
  }

  async loadData() {
    try {
      // Show loading state
      this.showLoadingState();
      
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
    } finally {
      this.hideLoadingState();
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
      },
      {
        "id": 3,
        "name": "Янка Купала",
        "years": "1882 — 1942",
        "field": "Поэт, драматург",
        "category": "Культура",
        "fact": "Янка Купала — один из основателей современной белорусской литературы.",
        "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
      }
    ];
    
    this.facts = [
      {"id": 1, "name": "Франциск Скорина", "fact": "Первый белорусский книгопечатник издал «Псалтыр» в Праге в 1517 году."},
      {"id": 2, "name": "Кастусь Калиновский", "fact": "Его письма «Мужыцкая праўда» стали символом борьбы за свободу."},
      {"id": 3, "name": "Янка Купала", "fact": "Настоящее имя — Иван Луцевич."}
    ];
    
    console.log('🔄 Using fallback data');
  }

  loadFavorites() {
    const saved = localStorage.getItem('heroesFavorites');
    if (saved) {
      this.favorites = new Set(JSON.parse(saved));
    }
  }

  saveFavorites() {
    localStorage.setItem('heroesFavorites', JSON.stringify([...this.favorites]));
  }

  setupEventListeners() {
    // Button events
    this.on('#menuBtn', 'click', () => this.showMenu());
    this.on('#closeMenuBtn', 'click', () => this.hideMenu());
    this.on('#closeModal', 'click', () => this.hideDetailModal());
    this.on('#closeDetailBtn', 'click', () => this.hideDetailModal());
    this.on('#closeFavoritesBtn', 'click', () => this.hideFavoritesModal());
    this.on('#closeInstructions', 'click', () => this.hideInstructions());
    
    // Action buttons
    this.on('#dislikeBtn', 'click', () => this.swipeRight());
    this.on('#likeBtn', 'click', () => this.swipeLeft());
    this.on('#favoriteBtn', 'click', () => this.addToFavorites());
    
    // Menu actions
    this.on('#favoritesBtn', 'click', () => this.showFavorites());
    this.on('#resetAppBtn', 'click', () => this.resetApp());
    this.on('#aboutAppBtn', 'click', () => this.showAbout());
    this.on('#resetBtn', 'click', () => this.resetApp());
    
    // Share button
    this.on('#shareDetailBtn', 'click', () => this.shareCurrentHero());
    
    // Touch events for swiping
    this.setupSwipeEvents();
  }

  on(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  setupSwipeEvents() {
    const stack = document.getElementById('cardsStack');
    if (!stack) return;

    // Mouse events for desktop
    stack.addEventListener('mousedown', this.handleTouchStart.bind(this));
    stack.addEventListener('mousemove', this.handleTouchMove.bind(this));
    stack.addEventListener('mouseup', this.handleTouchEnd.bind(this));
    stack.addEventListener('mouseleave', this.handleTouchEnd.bind(this));

    // Touch events for mobile
    stack.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    stack.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    stack.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  handleTouchStart(e) {
    if (this.currentIndex >= this.heroes.length) return;
    
    this.isSwiping = true;
    const touch = e.type.includes('mouse') ? e : e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      currentCard.classList.add('swiping');
    }
    
    e.preventDefault();
  }

  handleTouchMove(e) {
    if (!this.isSwiping || this.currentIndex >= this.heroes.length) return;
    
    const touch = e.type.includes('mouse') ? e : e.touches[0];
    this.currentX = touch.clientX - this.startX;
    this.currentY = touch.clientY - this.startY;
    
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      const rotate = this.currentX * 0.1;
      currentCard.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotate}deg)`;
      
      // Update swipe indicators
      this.updateSwipeIndicators();
    }
    
    e.preventDefault();
  }

  handleTouchEnd() {
    if (!this.isSwiping || this.currentIndex >= this.heroes.length) return;
    
    this.isSwiping = false;
    const currentCard = this.getCurrentCard();
    
    if (currentCard) {
      currentCard.classList.remove('swiping');
      
      // Check swipe direction
      if (Math.abs(this.currentY) > this.verticalSwipeThreshold) {
        // Vertical swipe
        if (this.currentY < 0) {
          this.swipeUp(); // Swipe up for details
        } else {
          this.swipeDown(); // Swipe down for favorites
        }
      } else if (Math.abs(this.currentX) > this.swipeThreshold) {
        // Horizontal swipe
        if (this.currentX > 0) {
          this.swipeRight(); // Swipe right to skip
        } else {
          this.swipeLeft(); // Swipe left to like
        }
      } else {
        // Return to original position
        this.resetCardPosition();
      }
    }
    
    // Reset values
    this.currentX = 0;
    this.currentY = 0;
  }

  updateSwipeIndicators() {
    const currentCard = this.getCurrentCard();
    if (!currentCard) return;
    
    // Remove all indicator classes
    currentCard.classList.remove('swipe-left', 'swipe-right', 'swipe-up', 'swipe-down');
    
    if (Math.abs(this.currentY) > Math.abs(this.currentX)) {
      // Vertical swipe dominant
      if (this.currentY < -this.verticalSwipeThreshold) {
        currentCard.classList.add('swipe-up');
      } else if (this.currentY > this.verticalSwipeThreshold) {
        currentCard.classList.add('swipe-down');
      }
    } else {
      // Horizontal swipe dominant
      if (this.currentX < -this.swipeThreshold) {
        currentCard.classList.add('swipe-left');
      } else if (this.currentX > this.swipeThreshold) {
        currentCard.classList.add('swipe-right');
      }
    }
  }

  resetCardPosition() {
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      currentCard.style.transform = '';
      currentCard.classList.remove('swipe-left', 'swipe-right', 'swipe-up', 'swipe-down');
    }
  }

  initializeUI() {
    if (this.heroes.length === 0) {
      this.showEmptyState();
      return;
    }
    
    this.renderCards();
    this.updateProgress();
    
    // Show instructions for first-time users
    if (!localStorage.getItem('instructionsShown')) {
      this.showInstructions();
      localStorage.setItem('instructionsShown', 'true');
    }
  }

  renderCards() {
    const stack = document.getElementById('cardsStack');
    if (!stack) return;
    
    stack.innerHTML = '';
    
    // Show next 3 cards
    const cardsToShow = Math.min(3, this.heroes.length - this.currentIndex);
    
    for (let i = 0; i < cardsToShow; i++) {
      const hero = this.heroes[this.currentIndex + i];
      const card = this.createCard(hero, i);
      stack.appendChild(card);
    }
  }

  createCard(hero, index) {
    const card = document.createElement('div');
    card.className = 'hero-card premium-glass';
    card.style.zIndex = 10 - index;
    card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 10}px)`;
    
    card.innerHTML = `
      <img class="card-image" src="${hero.image}" alt="${hero.name}"
           onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23f0f0f0\"/><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"10\" fill=\"%23666\" text-anchor=\"middle\" dy=\".3em\">${hero.name}</text></svg>'">
      <div class="card-content">
        <h3 class="card-name">${hero.name}</h3>
        <div class="card-meta">${hero.years} • ${hero.field}</div>
        <p class="card-fact">${hero.fact}</p>
      </div>
      <div class="swipe-indicator like-indicator">👍 Падабаецца</div>
      <div class="swipe-indicator dislike-indicator">👎 Прапусціць</div>
      <div class="swipe-indicator detail-indicator">📖 Падрабязнасці</div>
      <div class="swipe-indicator favorite-indicator">⭐ У закладкі</div>
    `;
    
    return card;
  }

  getCurrentCard() {
    const stack = document.getElementById('cardsStack');
    return stack ? stack.firstElementChild : null;
  }

  // Swipe Actions
  swipeLeft() {
    if (this.currentIndex >= this.heroes.length) return;
    
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      currentCard.classList.add('swipe-left');
      setTimeout(() => {
        this.nextCard();
      }, 300);
    }
  }

  swipeRight() {
    if (this.currentIndex >= this.heroes.length) return;
    
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      currentCard.classList.add('swipe-right');
      setTimeout(() => {
        this.nextCard();
      }, 300);
    }
  }

  swipeUp() {
    if (this.currentIndex >= this.heroes.length) return;
    
    this.showDetailModal(this.heroes[this.currentIndex]);
    
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      currentCard.classList.add('swipe-up');
      setTimeout(() => {
        this.resetCardPosition();
      }, 300);
    }
  }

  swipeDown() {
    if (this.currentIndex >= this.heroes.length) return;
    
    this.addToFavorites();
    
    const currentCard = this.getCurrentCard();
    if (currentCard) {
      currentCard.classList.add('swipe-down');
      setTimeout(() => {
        this.nextCard();
      }, 300);
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

  addToFavorites() {
    if (this.currentIndex >= this.heroes.length) return;
    
    const hero = this.heroes[this.currentIndex];
    this.favorites.add(hero.id);
    this.saveFavorites();
    this.updateFavoritesCount();
    
    // Show notification
    this.showNotification(`✅ ${hero.name} даданы ў закладкі`);
  }

  removeFromFavorite(heroId) {
    this.favorites.delete(heroId);
    this.saveFavorites();
    this.updateFavoritesCount();
    this.renderFavoritesList();
  }

  // UI State Management
  showLoadingState() {
    const loading = document.getElementById('loadingState');
    const stack = document.getElementById('cardsStack');
    const empty = document.getElementById('emptyState');
    
    if (loading) loading.classList.remove('hidden');
    if (stack) stack.classList.add('hidden');
    if (empty) empty.classList.add('hidden');
  }

  hideLoadingState() {
    const loading = document.getElementById('loadingState');
    if (loading) loading.classList.add('hidden');
  }

  showEmptyState() {
    const empty = document.getElementById('emptyState');
    const stack = document.getElementById('cardsStack');
    
    if (empty) empty.classList.remove('hidden');
    if (stack) stack.classList.add('hidden');
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
      const progress = (this.currentIndex / this.heroes.length) * 100;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${this.currentIndex}/${this.heroes.length}`;
    }
  }

  updateFavoritesCount() {
    const countElement = document.getElementById('favoritesCount');
    if (countElement) {
      countElement.textContent = this.favorites.size;
    }
  }

  // Modal Management
  showDetailModal(hero) {
    const modal = document.getElementById('detailModal');
    const image = document.getElementById('detailImage');
    const name = document.getElementById('detailName');
    const meta = document.getElementById('detailMeta');
    const description = document.getElementById('detailDescription');
    
    if (modal && image && name && meta && description) {
      image.src = hero.image;
      image.alt = hero.name;
      name.textContent = hero.name;
      meta.innerHTML = `
        <div>${hero.years}</div>
        <div>${hero.field} • ${hero.category}</div>
      `;
      
      // Get additional fact
      const additionalFact = this.getAdditionalFact(hero.name);
      description.innerHTML = `
        <p>${hero.fact}</p>
        ${additionalFact ? `
          <div style="margin-top: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid var(--accent-primary);">
            <strong>📌 Дадатковы факт:</strong>
            <p style="margin: 8px 0 0; color: var(--text-secondary);">${additionalFact.fact}</p>
          </div>
        ` : ''}
      `;
      
      modal.classList.remove('hidden');
      modal.dataset.currentHero = hero.id;
    }
  }

  hideDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showMenu() {
    const modal = document.getElementById('menuModal');
    if (modal) {
      this.updateFavoritesCount();
      modal.classList.remove('hidden');
    }
  }

  hideMenu() {
    const modal = document.getElementById('menuModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showFavorites() {
    this.hideMenu();
    const modal = document.getElementById('favoritesModal');
    const list = document.getElementById('favoritesList');
    const empty = document.getElementById('emptyFavorites');
    
    if (modal && list && empty) {
      this.renderFavoritesList();
      
      if (this.favorites.size === 0) {
        list.classList.add('hidden');
        empty.classList.remove('hidden');
      } else {
        list.classList.remove('hidden');
        empty.classList.add('hidden');
      }
      
      modal.classList.remove('hidden');
    }
  }

  hideFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  renderFavoritesList() {
    const list = document.getElementById('favoritesList');
    if (!list) return;
    
    list.innerHTML = '';
    
    this.favorites.forEach(heroId => {
      const hero = this.heroes.find(h => h.id === heroId);
      if (hero) {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
          <img class="favorite-image" src="${hero.image}" alt="${hero.name}"
               onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23f0f0f0\"/><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"8\" fill=\"%23666\" text-anchor=\"middle\" dy=\".3em\">${hero.name}</text></svg>'">
          <div class="favorite-info">
            <div class="favorite-name">${hero.name}</div>
            <div class="favorite-meta">${hero.years} • ${hero.field}</div>
          </div>
          <button class="remove-favorite" onclick="app.removeFromFavorite(${hero.id})">
            ✕
          </button>
        `;
        
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('remove-favorite')) {
            this.showDetailModal(hero);
            this.hideFavoritesModal();
          }
        });
        
        list.appendChild(item);
      }
    });
  }

  showInstructions() {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.classList.remove('hidden');
    }
  }

  hideInstructions() {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.classList.add('hidden');
    }
  }

  showAbout() {
    this.hideMenu();
    const aboutHero = {
      id: 'about',
      name: 'Аб праекце',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">🇧🇾</text></svg>',
      years: '2024',
      field: 'Гісторыя і культура',
      category: 'Адукацыя',
      fact: 'Гэты праект прысвечаны памяці герояў Беларусі. Свайпайце карткі, каб адкрываць гісторыі: управа - прапусціць, улева - падабаецца, уверх - падрабязнасці, уніз - у закладкі.'
    };
    
    this.showDetailModal(aboutHero);
  }

  resetApp() {
    this.currentIndex = 0;
    this.hideMenu();
    this.hideFavoritesModal();
    this.initializeUI();
    this.showNotification('🗂️ Пачалі нанова!');
  }

  getAdditionalFact(heroName) {
    if (!this.facts) return null;
    const heroFacts = this.facts.filter(fact => fact.name === heroName);
    return heroFacts.length > 0 ? heroFacts[Math.floor(Math.random() * heroFacts.length)] : null;
  }

  shareCurrentHero() {
    const modal = document.getElementById('detailModal');
    const heroId = modal?.dataset.currentHero;
    const hero = this.heroes.find(h => h.id == heroId);
    
    if (!hero) return;
    
    const shareText = `🇧🇾 ${hero.name}\n${hero.years}\n${hero.fact}\n\n#ГероіБеларусі`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Герой Беларусі',
        text: shareText
      }).catch(() => {
        this.copyToClipboard(shareText);
      });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
      () => this.showNotification('📋 Тэкст скапіяваны!'),
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
  app = new SwipeHeroesApp();
});

// Make app globally available
window.app = app;