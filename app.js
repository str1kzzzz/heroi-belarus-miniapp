// Telegram Mini App support
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const app = document.getElementById('app');
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', showCategories);

function showCategories() {
  app.innerHTML = `
    <div class="glass hero">
      <h2>Выберы катэгорыю</h2>
      <div class="category-bar">
        <button class="cat-btn" onclick="showCategory('Войны')">🪖 Войны</button>
        <button class="cat-btn" onclick="showCategory('Культура')">🎭 Культура</button>
        <button class="cat-btn" onclick="showCategory('Спорт')">⚽ Спорт</button>
        <button class="cat-btn" onclick="showCategory('Навука')">🧠 Навука</button>
      </div>
      <div class="cards-area" id="cards"></div>
      <button class="btn-ghost" onclick="location.reload()">⬅ Назад</button>
    </div>
  `;
}

async function showCategory(cat) {
  try {
    const res = await fetch('data/heroes.json');
    const heroes = await res.json();
    const list = heroes.filter(h => h.category === cat || h.field === cat);
    const cards = document.getElementById('cards');
    if (!list.length) {
      cards.innerHTML = `<p>Нічога не знойдзена ў катэгорыі "${cat}"</p>`;
      return;
    }
    cards.innerHTML = list.map(h => `
      <div class="card glass">
        <img class="thumb" src="${h.image}" alt="${h.name}">
        <h3>${h.name}</h3>
        <p><small>${h.years} • ${h.field || h.category}</small></p>
        <p>${h.fact || h.bio || ''}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    app.innerHTML = `<p>Памылка загрузкі дадзеных 😔</p><button onclick="location.reload()">⬅ Назад</button>`;
  }
}