// app.js — fully optimized for Telegram Mini App
(function(){
  // Telegram WebApp initialization
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    try { 
      tg.expand(); 
      tg.enableClosingConfirmation();
      console.log('Telegram WebApp initialized');
      
      // Apply Telegram theme
      document.body.className = tg.colorScheme;
      
      // Handle theme changes
      tg.onEvent('themeChanged', () => {
        document.body.className = tg.colorScheme;
      });
      
      // Handle back button in Telegram
      tg.onEvent('backButtonClicked', () => {
        const modal = document.getElementById('heroModal');
        if (modal && !modal.classList.contains('hidden')) {
          closeModalFunc();
          return false;
        }
        return true;
      });
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
    console.log('INIT app.js running');
    
    const startBtn = safeQuery('startBtn');
    const aboutBtn = safeQuery('aboutBtn');
    const refreshBtn = safeQuery('refreshBtn');
    const cardsArea = safeQuery('heroesGrid');
    const categories = safeQuery('categories');
    const heroModal = safeQuery('heroModal');
    const closeModal = safeQuery('closeModal');
    const modalImg = safeQuery('modalImg');
    const modalName = safeQuery('modalName');
    const modalDesc = safeQuery('modalDesc');

    let HEROES = [];
    let FACTS = [];

    async function loadHeroes(){
      try {
        console.log('Loading heroes.json...');
        const res = await fetch('heroes.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        HEROES = await res.json();
        console.log('Loaded heroes:', HEROES.length);
        return HEROES;
      } catch (err) {
        console.error('Failed to load heroes.json:', err);
        HEROES = [];
        if (cardsArea) {
          cardsArea.innerHTML = `<div class="card glass"><p>Памылка загрузкі дадзеных. Праверце файл heroes.json.</p></div>`;
        }
        return [];
      }
    }

    async function loadFacts(){
      try {
        console.log('Loading facts.json...');
        const res = await fetch('facts.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        FACTS = await res.json();
        console.log('Loaded facts:', FACTS.length);
        return FACTS;
      } catch (err) {
        console.error('Failed to load facts.json:', err);
        FACTS = [];
        return [];
      }
    }

    function getRandomFact() {
      if (!FACTS.length) {
        return {
          name: "Цікавы факт",
          fact: "Загрузіце файл facts.json для адлюстравання выпадковых фактаў."
        };
      }
      return FACTS[Math.floor(Math.random() * FACTS.length)];
    }

    function getFactByHeroName(heroName) {
      if (!FACTS.length) return null;
      const heroFacts = FACTS.filter(fact => fact.name === heroName);
      if (heroFacts.length > 0) {
        return heroFacts[Math.floor(Math.random() * heroFacts.length)];
      }
      return null;
    }

    function closeModalFunc() {
      if (heroModal) {
        heroModal.classList.add('hidden');
      }
      if (tg && tg.BackButton) {
        tg.BackButton.hide();
      }
    }

    function openModalWithHero(hero){
      if (!hero) return;
      
      const additionalFact = getFactByHeroName(hero.name);
      
      if (modalImg) {
        modalImg.src = hero.image;
        modalImg.alt = hero.name;
        modalImg.onerror = function() {
          this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle" dy=".3em">Няма выявы</text></svg>';
        };
      }
      
      if (modalName) modalName.textContent = hero.name;
      
      if (modalDesc) {
        let factHTML = `
          <p><strong>${hero.years || 'Даты не указаны'}</strong></p>
          <p><em>${hero.field}</em> • ${hero.category}</p>
          <p style="margin-top: 12px">${hero.fact}</p>
        `;
        
        if (additionalFact && additionalFact.fact !== hero.fact) {
          factHTML += `
            <div class="fact-highlight">
              <strong>📌 Дадатковы факт:</strong>
              <p style="margin: 8px 0 0;">${additionalFact.fact}</p>
            </div>
          `;
        }
        
        modalDesc.innerHTML = factHTML;
        
        const existingShareBtn = modalDesc.parentNode.querySelector('.share-btn');
        if (existingShareBtn) existingShareBtn.remove();
        
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn-primary share-btn';
        shareBtn.textContent = 'Падзяліцца';
        shareBtn.style.marginTop = '16px';
        shareBtn.style.width = '100%';
        shareBtn.addEventListener('click', () => shareHero(hero));
        
        modalDesc.parentNode.insertBefore(shareBtn, modalDesc.nextSibling);
      }
      
      heroModal.dataset.current = hero.id;
      heroModal.classList.remove('hidden');
      
      if (tg && tg.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(closeModalFunc);
      }
    }

    function showRandomFact() {
      const randomFact = getRandomFact();
      openModalWithHero({
        id: 'random-fact',
        name: `📚 Цікавы факт: ${randomFact.name}`,
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">💡</text></svg>',
        years: '',
        field: 'Гісторыя Беларусі',
        category: 'Факт',
        fact: randomFact.fact
      });
    }

    function shareHero(hero) {
      const shareText = `${hero.name} — ${hero.fact}`;
      
      if (tg) {
        try { 
          if (tg.showPopup) {
            tg.showPopup({
              title: 'Падзяліцца',
              message: `Хочаце падзяліцца інфармацыяй пра ${hero.name}?`,
              buttons: [
                {id: 'copy', type: 'default', text: 'Скапіяваць'},
                {id: 'close', type: 'cancel', text: 'Адмяніць'}
              ]
            }, (buttonId) => {
              if (buttonId === 'copy') {
                navigator.clipboard.writeText(shareText).then(
                  () => tg.showAlert('Тэкст скапіяваны!'),
                  () => tg.showAlert('Памылка капіравання')
                );
              }
            });
          } else {
            navigator.clipboard.writeText(shareText).then(
              () => alert('Тэкст скапіяваны'),
              () => alert('Капіраванне не ўдалося')
            );
          }
        } catch(e){ 
          console.warn('Telegram share failed', e);
          navigator.clipboard.writeText(shareText).then(
            () => alert('Тэкст скапіяваны'),
            () => alert('Капіраванне не ўдалося')
          );
        }
      } else if (navigator.share) {
        navigator.share({
          title: hero.name,
          text: shareText,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareText).then(
          () => alert('Тэкст скапіяваны'),
          () => alert('Капіраванне не ўдалося')
        );
      }
    }

    function renderCategoriesAndDefault(){
      const cats = Array.from(new Set(HEROES.map(h => h.category).filter(Boolean)));
      
      categories.innerHTML = '';
      
      cats.forEach((c, idx) => {
        const b = document.createElement('button');
        b.className = 'cat-btn' + (idx === 0 ? ' active' : '');
        b.textContent = c;
        b.addEventListener('click', () => {
          document.querySelectorAll('.cat-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          showCategory(c);
        });
        categories.appendChild(b);
      });

      const randomFactBtn = document.createElement('button');
      randomFactBtn.className = 'cat-btn';
      randomFactBtn.innerHTML = '🎲 Выпадковы факт';
      randomFactBtn.addEventListener('click', showRandomFact);
      categories.appendChild(randomFactBtn);

      if (cats.length) {
        showCategory(cats[0]);
      } else {
        cardsArea.innerHTML = '<div class="card glass"><p>Няма катэгорый у дадзеных.</p></div>';
      }
    }

    function showCategory(cat){
      const arr = HEROES.filter(h => h.category === cat);
      
      if (!arr.length) {
        cardsArea.innerHTML = `<div class="card glass"><p>Нічога не знойдзена для "${cat}"</p></div>`;
        return;
      }
      
      cardsArea.innerHTML = arr.map(h => `
        <article class="card glass" data-id="${h.id}">
          <img class="thumb" src="${h.image}" alt="${h.name}" loading="lazy" 
               onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"%23f0f0f0\"/><text x=\"50\" y=\"50\" font-family=\"Arial\" font-size=\"10\" fill=\"%23666\" text-anchor=\"middle\" dy=\".3em\">Няма выявы</text></svg>'">
          <div>
            <h3>${h.name}</h3>
            <p><small>${h.years || ''} • ${h.field}</small></p>
            <p>${h.fact.substring(0, 80)}...</p>
          </div>
          <div class="card-actions">
            <button class="btn-ghost" data-id="${h.id}">Дэталі</button>
          </div>
        </article>
      `).join('');

      cardsArea.querySelectorAll('.btn-ghost').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const hero = HEROES.find(x => String(x.id) === String(id));
          if (hero) openModalWithHero(hero);
        });
      });

      cardsArea.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON') return;
          const id = card.getAttribute('data-id');
          const hero = HEROES.find(x => String(x.id) === String(id));
          if (hero) openModalWithHero(hero);
        });
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', async () => {
        await loadHeroes();
        renderCategoriesAndDefault();
        startBtn.textContent = 'Абнавіць';
      });
    }

    if (aboutBtn) {
      aboutBtn.addEventListener('click', () => {
        openModalWithHero({
          id: 'about',
          name: 'Аб праекце',
          image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23007aff"/><text x="50" y="50" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">ℹ️</text></svg>',
          years: '2025',
          field: 'Гісторыя і культура',
          category: 'Адукацыя',
          fact: 'Гэты праект прысвечаны памяці герояў Беларусі. Мы хочам захаваць і перадаць гісторыю подзвігаў нашых суайчыннікаў. Выкарыстоўвайце кнопку "🎲 Выпадковы факт" для адкрыцця цікавых фактаў!'
        });
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => location.reload());
    }

    if (closeModal) {
      closeModal.addEventListener('click', closeModalFunc);
    }

    if (heroModal) {
      heroModal.addEventListener('click', (e) => {
        if (e.target === heroModal) closeModalFunc();
      });
    }

    Promise.all([loadHeroes(), loadFacts()]).then(() => {
      if (HEROES.length > 0) {
        renderCategoriesAndDefault();
        if (startBtn) startBtn.textContent = 'Абнавіць';
      }
    });

    window.__HEROES = HEROES;
    window.__FACTS = FACTS;
    window.__showRandomFact = showRandomFact;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }
})();