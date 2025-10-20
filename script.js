/* =========================
   Imagen inicial (scroll reveal “todo negro” → foto)
   - Empieza negro con overlay
   - La foto y el overlay cambian entre 0% y 35% del alto de la ventana
========================= */
const revealImg = document.getElementById('revealImage');
const revealOverlay = document.getElementById('revealOverlay');

function handleReveal(){
  const sc = window.scrollY;
  const threshold = window.innerHeight * 0.35;   // rango de revelado (rápido pero no cortado)
  const t = Math.min(Math.max(sc / Math.max(threshold,1), 0), 1);

  // La foto aparece y sube levemente
  revealImg.style.opacity   = t;
  revealImg.style.transform = `translateY(${26 - 26*t}px) scale(${0.98 + 0.02*t})`;

  // El overlay negro se desvanece (de 1 a 0)
  revealOverlay.style.opacity = 1 - t;
}
window.addEventListener('scroll', handleReveal, {passive:true});
handleReveal();

/* =========================
   Contador (3 arriba / 3 abajo)
========================= */
const startDate = new Date('2025-09-20T00:00:00');
function updateClock(){
  const now = new Date();
  let years  = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days   = now.getDate()  - startDate.getDate();
  let hours  = now.getHours() - startDate.getHours();
  let minutes= now.getMinutes()- startDate.getMinutes();
  let seconds= now.getSeconds()- startDate.getSeconds();

  if (seconds < 0){ seconds += 60; minutes--; }
  if (minutes < 0){ minutes += 60; hours--; }
  if (hours   < 0){ hours   += 24; days--; }
  if (days    < 0){
    const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastMonthDays; months--;
  }
  if (months  < 0){ months += 12; years--; }

  const set = (id, v) => document.getElementById(id).textContent = String(v).padStart(2,'0');
  set('years', years); set('months', months); set('days', days);
  set('hours', hours); set('minutes', minutes); set('seconds', seconds);
}
setInterval(updateClock, 1000);
updateClock();

/* =========================
   Galería 3D
   - Secundarias por detrás (translateZ negativo + z-index menor)
   - No “tapan” la principal (opacidad y zIndex)
========================= */
const track   = document.querySelector('.gallery-track');
const items   = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
let baseX = 200;
let depthZ = 160; // profundidad hacia atrás

function recalcLayout(){
  const w = track.getBoundingClientRect().width;
  baseX  = Math.min(0.28 * w, 220);  // distancia lateral
  depthZ = Math.min(0.18 * w, 180);  // profundidad hacia atrás
  updateGallery();
}

function updateGallery(){
  items.forEach((item, i) => {
    const off = i - currentIndex;
    const base = 'translate(-50%,-50%)';

    if (off === 0){
      // Principal al frente
      item.style.transform = `${base} translateX(0px) translateZ(0px) rotateY(0deg) scale(1)`;
      item.style.opacity   = 1;
      item.style.zIndex    = 100;           // muy por encima
      item.style.pointerEvents = 'auto';
      item.style.filter = 'none';
    } else {
      const dir   = off < 0 ? -1 : 1;
      const abs   = Math.abs(off);
      const x     = dir * baseX * abs;
      const rotY  = dir * -12;
      const zBack = -depthZ * abs;          // EMPUJA HACIA ATRÁS
      const scale = Math.max(0.68, 1 - 0.18*abs);
      const op    = Math.max(0.35, 0.85 - 0.20*abs);

      item.style.transform = `${base} translateX(${x}px) translateZ(${zBack}px) rotateY(${rotY}deg) scale(${scale})`;
      item.style.opacity   = op;
      item.style.zIndex    = 100 - abs;     // siempre detrás de la principal
      item.style.pointerEvents = 'none';    // no tapa la principal
      item.style.filter = 'brightness(0.92)'; // leve atenuación sin opacar
    }
  });
}

function goPrev(){ currentIndex = (currentIndex - 1 + items.length) % items.length; updateGallery(); }
function goNext(){ currentIndex = (currentIndex + 1) % items.length; updateGallery(); }

prevBtn?.addEventListener('click', goPrev);
nextBtn?.addEventListener('click', goNext);

// Gestos (táctil/mouse)
let startX = 0, dragging = false;
const start = x => { startX = x; dragging = true; };
const end   = x => {
  if(!dragging) return;
  const d = x - startX;
  if (d > 50) goPrev();
  else if (d < -50) goNext();
  dragging = false;
};

track.addEventListener('touchstart', e => start(e.touches[0].clientX), {passive:true});
track.addEventListener('touchend',   e => end(e.changedTouches[0].clientX));
track.addEventListener('mousedown',  e => start(e.clientX));
track.addEventListener('mouseup',    e => end(e.clientX));
track.addEventListener('mouseleave', () => { dragging = false; });

window.addEventListener('resize', recalcLayout);
recalcLayout();
