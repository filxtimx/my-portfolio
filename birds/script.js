// :0 i18n setup – сайтът поддържа EN/BG ;)
const params = new URLSearchParams(location.search);
const lang   = params.get('lang') === 'bg' ? 'bg' : 'en';

// :0 Преводи за основните елементи
const i18n = {
  en: {
    searchPlaceholder: '🔍 Search birds…',
    heroTitle:        'Discover a new world...',
    learnBtn:         '▶ My Favorite Bird',
    getStartedBtn:    'Get Started',
    footer:           'Birds Showcase © 2025',
    videoTitle:       'Pelican'
  },
  bg: {
    searchPlaceholder: '🔍 Търси птици…',
    heroTitle:        'Открий нов свят...',
    learnBtn:         '▶ Моята любима птица',
    getStartedBtn:    'Започни',
    footer:           'Изложба Птици © 2025',
    videoTitle:       'Пеликан'
  }
};

// :0 Функция, която наглася текста
function translatePage() {
  // placeholder за търсачката
  document.getElementById('searchBirds').placeholder = i18n[lang].searchPlaceholder;
  // всички data-i18n-key елементи
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  // езиков бутон
  document.getElementById('langToggle').textContent = lang === 'en' ? 'BG' : 'EN';
  // lang атрибут на html
  document.documentElement.lang = lang;
}
translatePage();

// :0 При click – сменяме езика
document.getElementById('langToggle').addEventListener('click', () => {
  const newLang = lang === 'en' ? 'bg' : 'en';
  params.set('lang', newLang);
  location.search = params.toString();
});

//----------------------------------------------
//              PRELOADER & FADE-IN
window.addEventListener('load', () => {
  lottie.loadAnimation({
    container: document.getElementById('loader-birds'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'assets/video/loading.json'
  });
  const pre  = document.getElementById('preloader');
  const main = document.getElementById('site-content');
  setTimeout(() => {
    pre.style.transition = 'opacity 0.5s ease';
    pre.style.opacity    = 0;
    pre.addEventListener('transitionend', () => pre.style.display = 'none', { once: true });
    main.classList.remove('hidden');
    requestAnimationFrame(() => main.classList.add('visible'));
  }, 2000);
});

// HERO background rotate every 3h
(() => {
  const hr   = document.getElementById('heroRight');
  const imgs = [
    'assets/images/1920x1280-closeup-1.jpg',
    'assets/images/1920x1280-wild-2.jpg',
    'assets/images/1920x1312-beautiful-3.jpg',
    'assets/images/1920x1320-beautiful-4.jpg'
  ];
  const idx = Math.floor(Date.now()/(3*60*60*1000)) % imgs.length;
  hr.style.backgroundImage = `url(${imgs[idx]})`;
})();

// SELECTORS
const learnBtn    = document.getElementById('learnMoreBtn');
const getStarted  = document.getElementById('getStartedBtn');
const videoModal  = document.getElementById('videoModal');
const videoClose  = document.getElementById('videoClose');
const videoStart  = document.getElementById('videoGetStarted');
const videoFrame  = document.getElementById('introVideo');
const heroEl      = document.querySelector('.hero');
const initialGrid = document.getElementById('initialGrid');
const searchBar   = document.querySelector('.header-search');
// превод на заглавие в модал
document.querySelector('#videoModal h2').textContent = i18n[lang].videoTitle;

// INIT: скриваме grid & search
initialGrid.classList.add('hidden');
searchBar.classList.add('hidden');

// "My Favorite Bird" → video modal
learnBtn.addEventListener('click', () => {
  videoFrame.src = 'https://www.youtube.com/embed/YLN32hiMoFc';
  videoModal.classList.remove('hidden');
});
videoClose.addEventListener('click', () => {
  videoFrame.src = '';
  videoModal.classList.add('hidden');
});
videoModal.addEventListener('click', e => {
  if (e.target === videoModal) {
    videoFrame.src = '';
    videoModal.classList.add('hidden');
  }
});

// "Get Started" flow
videoStart.addEventListener('click', () => {
  videoFrame.src = '';
  videoModal.classList.add('hidden');
  heroEl.classList.add('collapsed');
  initialGrid.classList.remove('hidden');
  searchBar.classList.remove('hidden');
  // hide nav links
  document.querySelector('.site-nav').classList.add('hidden');
  // search hookup
  const input = document.getElementById('searchBirds');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.bird-card').forEach(c => {
      const name = c.querySelector('h3').textContent.toLowerCase();
      c.style.display = name.includes(q) ? '' : 'none';
    });
  });
});
getStarted.addEventListener('click', () => videoStart.click());

