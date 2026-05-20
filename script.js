/************************************************************
 * CONFIG
 ************************************************************/
const START_DATE_ISO = '2025-09-20T00:00:00';
const REVEAL_RANGE_VH = 0.35;

const GALLERY_LATERAL_FRACTION = 0.28;
const GALLERY_LATERAL_MAX = 240;
const GALLERY_DEPTH_FRACTION = 0.22;
const GALLERY_DEPTH_MAX = 220;
const GALLERY_ROTATE_Y = 12;
const GALLERY_MIN_SCALE = 0.68;
const GALLERY_OPACITY_MIN = 0.35;
const GALLERY_OPACITY_START = 0.85;

/************************************************************
 * HELPERS
 ************************************************************/
const clamp01 = x => Math.min(Math.max(x, 0), 1);

/************************************************************
 * DOM REFS
 ************************************************************/
const revealImg = document.getElementById('revealImage');
const revealOverlay = document.getElementById('revealOverlay');

const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const track = document.querySelector('.gallery-track');
const items = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

const tabButtons = Array.from(document.querySelectorAll('[data-tab-target]'));
const tabPanels = Array.from(document.querySelectorAll('[data-tab-panel]'));

const presentationSlides = Array.from(document.querySelectorAll('[data-slide]'));
const presentationDots = Array.from(document.querySelectorAll('[data-slide-to]'));
const presentationPrevBtn = document.querySelector('.presentation-prev');
const presentationNextBtn = document.querySelector('.presentation-next');
const slidesViewport = document.querySelector('.slides-viewport');
let presentationDirection = 1;

/************************************************************
 * 1) PESTAÑAS
 ************************************************************/
