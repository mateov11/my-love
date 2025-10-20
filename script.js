/* ---------- Imagen inicial: aparece antes (20% de scroll) ---------- */
const img = document.getElementById('revealImage');
function handleScrollReveal(){
  const sc = window.scrollY;
  const threshold = window.innerHeight * 0.2;        // 20% de la ventana
  const t = Math.min(Math.max(sc / Math.max(threshold, 1), 0), 1);
  img.style.opacity = t;
  img.style.transform = `translateY(${22 - 22 * t}px)`;
}
window.addEventListener('scroll', handleScrollReveal, { passive: true });
handleScrollReveal();

/* ---------- Contador (3 arriba / 3 abajo) ---------- */
const startDate = new Date('2025-09-20T00:00:00');
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

/* ---------- Galería 3D centrada y consistente ---------- */
const track   = document.querySelector('.gallery-track');
const items   = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
let baseX = 200; // se recalcula según ancho

function recalcLayout(){
  // distancia lateral en función del ancho del contenedor (para móvil/PC)
  const w = track.getBoundingClientRect().width;
  baseX = Math.min(0.28 * w, 220);  // 28% del ancho, máx 220px
  updateGallery();
}

function updateGallery(){
  items.forEach((item, i) => {
    const off = i - currentIndex;
    const base = 'translate(-50%,-50%)';
    if (off === 0){
      item.style.transform = `${base} rotateY(0deg) scale(1)`;
      item.style.opacity   = 1;
      item.style.zIndex    = 10;
    } else {
      const dir  = off < 0 ? -1 : 1;
      const abs  = Math.abs(off);
      const x    = dir * baseX * abs;
      const rot  = dir * -12;
      const scale= Math.max(0.65, 1 - 0.18 * abs);
      const op   = Math.max(0.25, 0.85 - 0.20 * abs);
      item.style.transform = `${base} translateX(${x}px) rotateY(${rot}deg) scale(${scale})`;
      item.style.opacity   = op;
      item.style.zIndex    = 10 - abs;
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
const end   = x => { if(!dragging) return; const d = x - startX; if (d > 50) goPrev(); else if (d < -50) goNext(); dragging = false; };

track.addEventListener('touchstart', e => start(e.touches[0].clientX), {passive:true});
track.addEventListener('touchend',   e => end(e.changedTouches[0].clientX));
track.addEventListener('mousedown',  e => start(e.clientX));
track.addEventListener('mouseup',    e => end(e.clientX));
track.addEventListener('mouseleave', () => { dragging = false; });

window.addEventListener('resize', recalcLayout);
recalcLayout();
