const ovenIntro = document.querySelector('[data-oven-intro]');
const ovenSkip = document.querySelector('[data-oven-skip]');

const finishOvenIntro = () => {
  document.body.classList.remove('intro-active');
  ovenIntro?.remove();
};

if (ovenIntro) {
  window.setTimeout(() => ovenIntro.classList.add('is-opening'), 550);
  window.setTimeout(finishOvenIntro, 5200);
  ovenSkip?.addEventListener('click', finishOvenIntro);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finishOvenIntro();
  }, { once: true });
}

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const copyButton = document.querySelector('[data-copy]');
const copyStatus = document.querySelector('#copy-status');

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 80);
};

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav?.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton.focus();
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

copyButton?.addEventListener('click', async () => {
  const message = document.querySelector('#dm-message')?.textContent?.trim();
  if (!message) return;

  try {
    await navigator.clipboard.writeText(message);
    copyButton.classList.add('copied');
    copyButton.querySelector('span').textContent = 'note copied!';
    copyStatus.textContent = 'Order note copied to clipboard.';
    window.setTimeout(() => {
      copyButton.classList.remove('copied');
      copyButton.querySelector('span').textContent = 'copy this note';
    }, 2200);
  } catch {
    copyStatus.textContent = 'Could not copy automatically. Please select the note and copy it.';
  }
});

const scorePatterns = {
  leaf: {
    name: 'botanical leaf score',
    lines: '<path d="M151 304C179 258 210 210 269 119"/><path d="M174 266C151 265 139 252 137 235 156 237 170 247 174 266ZM191 239C168 235 157 220 158 204 177 208 189 221 191 239ZM210 211C189 203 181 188 184 172 203 179 213 194 210 211ZM185 250C204 253 219 245 227 231 209 227 194 234 185 250ZM205 220C225 221 240 210 246 195 228 193 214 202 205 220ZM226 187C245 185 258 173 262 157 244 157 231 169 226 187Z"/>'
  },
  sun: {
    name: 'sunrise score',
    lines: '<path d="M112 270h196"/><path d="M145 270a65 65 0 0 1 130 0"/><path d="M210 168v-34M160 184l-22-29M260 184l22-29M126 222l-34-12M294 222l34-12"/>'
  },
  wheat: {
    name: 'wheat score',
    lines: '<path d="M210 315V112"/><path d="M209 285c-37-7-50-24-55-48 31 2 49 18 55 48ZM211 249c37-7 50-24 55-48-31 2-49 18-55 48ZM209 213c-34-8-45-24-49-46 28 3 44 18 49 46ZM211 177c31-8 42-22 45-42-26 3-40 16-45 42"/>'
  },
  crosshatch: {
    name: 'woven score',
    lines: '<path d="M142 171l107 107M170 143l107 107M116 203l101 101M278 171L171 278M250 143L143 250M304 203L203 304"/>'
  }
};

const loafPreview = document.querySelector('[data-loaf-preview]');
const scoreLines = document.querySelector('[data-score-lines]');
const scoreName = document.querySelector('[data-score-name]');
const scoreButtons = document.querySelectorAll('[data-score]');
const scoringCanvas = document.querySelector('#scoring-canvas');
const clearDrawing = document.querySelector('[data-clear-drawing]');

scoreButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.score;
    scoreButtons.forEach((choice) => {
      const active = choice === button;
      choice.classList.toggle('active', active);
      choice.setAttribute('aria-pressed', String(active));
    });

    const isCustom = selected === 'custom';
    loafPreview?.classList.toggle('custom-mode', isCustom);
    if (scoreName) scoreName.textContent = isCustom ? 'your own score' : scorePatterns[selected]?.name || 'score preview';
    if (!isCustom && scoreLines && scorePatterns[selected]) {
      scoreLines.innerHTML = scorePatterns[selected].lines;
    }
  });
});

if (scoringCanvas) {
  const context = scoringCanvas.getContext('2d');
  let drawing = false;

  const canvasPoint = (event) => {
    const bounds = scoringCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (scoringCanvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (scoringCanvas.height / bounds.height)
    };
  };

  const beginDrawing = (event) => {
    drawing = true;
    scoringCanvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const continueDrawing = (event) => {
    if (!drawing) return;
    const point = canvasPoint(event);
    context.strokeStyle = '#fae6b7';
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const endDrawing = () => {
    drawing = false;
    context.closePath();
  };

  scoringCanvas.addEventListener('pointerdown', beginDrawing);
  scoringCanvas.addEventListener('pointermove', continueDrawing);
  scoringCanvas.addEventListener('pointerup', endDrawing);
  scoringCanvas.addEventListener('pointercancel', endDrawing);
  clearDrawing?.addEventListener('click', () => context.clearRect(0, 0, scoringCanvas.width, scoringCanvas.height));
}

document.querySelectorAll('.fact-card').forEach((card) => {
  card.addEventListener('toggle', () => {
    if (!card.open) return;
    document.querySelectorAll('.fact-card[open]').forEach((otherCard) => {
      if (otherCard !== card) otherCard.open = false;
    });
  });
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
