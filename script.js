// Imagen inicial con revelado más rápido
const img = document.getElementById('revealImage');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const reveal = Math.min(scrollTop / (window.innerHeight * 0.4), 1);
  img.style.opacity = reveal;
  img.style.transform = `translate(-50%, ${30 - reveal * 30}px)`;
});

// Contador desde 20 septiembre 2025
const startDate = new Date('2025-09-20T00:00:00');

function updateClock() {
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  let hours = now.getHours() - startDate.getHours();
  let minutes = now.getMinutes() - startDate.getMinutes();
  let seconds = now.getSeconds() - startDate.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastMonthDays;
    months--;
  }
  if (months < 0) { months += 12; years--; }

  document.getElementById('years').textContent = String(years).padStart(2, '0');
  document.getElementById('months').textContent = String(months).padStart(2, '0');
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateClock, 1000);
updateClock();

// Galería 3D centrada
const track = document.querySelector('.gallery-track');
const items = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;

function updateGallery() {
  items.forEach((item, index) => {
    const offset = index - currentIndex;
    const base = 'translate(-50%, -50%)';
    if (offset === 0) {
      item.style.transform = `${base} rotateY(0deg) scale(1)`;
      item.style.opacity = 1;
      item.style.zIndex = 10;
    } else {
      const dir = offset < 0 ? -1 : 1;
      const abs = Math.abs(offset);
      const x = dir * 250 * abs;
      const rot = dir * -15;
      const scale = Math.max(0.6, 1 - 0.2 * abs);
      const opacity = Math.max(0.2, 0.8 - 0.2 * abs);
      item.style.transform = `${base} translateX(${x}px) rotateY(${rot}deg) scale(${scale})`;
      item.style.opacity = opacity;
      item.style.zIndex = 10 - abs;
    }
  });
}

function goPrev() {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  updateGallery();
}

function goNext() {
  currentIndex = (currentIndex + 1) % items.length;
  updateGallery();
}

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);

// Swipe táctil y mouse
let startX = 0, isDragging = false;
track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; });
track.addEventListener('touchend', e => {
  if (!isDragging) return;
  const diff = e.changedTouches[0].clientX - startX;
  if (diff > 50) goPrev();
  else if (diff < -50) goNext();
  isDragging = false;
});
track.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
track.addEventListener('mouseup', e => {
  if (!isDragging) return;
  const diff = e.clientX - startX;
  if (diff > 50) goPrev();
  else if (diff < -50) goNext();
  isDragging = false;
});
track.addEventListener('mouseleave', e => { isDragging = false; });

updateGallery();
