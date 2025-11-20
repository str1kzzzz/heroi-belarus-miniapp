// app.js - Complete rewrite for Belarusian Heroes App
class BelarusHeroesApp {
  constructor() {
    this.heroes = [];
    this.facts = [];
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

  init() {
    console.log('🚀 Initializing Belarus Heroes App...');

    // Initialize Telegram Web App if available
    this.initTelegramWebApp();

    // Load data immediately
    this.loadData();

    // Shuffle heroes for random order
    this.shuffleHeroes();

    // Load favorites from localStorage
    this.loadFavorites();

    // Setup UI
    this.setupEventListeners();
    this.renderCards();
    this.updateProgress();

    // Show instructions for first-time users
    if (!localStorage.getItem('instructionsShown')) {
      setTimeout(() => this.showInstructions(), 1500);
      localStorage.setItem('instructionsShown', 'true');
    }

    console.log('✅ App initialized with', this.heroes.length, 'heroes (shuffled randomly)');
  }

  initTelegramWebApp() {
    // Check if running in Telegram Web App
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      console.log('📱 Running in Telegram Web App');

      this.telegramWebApp = Telegram.WebApp;

      // Mark as Telegram Web App for CSS
      document.body.classList.add('telegram-webapp');

      // Set Telegram theme colors if available
      this.applyTelegramTheme();

      // Handle viewport changes
      this.telegramWebApp.onEvent('viewportChanged', () => {
        this.handleViewportChange();
      });

      // Expand to full height
      this.telegramWebApp.expand();

      // Enable closing confirmation
      this.telegramWebApp.enableClosingConfirmation();

      // Set app header color
      this.telegramWebApp.setHeaderColor('#000000');

      // Handle back button
      this.telegramWebApp.onEvent('backButtonClicked', () => {
        // Close any open modals first
        const openModals = document.querySelectorAll('.modal.open');
        if (openModals.length > 0) {
          openModals.forEach(modal => modal.classList.remove('open'));
          return;
        }
        // If no modals open, show menu
        this.showMenu();
      });

      // Show back button
      this.telegramWebApp.BackButton.show();

      console.log('✅ Telegram Web App initialized');
    } else {
      console.log('🌐 Running in regular browser');
    }
  }


  applyTelegramTheme() {
    if (!this.telegramWebApp) return;

    const theme = this.telegramWebApp.themeParams;
    if (theme) {
      // Apply Telegram theme colors to CSS variables
      const root = document.documentElement;
      if (theme.bg_color) root.style.setProperty('--bg-primary', theme.bg_color);
      if (theme.secondary_bg_color) root.style.setProperty('--bg-secondary', theme.secondary_bg_color);
      if (theme.text_color) root.style.setProperty('--text-primary', theme.text_color);
      if (theme.hint_color) root.style.setProperty('--text-tertiary', theme.hint_color);
      if (theme.link_color) root.style.setProperty('--accent-primary', theme.link_color);

      console.log('🎨 Applied Telegram theme colors');
    }
  }

  handleViewportChange() {
    if (!this.telegramWebApp) return;

    // Update viewport height for dynamic changes
    const viewportHeight = this.telegramWebApp.viewportHeight;
    if (viewportHeight) {
      document.documentElement.style.setProperty('--telegram-viewport-height', `${viewportHeight}px`);
      console.log('📐 Viewport changed to:', viewportHeight);
    }
  }

