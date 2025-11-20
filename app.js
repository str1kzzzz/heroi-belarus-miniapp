// Belarusian Heroes App - Clean Implementation
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
    this.swipeThreshold = 80;
    this.verticalSwipeThreshold = 100;

    this.init();
  }

  init() {
    this.loadData();
    this.shuffleHeroes();
    this.loadFavorites();
    this.setupEventListeners();
    this.renderCards();
    this.updateProgress();
    this.showInstructions();
  }

  loadData() {
    // Hero data
    this.heroes = [
      { id: 1, name: "Франциск Скорина", years: "ок. 1490 — ок. 1551", field: "Просветитель, первопечатник", category: "Культура", fact: "Франциск Скорина напечатал первую книгу на белорусской земле в 1517 году — «Псалтыр».", image: "images/francisk.jpg" },
      { id: 2, name: "Кастусь Калиновский", years: "1838 — 1864", field: "Революционер, публицист", category: "История", fact: "Калиновский был одним из лидеров восстания 1863 года против Российской империи.", image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Kastuś_Kalinouski.jpg" },
      { id: 3, name: "Янка Купала", years: "1882 — 1942", field: "Поэт, драматург", category: "Культура", fact: "Янка Купала — один из основателей современной белорусской литературы.", image: "images/kupala.jpg" },
      { id: 4, name: "Якуб Колас", years: "1882 — 1956", field: "Писатель, академик", category: "Культура", fact: "Автор эпопеи «На ростанях» и один из основателей Академии наук Беларуси.", image: "images/kolas_yakub.jpg" },
      { id: 5, name: "Максим Богданович", years: "1891 — 1917", field: "Поэт, критик", category: "Культура", fact: "Автор стихотворения «Пагоня», ставшего символом национального духа Беларуси.", image: "images/maxim_bogdanovich.JPG" },
      { id: 6, name: "Ефросинья Полоцкая", years: "ок. 1104 — ок. 1173", field: "Игуменья, просветительница", category: "Культура", fact: "Основала монастырь в Полоцке и способствовала развитию образования и культуры.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Euphrosyne_of_Polotsk.jpg/200px-Euphrosyne_of_Polotsk.jpg" },
      { id: 7, name: "Симеон Полоцкий", years: "1629 — 1680", field: "Поэт, драматург, педагог", category: "Культура", fact: "Один из первых белорусских и русских поэтов Нового времени, основатель школьного театра.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Simeon_Polotsky.jpg/200px-Simeon_Polotsky.jpg" },
      { id: 8, name: "Тадеуш Костюшко", years: "1746 — 1817", field: "Военачальник, политик", category: "История", fact: "Лидер восстания 1794 года в Речи Посполитой, национальный герой Польши, Беларуси и Литвы.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Tadeusz_Kościuszko.PNG/200px-Tadeusz_Kościuszko.PNG" },
      { id: 9, name: "Винцент Дунин-Марцинкевич", years: "1808 — 1884", field: "Поэт, драматург, этнограф", category: "Культура", fact: "Один из основателей белорусской литературы, автор первой белорусской пьесы.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Vincent_Dunin-Marcinkievič.jpg/200px-Vincent_Dunin-Marcinkievič.jpg" },
      { id: 10, name: "Адам Мицкевич", years: "1798 — 1855", field: "Поэт, философ", category: "Культура", fact: "Великий польский и белорусский поэт, автор «Пана Тадеуша», родился в Беларуси.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Adam_Mickiewicz.PNG/200px-Adam_Mickiewicz.PNG" },
      { id: 11, name: "Констанция Буйло", years: "1898 — 1986", field: "Партизанка, Герой Советского Союза", category: "Война", fact: "Командир женского партизанского отряда во время Великой Отечественной войны.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Konstantyja_Bujło.jpg/200px-Konstantyja_Bujło.jpg" },
      { id: 12, name: "Павел Сухой", years: "1895 — 1975", field: "Авиаконструктор", category: "Наука", fact: "Создал знаменитые самолёты Су-2, Су-7, Су-9, основатель КБ Сухого.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Pavel_Sukhoi.jpg/200px-Pavel_Sukhoi.jpg" },
      { id: 13, name: "Владимир Короткевич", years: "1930 — 1984", field: "Писатель-фантаст", category: "Культура", fact: "Один из основателей белорусской научной фантастики, автор «Чёрного замка Ольшанского».", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Vladimir_Korotkevich.jpg/200px-Vladimir_Korotkevich.jpg" },
      { id: 14, name: "Рыгор Барадулин", years: "1935 — 2014", field: "Поэт, переводчик", category: "Культура", fact: "Народный поэт Беларуси, лауреат Государственной премии, переводил Шекспира и Пушкина.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ryhor_Baradulin.jpg/200px-Ryhor_Baradulin.jpg" },
      { id: 15, name: "Василий Быков", years: "1924 — 2003", field: "Писатель, фронтовик", category: "Культура", fact: "Автор произведений о войне, лауреат Государственной премии СССР.", image: "images/bykov.jpg" },
      { id: 16, name: "Светлана Алексиевич", years: "род. 1948", field: "Писательница, журналистка", category: "Культура", fact: "Лауреат Нобелевской премии по литературе 2015 года за документальную прозу.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Svetlana_Alexievich_2013.jpg/200px-Svetlana_Alexievich_2013.jpg" },
      { id: 17, name: "Виктор Гончаренко", years: "род. 1977", field: "Футбольный тренер", category: "Спорт", fact: "Тренер сборной Беларуси по футболу, работал с ведущими европейскими клубами.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Viktor_Goncharenko_2018.jpg/200px-Viktor_Goncharenko_2018.jpg" },
      { id: 18, name: "Мария Игнатенко", years: "1929 — 1943", field: "Партизанка, пионер-герой", category: "Война", fact: "Юная партизанка, казнённая фашистами, символ мужества белорусских детей.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Maria_Ignatenko.jpg/200px-Maria_Ignatenko.jpg" },
      { id: 19, name: "Иван Мележ", years: "1921 — 1976", field: "Писатель", category: "Культура", fact: "Автор трилогии «Полесская хроника», классик белорусской литературы.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ivan_Melezh.jpg/200px-Ivan_Melezh.jpg" },
      { id: 20, name: "Александр Лукашенко", years: "род. 1954", field: "Президент Республики Беларусь", category: "Политика", fact: "Первый и единственный Президент Республики Беларусь с 1994 года.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Alexander_Lukashenko_2020.jpg/200px-Alexander_Lukashenko_2020.jpg" }
    ];

    // Facts data
    this.facts = [
      { id: 1, name: "Франциск Скорина", fact: "Первый белорусский книгопечатник издал «Псалтыр» в Праге в 1517 году." },
      { id: 2, name: "Кастусь Калиновский", fact: "Его письма «Мужыцкая праўда» стали символом борьбы за свободу." },
      { id: 3, name: "Янка Купала", fact: "Настоящее имя — Иван Луцевич." },
      { id: 4, name: "Якуб Колас", fact: "Псевдоним означает «Колос» — символ родной земли." },
      { id: 5, name: "Максим Богданович", fact: "Умер в возрасте 25 лет, но успел изменить белорусскую литературу навсегда." },
      { id: 6, name: "Ефросинья Полоцкая", fact: "Основала Спасо-Преображенский монастырь и Крестовоздвиженскую церковь в Полоцке." },
      { id: 7, name: "Симеон Полоцкий", fact: "Написал первую русскую пьесу «Комедия притчи о блудном сыне»." },
      { id: 8, name: "Тадеуш Костюшко", fact: "Участвовал в Войне за независимость США, получил звание бригадного генерала." },
      { id: 9, name: "Винцент Дунин-Марцинкевич", fact: "Собрал более 2000 белорусских народных песен и опубликовал их." },
      { id: 10, name: "Адам Мицкевич", fact: "Его поэма «Пан Тадеуш» считается национальным эпосом Польши." },
      { id: 11, name: "Констанция Буйло", fact: "Её отряд уничтожил более 300 немецких солдат и офицеров." },
      { id: 12, name: "Павел Сухой", fact: "Создал первый в СССР реактивный истребитель Су-9." },
      { id: 13, name: "Владимир Короткевич", fact: "Написал более 20 книг, включая исторические романы и фантастику." },
      { id: 14, name: "Рыгор Барадулин", fact: "Перевёл на белорусский язык произведения Шекспира, Гёте и Пушкина." },
      { id: 15, name: "Василий Быков", fact: "Его произведения переведены на 40 языков мира." },
      { id: 16, name: "Светлана Алексиевич", fact: "Её книги «У войны не женское лицо» и «Последние свидетели» стали мировыми бестселлерами." },
      { id: 17, name: "Виктор Гончаренко", fact: "Привёл «Краснодар» к победе в Кубке России в 2019 году." },
      { id: 18, name: "Мария Игнатенко", fact: "Стала символом белорусского сопротивления, её именем названы улицы и школы." },
      { id: 19, name: "Иван Мележ", fact: "Трилогия «Полесская хроника» переведена на многие языки." },
      { id: 20, name: "Александр Лукашенко", fact: "Под его руководством Беларусь стала членом ООН и других международных организаций." }
    ];
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

    stack.addEventListener('mousedown', (e) => this.handleStart(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', (e) => this.handleEnd(e));

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
    const stack = document.getElementById('cardsStack');
    if (!stack) return;

    // Clear the stack completely
    stack.innerHTML = '';

    // Only render the current card
    if (this.currentIndex < this.heroes.length) {
      const hero = this.heroes[this.currentIndex];
      const card = this.createCard(hero);
      card.classList.add('entering');
      stack.appendChild(card);
    }
  }

  createCard(hero) {
    const card = document.createElement('div');
    card.className = 'hero-card';

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'hero-image-container';

    const img = document.createElement('img');
    img.className = 'hero-image';
    img.src = hero.image;
    img.alt = hero.name;
    img.loading = 'lazy';
    img.onerror = () => {
      img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name}</text></svg>`;
    };

    imageContainer.appendChild(img);

    // Content
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

    card.appendChild(imageContainer);
    card.appendChild(content);

    return card;
  }

  getCurrentCard() {
    const stack = document.getElementById('cardsStack');
    return stack ? stack.firstElementChild : null;
  }

  like() {
    this.animateCard('exiting-left');
    this.showFeedback('❤️');
    setTimeout(() => this.nextCard(), 600);
  }

  dislike() {
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
      const progress = (this.currentIndex / this.heroes.length) * 100;
      fill.style.width = `${progress}%`;
      text.textContent = `${this.currentIndex}/${this.heroes.length}`;
    }
  }

  updateFavoritesCount() {
    const badge = document.querySelector('#favoritesBtn .badge');
    if (badge) {
      badge.textContent = this.favorites.size;
    }
  }

  showEmptyState() {
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('cardsStack').classList.add('hidden');
  }

  hideEmptyState() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('cardsStack').classList.remove('hidden');
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
    const results = document.getElementById('searchResults');
    if (!results) return;

    if (query.length < 2) {
      results.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 20px;">Пачніце ўводзіць імя героя...</p>';
      return;
    }

    const filtered = this.heroes.filter(hero =>
      hero.name.toLowerCase().includes(query.toLowerCase()) ||
      hero.field.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      results.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 20px;">Героі не знойдзены</p>';
      return;
    }

    results.innerHTML = '';
    filtered.forEach(hero => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        background: var(--gray-50);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
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
        <div style="font-weight: 600; color: var(--gray-900); margin-bottom: 4px;">${hero.name}</div>
        <div style="font-size: 14px; color: var(--gray-600);">${hero.years} • ${hero.field}</div>
      `;

      item.appendChild(img);
      item.appendChild(info);

      item.addEventListener('click', () => {
        this.showDetailModal(hero);
        this.hideModal('searchModal');
      });

      results.appendChild(item);
    });
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
document.addEventListener('DOMContentLoaded', () => {
  window.app = new BelarusHeroesApp();
});