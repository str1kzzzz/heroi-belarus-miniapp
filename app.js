/* app.js — iOS-like UI for "Героі Беларусі" */
const tg = window.Telegram?.WebApp;
if (tg) {
  try { tg.expand(); } catch(e) { /* ignore */ }
}

const ROOT = document.getElementById('app');
const cardsArea = document.getElementById('cardsArea');
const detailModal = document.getElementById('detailModal');
const modalContent = document.getElementById('modalContent');

let HEROES = [];

// init
document.addEventListener('DOMContentLoaded', init);

async function init(){
  // hook buttons
  document.getElementById('startBtn')?.addEventListener('click', onStart);
  document.getElementById('factBtn')?.addEventListener('click', showRandomFact);
  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('shareBtn')?.addEventListener('click', onShare);

  // try load heroes
  try {
    const res = await fetch('data/heroes.json');
    HEROES = await res.json();
  } catch (err) {
    console.error('Ошибка загрузки heroes.json', err);
    HEROES = [];
  }
}

// Start button: show category picker + cards
function onStart(){
  renderCategories();
  showCategory('Культура'); // default
  document.getElementById('cardsArea').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderCategories(){
  const cats = Array.from(new Set(HEROES.map(h => h.category))).filter(Boolean);
  const bar = document.createElement('div');
  bar.className = 'category-bar';
  cats.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (idx===0 ? ' active' : '');
    btn.textContent = c;
    btn.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      showCategory(c);
    };
    bar.appendChild(btn);
  });

  // inject
  cardsArea.innerHTML = '';
  cardsArea.appendChild(bar);
  const listWrap = document.createElement('div');
  listWrap.id = 'listWrap';
  listWrap.className = 'list-wrap';
  cardsArea.appendChild(listWrap);
}

// show list for category
function showCategory(cat){
  const listWrap = document.getElementById('listWrap') || document.createElement('div');
  listWrap.id = 'listWrap';
  listWrap.innerHTML = ''; // clear

  const arr = HEROES.filter(h => h.category === cat);
  if (!arr.length){
    listWrap.innerHTML = `<div class="card"><p>Нічога не знойдзена для "${cat}"</p></div>`;
  } else {
    arr.forEach(h => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img class="thumb" src="${h.image}" alt="${h.name}" loading="lazy" />
        <div>
          <h3>${h.name}</h3>
          <p><small>${h.years || ''} • ${h.field || ''}</small></p>
          <p>${h.fact || ''}</p>
        </div>
        <div class="card-actions">
          <button class="btn-ghost" data-id="${h.id}" onclick="openDetail(${h.id})">Дэталі</button>
        </div>
      `;
      listWrap.appendChild(card);
    });
  }

  // ensure cardsArea contains listWrap
  if (!document.getElementById('listWrap')) cardsArea.appendChild(listWrap);
  // smooth scroll into view
  listWrap.scrollIntoView({behavior:'smooth'});
}

// open detail modal
window.openDetail = function(id){
  const hero = HEROES.find(h => h.id === id);
  if (!hero) return;
  const html = `
    <img class="thumb" src="${hero.image}" alt="${hero.name}" />
    <h2 style="margin:8px 0 4px">${hero.name}</h2>
    <p style="color:var(--muted);margin:0 0 8px"><small>${hero.years || ''} • ${hero.field || ''}</small></p>
    <p>${hero.fact || hero.bio || ''}</p>
  `;
  modalContent.innerHTML = html;
  detailModal.classList.remove('hidden');
  detailModal.setAttribute('aria-hidden','false');
  // store current hero id for share
  detailModal.dataset.current = id;
}

// close modal
function closeModal(){
  detailModal.classList.add('hidden');
  detailModal.setAttribute('aria-hidden','true');
  delete detailModal.dataset.current;
}

// share: use Web Share API, fallback to copy link, or Telegram WebApp
function onShare(){
  const id = detailModal.dataset.current;
  if (!id) return;
  const hero = HEROES.find(h => h.id == id);
  const text = `${hero.name} — ${hero.fact || hero.bio || ''}`;
  const url = location.href; // can be replaced by deep link

  // prefer native share
  if (navigator.share){
    navigator.share({title: hero.name, text, url}).catch(()=>{});
    return;
  }

  // fallback: try Telegram WebApp share (sendData) or copy
  try {
    if (tg && tg.sendData){
      tg.sendData(JSON.stringify({action:'share', heroId:id}));
      // note: sendData sends to bot - implement bot to handle if needed
      return;
    }
  } catch(e){}

  // fallback: copy to clipboard
  navigator.clipboard.writeText(`${text}\n${url}`).then(()=> alert('Скопіравана ў буфер абмену'), ()=> alert('Не ўдалося скапіяваць'));
}

// Random fact
function showRandomFact(){
  if (!HEROES.length){ alert('Дадзеныя не загружаныя'); return; }
  const h = HEROES[Math.floor(Math.random()*HEROES.length)];
  // small popup modal
  modalContent.innerHTML = `<h3>💡 Факт</h3><p><strong>${h.name}</strong><br/>${h.fact || h.bio || ''}</p>`;
  detailModal.classList.remove('hidden');
  detailModal.setAttribute('aria-hidden','false');
  detailModal.dataset.current = h.id;
}