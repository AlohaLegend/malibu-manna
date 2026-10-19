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

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
