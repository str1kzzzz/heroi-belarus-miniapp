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
      setTimeout(() => this.showInstructions(), 1000);
      localStorage.setItem('instructionsShown', 'true');
    }

    console.log('✅ App initialized with', this.heroes.length, 'heroes (shuffled randomly)');
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

    // New modal buttons
    this.addEvent('#closeSearchBtn', 'click', () => this.hideSearch());
    this.addEvent('#closeStatsBtn', 'click', () => this.hideStats());
    this.addEvent('#closeRandomBtn', 'click', () => this.hideRandom());
    this.addEvent('#anotherRandomBtn', 'click', () => this.showRandomHero());

    // Search functionality
    this.addEvent('#searchInput', 'input', (e) => this.performSearch(e.target.value));

    // Touch events
    this.setupTouchEvents();
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

    // Mouse events
    stack.addEventListener('mousedown', (e) => this.handleStart(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', (e) => this.handleEnd(e));

    // Touch events
    stack.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleEnd(e));
  }

  handleStart(e) {
    if (this.currentIndex >= this.heroes.length) return;

    this.isSwiping = true;
    const point = e.type.includes('mouse') ? e : e.touches[0];
    this.startX = point.clientX;
    this.startY = point.clientY;

    const card = this.getCurrentCard();
    if (card) {
      card.classList.add('swiping');
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
      card.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotate}deg)`;
      this.updateIndicators(card);
    }

    e.preventDefault();
  }

  handleEnd(e) {
    if (!this.isSwiping || this.currentIndex >= this.heroes.length) return;

    this.isSwiping = false;
    const card = this.getCurrentCard();

    if (card) {
      card.classList.remove('swiping');

      // Check swipe direction
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

  updateIndicators(card) {
    card.classList.remove('swipe-left', 'swipe-right', 'swipe-up', 'swipe-down');

    if (Math.abs(this.currentY) > Math.abs(this.currentX)) {
      if (this.currentY < -this.verticalSwipeThreshold) {
        card.classList.add('swipe-up');
      } else if (this.currentY > this.verticalSwipeThreshold) {
        card.classList.add('swipe-down');
      }
    } else {
      if (this.currentX < -this.swipeThreshold) {
        card.classList.add('swipe-left');
      } else if (this.currentX > this.swipeThreshold) {
        card.classList.add('swipe-right');
      }
    }
  }

  resetCard() {
    const card = this.getCurrentCard();
    if (card) {
      card.style.transform = '';
      card.classList.remove('swipe-left', 'swipe-right', 'swipe-up', 'swipe-down');
    }
  }

  renderCards() {
    const stack = document.getElementById('cardsStack');
    if (!stack) {
      console.error('Cards stack not found!');
      return;
    }

    stack.innerHTML = '';

    const cardsToShow = Math.min(3, this.heroes.length - this.currentIndex);

    for (let i = 0; i < cardsToShow; i++) {
      const hero = this.heroes[this.currentIndex + i];
      const card = this.createCard(hero, i);

      // Add entry animation for the top card
      if (i === 0) {
        card.classList.add('entering');
      }

      stack.appendChild(card);
    }

    console.log(`Rendered ${cardsToShow} cards`);
  }

  createCard(hero, index) {
    const card = document.createElement('div');
    card.className = 'hero-card premium-glass';
    card.style.zIndex = 10 - index;
    card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 10}px)`;

    // Create image
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = hero.image;
    img.alt = hero.name;
    img.onerror = () => {
      img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
    };

    // Create content
    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = `
      <h3 class="card-name">${hero.name}</h3>
      <div class="card-meta">${hero.years} • ${hero.field}</div>
      <p class="card-fact">${hero.fact}</p>
    `;

    // Create indicators
    const likeIndicator = document.createElement('div');
    likeIndicator.className = 'swipe-indicator like-indicator';
    likeIndicator.textContent = '👍 Падабаецца';

    const dislikeIndicator = document.createElement('div');
    dislikeIndicator.className = 'swipe-indicator dislike-indicator';
    dislikeIndicator.textContent = '👎 Прапусціць';

    const detailIndicator = document.createElement('div');
    detailIndicator.className = 'swipe-indicator detail-indicator';
    detailIndicator.textContent = '📖 Падрабязнасці';

    const favoriteIndicator = document.createElement('div');
    favoriteIndicator.className = 'swipe-indicator favorite-indicator';
    favoriteIndicator.textContent = '⭐ У закладкі';

    // Create sparkle container
    const sparkles = document.createElement('div');
    sparkles.className = 'swipe-sparkles';

    // Add sparkle particles
    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 0.5 + 's';
      sparkles.appendChild(sparkle);
    }

    card.appendChild(img);
    card.appendChild(content);
    card.appendChild(likeIndicator);
    card.appendChild(dislikeIndicator);
    card.appendChild(detailIndicator);
    card.appendChild(favoriteIndicator);
    card.appendChild(sparkles);

    return card;
  }

  getCurrentCard() {
    const stack = document.getElementById('cardsStack');
    return stack ? stack.firstElementChild : null;
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
    const stack = document.getElementById('cardsStack');

    if (empty) empty.classList.remove('hidden');
    if (stack) stack.classList.add('hidden');

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
      meta.innerHTML = `${hero.years}<br>${hero.field} • ${hero.category}`;

      const extraFact = this.getExtraFact(hero.name);
      description.innerHTML = `
        <p>${hero.fact}</p>
        ${extraFact ? `<div style="margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.1); border-radius: 12px;"><strong>📌 Дадатковы факт:</strong><br>${extraFact.fact}</div>` : ''}
      `;

      modal.classList.remove('hidden');
    }
  }

  hideDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.add('hidden');
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
    if (modal) modal.classList.add('hidden');
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

      modal.classList.remove('hidden');
    }
  }

  hideFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) modal.classList.add('hidden');
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
    const instructions = document.getElementById('instructions');
    if (instructions) instructions.classList.remove('hidden');
  }

  hideInstructions() {
    const instructions = document.getElementById('instructions');
    if (instructions) instructions.classList.add('hidden');
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
    const stack = document.getElementById('cardsStack');
    if (empty) empty.classList.add('hidden');
    if (stack) stack.classList.remove('hidden');
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
      results.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">Пачніце ўводзіць імя героя...</p>';
      modal.classList.remove('hidden');
      input.focus();
    }
  }

  hideSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) modal.classList.add('hidden');
  }

  performSearch(query) {
    const results = document.getElementById('searchResults');
    if (!results) return;

    if (query.length < 2) {
      results.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">Пачніце ўводзіць імя героя...</p>';
      return;
    }

    const filtered = this.heroes.filter(hero =>
      hero.name.toLowerCase().includes(query.toLowerCase()) ||
      hero.field.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      results.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">Героі не знойдзены</p>';
      return;
    }

    results.innerHTML = '';
    filtered.forEach(hero => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        background: var(--bg-secondary);
        border-radius: 12px;
        cursor: pointer;
        transition: var(--transition-smooth);
      `;

      const img = document.createElement('img');
      img.src = hero.image;
      img.alt = hero.name;
      img.style.cssText = 'width: 40px; height: 40px; border-radius: 8px; margin-right: 12px; object-fit: cover;';
      img.onerror = () => {
        img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
      };

      const info = document.createElement('div');
      info.innerHTML = `
        <div style="font-weight: 600;">${hero.name}</div>
        <div style="font-size: 12px; color: var(--text-tertiary);">${hero.years} • ${hero.field}</div>
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
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
          <h3>Ваша статыстыка</h3>
        </div>

        <div style="display: grid; gap: 16px;">
          <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--accent-primary);">${viewedHeroes}</div>
            <div style="color: var(--text-secondary);">Прагледжана герояў</div>
          </div>

          <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--accent-warning);">${favoriteCount}</div>
            <div style="color: var(--text-secondary);">У закладках</div>
          </div>

          <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--accent-success);">${totalHeroes}</div>
            <div style="color: var(--text-secondary);">Усяго герояў</div>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <h4 style="margin-bottom: 16px;">Героі па катэгорыях:</h4>
          ${Object.entries(categories).map(([category, count]) =>
            `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
              <span>${category}</span>
              <span style="font-weight: 600;">${count}</span>
            </div>`
          ).join('')}
        </div>
      `;

      modal.classList.remove('hidden');
    }
  }

  hideStats() {
    const modal = document.getElementById('statsModal');
    if (modal) modal.classList.add('hidden');
  }

  showRandomHero() {
    const modal = document.getElementById('randomModal');
    const content = document.getElementById('randomHeroContent');

    if (modal && content) {
      const randomHero = this.heroes[Math.floor(Math.random() * this.heroes.length)];

      content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="width: 120px; height: 120px; margin: 0 auto 16px; border-radius: 16px; overflow: hidden; background: var(--bg-secondary);">
            <img src="${randomHero.image}" alt="${randomHero.name}"
                 style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%23666" text-anchor="middle" dy=".3em">${randomHero.name}</text></svg>'">
          </div>
          <h3 style="margin-bottom: 8px;">${randomHero.name}</h3>
          <div style="color: var(--text-secondary); margin-bottom: 16px;">${randomHero.years} • ${randomHero.field}</div>
          <p style="line-height: 1.6; color: var(--text-secondary);">${randomHero.fact}</p>
        </div>
      `;

      modal.classList.remove('hidden');
    }
  }

  hideRandom() {
    const modal = document.getElementById('randomModal');
    if (modal) modal.classList.add('hidden');
  }

  showSuccessFeedback(icon) {
    const feedback = document.createElement('div');
    feedback.className = 'success-feedback';

    const iconElement = document.createElement('div');
    iconElement.className = 'success-icon';
    iconElement.textContent = icon;

    feedback.appendChild(iconElement);
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 600);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(20px);
      color: white;
      padding: 16px 24px;
      border-radius: 16px;
      font-weight: 500;
      z-index: 10000;
      text-align: center;
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

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new BelarusHeroesApp();
});

// Make app globally available
window.app = app;