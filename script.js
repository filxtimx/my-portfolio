// script.js

// 1) Minimum loader display
const MIN_DISPLAY = 800;            // milliseconds
const startTime   = Date.now();

// Hide fallback image (only show if JS fails)
document.getElementById('loader-fallback').style.display = 'none';

// 2) Initialize Lottie animation
const anim = lottie.loadAnimation({
  container: document.getElementById('lottie'),
  renderer:  'svg',
  loop:      true,
  autoplay:  true,
  path:      'loader.json'         // your Lottie JSON
});
anim.setSpeed(1.2);                // 1.2× speed

// 3) Wait for both page load and video buffering
function waitForVideo(videoEl) {
  return new Promise(resolve => {
    if (videoEl.readyState >= 3) return resolve();
    videoEl.addEventListener('canplaythrough', resolve, { once: true });
  });
}
const pageLoad = new Promise(resolve =>
  window.addEventListener('load', resolve)
);

Promise.all([
  pageLoad,
  waitForVideo(document.getElementById('bg-video'))
]).then(async () => {
  // Ensure loader is visible at least MIN_DISPLAY
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_DISPLAY) {
    await new Promise(r => setTimeout(r, MIN_DISPLAY - elapsed));
  }
  // Fade out + remove loader
  const loader = document.getElementById('loader');
  loader.classList.add('fade-out');
  loader.addEventListener('animationend', () => loader.remove());
});

// 4) TEXT SWAP LOGIC (EN ↔ BG)
const toggle         = document.getElementById('toggle-lang');
const heroTitle      = document.getElementById('hero-title');
const heroText       = document.getElementById('hero-text');
const portfolioTitle = document.getElementById('portfolio-title');
const lastLabel      = document.getElementById('last-label');
const otherLabel     = document.getElementById('other-label');

// Content for both languages
const content = {
  en: {
    title:     'Petur Apostolov',
    text:      `I started programming at 15 in 9th grade with Python and today, at 20, I’m in my third semester of IT studies at New Bulgarian University. Over the years I’ve built up skills in C#, C, C++, JavaScript, HTML, CSS and JSON—though my true passion is frontend development. I love crafting clean, interactive user interfaces and plan to dive into backend work as I grow, but right now I’m all about the UI.`,
    portfolio: 'My Projects:',
    last:      'Last project:',
    others:    'Other projects:',
    birds:     'Birds Site',
    todo:      'To-Do List App',
    weather:   'Weather App',
    mini:      'Mini Games'
  },
  bg: {
    title:     'Петър Апостолов',
    text:      `Започнах да програмирам на 15 години в 9-ти клас с Python, а днес, на 20, съм в трети семестър по ИТ в Нов български университет. През годините придобих умения в C#, C, C++, JavaScript, HTML, CSS и JSON—истинската ми страст е фронтенд разработката. Обичам да създавам чисти, интерактивни потребителски интерфейси и в бъдеще планирам да навляза и в бекенд, но към момента фокусът ми е изцяло върху UI.`,
    portfolio: 'Моите проекти:',
    last:      'Последен проект:',
    others:    'Други проекти:',
    birds:     'Уебсайт за птици',
    todo:      'Приложение за списък със задачи',
    weather:   'Метеорологично приложение',
    mini:      'Мини игри'
  }
};

// Swap on toggle
toggle.addEventListener('change', () => {
  const lang = toggle.checked ? 'bg' : 'en';

  // Hero
  heroTitle     .textContent = content[lang].title;
  heroText      .textContent = content[lang].text;

  // Projects headings
  portfolioTitle.textContent = content[lang].portfolio;
  lastLabel     .textContent = content[lang].last;
  otherLabel    .textContent = content[lang].others;

  // Last-project card title
  document.querySelector('.last-project .project-title')
          .textContent = content[lang].birds;

  // Other-projects grid titles
  document.querySelectorAll('.other-projects .project-title')
    .forEach((el, i) => {
      const key = i === 0 ? 'todo' : i === 1 ? 'weather' : 'mini';
      el.textContent = content[lang][key];
    });
});
