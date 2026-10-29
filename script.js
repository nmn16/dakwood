/**
 * Kenchain Groups × Dakwood Furniture & Interiors Pvt. Ltd.
 * Core Interactive Scripts
 */

(function () {
  'use strict';

  // DOM Query Helpers
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  // State Elements
  const header = $('#header');
  const menuBtn = $('#menu');
  const navMenu = $('#nav');
  const navLinks = $$('.nav-item');
  const sections = $$('main > section[id]');
  const filterBtns = $$('.col-filter-btn');
  const collectionCards = $$('.collection-card');
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  const modalCategory = $('#modalCategory');
  const modalPhoto = $('#modalPhoto');
  const toast = $('#toast');
  const copyBtn = $('#copyScene');
  const contactForm = $('#contactForm');

  let activeModalData = '';
  let lastActiveElement = null;
  let toastTimer = null;

  /* ==========================================================================
     1. Sticky Header & Scroll-Spy Navigation
     ========================================================================== */
  function handleScroll() {
    const scrollY = window.scrollY;

    // Header elevation
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll-Spy to highlight current active numbered section
    let currentSectionId = '';
    const scrollAnchor = scrollY + 160;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollAnchor >= top && scrollAnchor < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        const targetId = link.getAttribute('href').replace('#', '');
        if (targetId === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ==========================================================================
     2. Mobile Navigation Drawer
     ========================================================================== */
  function toggleMobileMenu(forceState) {
    if (!navMenu) return;
    const isCurrentlyOpen = navMenu.classList.contains('open');
    const newState = forceState !== undefined ? forceState : !isCurrentlyOpen;

    navMenu.classList.toggle('open', newState);
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', newState ? 'true' : 'false');
      const icon = $('.toggle-icon', menuBtn);
      if (icon) icon.textContent = newState ? '✕' : '☰';
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close menu on link click
  $$('#nav a').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // Close menu on click outside
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('open')) {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        toggleMobileMenu(false);
      }
    }
  });

  /* ==========================================================================
     3. Product Collections Category Filters
     ========================================================================== */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.dataset.filter;
      collectionCards.forEach(card => {
        const matches = filterVal === 'all' || card.dataset.category === filterVal;
        card.classList.toggle('hidden', !matches);
      });
    });
  });

  /* ==========================================================================
     4. Accessible Lightbox Modal
     ========================================================================== */
  function openModal(title, category, description, imageUrl) {
    if (!modal) return;
    lastActiveElement = document.activeElement;

    if (modalTitle) modalTitle.textContent = title;
    if (modalCategory) modalCategory.textContent = category || 'PRODUCT COLLECTION';
    if (modalDescription) modalDescription.textContent = description;
    if (modalPhoto && imageUrl) {
      modalPhoto.style.backgroundImage = `url("${imageUrl}")`;
    }

    activeModalData = `${title}\n${category ? category + ' · ' : ''}${description}`;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const closeBtn = $('.modal-close', modal);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  // Collection modal triggers
  $$('.open-modal-btn, .lightbox-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.collection-card');
      const img = card ? $('img', card) : null;
      openModal(
        btn.dataset.title,
        btn.dataset.category,
        btn.dataset.description,
        img ? img.src : ''
      );
    });
  });

  // Inspiration gallery cards
  $$('.inspo-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = $('img', card);
      const title = card.dataset.title || $('b', card)?.textContent || 'Interior Inspiration';
      const desc = card.dataset.desc || 'Architectural residential interior concept illustrating materials, cabinetry and finishes.';
      const cat = $('small', card)?.textContent || 'INSPIRATION';
      openModal(title, cat, desc, img ? img.src : '');
    });
  });

  // Close triggers
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  /* ==========================================================================
     5. Toast Notifications & Clipboard Copy
     ========================================================================== */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!activeModalData) return;
      try {
        await navigator.clipboard.writeText(activeModalData);
        showToast('✓ Details copied to clipboard');
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = activeModalData;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        textarea.remove();
        showToast(success ? '✓ Details copied to clipboard' : 'Clipboard access denied by browser');
      }
    });
  }

  /* ==========================================================================
     6. Video Player Robustness & Fallback Handling
     ========================================================================== */
  $$('.video-media-box video').forEach(video => {
    // If video load errors out (e.g. offline, CORS or blocked download),
    // retain poster gracefully without black screen
    video.addEventListener('error', () => {
      video.style.opacity = '0.01'; // Keep poster behind visible
      const parent = video.parentElement;
      if (parent && !parent.querySelector('.video-fallback-msg')) {
        const note = document.createElement('div');
        note.className = 'video-fallback-msg';
        note.style.cssText = 'position:absolute;bottom:10px;left:10px;right:10px;background:rgba(48,37,31,0.85);color:#D8C8B1;font-size:9.5px;padding:6px 10px;border-radius:3px;text-align:center;pointer-events:none;';
        note.textContent = 'Preview footage streaming online. Source page available below.';
        parent.appendChild(note);
      }
    });

    // Pause other videos when one begins playing
    video.addEventListener('play', () => {
      $$('.video-media-box video').forEach(other => {
        if (other !== video && !other.paused) {
          other.pause();
        }
      });
    });
  });

  /* ==========================================================================
     7. Contact Form Validation & Submission
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = $('#formName', contactForm);
      const emailInput = $('#formEmail', contactForm);
      const interestInput = $('#formInterest', contactForm);

      if (!nameInput.value.trim()) {
        showToast('Please provide your full name');
        nameInput.focus();
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        showToast('Please enter a valid email address');
        emailInput.focus();
        return;
      }

      if (!interestInput.value) {
        showToast('Please select an interior product interest');
        interestInput.focus();
        return;
      }

      const submitBtn = $('#submitBtn', contactForm);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Inquiry...';
      }

      setTimeout(() => {
        showToast('✓ Thank you! Your inquiry has been registered.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Inquiry Message ↗';
        }
      }, 700);
    });
  }

})();
