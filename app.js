// Простая логика: старт -> выбор категорий -> показать карточки
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const app = document.getElementById('app');
document.getElementById('startBtn').addEventListener('click', showCategories);

function showCategories() {ы
  app.innerHTML = `
    <h2>Выберы катэгорыю</h2>
    <div>
      <button onclick="showCategory('Войны')">🪖 Войны</button>
      <button onclick="showCategory('Культура')">🎭 Культура</button>
      <button onclick="showCategory('Спорт')">⚽ Спорт</button>
    </div>
    <div style="margin-top:12px"><button onclick="location.reload()">⬅ Назад</button></div>
  `;
}

async function showCategory(cat) {
  const res = await fetch('data/heroes.json');
  const heroes = await res.json();
  const list = heroes.filter(h => h.category === cat || h.field === cat);
  if (!list.length) {
    app.innerHTML = `<p>Ничего не найдено для категории "${cat}"</p><button onclick="location.reload()">⬅ Назад</button>`;
    return;
  }
  let html = `<h3>${cat}</h3>`;
  list.forEach(h => {
    html += `
      <div class="card">
        <img src="${h.image}" alt="${h.name}">
        <h4>${h.name}</h4>
        <p><small>${h.years} — ${h.field || ''}</small></p>
        <p>${h.fact || h.bio || ''}</p>
      </div>
    `;
  });
  html += `<button onclick="location.reload()">⬅ Назад</button>`;
  app.innerHTML = html;
}