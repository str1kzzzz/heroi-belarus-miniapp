// Belarusian Heroes Journey - Interactive Story App
class BelarusHeroesJourney {
  constructor() {
    // Initialize properties
    Object.assign(this, {
      heroes: [],
      facts: [],
      story: {},
      currentScene: 'intro',
      visitedScenes: new Set(),
      discoveredHeroes: new Set(),
      progress: 0,
      totalScenes: 0
    });

    // Start performance monitoring
    this.startPerformanceMonitoring();
  }

  startPerformanceMonitoring() {
    if ('performance' in window && 'mark' in performance) {
      performance.mark('app-init-start');
    }
  }

  endPerformanceMonitoring() {
    if ('performance' in window && 'mark' in performance && 'measure' in performance) {
      try {
        performance.mark('app-init-end');
        performance.measure('app-initialization', 'app-init-start', 'app-init-end');
        const measure = performance.getEntriesByName('app-initialization')[0];
        console.log(`App initialized in ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        console.warn('Performance monitoring failed:', e);
      }
    }
  }

  async init() {
    try {
      // Show loading state
      this.showLoadingState();

      // Load data asynchronously
      await this.loadData();

      // Initialize app after data is loaded
      this.loadProgress();
      this.setupEventListeners();
      this.showScene(this.currentScene);
      this.updateProgress();
      this.showInstructions();

      // Hide loading state
      this.hideLoadingState();

      // End performance monitoring
      this.endPerformanceMonitoring();

    } catch (error) {
      console.error('Error initializing app:', error);
      this.showToast('❌ Памылка ініцыялізацыі прыкладання', 5000);
      this.endPerformanceMonitoring();
    }
  }

  async loadData() {
    try {
      // Load heroes data
      const heroesResponse = await fetch('heroes.json');
      if (!heroesResponse.ok) {
        throw new Error(`Failed to load heroes: ${heroesResponse.status}`);
      }
      this.heroes = await heroesResponse.json();

      // Load facts data
      const factsResponse = await fetch('facts.json');
      if (!factsResponse.ok) {
        throw new Error(`Failed to load facts: ${factsResponse.status}`);
      }
      this.facts = await factsResponse.json();

      // Load story data
      const storyResponse = await fetch('story.json');
      if (!storyResponse.ok) {
        throw new Error(`Failed to load story: ${storyResponse.status}`);
      }
      this.story = await storyResponse.json();

      // Calculate total scenes
      this.totalScenes = Object.keys(this.story.scenes).length;

      console.log(`Loaded ${this.heroes.length} heroes, ${this.facts.length} facts, and ${this.totalScenes} scenes`);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('❌ Памылка загрузкі даных', 5000);
      // Fallback data
      this.heroes = [];
      this.facts = [];
      this.story = { scenes: {} };
    }
  }

  setupEventListeners() {
    // Menu button
    this.addEvent('#menuBtn', 'click', () => this.showModal('menuModal'));

    // Modal close buttons
    this.addEvent('#closeMenuBtn', 'click', () => this.hideModal('menuModal'));
    this.addEvent('#closeProgressBtn', 'click', () => this.hideModal('progressModal'));
    this.addEvent('#closeHeroesListBtn', 'click', () => this.hideModal('heroesListModal'));
    this.addEvent('#closeInstructions', 'click', () => this.hideModal('instructionsModal'));

    // Menu items
    this.addEvent('#progressBtn', 'click', () => this.showProgress());
    this.addEvent('#heroesListBtn', 'click', () => this.showHeroesList());
    this.addEvent('#resetJourneyBtn', 'click', () => this.resetJourney());
    this.addEvent('#aboutAppBtn', 'click', () => this.showAbout());

    // Instructions
    this.addEvent('#startJourney', 'click', () => this.hideModal('instructionsModal'));

    // Modal overlay
    this.addEvent('#modalOverlay', 'click', () => this.hideAllModals());
  }

  addEvent(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  showScene(sceneId) {
    const scene = this.story.scenes[sceneId];
    if (!scene) {
      console.error(`Scene ${sceneId} not found`);
      return;
    }

    // Mark scene as visited
    this.visitedScenes.add(sceneId);

    // Update current scene
    this.currentScene = sceneId;

    // Update progress
    this.updateProgress();

    // Render scene
    this.renderScene(scene);

    // Save progress
    this.saveProgress();
  }

  renderScene(scene) {
    const sceneElement = document.getElementById('storyScene');
    if (!sceneElement) return;

    // Update title
    const titleElement = document.getElementById('sceneTitle');
    if (titleElement) {
      titleElement.textContent = scene.title || '';
    }

    // Update image
    const imageElement = document.querySelector('.scene-image img');
    if (imageElement) {
      let imageSrc = scene.image || '';

      // If scene has hero_id, use the hero's image
      if (scene.hero_id) {
        const hero = this.heroes.find(h => h.id === scene.hero_id);
        if (hero) {
          imageSrc = hero.image;
        }
      }

      // Handle different image types
      if (imageSrc.startsWith('images/') || imageSrc.startsWith('http')) {
        // Already correct
      } else if (!imageSrc || imageSrc.startsWith('data:')) {
        // Keep as is (data URLs or empty)
      }

      imageElement.src = imageSrc;
      imageElement.alt = scene.title || '';

      // Add error handling
      imageElement.onerror = () => {
        // Fallback to a default SVG
        imageElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle" dy=".3em">🖼️</text></svg>';
      };
    }

    // Update text
    const textElement = document.getElementById('sceneText');
    if (textElement) {
      textElement.textContent = scene.text || '';
    }

    // Update choices
    const choicesElement = document.getElementById('sceneChoices');
    if (choicesElement) {
      choicesElement.innerHTML = '';

      if (scene.choices && scene.choices.length > 0) {
        scene.choices.forEach(choice => {
          const choiceBtn = document.createElement('button');
          choiceBtn.className = 'choice-btn';
          choiceBtn.textContent = choice.text;
          choiceBtn.addEventListener('click', () => this.makeChoice(choice));
          choicesElement.appendChild(choiceBtn);
        });
      }
    }

    // If scene has hero_id, mark hero as discovered
    if (scene.hero_id) {
      this.discoveredHeroes.add(scene.hero_id);
    }
  }

  makeChoice(choice) {
    if (choice.next) {
      this.showScene(choice.next);
    } else if (choice.category) {
      // Handle category choice - go to appropriate path
      const categoryScenes = Object.values(this.story.scenes).filter(s =>
        s.category === choice.category && s.choices && s.choices.length > 0
      );
      if (categoryScenes.length > 0) {
        this.showScene(categoryScenes[0].id || categoryScenes[0].title.toLowerCase().replace(/\s+/g, '_'));
      }
    }
  }

  updateProgress() {
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');

    if (fill && text) {
      const progress = (this.visitedScenes.size / this.totalScenes) * 100;
      fill.style.width = `${Math.min(progress, 100)}%`;
      text.textContent = `Сцэна ${this.visitedScenes.size}`;
    }
  }

  showProgress() {
    this.hideModal('menuModal');

    const content = document.querySelector('#progressModal .modal-body');
    if (!content) return;

    const visitedCount = this.visitedScenes.size;
    const discoveredHeroesCount = this.discoveredHeroes.size;
    const totalHeroes = this.heroes.length;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
        <h2>Ваш прагрэс</h2>
      </div>

      <div style="display: grid; gap: 16px; margin-bottom: 32px;">
        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200);">
          <div style="font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">${visitedCount}</div>
          <div style="color: var(--gray-600);">Прагледжана сцэн</div>
        </div>

        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200);">
          <div style="font-size: 24px; font-weight: 700; color: var(--secondary); margin-bottom: 8px;">${discoveredHeroesCount}</div>
          <div style="color: var(--gray-600);">Адкрыта герояў</div>
        </div>

        <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center; border: 1px solid var(--gray-200);">
          <div style="font-size: 24px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">${totalHeroes}</div>
          <div style="color: var(--gray-600);">Усяго герояў</div>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--gray-900);">Наведаныя сцэны:</h3>
        <div style="max-height: 200px; overflow-y: auto;">
          ${Array.from(this.visitedScenes).map(sceneId => {
            const scene = this.story.scenes[sceneId];
            return scene ? `<div style="padding: 8px 0; border-bottom: 1px solid var(--gray-200); color: var(--gray-700);">${scene.title}</div>` : '';
          }).join('')}
        </div>
      </div>
    `;

    this.showModal('progressModal');
  }

  showHeroesList() {
    this.hideModal('menuModal');

    const grid = document.getElementById('heroesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.heroes.forEach(hero => {
      const item = document.createElement('div');
      item.className = 'hero-grid-item';

      const isDiscovered = this.discoveredHeroes.has(hero.id);

      const imgSrc = hero.image.startsWith('http') ? hero.image : hero.image;

      item.innerHTML = `
        <img src="${imgSrc}" alt="${hero.name}" class="hero-grid-image" onerror="this.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%23666" text-anchor="middle" dy=".3em">${hero.name.split(' ').map(n => n[0]).join('')}</text></svg>'">
        <div class="hero-grid-name">${isDiscovered ? hero.name : '❓'}</div>
      `;

      if (isDiscovered) {
        item.addEventListener('click', () => {
          this.showHeroDetail(hero);
          this.hideModal('heroesListModal');
        });
      }

      grid.appendChild(item);
    });

    this.showModal('heroesListModal');
  }

  showHeroDetail(hero) {
    // Create a temporary scene for hero detail
    const heroScene = {
      title: hero.name,
      text: `${hero.years} • ${hero.field}\n\n${hero.fact}`,
      image: hero.image,
      choices: [
        { text: 'Вярнуцца да спісу', next: null }
      ]
    };

    this.renderScene(heroScene);
    this.hideAllModals();
  }

  showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('storyContainer').classList.add('hidden');
  }

  hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('storyContainer').classList.remove('hidden');
  }

