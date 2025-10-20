const img = document.getElementById('revealImage');

// Función para interpolar colores entre negro y gris casi negro
function interpolateColor(color1, color2, factor) {
  const c1 = color1.match(/\w\w/g).map(c => parseInt(c, 16));
  const c2 = color2.match(/\w\w/g).map(c => parseInt(c, 16));
  const result = c1.map((c, i) => Math.round(c + (c2[i] - c) * factor));
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

const colorStart = '#000000'; // negro
const colorEnd = '#333333';   // gris casi negro

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  let scrollFraction = scrollTop / docHeight;
  if(scrollFraction > 1) scrollFraction = 1;
  if(scrollFraction < 0) scrollFraction = 0;

  const color = interpolateColor(colorStart.substring(1), colorEnd.substring(1), scrollFraction);
  document.body.style.background = color;

  // Imagen con scroll
  let reveal = scrollTop / window.innerHeight;
  if (reveal < 0) reveal = 0;
  if (reveal > 1) reveal = 1;
  img.style.opacity = reveal;
  img.style.transform = `translateX(-50%) translateY(${50 - reveal*50}px)`;
});

// Contador desde 20 septiembre 2025
const startDate = new Date('2025-09-20T00:00:00');

function updateClock() {
  const now = new Date();
  let diff = now - startDate;

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  let hours = now.getHours() - startDate.getHours();
  let minutes = now.getMinutes() - startDate.getMinutes();
  let seconds = now.getSeconds() - startDate.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) { 
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastMonth;
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }

  document.getElementById('years').textContent = String(years).padStart(2,'0');
  document.getElementById('months').textContent = String(months).padStart(2,'0');
  document.getElementById('days').textContent = String(days).padStart(2,'0');
  document.getElementById('hours').textContent = String(hours).padStart(2,'0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2,'0');
}

setInterval(updateClock, 1000);
updateClock();
const track = document.querySelector('.gallery-track');
const items = Array.from(document.querySelectorAll('.gallery-item'));
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;

function updateGallery() {
  items.forEach((item, index) => {
    const offset = index - currentIndex;

    if(offset === 0){
      // Imagen principal
      item.style.transform = `translateX(0) translateY(-50%) rotateY(0deg) scale(1)`;
      item.style.opacity = 1;
      item.style.zIndex = 10;
    } else {
      const direction = offset < 0 ? -1 : 1;
      const absOffset = Math.abs(offset);

      const translateX = direction * 250 * absOffset;
      const rotateY = direction * -15;
      const scale = 1 - 0.15 * absOffset;
      const opacity = 0.5 - 0.1 * (absOffset - 1);
      const zIndex = 10 - absOffset;

      item.style.transform = `translateX(${translateX}px) translateY(-50%) rotateY(${rotateY}deg) scale(${scale})`;
      item.style.opacity = opacity;
      item.style.zIndex = zIndex;
    }
  });
}

// Flechas (solo desktop)
prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  updateGallery();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % items.length;
  updateGallery();
});

// Swipe touch / mouse drag
let startX = 0;
let isDragging = false;

function handleSwipe(diff) {
  if(diff > 50) {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateGallery();
  } else if(diff < -50) {
    currentIndex = (currentIndex + 1) % items.length;
    updateGallery();
  }
}

// Touch
track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; });
track.addEventListener('touchend', e => { 
  if(!isDragging) return; 
  handleSwipe(e.changedTouches[0].clientX - startX); 
  isDragging = false; 
});

// Mouse (desktop)
track.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
track.addEventListener('mouseup', e => { 
  if(!isDragging) return; 
  handleSwipe(e.clientX - startX); 
  isDragging = false; 
});
track.addEventListener('mouseleave', e => { 
  if(isDragging) handleSwipe(e.clientX - startX); 
  isDragging = false; 
});

// Inicializa
updateGallery();