function activateTab(tabName){
  tabButtons.forEach(button => {
    const isActive = button.dataset.tabTarget === tabName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach(panel => {
    const isActive = panel.dataset.tabPanel === tabName;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabName === 'historia'){
    requestAnimationFrame(() => {
      handleReveal();
      recalcLayout();
    });
  }

  if (tabName === 'presentacion'){
    requestAnimationFrame(updatePresentation);
  }
}

/************************************************************
 * 2) REVELADO IMAGEN
 ************************************************************/
function handleReveal(){
  const sc = window.scrollY || window.pageYOffset || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 1;
  const revealThreshold = vh * REVEAL_RANGE_VH;
  const t = clamp01(sc / Math.max(revealThreshold, 1));

  if (revealImg) {
    revealImg.style.opacity = t;
    revealImg.style.transform = `translateY(${28 - 28 * t}px) scale(${0.98 + 0.02 * t})`;
  }

  if (revealOverlay) {
    revealOverlay.style.opacity = 0;
  }
}

/************************************************************
 * 3) CONTADOR
 ************************************************************/
const startDate = new Date(START_DATE_ISO);

function updateClock(){
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  let hours = now.getHours() - startDate.getHours();
  let minutes = now.getMinutes() - startDate.getMinutes();
  let seconds = now.getSeconds() - startDate.getSeconds();

  if (seconds < 0){ seconds += 60; minutes--; }
  if (minutes < 0){ minutes += 60; hours--; }
  if (hours < 0){ hours += 24; days--; }
  if (days < 0){
    const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastMonthDays;
    months--;
  }
  if (months < 0){ months += 12; years--; }

  if (yearsEl) yearsEl.textContent = String(Math.max(years, 0)).padStart(2, '0');
  if (monthsEl) monthsEl.textContent = String(Math.max(months, 0)).padStart(2, '0');
  if (daysEl) daysEl.textContent = String(Math.max(days, 0)).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(Math.max(hours, 0)).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(Math.max(minutes, 0)).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(Math.max(seconds, 0)).padStart(2, '0');
}

/************************************************************
 * 4) GALERÍA 3D
 ************************************************************/
let currentIndex = 0;
let baseX = 220;
let depthZ = 200;

function recalcLayout(){
  if (!track) return;
  const w = track.getBoundingClientRect().width || 1;
  baseX = Math.min(GALLERY_LATERAL_FRACTION * w, GALLERY_LATERAL_MAX);
  depthZ = Math.min(GALLERY_DEPTH_FRACTION * w, GALLERY_DEPTH_MAX);
  updateGallery();
}

function updateGallery(){
  if (!items.length) return;

  items.forEach((item, i) => {
    const off = i - currentIndex;
    const abs = Math.abs(off);
    const dir = off < 0 ? -1 : 1;

    if (off === 0){
      item.style.transform = 'translate(-50%, -50%) translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
      item.style.opacity = 1;
      item.style.zIndex = 1000;
      item.style.pointerEvents = 'auto';
      item.style.filter = 'none';
      return;
    }

    const x = dir * baseX * abs;
    const zBack = -depthZ * abs;
    const rotY = dir * -GALLERY_ROTATE_Y;
    const scale = Math.max(GALLERY_MIN_SCALE, 1 - 0.18 * abs);
    const op = Math.max(GALLERY_OPACITY_MIN, GALLERY_OPACITY_START - 0.20 * abs);
    const zLayer = 1000 - abs;

    item.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${zBack}px) rotateY(${rotY}deg) scale(${scale})`;
    item.style.opacity = op;
    item.style.zIndex = zLayer;
    item.style.pointerEvents = 'none';
    item.style.filter = 'brightness(0.92)';
  });
}

function goPrev(){
  if (!items.length) return;
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  updateGallery();
}

function goNext(){
  if (!items.length) return;
  currentIndex = (currentIndex + 1) % items.length;
  updateGallery();
}

/************************************************************
 * 5) GESTOS GALERÍA
 ************************************************************/
let startX = 0;
let dragging = false;

function dragStart(x){
  startX = x;
  dragging = true;
}

function dragEnd(x){
  if(!dragging) return;
  const d = x - startX;
  if (d > 50) goPrev();
  else if (d < -50) goNext();
  dragging = false;
}

/************************************************************
 * 6) PRESENTACIÓN
 ************************************************************/
let presentationIndex = 0;
let presentationTouchStartX = 0;
let presentationTouching = false;

function markLongSlides(){
  presentationSlides.forEach(slide => {
    const paragraph = slide.querySelector('p');
    const title = slide.querySelector('h3');
    const totalText = `${title ? title.textContent : ''} ${paragraph ? paragraph.textContent : ''}`.trim();
    slide.classList.toggle('is-long', totalText.length > 340);
  });
}

function updatePresentation(){
  if (!presentationSlides.length) return;

  if (slidesViewport){
    slidesViewport.classList.toggle('is-forward', presentationDirection >= 0);
    slidesViewport.classList.toggle('is-backward', presentationDirection < 0);
  }

  presentationSlides.forEach((slide, index) => {
    const isActive = index === presentationIndex;
    slide.classList.toggle('is-active', isActive);
  });

  presentationDots.forEach(dot => {
    dot.classList.toggle('is-active', Number(dot.dataset.slideTo) === presentationIndex);
  });
}

function goToPresentationSlide(index){
  if (!presentationSlides.length) return;
  const total = presentationSlides.length;
  const normalized = (index + total) % total;
  presentationDirection = normalized > presentationIndex ? 1 : -1;
  if (presentationIndex === total - 1 && normalized === 0) presentationDirection = 1;
  if (presentationIndex === 0 && normalized === total - 1) presentationDirection = -1;
  presentationIndex = normalized;
  updatePresentation();
}

function goPresentationPrev(){
  goToPresentationSlide(presentationIndex - 1);
}

function goPresentationNext(){
  goToPresentationSlide(presentationIndex + 1);
}

function startPresentationSwipe(x){
  presentationTouchStartX = x;
  presentationTouching = true;
}

function endPresentationSwipe(x){
  if (!presentationTouching) return;
  const diff = x - presentationTouchStartX;
  if (diff > 50) goPresentationPrev();
  if (diff < -50) goPresentationNext();
  presentationTouching = false;
}

/************************************************************
 * 7) EVENTOS
 ************************************************************/
window.addEventListener('scroll', handleReveal, { passive: true });
window.addEventListener('resize', () => {
  handleReveal();
  recalcLayout();
});

document.addEventListener('DOMContentLoaded', () => {
  handleReveal();
  recalcLayout();
  updateGallery();
  updateClock();
  markLongSlides();
  updatePresentation();
  setInterval(updateClock, 1000);

  tabButtons.forEach(button => {
    button.addEventListener('click', () => activateTab(button.dataset.tabTarget));
  });

  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  if (track){
    track.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive:true });
    track.addEventListener('touchend', e => dragEnd(e.changedTouches[0].clientX));
    track.addEventListener('mousedown', e => dragStart(e.clientX));
    track.addEventListener('mouseup', e => dragEnd(e.clientX));
    track.addEventListener('mouseleave', () => { dragging = false; });
  }

  if (presentationPrevBtn) presentationPrevBtn.addEventListener('click', goPresentationPrev);
  if (presentationNextBtn) presentationNextBtn.addEventListener('click', goPresentationNext);

  presentationDots.forEach(dot => {
    dot.addEventListener('click', () => goToPresentationSlide(Number(dot.dataset.slideTo)));
  });

  if (slidesViewport){
    slidesViewport.addEventListener('touchstart', e => startPresentationSwipe(e.touches[0].clientX), { passive:true });
    slidesViewport.addEventListener('touchend', e => endPresentationSwipe(e.changedTouches[0].clientX));
  }

  document.addEventListener('keydown', event => {
    const presentationPanel = document.querySelector('[data-tab-panel="presentacion"]');
    const presentationIsOpen = presentationPanel && !presentationPanel.hidden;
    if (!presentationIsOpen) return;

    if (event.key === 'ArrowLeft') goPresentationPrev();
    if (event.key === 'ArrowRight') goPresentationNext();
  });
});