  loadData() {
    console.log('📚 Loading hero data...');

    // Use local JSON data directly
    this.heroes = [
      {
        "id": 1,
        "name": "Франциск Скорина",
        "years": "ок. 1490 — ок. 1551",
        "field": "Просветитель, первопечатник",
        "category": "Культура",
        "fact": "Франциск Скорина напечатал первую книгу на белорусской земле в 1517 году — «Псалтыр».",
        "image": "images/francisk.jpg"
      },
      {
        "id": 2,
        "name": "Кастусь Калиновский",
        "years": "1838 — 1864",
        "field": "Революционер, публицист",
        "category": "История",
        "fact": "Калиновский был одним из лидеров восстания 1863 года против Российской империи.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/1/16/Kastuś_Kalinouski.jpg"
      },
      {
        "id": 3,
        "name": "Янка Купала",
        "years": "1882 — 1942",
        "field": "Поэт, драматург",
        "category": "Культура",
        "fact": "Янка Купала — один из основателей современной белорусской литературы.",
        "image": "images/kupala.jpg"
      },
      {
        "id": 4,
        "name": "Якуб Колас",
        "years": "1882 — 1956",
        "field": "Писатель, академик",
        "category": "Культура",
        "fact": "Автор эпопеи «На ростанях» и один из основателей Академии наук Беларуси.",
        "image": "images/kolas_yakub.jpg"
      },
      {
        "id": 5,
        "name": "Максим Богданович",
        "years": "1891 — 1917",
        "field": "Поэт, критик",
        "category": "Культура",
        "fact": "Автор стихотворения «Пагоня», ставшего символом национального духа Беларуси.",
        "image": "images/maxim_bogdanovich.JPG"
      },
      {
        "id": 6,
        "name": "Ефросинья Полоцкая",
        "years": "ок. 1104 — ок. 1173",
        "field": "Игуменья, просветительница",
        "category": "Культура",
        "fact": "Основала монастырь в Полоцке и способствовала развитию образования и культуры.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Euphrosyne_of_Polotsk.jpg/200px-Euphrosyne_of_Polotsk.jpg"
      },
      {
        "id": 7,
        "name": "Симеон Полоцкий",
        "years": "1629 — 1680",
        "field": "Поэт, драматург, педагог",
        "category": "Культура",
        "fact": "Один из первых белорусских и русских поэтов Нового времени, основатель школьного театра.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Simeon_Polotsky.jpg/200px-Simeon_Polotsky.jpg"
      },
      {
        "id": 8,
        "name": "Тадеуш Костюшко",
        "years": "1746 — 1817",
        "field": "Военачальник, политик",
        "category": "История",
        "fact": "Лидер восстания 1794 года в Речи Посполитой, национальный герой Польши, Беларуси и Литвы.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Tadeusz_Kościuszko.PNG/200px-Tadeusz_Kościuszko.PNG"
      },
      {
        "id": 9,
        "name": "Винцент Дунин-Марцинкевич",
        "years": "1808 — 1884",
        "field": "Поэт, драматург, этнограф",
        "category": "Культура",
        "fact": "Один из основателей белорусской литературы, автор первой белорусской пьесы.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Vincent_Dunin-Marcinkievič.jpg/200px-Vincent_Dunin-Marcinkievič.jpg"
      },
      {
        "id": 10,
        "name": "Адам Мицкевич",
        "years": "1798 — 1855",
        "field": "Поэт, философ",
        "category": "Культура",
        "fact": "Великий польский и белорусский поэт, автор «Пана Тадеуша», родился в Беларуси.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Adam_Mickiewicz.PNG/200px-Adam_Mickiewicz.PNG"
      },
      {
        "id": 11,
        "name": "Констанция Буйло",
        "years": "1898 — 1986",
        "field": "Партизанка, Герой Советского Союза",
        "category": "Война",
        "fact": "Командир женского партизанского отряда во время Великой Отечественной войны.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Konstantyja_Bujło.jpg/200px-Konstantyja_Bujło.jpg"
      },
      {
        "id": 12,
        "name": "Павел Сухой",
        "years": "1895 — 1975",
        "field": "Авиаконструктор",
        "category": "Наука",
        "fact": "Создал знаменитые самолёты Су-2, Су-7, Су-9, основатель КБ Сухого.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Pavel_Sukhoi.jpg/200px-Pavel_Sukhoi.jpg"
      },
      {
        "id": 13,
        "name": "Владимир Короткевич",
        "years": "1930 — 1984",
        "field": "Писатель-фантаст",
        "category": "Культура",
        "fact": "Один из основателей белорусской научной фантастики, автор «Чёрного замка Ольшанского».",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Vladimir_Korotkevich.jpg/200px-Vladimir_Korotkevich.jpg"
      },
      {
        "id": 14,
        "name": "Рыгор Барадулин",
        "years": "1935 — 2014",
        "field": "Поэт, переводчик",
        "category": "Культура",
        "fact": "Народный поэт Беларуси, лауреат Государственной премии, переводил Шекспира и Пушкина.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ryhor_Baradulin.jpg/200px-Ryhor_Baradulin.jpg"
      },
      {
        "id": 15,
        "name": "Василий Быков",
        "years": "1924 — 2003",
        "field": "Писатель, фронтовик",
        "category": "Культура",
        "fact": "Автор произведений о войне, лауреат Государственной премии СССР.",
        "image": "images/bykov.jpg"
      },
      {
        "id": 16,
        "name": "Светлана Алексиевич",
        "years": "род. 1948",
        "field": "Писательница, журналистка",
        "category": "Культура",
        "fact": "Лауреат Нобелевской премии по литературе 2015 года за документальную прозу.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Svetlana_Alexievich_2013.jpg/200px-Svetlana_Alexievich_2013.jpg"
      },
      {
        "id": 17,
        "name": "Виктор Гончаренко",
        "years": "род. 1977",
        "field": "Футбольный тренер",
        "category": "Спорт",
        "fact": "Тренер сборной Беларуси по футболу, работал с ведущими европейскими клубами.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Viktor_Goncharenko_2018.jpg/200px-Viktor_Goncharenko_2018.jpg"
      },
      {
        "id": 18,
        "name": "Мария Игнатенко",
        "years": "1929 — 1943",
        "field": "Партизанка, пионер-герой",
        "category": "Война",
        "fact": "Юная партизанка, казнённая фашистами, символ мужества белорусских детей.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Maria_Ignatenko.jpg/200px-Maria_Ignatenko.jpg"
      },
      {
        "id": 19,
        "name": "Иван Мележ",
        "years": "1921 — 1976",
        "field": "Писатель",
        "category": "Культура",
        "fact": "Автор трилогии «Полесская хроника», классик белорусской литературы.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ivan_Melezh.jpg/200px-Ivan_Melezh.jpg"
      },
      {
        "id": 20,
        "name": "Александр Лукашенко",
        "years": "род. 1954",
        "field": "Президент Республики Беларусь",
        "category": "Политика",
        "fact": "Первый и единственный Президент Республики Беларусь с 1994 года.",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Alexander_Lukashenko_2020.jpg/200px-Alexander_Lukashenko_2020.jpg"
      }
    ];

    this.facts = [
      {"id": 1, "name": "Франциск Скорина", "fact": "Первый белорусский книгопечатник издал «Псалтыр» в Праге в 1517 году."},
      {"id": 2, "name": "Кастусь Калиновский", "fact": "Его письма «Мужыцкая праўда» стали символом борьбы за свободу."},
      {"id": 3, "name": "Янка Купала", "fact": "Настоящее имя — Иван Луцевич."},
      {"id": 4, "name": "Якуб Колас", "fact": "Псевдоним означает «Колос» — символ родной земли."},
      {"id": 5, "name": "Максим Богданович", "fact": "Умер в возрасте 25 лет, но успел изменить белорусскую литературу навсегда."},
      {"id": 6, "name": "Ефросинья Полоцкая", "fact": "Основала Спасо-Преображенский монастырь и Крестовоздвиженскую церковь в Полоцке."},
      {"id": 7, "name": "Симеон Полоцкий", "fact": "Написал первую русскую пьесу «Комедия притчи о блудном сыне»."},
      {"id": 8, "name": "Тадеуш Костюшко", "fact": "Участвовал в Войне за независимость США, получил звание бригадного генерала."},
      {"id": 9, "name": "Винцент Дунин-Марцинкевич", "fact": "Собрал более 2000 белорусских народных песен и опубликовал их."},
      {"id": 10, "name": "Адам Мицкевич", "fact": "Его поэма «Пан Тадеуш» считается национальным эпосом Польши."},
      {"id": 11, "name": "Констанция Буйло", "fact": "Её отряд уничтожил более 300 немецких солдат и офицеров."},
      {"id": 12, "name": "Павел Сухой", "fact": "Создал первый в СССР реактивный истребитель Су-9."},
      {"id": 13, "name": "Владимир Короткевич", "fact": "Написал более 20 книг, включая исторические романы и фантастику."},
      {"id": 14, "name": "Рыгор Барадулин", "fact": "Перевёл на белорусский язык произведения Шекспира, Гёте и Пушкина."},
      {"id": 15, "name": "Василий Быков", "fact": "Его произведения переведены на 40 языков мира."},
      {"id": 16, "name": "Светлана Алексиевич", "fact": "Её книги «У войны не женское лицо» и «Последние свидетели» стали мировыми бестселлерами."},
      {"id": 17, "name": "Виктор Гончаренко", "fact": "Привёл «Краснодар» к победе в Кубке России в 2019 году."},
      {"id": 18, "name": "Мария Игнатенко", "fact": "Стала символом белорусского сопротивления, её именем названы улицы и школы."},
      {"id": 19, "name": "Иван Мележ", "fact": "Трилогия «Полесская хроника» переведена на многие языки."},
      {"id": 20, "name": "Александр Лукашенко", "fact": "Под его руководством Беларусь стала членом ООН и других международных организаций."}
    ];
  }

