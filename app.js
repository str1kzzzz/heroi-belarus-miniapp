// app.js — robust init + liquid glass UI logic
const tg = window.Telegram?.WebApp;
if (tg) {
  try { tg.expand(); } catch(e){ console.warn('tg.expand failed', e); }
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM элементы
  const startBtn = document.getElementById('startBtn');
  const factBtn = document.getElementById('factBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const cardsArea = document.getElementById('cardsArea');
  const app = document.getElementById('app');
  const detailModal = document.getElementById('detailModal');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');
  const shareBtn = document.getElementById('shareBtn');

  // quick checks
  if (!startBtn) console.error('startBtn not found');
  if (!cardsArea) console.error('cardsArea not found');

  // load data
  let HEROES = [];

  async function loadHeroes(){
    try {
      const res = await fetch('data/heroes.json', {cache: "no-store"});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      HEROES = await res.json();
      console.log('Loaded heroes:', HEROES.length);
    } catch (err) {
      console.error('Failed to load heroes.json:', err);
      HEROES = [];
      // show user friendly message
      cardsArea.innerHTML = `<div class="card"><p>Памылка загрузкі дадзеных. Праверьце шлях да data/heroes.json і што файл прысутнічае.</p></div>`;
      cardsArea.classList.remove('hidden');
    }
  }

  // wire controls
  startBtn?.addEventListener('click', async () => {
    await loadHeroes();
    renderCategoriesAndDefault();
  });

  factBtn?.addEventListener('click', async () => {
    if (!HEROES.length) await loadHeroes();
    if (!HEROES.length) return alert('Дадзеныя не загружаныя');
    const h = HEROES[Math.floor(Math.random()*HEROES.length)];
    openModalWithHero(h);
  });

  reloadBtn?.addEventListener('click', () => location.reload());

  closeModal?.addEventListener('click', () => {
    detailModal.classList.add('hidden');
    detailModal.setAttribute('aria-hidden','true');
  });

  shareBtn?.addEventListener('click', () => {
    const currentId = detailModal.dataset.current;
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

  // render categories and default category
  function renderCategoriesAndDefault(){
    // categories
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

    // cards container
    cardsArea.innerHTML = '';
    cardsArea.appendChild(catBar);
    const listWrap = document.createElement('div');
    listWrap.id = 'listWrap';
    cardsArea.appendChild(listWrap);
    cardsArea.classList.remove('hidden');

    // show first category if exists
    if (cats.length) showCategory(cats[0]);
    else listWrap.innerHTML = '<div class="card"><p>Няма катэгорый у дадзеных.</p></div>';
  }

  // showCategory: fill cards
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

  // open modal
  function openModalWithHero(hero){
    if (!hero) return;
    modalContent.innerHTML = `
      <img class="thumb" style="height:220px;border-radius:12px;width:100%;object-fit:cover" src="${hero.image}" alt="${hero.name}" />
      <h2 style="margin:10px 0 6px">${hero.name}</h2>
      <p style="color:var(--muted);margin:0 0 8px"><small>${hero.years || ''} • ${hero.field || hero.category || ''}</small></p>
      <p>${hero.fact || hero.bio || ''}</p>
    `;
    detailModal.dataset.current = hero.id;
    detailModal.classList.remove('hidden');
    detailModal.setAttribute('aria-hidden','false');
  }

}); // DOMContentLoaded end