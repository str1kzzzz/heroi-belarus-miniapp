
// app.js — robust init + liquid glass UI logic (improved: immediate init + verbose logs)
(function(){
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg && tg.expand) {
    try { tg.expand(); } catch(e){ console.warn('tg.expand failed', e); }
  }

  function safeQuery(id) { return document.getElementById(id); }

  // main init function
  function init() {
    console.log('INIT app.js running');
    const startBtn = safeQuery('startBtn');
    const factBtn = safeQuery('factBtn');
    const reloadBtn = safeQuery('reloadBtn');
    const cardsArea = safeQuery('cardsArea');
    const app = safeQuery('app');
    const detailModal = safeQuery('detailModal');
    const modalContent = safeQuery('modalContent');
    const closeModal = safeQuery('closeModal');
    const shareBtn = safeQuery('shareBtn');

    if (!app) {
      console.error('Main app element (#app) not found. Aborting init.');
      return;
    }

    let HEROES = [];

    async function loadHeroes(){
      try {
        console.log('Loading heroes.json ...');
        const res = await fetch('data/heroes.json', {cache: 'no-store'});
        if (!res.ok) throw new Error('HTTP ' + res.status);
        HEROES = await res.json();
        console.log('Loaded heroes:', HEROES.length);
        return HEROES;
      } catch (err) {
        console.error('Failed to load heroes.json:', err);
        HEROES = [];
        if (cardsArea) {
          cardsArea.innerHTML = `<div class="card"><p>Памылка загрузкі дадзеных. Праверце шлях да <code>data/heroes.json</code>.</p></div>`;
          cardsArea.classList.remove('hidden');
        }
        return [];
      }
    }

    // wire controls safely
    if (startBtn) {
      startBtn.addEventListener('click', async () => {
        await loadHeroes();
        renderCategoriesAndDefault();
      });
    } else {
      console.warn('#startBtn not found');
    }

    if (factBtn) {
      factBtn.addEventListener('click', async () => {
        if (!HEROES.length) await loadHeroes();
        if (!HEROES.length) return alert('Дадзеныя не загружаныя');
        const h = HEROES[Math.floor(Math.random()*HEROES.length)];
        openModalWithHero(h);
      });
    }

    reloadBtn && reloadBtn.addEventListener('click', () => location.reload());

    closeModal && closeModal.addEventListener('click', () => {
      detailModal && detailModal.classList.add('hidden');
      detailModal && detailModal.setAttribute('aria-hidden','true');
    });

    shareBtn && shareBtn.addEventListener('click', () => {
      const currentId = detailModal && detailModal.dataset.current;
      if (!currentId) return;
      const hero = HEROES.find(h => String(h.id) === String(currentId));
      if (!hero) return;
      const text = `${hero.name} — ${hero.fact || hero.bio || ''}`;
      const url = location.href;
      if (navigator.share) {
        navigator.share({title: hero.name, text, url}).catch(()=>{});
      } else if (tg && tg.sendData) {
        try { tg.sendData(JSON.stringify({action:'share', heroId: hero.id})); }
        catch(e){ console.warn('tg.sendData failed', e); alert(text); }
      } else {
        navigator.clipboard.writeText(text + '\n' + url).then(()=>alert('Тэкст скапіяваны'), ()=>alert('Капіраванне не ўдалося'));
      }
    });

    // render categories and default
    function renderCategoriesAndDefault(){
      const cats = Array.from(new Set(HEROES.map(h => h.category).filter(Boolean)));
      const catBar = document.createElement('div');
      catBar.className = 'category-bar';
      cats.forEach((c, idx) => {
        const b = document.createElement('button');
        b.className = 'cat-btn' + (idx === 0 ? ' active' : '');
        b.textContent = c;
        b.addEventListener('click', () => {
          document.querySelectorAll('.cat-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          showCategory(c);
        });
        catBar.appendChild(b);
      });

      cardsArea.innerHTML = '';
      cardsArea.appendChild(catBar);
      const listWrap = document.createElement('div');
      listWrap.id = 'listWrap';
      cardsArea.appendChild(listWrap);
      cardsArea.classList.remove('hidden');

      if (cats.length) showCategory(cats[0]);
      else listWrap.innerHTML = '<div class="card"><p>Няма катэгорый у дадзеных.</p></div>';
    }

    function showCategory(cat){
      const listWrap = document.getElementById('listWrap');
      if (!listWrap) return;
      const arr = HEROES.filter(h => h.category === cat || h.field === cat);
      if (!arr.length) {
        listWrap.innerHTML = `<div class="card"><p>Нічога не знойдзена для "${cat}"</p></div>`;
        return;
      }
      listWrap.innerHTML = arr.map(h => `
        <article class="card glass" data-id="${h.id}">
          <img class="thumb" src="${h.image}" alt="${h.name}" loading="lazy" />
          <div>
            <h3>${h.name}</h3>
            <p><small>${h.years || ''} • ${h.field || h.category || ''}</small></p>
            <p>${h.fact || h.bio || ''}</p>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
            <button class="btn-ghost" data-id="${h.id}">Дэталі</button>
          </div>
        </article>
      `).join('');

      // attach detail handlers
      listWrap.querySelectorAll('.btn-ghost').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = btn.getAttribute('data-id');
          const hero = HEROES.find(x => String(x.id) === String(id));
          if (hero) openModalWithHero(hero);
        });
      });
    }

    function openModalWithHero(hero){
      if (!hero) return;
      modalContent && (modalContent.innerHTML = `
        <img class="thumb" style="height:220px;border-radius:12px;width:100%;object-fit:cover" src="${hero.image}" alt="${hero.name}" />
        <h2 style="margin:10px 0 6px">${hero.name}</h2>
        <p style="color:var(--muted);margin:0 0 8px"><small>${hero.years || ''} • ${hero.field || hero.category || ''}</small></p>
        <p>${hero.fact || hero.bio || ''}</p>
      `);
      detailModal && (detailModal.dataset.current = hero.id);
      detailModal && detailModal.classList.remove('hidden');
      detailModal && detailModal.setAttribute('aria-hidden','false');
    }

    // expose for debug in console
    window.__HEROES = HEROES;
    window.__reloadHeroes = loadHeroes;
  } // end init

  // run init immediately if possible
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