  setupEventListeners() {
    console.log('🎧 Setting up event listeners...');

    // Menu and modal buttons
    this.addEvent('#menuBtn', 'click', () => this.showMenu());
    this.addEvent('#closeMenuBtn', 'click', () => this.hideMenu());
    this.addEvent('#closeModal', 'click', () => this.hideDetailModal());
    this.addEvent('#closeDetailBtn', 'click', () => this.hideDetailModal());
    this.addEvent('#closeFavoritesBtn', 'click', () => this.hideFavoritesModal());
    this.addEvent('#closeInstructions', 'click', () => this.hideInstructions());

    // Action buttons
    this.addEvent('#dislikeBtn', 'click', () => this.dislike());
    this.addEvent('#likeBtn', 'click', () => this.like());
    this.addEvent('#favoriteBtn', 'click', () => this.favorite());

    // Menu actions
    this.addEvent('#favoritesBtn', 'click', () => this.showFavorites());
    this.addEvent('#searchBtn', 'click', () => this.showSearch());
    this.addEvent('#statsBtn', 'click', () => this.showStats());
    this.addEvent('#randomBtn', 'click', () => this.showRandomHero());
    this.addEvent('#resetAppBtn', 'click', () => this.reset());
    this.addEvent('#aboutAppBtn', 'click', () => this.showAbout());
    this.addEvent('#resetBtn', 'click', () => this.reset());

    // Share button
    this.addEvent('#shareDetailBtn', 'click', () => this.shareCurrent());

    // Modal buttons
    this.addEvent('#closeSearchBtn', 'click', () => this.hideSearch());
    this.addEvent('#closeStatsBtn', 'click', () => this.hideStats());
    this.addEvent('#closeRandomBtn', 'click', () => this.hideRandom());
    this.addEvent('#anotherRandomBtn', 'click', () => this.showRandomHero());
    this.addEvent('#startExploring', 'click', () => this.hideInstructions());

    // Modal backdrop clicks
    this.setupModalBackdropClicks();

    // Search functionality
    this.addEvent('#searchInput', 'input', (e) => this.performSearch(e.target.value));

    // Touch events
    this.setupTouchEvents();

    // Keyboard navigation
    this.setupKeyboardNavigation();
  }

