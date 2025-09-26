document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  const sidebar = document.getElementById('sidebar');
  const themeToggle = document.getElementById('themeToggle');
  const mobileToggle = document.getElementById('mobileToggle');
  const typedEl = document.querySelector('.typed-text');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  let currentSectionIndex = 0;
  let isScrolling = false;
  const sectionsArray = Array.from(sections);

  // Set current year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize Typed text
  if (typedEl) {
    const strings = ['Software Engineer', 'Full Stack Developer', 'Java Developer'];
    let si = 0, pos = 0, forward = true;
    function tick() {
      const current = strings[si];
      if (forward) {
        pos++;
        if (pos > current.length) { forward = false; setTimeout(tick, 1500); return; }
      } else {
        pos--;
        if (pos < 0) { forward = true; si = (si + 1) % strings.length; }
      }
      typedEl.textContent = current.substring(0, pos);
      setTimeout(tick, forward ? 60 : 30);
    }
    tick();
  }

  // Show section
  function showSection(id) {
    if (isScrolling) return;
    const target = document.getElementById(id);
    if (!target) return;

    isScrolling = true;

    // Update sections
    sections.forEach(s => s.classList.remove('active'));
    target.classList.add('active');

    // Update nav links
    navLinks.forEach(link => {
      link.parentElement.classList.toggle('active', link.getAttribute('data-target') === id);
    });

    currentSectionIndex = sectionsArray.indexOf(target);

    // Close mobile sidebar
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }

    // Update URL hash
    history.replaceState(null, '', `#${id}`);

    setTimeout(() => { isScrolling = false; }, 500);
  }

  // Initial section from hash
  const initial = window.location.hash ? window.location.hash.substring(1) : 'home';
  showSection(initial);

  // Nav clicks
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      showSection(targetId);
    });
  });

  // Wheel scroll
  function handleWheel(e) {
    if (isScrolling) return;
    const delta = e.deltaY;
    if (delta === 0) return;

    const nextIndex = delta > 0
      ? Math.min(currentSectionIndex + 1, sections.length - 1)
      : Math.max(currentSectionIndex - 1, 0);

    if (nextIndex !== currentSectionIndex) {
      showSection(sectionsArray[nextIndex].id);
    }
  }
  window.addEventListener('wheel', e => {
    e.preventDefault();
    handleWheel(e);
  }, { passive: false });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (isScrolling) return;
    let nextIndex = currentSectionIndex;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') nextIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
    if (e.key === 'ArrowUp' || e.key === 'PageUp') nextIndex = Math.max(currentSectionIndex - 1, 0);
    if (nextIndex !== currentSectionIndex) showSection(sectionsArray[nextIndex].id);
  });

  // Touch swipe
  let touchStartY = 0, touchEndY = 0;
  const minSwipeDistance = 50;

  document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; });
  document.addEventListener('touchmove', e => { e.preventDefault(); }, { passive: false });
  document.addEventListener('touchend', e => {
    if (isScrolling) return;
    touchEndY = e.changedTouches[0].clientY;
    const distance = touchStartY - touchEndY;

    if (Math.abs(distance) > minSwipeDistance) {
      const nextIndex = distance > 0
        ? Math.min(currentSectionIndex + 1, sections.length - 1)
        : Math.max(currentSectionIndex - 1, 0);

      if (nextIndex !== currentSectionIndex) showSection(sectionsArray[nextIndex].id);
    }
  });

  // Theme toggle
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const i = themeToggle.querySelector('i');
    if (!i) return;
    i.className = document.body.classList.contains('dark-theme') ? 'fas fa-moon' : 'fas fa-sun';
  }

  // Mobile toggle
  mobileToggle && mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Hash change
  window.addEventListener('hashchange', () => {
    const h = window.location.hash ? window.location.hash.substring(1) : 'home';
    showSection(h);
  });

  // Contact form async
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const res = await fetch(form.action, { method: form.method, body: data, headers: { Accept: 'application/json' } });
      if (res.ok) {
        status.textContent = '✅ Thank you! Your message has been sent.';
        status.classList.add('text-success'); status.classList.remove('text-danger');
        form.reset();
      } else {
        status.textContent = '❌ Oops! Something went wrong.';
        status.classList.add('text-danger'); status.classList.remove('text-success');
      }
    } catch {
      status.textContent = '❌ Network error. Try again later.';
      status.classList.add('text-danger'); status.classList.remove('text-success');
    }
  });
});
