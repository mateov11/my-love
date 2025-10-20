/************************************************************
 * CONFIG
 ************************************************************/
const START_DATE_ISO = '2025-09-20T00:00:00'; // fecha del contador
const REVEAL_RANGE_VH = 0.35;                // 0.25 = más rápido, 0.45 = más largo

// Galería 3D
const GALLERY_LATERAL_FRACTION = 0.28;  // % del ancho para separar laterales
const GALLERY_LATERAL_MAX = 240;        // px máximo de separación lateral
const GALLERY_DEPTH_FRACTION = 0.22;    // % del ancho como profundidad hacia atrás
const GALLERY_DEPTH_MAX = 220;          // px máximo de profundidad
const GALLERY_ROTATE_Y = 12;            // grados de inclinación lateral
const GALLERY_MIN_SCALE = 0.68;         // escala mínima
const GALLERY_OPACITY_MIN = 0.35;       // opacidad mínima secundarias
const GALLERY_OPACITY_START = 0.85;     // opacidad base primera secundaria

/************************************************************
 * HELPERS
 ************************************************************/
const clamp01 = x => Math.min(Math.max(x, 0), 1);

/************************************************************
 * DOM REFS
 ************************************************************/
const revealImg     = document.getElementById('revealImage');
const revealOverlay = document.getElementById('revealOverlay'); // lo ignoraremos (queda oculto por CSS)
const imageSection  = document.querySelector('.image-section');

const yearsEl   = document.getElementById('years');
const monthsEl  = document.getElementById('months');
const daysEl    = document.getElementById('days');
const hoursEl   = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const track   = document.querySelector('.gallery-track');
const items   = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

/************************************************************
 * 1) REVELADO IMAGEN (sin negro: fondo fijo #333333)
 ************************************************************/
function handleReveal(){
  const sc = window.scrollY || window.pageYOffset || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 1;

  // Progreso del revelado (0 → 1)
  const revealThreshold = vh * REVEAL_RANGE_VH;
  const t = clamp01(sc / Math.max(revealThreshold, 1));

  // Imagen aparece y sube
  if (revealImg) {
    revealImg.style.opacity   = t;
    revealImg.style.transform = `translateY(${28 - 28*t}px) scale(${0.98 + 0.02*t})`;
  }

  // Overlay: aseguramos que no oscurezca (por si existe en HTML)
  if (revealOverlay) {
    revealOverlay.style.opacity = 0; // siempre transparente
  }
}

/************************************************************
 * 2) CONTADOR (3 arriba / 3 abajo)
 ************************************************************/
const startDate = new Date(START_DATE_ISO);

function updateClock(){
  const now = new Date();

  let years  = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth()    - startDate.getMonth();
  let days   = now.getDate()     - startDate.getDate();
  let hours  = now.getHours()    - startDate.getHours();
  let minutes= now.getMinutes()  - startDate.getMinutes();
  let seconds= now.getSeconds()  - startDate.getSeconds();

  if (seconds < 0){ seconds += 60; minutes--; }
  if (minutes < 0){ minutes += 60; hours--; }
  if (hours   < 0){ hours   += 24;  days--; }
  if (days    < 0){
    const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastMonthDays;
    months--;
  }
  if (months  < 0){ months += 12; years--; }

  if (yearsEl)   yearsEl.textContent   = String(years).padStart(2,'0');
  if (monthsEl)  monthsEl.textContent  = String(months).padStart(2,'0');
  if (daysEl)    daysEl.textContent    = String(days).padStart(2,'0');
  if (hoursEl)   hoursEl.textContent   = String(hours).padStart(2,'0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2,'0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2,'0');
}

/************************************************************
 * 3) GALERÍA 3D (principal al frente, secundarias detrás)
 ************************************************************/
let currentIndex = 0;
let baseX  = 220;   // desplazamiento lateral recalculado por ancho
let depthZ = 200;   // profundidad hacia atrás recalculada

function recalcLayout(){
  if (!track) return;
  const w = track.getBoundingClientRect().width || 1;
  baseX  = Math.min(GALLERY_LATERAL_FRACTION * w, GALLERY_LATERAL_MAX);
  depthZ = Math.min(GALLERY_DEPTH_FRACTION   * w, GALLERY_DEPTH_MAX);
  updateGallery();
}

function updateGallery(){
  if (!items.length) return;

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
      const zBack  = -depthZ * abs;               // hacia atrás
      const rotY   = dir * -GALLERY_ROTATE_Y;
      const scale  = Math.max(GALLERY_MIN_SCALE, 1 - 0.18 * abs);
      const op     = Math.max(GALLERY_OPACITY_MIN, GALLERY_OPACITY_START - 0.20 * abs);
      const zLayer = 1000 - abs;

      item.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${zBack}px) rotateY(${rotY}deg) scale(${scale})`;
      item.style.opacity   = op;
      item.style.zIndex    = zLayer;
      item.style.pointerEvents = 'none';          // no interceptan clics
      item.style.filter    = 'brightness(0.92)';  // leve atenuación sin opacar demasiado
    }
  });
}

function goPrev(){ currentIndex = (currentIndex - 1 + items.length) % items.length; updateGallery(); }
function goNext(){ currentIndex = (currentIndex + 1) % items.length; updateGallery(); }

/************************************************************
 * 4) GESTOS (táctil y mouse)
 ************************************************************/
let startX = 0, dragging = false;
function dragStart(x){ startX = x; dragging = true; }
function dragEnd(x){
  if(!dragging) return;
  const d = x - startX;
  if (d > 50) goPrev();
  else if (d < -50) goNext();
  dragging = false;
}

/************************************************************
 * 5) EVENTOS
 ************************************************************/
window.addEventListener('scroll', handleReveal, { passive: true });
window.addEventListener('resize', () => { handleReveal(); recalcLayout(); });

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa todo
  handleReveal();
  recalcLayout();
  updateGallery();
  updateClock();
  setInterval(updateClock, 1000);

  // Botones galería
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  // Gestos táctil y mouse
  if (track){
    track.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), {passive:true});
    track.addEventListener('touchend',   e => dragEnd(e.changedTouches[0].clientX));
    track.addEventListener('mousedown',  e => dragStart(e.clientX));
    track.addEventListener('mouseup',    e => dragEnd(e.clientX));
    track.addEventListener('mouseleave', () => { dragging = false; });
  }
});