  addEvent(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  setupTouchEvents() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    // Mouse events
    container.addEventListener('mousedown', (e) => this.handleStart(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', (e) => this.handleEnd(e));

    // Touch events
    container.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });
  }

  setupModalBackdropClicks() {
    // Detail modal backdrop
    const detailBackdrop = document.querySelector('#detailModal .modal-backdrop');
    if (detailBackdrop) {
      detailBackdrop.addEventListener('click', () => this.hideDetailModal());
    }

    // Menu modal backdrop
    const menuBackdrop = document.querySelector('#menuModal .modal-backdrop');
    if (menuBackdrop) {
      menuBackdrop.addEventListener('click', () => this.hideMenu());
    }

    // Favorites modal backdrop
    const favoritesBackdrop = document.querySelector('#favoritesModal .modal-backdrop');
    if (favoritesBackdrop) {
      favoritesBackdrop.addEventListener('click', () => this.hideFavoritesModal());
    }

    // Search modal backdrop
    const searchBackdrop = document.querySelector('#searchModal .modal-backdrop');
    if (searchBackdrop) {
      searchBackdrop.addEventListener('click', () => this.hideSearch());
    }

    // Stats modal backdrop
    const statsBackdrop = document.querySelector('#statsModal .modal-backdrop');
    if (statsBackdrop) {
      statsBackdrop.addEventListener('click', () => this.hideStats());
    }

    // Random modal backdrop
    const randomBackdrop = document.querySelector('#randomModal .modal-backdrop');
    if (randomBackdrop) {
      randomBackdrop.addEventListener('click', () => this.hideRandom());
    }

    // Instructions modal backdrop
    const instructionsBackdrop = document.querySelector('#instructionsModal .modal-backdrop');
    if (instructionsBackdrop) {
      instructionsBackdrop.addEventListener('click', () => this.hideInstructions());
    }
  }

  handleStart(e) {
    if (this.currentIndex >= this.heroes.length) return;

    this.isSwiping = true;
    const point = e.type.includes('mouse') ? e : e.touches[0];
    this.startX = point.clientX;
    this.startY = point.clientY;
    this.currentX = 0;
    this.currentY = 0;

    const card = this.getCurrentCard();
    if (card) {
      card.classList.add('dragging');
      card.classList.remove('liked', 'disliked', 'favorited');
      // Hide all indicators
      const indicators = card.querySelectorAll('.swipe-indicator');
      indicators.forEach(indicator => indicator.classList.remove('visible'));
    }

    // Prevent default only for touch events to avoid scroll issues
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
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
      this.updateIndicators(card);
    }

