// app.js - FIXED PATHS VERSION
(function(){
  console.log('=== APP START - FIXED PATHS ===');
  
  // Telegram WebApp initialization
  const tg = window.Telegram?.WebApp;
  if (tg) {
    try { 
      tg.expand(); 
      tg.enableClosingConfirmation();
      console.log('Telegram WebApp initialized');
    } catch(e){ 
      console.warn('Telegram init failed', e); 
    }
  }

  function safeQuery(id) { 
    const element = document.getElementById(id);
    if (!element) console.warn(`Element #${id} not found`);
    return element;
  }

  function init() {
    console.log('Initializing app with fixed paths...');
    
    // Проверяем элементы
    const elements = ['startBtn', 'aboutBtn', 'refreshBtn', 'heroesGrid', 'categories', 'heroModal'];
    elements.forEach(id => {
      const el = safeQuery(id);
      console.log(`${id}:`, el ? 'FOUND' : 'MISSING');
    });

    let HEROES = [];
    let FACTS = [];

    // Функции загрузки с исправленными путями
    async function loadHeroes(){
      try {
        console.log('Loading heroes...');
        // Пробуем все возможные пути
        const paths = [
          'heroes.json',
          './heroes.json',
          '/heroes.json'
        ];
        
        for (const path of paths) {
          try {
            const res = await fetch(path);
            if (res.ok) {
              HEROES = await res.json();
              console.log(`✅ Heroes loaded from: ${path}`);
              return HEROES;
            }
          } catch (e) {
            console.warn(`Failed from ${path}:`, e);
          }
        }
        
        throw new Error('All paths failed');
        
      } catch (err) {
        console.error('Failed to load heroes:', err);
        // Fallback данные
        HEROES = [
          {
            "id": 1,
            "name": "Франциск Скорина",
            "years": "ок. 1490 — ок. 1551",
            "field": "Просветитель, первопечатник", 
            "category": "Культура",
            "fact": "Франциск Скорина напечатал первую книгу на белорусской земле в 1517 году — «Псалтыр».",
            "image": "./images/francisk.jpg"
          },
          {
            "id": 2,
            "name": "Кастусь Калиновский", 
            "years": "1838 — 1864",
            "field": "Революционер, публицист",
            "category": "История",
            "fact": "Калиновский был одним из лидеров восстания 1863 года против Российской империи.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/1/16/Kastuś_Kalinouski.jpg"
          }
        ];
        console.log('Using fallback heroes');
        return HEROES;
      }
    }

    async function loadFacts(){
      try {
        console.log('Loading facts...');
        const paths = [
          'facts.json',
          './facts.json', 
          '/facts.json'
        ];
        
        for (const path of paths) {
          try {
            const res = await fetch(path);
            if (res.ok) {
              FACTS = await res.json();
              console.log(`✅ Facts loaded from: ${path}`);
              return FACTS;
            }
          } catch (e) {
            console.warn(`Failed from ${path}:`, e);
          }
        }
        
        throw new Error('All paths failed');
        
      } catch (err) {
        console.error('Failed to load facts:', err);
        FACTS = [
          {"id": 1, "name": "Франциск Скорина", "fact": "Первый белорусский книгопечатник издал «Псалтыр» в Праге в 1517 году."},
          {"id": 2, "name": "Кастусь Калиновский", "fact": "Его письма «Мужыцкая праўда» стали символом борьбы за свободу."}
        ];
        console.log('Using fallback facts');
        return FACTS;
      }
    }

    // Остальные функции остаются без изменений
    function closeModalFunc() {
      const heroModal = safeQuery('heroModal');
      if (heroModal) heroModal.classList.add('hidden');
      if (tg && tg.BackButton) tg.BackButton.hide();
    }

    function openModalWithHero(hero){
      if (!hero) return;
      
      const modal = safeQuery('heroModal');
      const modalImg = safeQuery('modalImg');
      const modalName = safeQuery('modalName');
      const modalDesc = safeQuery('modalDesc');
      
      if (modalImg) {
        modalImg.src = hero.image;
        modalImg.alt = hero.name;
        modalImg.onerror = function() {
          this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle" dy=".3em">Няма выявы</text></svg>';
        };
      }
      
      if (modalName) modalName.textContent = hero.name;
      if (modalDesc) modalDesc.innerHTML = `
        <p><strong>${hero.years || 'Даты не указаны'}</strong></p>
        <p><em>${hero.field}</em> • ${hero.category}</p>
        <p style="margin-top: 12px">${hero.fact}</p>
        <button class="btn-primary" onclick="shareHero(${JSON.stringify(hero).replace(/"/g, '&quot;')})" style="margin-top: 16px; width: 100%">Падзяліцца</button>
      `;
      
      if (modal) modal.classList.remove('hidden');
      
      if (tg && tg.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(closeModalFunc);
      }
    }

    function showRandomFact() {
      if (!FACTS.length) return;
      const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
      openModalWithHero({
        id: 'fact',
        name: `📚 Факт: ${fact.name}`,
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">💡</text></svg>',
        years: '',
        field: 'Цікавы факт',
        category: 'Факт', 
        fact: fact.fact
      });
    }

    function renderCategoriesAndDefault(){
      const cats = [...new Set(HEROES.map(h => h.category).filter(Boolean))];
      const categoriesEl = safeQuery('categories');
      const gridEl = safeQuery('heroesGrid');
      
      if (categoriesEl) {
        categoriesEl.innerHTML = '';
        
        cats.forEach((cat, idx) => {
          const btn = document.createElement('button');
          btn.className = `cat-btn ${idx === 0 ? 'active' : ''}`;
          btn.textContent = cat;
          btn.onclick = () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showCategory(cat);
          };
          categoriesEl.appendChild(btn);
        });
        
        const randomBtn = document.createElement('button');
        randomBtn.className = 'cat-btn';
        randomBtn.innerHTML = '🎲 Выпадковы факт';
        randomBtn.onclick = showRandomFact;
        categoriesEl.appendChild(randomBtn);
      }
      
      if (cats.length > 0) {
        showCategory(cats[0]);
      }
    }

    function showCategory(category) {
      const gridEl = safeQuery('heroesGrid');
      const heroes = HEROES.filter(h => h.category === category);
      
      if (gridEl) {
        gridEl.innerHTML = heroes.map(hero => `
          <div class="card glass" onclick="appOpenModal(${JSON.stringify(hero).replace(/"/g, '&quot;')})">
            <img class="thumb" src="${hero.image}" alt="${hero.name}" 
                 onerror="this.src='data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;><rect width=&quot;100&quot; height=&quot;100&quot; fill=&quot;%23f0f0f0&quot;/><text x=&quot;50&quot; y=&quot;50&quot; font-family=&quot;Arial&quot; font-size=&quot;10&quot; fill=&quot;%23666&quot; text-anchor=&quot;middle&quot; dy=&quot;.3em&quot;>${hero.name}</text></svg>'">
            <h3>${hero.name}</h3>
            <p><small>${hero.years} • ${hero.field}</small></p>
            <p>${hero.fact.substring(0, 80)}...</p>
            <div class="card-actions">
              <button class="btn-ghost" onclick="event.stopPropagation(); appOpenModal(${JSON.stringify(hero).replace(/"/g, '&quot;')})">Дэталі</button>
            </div>
          </div>
        `).join('');
      }
    }

    function shareHero(hero) {
      const text = `${hero.name} — ${hero.fact}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => alert('Тэкст скапіяваны!'),
          () => alert('Памылка капіравання')
        );
      } else {
        alert(text + '\n\n(Скапіруйце тэкст)');
      }
    }

    // Глобальные функции для onclick
    window.appOpenModal = openModalWithHero;
    window.shareHero = shareHero;
    window.closeModalFunc = closeModalFunc;
    window.showRandomFact = showRandomFact;

    // Назначаем обработчики
    safeQuery('startBtn')?.addEventListener('click', async function() {
      await loadHeroes();
      renderCategoriesAndDefault();
      this.textContent = 'Абнавіць';
    });

    safeQuery('aboutBtn')?.addEventListener('click', function() {
      openModalWithHero({
        id: 'about',
        name: 'Аб праекце',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">ℹ️</text></svg>',
        years: '2025',
        field: 'Гісторыя і культура', 
        category: 'Адукацыя',
        fact: 'Гэты праект прысвечаны памяці герояў Беларусі.'
      });
    });

    safeQuery('refreshBtn')?.addEventListener('click', function() {
      location.reload();
    });

    safeQuery('closeModal')?.addEventListener('click', closeModalFunc);

    safeQuery('heroModal')?.addEventListener('click', function(e) {
      if (e.target === this) closeModalFunc();
    });

    // Автозагрузка
    Promise.all([loadHeroes(), loadFacts()]).then(() => {
      renderCategoriesAndDefault();
    });

    console.log('App initialized successfully');
  }

  // Запуск
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();