// LOAD birds.json → build grid
let birdsData = {};
fetch('birds.json')
  .then(r => r.json())
  .then(birds => {
    birdsData = birds.reduce((a,b) => (a[b.id]=b,a), {});
    initialGrid.innerHTML = '';
    birds.forEach(b => {
      const card = document.createElement('div');
      card.className = 'bird-card';
      card.dataset.bird = b.id;
      // локализация
      const displayName = lang === 'bg' && b.name_bg ? b.name_bg : b.name;
      card.innerHTML = `<img src="${b.images[0]}" alt="${displayName}"><h3>${displayName}</h3>`;
      initialGrid.appendChild(card);
      card.addEventListener('click', () => openModal(b.id));
    });
  })
  .catch(console.error);

// DETAIL MODAL
const overlay   = document.querySelector('.modal-overlay');
const modal     = document.querySelector('.modal');
const modalImg  = modal.querySelector('img');
const titleEl   = modal.querySelector('h2');
const descEl    = modal.querySelector('p');
const factsDl   = modal.querySelector('.facts');
const factsRows = modal.querySelectorAll('.facts > div');
const audioEl   = modal.querySelector('audio');
const closeBtn  = modal.querySelector('.close-btn');
const headerEl  = document.querySelector('.site-header');
let currentBird, slideHandlers = [], idx = 0;

audioEl.addEventListener('click', e => e.stopPropagation());
audioEl.addEventListener('touchstart', e => e.stopPropagation());

function openModal(id) {
  const b = birdsData[id];
  currentBird = b; idx = 0;
  headerEl.classList.add('hidden');

  // slides
  slideHandlers = [
    () => {
      // описание
      const text = lang === 'bg' && b.desc_bg ? b.desc_bg : b.desc;
      descEl.textContent = text;
      factsDl.style.display = 'none';
    },
    () => {
      descEl.textContent = '';
      factsDl.style.display = 'grid';
      factsRows[0].querySelector('dd').textContent = lang==='bg'&&b.origin_bg?b.origin_bg:b.origin;
      factsRows[1].querySelector('dd').textContent = lang==='bg'&&b.weight_bg?b.weight_bg:b.weight;
      factsRows[2].querySelector('dd').textContent = lang==='bg'&&b.height_bg?b.height_bg:b.height;
      factsRows[3].querySelector('dd').textContent = lang==='bg'&&b.rarity_bg?b.rarity_bg:b.rarity;
      factsRows[4].style.display = 'none';
    },
    () => {
      descEl.innerHTML = `<strong>Fun Fact:</strong> ${(lang==='bg'&&b.funFact_bg)?b.funFact_bg:b.funFact}<br><strong>Extra Fact:</strong> ${(lang==='bg'&&b.extraFact_bg)?b.extraFact_bg:b.extraFact}`;
      factsDl.style.display = 'none';
      factsRows[4].style.display = '';
    }
  ];

  // audio
  if (b.audio) { audioEl.src = b.audio; audioEl.style.display = ''; }
  else         { audioEl.src = ''; audioEl.style.display = 'none'; }

  // carousel arrows
  modal.querySelectorAll('.prev-btn,.next-btn').forEach(e => e.remove());
  if (b.images.length>1) {
    ['prev','next'].forEach(dir => {
      const btn = document.createElement('button');
      btn.className = dir+'-btn';
      btn.textContent = dir==='prev'?'‹':'›';
      btn.addEventListener('click', e => {
        e.stopPropagation();
        idx += dir==='prev'? -1:1;
        idx = (idx + b.images.length)%b.images.length;
        updateSlide(); updateControls();
      });
      modal.insertBefore(btn, dir==='prev'?modalImg:titleEl);
    });
  }

  updateSlide();
  overlay.classList.remove('hidden');
  modal.addEventListener('click', e => e.stopPropagation());
}

function updateSlide() {
  const b = currentBird;
  modalImg.src = b.images[idx];
  modalImg.alt = `${b.name} (${idx+1}/${b.images.length})`;
  titleEl.textContent = lang==='bg'&&currentBird.name_bg?currentBird.name_bg:currentBird.name;
  slideHandlers[idx]();
  updateControls();
}

function updateControls() {
  const prev = modal.querySelector('.prev-btn');
  const next = modal.querySelector('.next-btn');
  if (prev) prev.style.display = idx===0 ? 'none' : '';
  if (next) next.style.display = idx===currentBird.images.length-1 ? 'none' : '';
}

function closeModal() {
  overlay.classList.add('hidden');
  audioEl.pause(); audioEl.currentTime = 0;
  headerEl.classList.remove('hidden');
}
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target===overlay) closeModal(); });