    // Prevent default for both mouse and touch to avoid text selection and scrolling
    e.preventDefault();
  }

  handleEnd(e) {
    if (!this.isSwiping || this.currentIndex >= this.heroes.length) return;

    this.isSwiping = false;
    const card = this.getCurrentCard();

    if (card) {
      card.classList.remove('dragging');

      // Check swipe direction with improved thresholds
      const absX = Math.abs(this.currentX);
      const absY = Math.abs(this.currentY);

      if (absY > this.verticalSwipeThreshold && absY > absX) {
        // Vertical swipe
        if (this.currentY < 0) {
          this.showDetails();
        } else {
          this.favorite();
        }
      } else if (absX > this.swipeThreshold) {
        // Horizontal swipe
        if (this.currentX > 0) {
          this.dislike();
        } else {
          this.like();
        }
      } else {
        // Not enough movement, reset card
        this.resetCard();
      }
    }

    this.currentX = 0;
    this.currentY = 0;
  }

  updateIndicators(card) {
    // Remove all indicator visibility
    const indicators = card.querySelectorAll('.swipe-indicator');
    indicators.forEach(indicator => indicator.classList.remove('visible'));

    if (Math.abs(this.currentY) > Math.abs(this.currentX)) {
      if (this.currentY < -this.verticalSwipeThreshold) {
        card.querySelector('.swipe-indicator.detail').classList.add('visible');
      } else if (this.currentY > this.verticalSwipeThreshold) {
        card.querySelector('.swipe-indicator.favorite').classList.add('visible');
      }
    } else {
      if (this.currentX < -this.swipeThreshold) {
        card.querySelector('.swipe-indicator.like').classList.add('visible');
      } else if (this.currentX > this.swipeThreshold) {
        card.querySelector('.swipe-indicator.dislike').classList.add('visible');
      }
    }
  }

  resetCard() {
    const card = this.getCurrentCard();
    if (card) {
      card.style.transform = '';
      card.classList.remove('dragging', 'liked', 'disliked', 'favorited');
      // Hide all indicators
      const indicators = card.querySelectorAll('.swipe-indicator');
      indicators.forEach(indicator => indicator.classList.remove('visible'));
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Only handle keyboard events when not in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.like();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.dislike();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.showDetails();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.favorite();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.showDetails();
          break;
        case 'Escape':
          // Close any open modals
          const openModals = document.querySelectorAll('.modal.open');
          if (openModals.length > 0) {
            openModals[openModals.length - 1].classList.remove('open');
          }
          break;
      }
    });
  }

  renderCards() {
    const container = document.getElementById('cardsContainer');
    if (!container) {
      console.error('Cards container not found!');
      return;
    }

    container.innerHTML = '';

    const cardsToShow = Math.min(3, this.heroes.length - this.currentIndex);

    for (let i = 0; i < cardsToShow; i++) {
      const hero = this.heroes[this.currentIndex + i];
      const card = this.createCard(hero, i);

      // Add entry animation for the top card
      if (i === 0) {
        card.classList.add('entering');
      }

      container.appendChild(card);
    }

    console.log(`Rendered ${cardsToShow} cards`);
  }

  createCard(hero, index) {
    const card = document.createElement('div');
    card.className = 'hero-card';
    card.style.zIndex = 10 - index;
    card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 8}px)`;

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'hero-image-container';

    const img = document.createElement('img');
    img.className = 'hero-image';
    img.src = hero.image;
    img.alt = hero.name;
    img.loading = 'lazy';
    img.onerror = () => {
      img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f5"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
    };

    imageContainer.appendChild(img);

    // Create content
    const content = document.createElement('div');
    content.className = 'card-content';

    const name = document.createElement('h3');
    name.className = 'card-name';
    name.textContent = hero.name;

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = `${hero.years} • ${hero.field}`;

    const description = document.createElement('p');
    description.className = 'card-description';
    description.textContent = hero.fact;

    content.appendChild(name);
    content.appendChild(meta);
    content.appendChild(description);

    // Create swipe indicators container
    const indicators = document.createElement('div');
    indicators.className = 'swipe-indicators';

    const likeIndicator = document.createElement('div');
    likeIndicator.className = 'swipe-indicator like';
    likeIndicator.textContent = 'Падабаецца';

    const dislikeIndicator = document.createElement('div');
    dislikeIndicator.className = 'swipe-indicator dislike';
    dislikeIndicator.textContent = 'Прапусціць';

    const detailIndicator = document.createElement('div');
    detailIndicator.className = 'swipe-indicator detail';
    detailIndicator.textContent = 'Падрабязнасці';

    const favoriteIndicator = document.createElement('div');
    favoriteIndicator.className = 'swipe-indicator favorite';
    favoriteIndicator.textContent = 'У закладкі';

    indicators.appendChild(likeIndicator);
    indicators.appendChild(dislikeIndicator);
    indicators.appendChild(detailIndicator);
    indicators.appendChild(favoriteIndicator);

    card.appendChild(imageContainer);
    card.appendChild(content);
    card.appendChild(indicators);

    return card;
  }

  getCurrentCard() {
    const container = document.getElementById('cardsContainer');
    return container ? container.firstElementChild : null;
  }

  like() {
    console.log('❤️ Like');
    this.showSuccessFeedback('❤️');
    this.animateCard('swipe-left');
    setTimeout(() => this.nextCard(), 300);
  }

  dislike() {
    console.log('👎 Dislike');
    this.showSuccessFeedback('👎');
    this.animateCard('swipe-right');
    setTimeout(() => this.nextCard(), 300);
  }

  favorite() {
    if (this.currentIndex >= this.heroes.length) return;

    const hero = this.heroes[this.currentIndex];
    this.favorites.add(hero.id);
    this.saveFavorites();
    this.updateFavoritesCount();

    console.log('⭐ Added to favorites:', hero.name);
    this.showSuccessFeedback('⭐');
    this.showToast(`✅ ${hero.name} даданы ў закладкі`);

    this.animateCard('swipe-down');
    setTimeout(() => this.nextCard(), 300);
  }

  showDetails() {
    if (this.currentIndex >= this.heroes.length) return;

    const hero = this.heroes[this.currentIndex];
    this.showDetailModal(hero);

    const card = this.getCurrentCard();
    if (card) {
      card.classList.add('swipe-up');
      setTimeout(() => this.resetCard(), 300);
    }
  }

  animateCard(direction) {
    const card = this.getCurrentCard();
    if (card) {
      // Add appropriate classes for visual feedback
      if (direction === 'swipe-left') {
        card.classList.add('liked');
      } else if (direction === 'swipe-right') {
        card.classList.add('disliked');
      } else if (direction === 'swipe-down') {
        card.classList.add('favorited');
      }

      // Add exit animation class
      const exitClass = direction.replace('swipe-', 'exiting-');
      card.classList.add(exitClass);

      // Remove the card after animation completes
      setTimeout(() => {
        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }
      }, 500); // Match the CSS animation duration
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
      const progress = (this.currentIndex / this.heroes.length) * 100;
      fill.style.width = `${progress}%`;
      text.textContent = `${this.currentIndex}/${this.heroes.length}`;
    }
  }

  updateFavoritesCount() {
    const countElement = document.getElementById('favoritesCount');
    if (countElement) {
      countElement.textContent = this.favorites.size;
    }
  }

  showEmptyState() {
    const empty = document.getElementById('emptyState');
    const container = document.getElementById('cardsContainer');

    if (empty) empty.classList.remove('hidden');
    if (container) container.classList.add('hidden');

    console.log('🏁 All heroes viewed!');
  }

  // Modal functions
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
      meta.innerHTML = `${hero.years}<br><span style="color: var(--color-gray-600);">${hero.field} • ${hero.category}</span>`;

      const extraFact = this.getExtraFact(hero.name);
      description.innerHTML = `
        <p style="margin: 0; line-height: 1.6; color: var(--color-gray-700);">${hero.fact}</p>
        ${extraFact ? `<div style="margin-top: 1.5rem; padding: 1rem; background: var(--color-gray-50); border-radius: 0.5rem; border: 1px solid var(--color-gray-200);"><strong style="color: var(--color-gray-900);">📌 Дадатковы факт:</strong><br><span style="color: var(--color-gray-700);">${extraFact.fact}</span></div>` : ''}
      `;

      modal.classList.add('open');
    }
  }

  hideDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('open');
  }

  showMenu() {
    const modal = document.getElementById('menuModal');
    if (modal) {
      this.updateFavoritesCount();
      modal.classList.add('open');
    }
  }

  hideMenu() {
    const modal = document.getElementById('menuModal');
    if (modal) modal.classList.remove('open');
  }

  showFavorites() {
    this.hideMenu();
    const modal = document.getElementById('favoritesModal');
    const list = document.getElementById('favoritesList');
    const empty = document.getElementById('emptyFavorites');

    if (modal && list && empty) {
      this.renderFavorites();

      if (this.favorites.size === 0) {
        list.classList.add('hidden');
        empty.classList.remove('hidden');
      } else {
        list.classList.remove('hidden');
        empty.classList.add('hidden');
      }

      modal.classList.add('open');
    }
  }

  hideFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) modal.classList.remove('open');
  }

  renderFavorites() {
    const list = document.getElementById('favoritesList');
    if (!list) return;

    list.innerHTML = '';

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
          img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f5"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
        };

        const info = document.createElement('div');
        info.className = 'favorite-info';
        info.innerHTML = `
          <div class="favorite-name">${hero.name}</div>
          <div class="favorite-meta">${hero.years} • ${hero.field}</div>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-favorite';
        removeBtn.innerHTML = '✕';
        removeBtn.onclick = () => this.removeFavorite(hero.id);

        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(removeBtn);

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

  removeFavorite(heroId) {
    this.favorites.delete(heroId);
    this.saveFavorites();
    this.updateFavoritesCount();
    this.renderFavorites();
    this.showToast('🗑️ Выдалена з закладак');
  }

  showInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) modal.classList.add('open');
  }

  hideInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) modal.classList.remove('open');
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

  reset() {
    this.currentIndex = 0;
    this.shuffleHeroes();
    this.hideMenu();
    this.hideFavoritesModal();
    this.hideDetailModal();
    this.hideEmptyState();
    this.renderCards();
    this.updateProgress();
    this.showToast('🔀 Героі перамешаны! Пачалі нанова!');
  }

  hideEmptyState() {
    const empty = document.getElementById('emptyState');
    const container = document.getElementById('cardsContainer');
    if (empty) empty.classList.add('hidden');
    if (container) container.classList.remove('hidden');
  }

  shuffleHeroes() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.heroes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.heroes[i], this.heroes[j]] = [this.heroes[j], this.heroes[i]];
    }
    console.log('🔀 Heroes shuffled randomly for new experience');
  }

  getExtraFact(heroName) {
    if (!this.facts) return null;
    const heroFacts = this.facts.filter(f => f.name === heroName);
    return heroFacts.length > 0 ? heroFacts[Math.floor(Math.random() * heroFacts.length)] : null;
  }

  shareCurrent() {
    const modal = document.getElementById('detailModal');
    const heroId = modal?.dataset.currentHero;
    const hero = this.heroes.find(h => h.id == heroId);

    if (!hero) return;

    const text = `🇧🇾 ${hero.name}\n${hero.years}\n${hero.fact}\n\n#ГероіБеларусі`;

    // Use Telegram Web App sharing if available
    if (this.telegramWebApp) {
      try {
        this.telegramWebApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`);
        return;
      } catch (e) {
        console.warn('Telegram sharing failed, falling back to clipboard');
      }
    }

    // Fallback to Web Share API or clipboard
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

  loadFavorites() {
    try {
      const saved = localStorage.getItem('belarusHeroesFavorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
        console.log(`⭐ Loaded ${this.favorites.size} favorites`);
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

  // New Features
  showSearch() {
    this.hideMenu();
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    if (modal && input && results) {
      input.value = '';
      results.innerHTML = '<p style="text-align: center; color: var(--color-gray-500); padding: 20px;">Пачніце ўводзіць імя героя...</p>';
      modal.classList.add('open');
      input.focus();
    }
  }

  hideSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) modal.classList.remove('open');
  }

  performSearch(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;

    if (query.length < 2) {
      results.innerHTML = '<p style="text-align: center; color: var(--color-gray-500); padding: 1.25rem;">Пачніце ўводзіць імя героя...</p>';
      return;
    }

    const filtered = this.heroes.filter(hero =>
      hero.name.toLowerCase().includes(query.toLowerCase()) ||
      hero.field.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      results.innerHTML = '<p style="text-align: center; color: var(--color-gray-500); padding: 1.25rem;">Героі не знойдзены</p>';
      return;
    }

    results.innerHTML = '';
    filtered.forEach(hero => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: var(--color-gray-50);
        border: 1px solid var(--color-gray-200);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: var(--transition-fast);
      `;

      const img = document.createElement('img');
      img.src = hero.image;
      img.alt = hero.name;
      img.style.cssText = 'width: 2.5rem; height: 2.5rem; border-radius: 0.375rem; margin-right: 0.75rem; object-fit: cover; border: 1px solid var(--color-gray-200);';
      img.onerror = () => {
        img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f5"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
      };

      const info = document.createElement('div');
      info.innerHTML = `
        <div style="font-weight: 600; color: var(--color-gray-900); margin-bottom: 0.125rem;">${hero.name}</div>
        <div style="font-size: 0.75rem; color: var(--color-gray-600);">${hero.years} • ${hero.field}</div>
      `;

      item.appendChild(img);
      item.appendChild(info);

      item.addEventListener('click', () => {
        this.showDetailModal(hero);
        this.hideSearch();
      });

      results.appendChild(item);
    });
  }

  showStats() {
    this.hideMenu();
    const modal = document.getElementById('statsModal');
    const content = document.getElementById('statsContent');

    if (modal && content) {
      const totalHeroes = this.heroes.length;
      const viewedHeroes = this.currentIndex;
      const favoriteCount = this.favorites.size;
      const categories = {};

      this.heroes.forEach(hero => {
        categories[hero.category] = (categories[hero.category] || 0) + 1;
      });

      content.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
          <h3 style="margin: 0;">Ваша статыстыка</h3>
        </div>

        <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
          <div style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem; text-align: center; border: 1px solid var(--color-gray-200);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.25rem;">${viewedHeroes}</div>
            <div style="color: var(--color-gray-600); font-size: 0.875rem;">Прагледжана герояў</div>
          </div>

          <div style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem; text-align: center; border: 1px solid var(--color-gray-200);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-warning); margin-bottom: 0.25rem;">${favoriteCount}</div>
            <div style="color: var(--color-gray-600); font-size: 0.875rem;">У закладках</div>
          </div>

          <div style="background: var(--color-gray-50); padding: 1rem; border-radius: 0.5rem; text-align: center; border: 1px solid var(--color-gray-200);">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 0.25rem;">${totalHeroes}</div>
            <div style="color: var(--color-gray-600); font-size: 0.875rem;">Усяго герояў</div>
          </div>
        </div>

        <div>
          <h4 style="margin-bottom: 1rem; color: var(--color-gray-900);">Героі па катэгорыях:</h4>
          ${Object.entries(categories).map(([category, count]) =>
            `<div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--color-gray-200);">
              <span style="color: var(--color-gray-700);">${category}</span>
              <span style="font-weight: 600; color: var(--color-gray-900);">${count}</span>
            </div>`
          ).join('')}
        </div>
      `;

      modal.classList.add('open');
    }
  }

  hideStats() {
    const modal = document.getElementById('statsModal');
    if (modal) modal.classList.remove('open');
  }

  showRandomHero() {
    this.hideMenu();
    const modal = document.getElementById('randomModal');
    const content = document.getElementById('randomHeroContent');

    if (modal && content) {
      const randomHero = this.heroes[Math.floor(Math.random() * this.heroes.length)];

      content.innerHTML = `
        <div style="text-align: center;">
          <div style="width: 8rem; height: 8rem; margin: 0 auto 1rem; border-radius: 0.75rem; overflow: hidden; background: var(--color-gray-100); border: 1px solid var(--color-gray-200);">
            <img src="${randomHero.image}" alt="${randomHero.name}"
                 style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f5f5"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${randomHero.name}</text></svg>'">
          </div>
          <h3 style="margin-bottom: 0.5rem; color: var(--color-gray-900);">${randomHero.name}</h3>
          <div style="color: var(--color-gray-600); margin-bottom: 1rem; font-size: 0.875rem;">${randomHero.years} • ${randomHero.field}</div>
          <p style="line-height: 1.6; color: var(--color-gray-700); margin: 0;">${randomHero.fact}</p>
        </div>
      `;

      modal.classList.add('open');
    }
  }

  hideRandom() {
    const modal = document.getElementById('randomModal');
    if (modal) modal.classList.remove('open');
  }

  showSuccessFeedback(icon) {
    const feedback = document.createElement('div');
    feedback.className = 'success-feedback';

    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
      font-size: 3rem;
      animation: pulse 0.6s ease-out;
    `;
    iconElement.textContent = icon;

    feedback.appendChild(iconElement);
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
}


// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new BelarusHeroesApp();
});

// Make app globally available
window.app = app;