  resetJourney() {
    this.hideModal('menuModal');

    // Reset progress
    this.currentScene = 'intro';
    this.visitedScenes.clear();
    this.discoveredHeroes.clear();

    // Clear saved progress
    localStorage.removeItem('belarusJourneyProgress');

    // Restart journey
    this.showScene('intro');
    this.updateProgress();

    this.showToast('🔄 Падарожжа пачата нанова!');
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('belarusJourneyProgress');
      if (saved) {
        const progress = JSON.parse(saved);
        this.currentScene = progress.currentScene || 'intro';
        this.visitedScenes = new Set(progress.visitedScenes || []);
        this.discoveredHeroes = new Set(progress.discoveredHeroes || []);
      }
    } catch (e) {
      console.warn('Failed to load progress:', e);
    }
  }

  saveProgress() {
    try {
      const progress = {
        currentScene: this.currentScene,
        visitedScenes: Array.from(this.visitedScenes),
        discoveredHeroes: Array.from(this.discoveredHeroes)
      };
      localStorage.setItem('belarusJourneyProgress', JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save progress:', e);
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

  showAbout() {
    this.hideModal('menuModal');

    const aboutScene = {
      title: 'Аб праекце',
      text: 'Гэты інтэрактыўны праект прысвечаны памяці герояў Беларусі. Праз падарожжа па гісторыі вы зможаце пазнаёміцца з выдатнымі постацямі, якія зрабілі ўклад у развіццё нашай краіны.',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23c8102e"/><text x="50" y="50" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">🇧🇾</text></svg>',
      choices: [
        { text: 'Пачаць падарожжа', next: 'intro' }
      ]
    };

    this.renderScene(aboutScene);
    this.hideAllModals();
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
    if (localStorage.getItem('journeyInstructionsShown')) return;

    this.showModal('instructionsModal');
    localStorage.setItem('journeyInstructionsShown', 'true');
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
document.addEventListener('DOMContentLoaded', async () => {
  try {
    window.app = new BelarusHeroesJourney();
    await window.app.init();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});