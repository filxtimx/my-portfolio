console.log('📦 script.js loaded');

// helper
const after = (ms, fn) => setTimeout(fn, ms);

// Main UI refs
const menu     = document.getElementById('menu');
const cards    = document.querySelectorAll('.card');
const loader   = document.getElementById('loader');

// Memory refs
const memV      = document.getElementById('memory-bg');
const memS      = document.getElementById('memory-game');
const exitM     = document.getElementById('exit-memory');
const readyMem  = document.getElementById('ready-memory');
const replayMem = document.getElementById('replay-memory');
const grid      = document.getElementById('memory-grid');
const infoMem   = document.getElementById('memory-info');
const moveCount = document.getElementById('move-count');
const timerEl   = document.getElementById('timer');

// Reaction refs
const reaV     = document.getElementById('reaction-bg');
const reaS     = document.getElementById('reaction-game');
const exitR    = document.getElementById('exit-reaction');
const readyBtn = document.getElementById('ready-btn');
const box      = document.getElementById('reaction-box');
const lastTime = document.getElementById('last-time');

// loader → menu
window.addEventListener('load', () => {
  after(1200, () => {
    loader.style.display = 'none';
    menu.classList.replace('hidden','visible');
    cards.forEach(c=>c.classList.add('show'));
  });
});

function openScreen(bg, screen, exitBtn) {
  // 1) fade menu out
  menu.classList.add('fade-out');
  cards.forEach(c => c.classList.add('fade-out'));

  setTimeout(() => {
    // 2) hide it, reveal bg
    menu.classList.replace('visible','hidden');
    menu.classList.remove('fade-out');
    cards.forEach(c => c.classList.remove('fade-out'));
    
    bg.classList.replace('hidden','visible');
    bg.classList.add('fade-in');
  }, 500);

  setTimeout(() => {
    bg.classList.remove('fade-in');
    screen.classList.replace('hidden','visible');
    screen.classList.add('fade-in');
  }, 1000);

  setTimeout(() => {
    screen.classList.remove('fade-in');
    exitBtn.classList.add('show');
  }, 1500);
}

function closeScreen(bg, screen, exitBtn) {
  // 1) fade screen & bg out
  screen.classList.add('fade-out');
  bg.classList.add('fade-out');
  exitBtn.classList.remove('show');

  setTimeout(() => {
    // 2) hide them, show menu
    screen.classList.replace('visible','hidden');
    screen.classList.remove('fade-out');
    bg.classList.replace('visible','hidden');
    bg.classList.remove('fade-out');

    menu.classList.replace('hidden','visible');
    menu.classList.add('fade-in');
    cards.forEach(c => {
      c.classList.add('fade-in');
    });
  }, 500);

  setTimeout(() => {
    // 3) clean up fade‐ins
    menu.classList.remove('fade-in');
    cards.forEach(c => c.classList.remove('fade-in'));
  }, 1000);
}


// ===== Memory Logic =====
const icons = ['🍎','🍌','🍒','🍇','🍉','🥝','🍓','🍑'];
let cardArr=[], firstCard, secondCard, lockGrid=false, moves=0, timer, startTime;

function shuffle(a){ return a.sort(()=>Math.random()-.5); }

function startMemory(){
  // reset
  grid.innerHTML = '';
  cardArr = shuffle(icons.concat(icons));
  moves=0; moveCount.textContent='0';
  clearInterval(timer); timerEl.textContent='0.0';
  firstCard=secondCard=null; lockGrid=false;
  startTime=Date.now();
  timer=setInterval(()=>{
    timerEl.textContent=((Date.now()-startTime)/1000).toFixed(1);
  },100);

  // build cards
  cardArr.forEach(icon=>{
    const card = document.createElement('div');
    card.className='memory-card';
    card.dataset.icon=icon;
    card.innerHTML=`
      <div class="memory-front"></div>
      <div class="memory-back">${icon}</div>
    `;
    card.addEventListener('click',flipCard);
    grid.appendChild(card);
  });
}
function flipCard(){
  if(lockGrid||this===firstCard) return;
  this.classList.add('flip');
  if(!firstCard){ firstCard=this; return; }
  secondCard=this; lockGrid=true; moves++; moveCount.textContent=moves;
  if(firstCard.dataset.icon===secondCard.dataset.icon){
    firstCard.removeEventListener('click',flipCard);
    secondCard.removeEventListener('click',flipCard);
    resetFlip();
    if(document.querySelectorAll('.memory-card.flip').length===cardArr.length){
      clearInterval(timer);
      alert(`🏆 Completed in ${moves} moves & ${timerEl.textContent}s`);
    }
  } else {
    after(600,()=>{
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetFlip();
    });
  }
}
function resetFlip(){ [firstCard,secondCard]=[null,null]; lockGrid=false; }

// menu → memory
document.getElementById('card-memory').addEventListener('click',()=>{
  readyMem.style.display='inline-block';
  replayMem.style.display='none';
  grid.style.display='none';
  infoMem.style.display='none';
  openScreen(memV,memS,exitM);
});

// Ready
readyMem.addEventListener('click',()=>{
  readyMem.style.display='none';
  replayMem.style.display='inline-block';
  grid.style.display='grid';
  infoMem.style.display='block';
  startMemory();
});

// Replay
replayMem.addEventListener('click',()=>{
  clearInterval(timer);
  grid.innerHTML=''; moves=0; moveCount.textContent='0';
  timerEl.textContent='0.0';
  grid.style.display='none';
  infoMem.style.display='none';
  replayMem.style.display='none';
  readyMem.style.display='inline-block';
});

// Exit
exitM.addEventListener('click',()=>{
  clearInterval(timer);
  closeScreen(memV,memS,exitM);
  grid.style.display='none';
  infoMem.style.display='none';
});

// ===== Reaction Logic =====
let showTimeout, startClick;
function scheduleBox(){
  showTimeout = setTimeout(()=>{
    box.classList.add('show');
    startClick = performance.now();
  }, Math.random()*2000+1000);
}
function startReaction(){
  lastTime.textContent='--';
  box.classList.remove('show');
  scheduleBox();
}

document.getElementById('card-reaction').addEventListener('click',()=>{
  readyBtn.style.display='inline-block';
  box.classList.remove('show');
  openScreen(reaV,reaS,exitR);
});
readyBtn.addEventListener('click',()=>{
  readyBtn.style.display='none';
  clearTimeout(showTimeout);
  startReaction();
});
box.addEventListener('click',()=>{
  const r = Math.round(performance.now()-startClick);
  lastTime.textContent=r;
  box.classList.remove('show');
  readyBtn.style.display='inline-block';
});
exitR.addEventListener('click',()=>{
  clearTimeout(showTimeout);
  closeScreen(reaV,reaS,exitR);
});
