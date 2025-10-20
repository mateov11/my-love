/* ========= 1) REVELADO INICIAL (todo negro → foto) ========= */
const revealImg     = document.getElementById('revealImage');
const revealOverlay = document.getElementById('revealOverlay');
const imageSection  = document.querySelector('.image-section');

/* progreso según la posición real de la sección en el viewport */
function revealProgress(){
  const rect = imageSection.getBoundingClientRect();
  const vh   = window.innerHeight || document.documentElement.clientHeight;

  // Empieza a revelar cuando la parte superior entra al viewport
  const start = 0;            // px dentro del viewport
  const end   = vh * 0.7;     // cuánto “camino” dura el revelado (ajustable)

  const y = Math.min(Math.max((start - rect.top), 0), end);
  return y / end; // 0 → 1
}

function handleReveal(){
  const t = Math.min(Math.max(revealProgress(), 0), 1);
  // Imagen aparece y sube
  revealImg.style.opacity   = t;
  revealImg.style.transform = `translateY(${28 - 28*t}px) scale(${0.98 + 0.02*t})`;
  // Overlay negro se va
  revealOverlay.style.opacity = 1 - t;
}

window.addEventListener('scroll', handleReveal, { passive: true });
window.addEventListener('resize', handleReveal);
document.addEventListener('DOMContentLoaded', handleReveal);
handleReveal();

/* ========= 2) CONTADOR (3 arriba / 3 abajo) ========= */
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

/* ========= 3) GALERÍA 3D (secundarias detrás) ========= */
const track   = document.querySelector('.gallery-track');
const items   = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
let baseX  = 220;   // desplazamiento lateral (se recalcula)
let depthZ = 200;   // empuje hacia atrás

function recalcLayout(){
  const w = track.getBoundingClientRect().width;
  baseX  = Math.min(0.28 * w, 240);  // lateral según ancho
  depthZ = Math.min(0.22 * w, 220);  // profundidad hacia atrás
  updateGallery();
}

function updateGallery(){
  items.forEach((item, i) => {
    const off  = i - currentIndex;
    const abs  = Math.abs(off);
    const dir  = off < 0 ? -1 : 1;

    if (off === 0){
      // Principal: al frente
      item.style.transform = `translate(-50%, -50%) translateX(0px) translateZ(0px) rotateY(0deg) scale(1)`;
      item.style.opacity   = 1;
      item.style.zIndex    = 1000;
      item.style.pointerEvents = 'auto';
      item.style.filter    = 'none';
    } else {
      // Secundarias: detrás, más pequeñas y sutilmente atenuadas
      const x      = dir * baseX * abs;
      const zBack  = -depthZ * abs;         // detrás
      const rotY   = dir * -12;
      const scale  = Math.max(0.68, 1 - 0.18*abs);
      const op     = Math.max(0.35, 0.85 - 0.20*abs);
      const zLayer = 1000 - abs;

      item.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${zBack}px) rotateY(${rotY}deg) scale(${scale})`;
      item.style.opacity   = op;
      item.style.zIndex    = zLayer;
      item.style.pointerEvents = 'none';    // no tapa la principal
      item.style.filter    = 'brightness(0.92)';
    }
  });
}

function goPrev(){ currentIndex = (currentIndex - 1 + items.length) % items.length; updateGallery(); }
function goNext(){ currentIndex = (currentIndex + 1) % items.length; updateGallery(); }

prevBtn?.addEventListener('click', goPrev);
nextBtn?.addEventListener('click', goNext);

// Gestos táctil/mouse
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
document.addEventListener('DOMContentLoaded', () => {
  recalcLayout();
  // Asegura que arranque bien posicionada la principal
  updateGallery();
});
