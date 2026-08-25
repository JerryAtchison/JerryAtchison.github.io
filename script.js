document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const menuButton = document.querySelector('.menu-button');
const primaryNav = document.querySelector('#primary-nav');

if (menuButton && primaryNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const imageFilePattern = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const fieldImageLinks = [...document.querySelectorAll('.article figure > a[href]')].filter((link) => {
  const image = link.querySelector('img');
  if (!image || link.hasAttribute('download')) return false;

  const url = new URL(link.href, window.location.href);
  return url.origin === window.location.origin
    && url.pathname.includes('/assets/field-experience/')
    && imageFilePattern.test(url.pathname);
});

if (fieldImageLinks.length && typeof HTMLDialogElement !== 'undefined') {
  const lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-label', 'Field image viewer');
  lightbox.innerHTML = `
    <div class="lightbox-shell">
      <div class="lightbox-toolbar">
        <span class="lightbox-counter"></span>
        <button class="lightbox-close" type="button" aria-label="Close image viewer">×</button>
      </div>
      <div class="lightbox-stage">
        <button class="lightbox-nav lightbox-previous" type="button" aria-label="View previous image">‹</button>
        <figure class="lightbox-figure">
          <div class="lightbox-image-wrap"><img class="lightbox-image" alt=""/></div>
          <figcaption class="lightbox-caption" aria-live="polite"></figcaption>
        </figure>
        <button class="lightbox-nav lightbox-next" type="button" aria-label="View next image">›</button>
      </div>
    </div>`;
  document.body.append(lightbox);

  const viewerImage = lightbox.querySelector('.lightbox-image');
  const viewerCaption = lightbox.querySelector('.lightbox-caption');
  const counter = lightbox.querySelector('.lightbox-counter');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const previousButton = lightbox.querySelector('.lightbox-previous');
  const nextButton = lightbox.querySelector('.lightbox-next');
  let currentIndex = 0;
  let activeTrigger = null;

  const showImage = (index) => {
    currentIndex = (index + fieldImageLinks.length) % fieldImageLinks.length;
    const link = fieldImageLinks[currentIndex];
    const thumbnail = link.querySelector('img');
    const caption = link.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || thumbnail.alt;

    viewerImage.src = link.href;
    viewerImage.alt = thumbnail.alt;
    viewerCaption.textContent = caption;
    viewerCaption.hidden = !caption;
    counter.textContent = `${currentIndex + 1} of ${fieldImageLinks.length}`;
    previousButton.hidden = fieldImageLinks.length < 2;
    nextButton.hidden = fieldImageLinks.length < 2;
  };

  const closeLightbox = () => {
    if (lightbox.open) lightbox.close();
  };

  fieldImageLinks.forEach((link, index) => {
    link.dataset.lightbox = '';
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      event.preventDefault();
      activeTrigger = link;
      showImage(index);
      lightbox.showModal();
      document.documentElement.classList.add('lightbox-open');
      closeButton.focus({ preventScroll: true });
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton.addEventListener('click', () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(currentIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(currentIndex + 1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      showImage(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      showImage(fieldImageLinks.length - 1);
    }
  });

  lightbox.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    viewerImage.removeAttribute('src');
    activeTrigger?.focus({ preventScroll: true });
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll([
  '#field-work .field-work-feature',
  '.field-case-library .field-case-card',
  '.project-layout .role-note',
  '.project-layout .case-metrics',
  '.project-layout .case-timeline',
  '.project-layout .case-figure-grid',
  '.project-layout .before-after-grid',
  '.project-layout .site-context-grid',
  '.project-layout .comparison-gallery',
  '.project-layout .evidence-details',
  '.project-layout .scope-note',
  '.project-layout .case-nav'
].join(','));

if (!reducedMotion && revealTargets.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealTargets.forEach((element) => {
    if (element.getBoundingClientRect().top <= window.innerHeight * 0.86) return;
    element.classList.add('reveal-pending');
    observer.observe(element);
  });
}
