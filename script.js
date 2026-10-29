/**
 * Kenchain Groups × Dakwood Furniture & Interiors Pvt. Ltd.
 * Core Interactive Scripts — Hero Carousel, Collection Carousels & Lightbox
 */

(function () {
  'use strict';

  /* ==========================================================================
     Central Asset Catalog & Mapping
     ========================================================================== */
  const ASSET_CATALOG = {
    hero: [
      {
        id: "hero-living-room",
        title: "Contemporary Living Room & TV Wall",
        caption: "01 · LIVING ROOM & TV WALL",
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=88"
      },
      {
        id: "hero-modular-kitchen",
        title: "Premium Modular Kitchen & Cabinetry",
        caption: "02 · MODULAR KITCHEN & CABINETRY",
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=2200&q=88"
      },
      {
        id: "hero-wood-panels",
        title: "Living Room with Fluted Wood Wall Panels",
        caption: "03 · FLUTED WOOD WALL PANELS",
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=88"
      },
      {
        id: "hero-showcase",
        title: "Built-In Showcase & Display Cabinetry",
        caption: "04 · BUILT-IN SHOWCASE CABINETRY",
        url: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=2200&q=88"
      },
      {
        id: "hero-coordinated-living",
        title: "Coordinated Living Space & Architectural Woodwork",
        caption: "05 · COORDINATED RESIDENTIAL LIVING",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=88"
      }
    ],
    collections: {
      "panels": {
        id: "col-panels",
        title: "Wall & Roof Panels",
        videoUrl: "https://videos.pexels.com/video-files/7034444/7034444-uhd_2160_3840_25fps.mp4",
        posterUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85",
        bgUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85"
      },
      "showcases": {
        id: "col-showcases",
        title: "Showcases & Display Units",
        videoUrl: "https://videos.pexels.com/video-files/7034438/7034438-uhd_2160_3840_25fps.mp4",
        posterUrl: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1000&q=85",
        bgUrl: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=85"
      },
      "tv-units": {
        id: "col-tv-units",
        title: "TV Stands & Entertainment Units",
        videoUrl: "https://videos.pexels.com/video-files/6969873/6969873-uhd_2160_3840_25fps.mp4",
        posterUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85",
        bgUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=85"
      },
      "kitchens": {
        id: "col-kitchens",
        title: "Kitchen Stands & Storage",
        videoUrl: "https://videos.pexels.com/video-files/7578546/7578546-uhd_2160_3840_30fps.mp4",
        posterUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85",
        bgUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85"
      },
      "wardrobes": {
        id: "col-wardrobes",
        title: "Wardrobes & Built-in Storage",
        videoUrl: "https://videos.pexels.com/video-files/6969864/6969864-uhd_2160_3840_25fps.mp4",
        posterUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1000&q=85",
        bgUrl: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1200&q=85"
      }
    },
    videos: [
      { id: "video-1", collection: "panels", title: "Wall Panels & Ceiling Design", src: "https://videos.pexels.com/video-files/7034444/7034444-uhd_2160_3840_25fps.mp4" },
      { id: "video-2", collection: "showcases", title: "Showcases, Shelves & Display Cabinets", src: "https://videos.pexels.com/video-files/7034438/7034438-uhd_2160_3840_25fps.mp4" },
      { id: "video-3", collection: "tv-units", title: "TV Stands & Entertainment Walls", src: "https://videos.pexels.com/video-files/6969873/6969873-uhd_2160_3840_25fps.mp4" },
      { id: "video-4", collection: "kitchens", title: "Modern Modular Kitchen Showcase", src: "https://videos.pexels.com/video-files/7578546/7578546-uhd_2160_3840_30fps.mp4" },
      { id: "video-5", collection: "wardrobes", title: "Custom Wardrobes & Built-In Storage", src: "https://videos.pexels.com/video-files/6969864/6969864-uhd_2160_3840_25fps.mp4" },
      { id: "video-6", collection: "living-room", title: "Contemporary Living Room Walkthrough", src: "https://videos.pexels.com/video-files/34955049/14806900_3840_2160_50fps.mp4" },
      { id: "video-7", collection: "craft", title: "Craftsmanship & Cabinet Assembly", src: "https://videos.pexels.com/video-files/5725965/5725965-uhd_2160_3840_25fps.mp4" },
      { id: "video-8", collection: "full-interior", title: "Complete Home Interior Walkthrough", src: "https://videos.pexels.com/video-files/7034451/7034451-uhd_2160_3840_25fps.mp4" }
    ]
  };

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
  const modalVideo = $('#modalVideo');
  const modalVideoToggle = $('#modalVideoToggle');
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
     3. Hero Background-Image Carousel
     ========================================================================== */
  const heroSlides = $$('.hero-slide');
  const heroDots = $$('.hero-indicator-dot');
  const heroPrev = $('#heroPrev');
  const heroNext = $('#heroNext');
  const heroSlideNum = $('#heroSlideNum');
  const heroSection = $('#home');

  let currentHeroIndex = 0;
  let heroTimer = null;
  const HERO_INTERVAL = 6000; // 6 seconds

  function setHeroSlide(index) {
    if (!heroSlides.length) return;
    currentHeroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      const isActive = i === currentHeroIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    heroDots.forEach((dot, i) => {
      const isActive = i === currentHeroIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (heroSlideNum) {
      heroSlideNum.textContent = String(currentHeroIndex + 1).padStart(2, '0');
    }
  }

  function startHeroTimer() {
    stopHeroTimer();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      heroTimer = setInterval(() => {
        setHeroSlide(currentHeroIndex + 1);
      }, HERO_INTERVAL);
    }
  }

  function stopHeroTimer() {
    if (heroTimer) {
      clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  if (heroSlides.length) {
    heroPrev?.addEventListener('click', () => {
      setHeroSlide(currentHeroIndex - 1);
      startHeroTimer();
    });

    heroNext?.addEventListener('click', () => {
      setHeroSlide(currentHeroIndex + 1);
      startHeroTimer();
    });

    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        setHeroSlide(i);
        startHeroTimer();
      });
    });

    // Pause on hover or focus
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopHeroTimer);
      heroSection.addEventListener('mouseleave', startHeroTimer);
      heroSection.addEventListener('focusin', stopHeroTimer);
      heroSection.addEventListener('focusout', startHeroTimer);

      // Mobile Touch Swipe for Hero
      let touchStartX = 0;
      let touchEndX = 0;

      heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopHeroTimer();
      }, { passive: true });

      heroSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
          if (diff > 0) {
            setHeroSlide(currentHeroIndex + 1); // Swiped left -> next
          } else {
            setHeroSlide(currentHeroIndex - 1); // Swiped right -> prev
          }
        }
        startHeroTimer();
      }, { passive: true });
    }

    // Keyboard navigation when hero or its controls are focused
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && (document.activeElement.closest('.hero-carousel-controls') || document.activeElement === heroSection)) {
        if (e.key === 'ArrowLeft') {
          setHeroSlide(currentHeroIndex - 1);
          startHeroTimer();
        } else if (e.key === 'ArrowRight') {
          setHeroSlide(currentHeroIndex + 1);
          startHeroTimer();
        }
      }
    });

    startHeroTimer();
  }

  /* ==========================================================================
     4. Independent Multi-Image Carousels for Every Collection Card
     ========================================================================== */
  $$('.product-carousel-box').forEach(box => {
    const slides = $$('.carousel-slide', box);
    const prevBtn = $('.col-arrow-prev', box);
    const nextBtn = $('.col-arrow-next', box);
    const dots = $$('.col-dot', box);
    const countLabel = $('.card-slide-count', box);
    const card = box.closest('.collection-card');

    if (!slides.length) return;

    let currentIndex = 0;

    function updateCardSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });

      if (countLabel) {
        countLabel.textContent = `${String(currentIndex + 1).padStart(2, '0')}/${String(slides.length).padStart(2, '0')}`;
      }
    }

    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCardSlide(currentIndex - 1);
    });

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCardSlide(currentIndex + 1);
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        updateCardSlide(idx);
      });
    });

    // Touch swipe support for this specific product card
    let touchStartX = 0;
    box.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    box.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          updateCardSlide(currentIndex + 1);
        } else {
          updateCardSlide(currentIndex - 1);
        }
      }
    }, { passive: true });

    // Store helper to get current active image & caption for modal
    box.getActiveSlideData = function () {
      const activeSlide = slides[currentIndex];
      const img = $('img', activeSlide);
      return {
        src: img ? img.src : '',
        caption: activeSlide.dataset.caption || '',
        sub: activeSlide.dataset.sub || ''
      };
    };
  });

  /* ==========================================================================
     5. Product Collections Category Filters
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
     6. Accessible Lightbox Modal (Photo & Video Supported)
     ========================================================================== */
  function openModal(title, category, description, imageUrl, videoUrl) {
    if (!modal) return;
    lastActiveElement = document.activeElement;

    if (modalTitle) modalTitle.textContent = title;
    if (modalCategory) modalCategory.textContent = category || 'PRODUCT COLLECTION';
    if (modalDescription) modalDescription.textContent = description;
    if (modalPhoto && imageUrl) {
      modalPhoto.style.backgroundImage = `url("${imageUrl}")`;
      modalPhoto.style.opacity = '1';
    }

    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.classList.remove('active');
      if (videoUrl) {
        modalVideo.src = videoUrl;
        if (modalVideoToggle) {
          modalVideoToggle.style.display = 'inline-flex';
          modalVideoToggle.textContent = '▷ Watch Video Footage';
        }
      } else {
        modalVideo.src = '';
        if (modalVideoToggle) {
          modalVideoToggle.style.display = 'none';
        }
      }
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

    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.classList.remove('active');
      modalVideo.src = '';
    }
    if (modalPhoto) {
      modalPhoto.style.opacity = '1';
    }
    if (modalVideoToggle) {
      modalVideoToggle.textContent = '▷ Watch Video Footage';
      modalVideoToggle.style.display = 'none';
    }

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  if (modalVideoToggle) {
    modalVideoToggle.addEventListener('click', () => {
      if (!modalVideo) return;
      const isVideoActive = modalVideo.classList.contains('active');
      if (isVideoActive) {
        modalVideo.pause();
        modalVideo.classList.remove('active');
        if (modalPhoto) modalPhoto.style.opacity = '1';
        modalVideoToggle.textContent = '▷ Watch Video Footage';
      } else {
        modalVideo.classList.add('active');
        if (modalPhoto) modalPhoto.style.opacity = '0';
        modalVideo.play().catch(() => {});
        modalVideoToggle.textContent = '▧ View High-Res Image';
      }
    });
  }

  // Collection modal triggers (using the current active slide of the card and mapped video)
  $$('.open-modal-btn, .lightbox-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.collection-card');
      const box = card ? $('.product-carousel-box', card) : null;
      const catKey = card ? card.dataset.category : '';
      const mappedCollection = ASSET_CATALOG.collections[catKey];
      let imgSrc = '';
      let slideCaption = '';

      if (box && typeof box.getActiveSlideData === 'function') {
        const slideData = box.getActiveSlideData();
        imgSrc = slideData.src;
        if (slideData.caption) {
          slideCaption = ` [${slideData.caption}]`;
        }
      } else if (card) {
        const img = $('img', card);
        imgSrc = img ? img.src : '';
      }

      openModal(
        btn.dataset.title + slideCaption,
        btn.dataset.category,
        btn.dataset.description,
        imgSrc,
        mappedCollection ? mappedCollection.videoUrl : ''
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
     7. Toast Notifications & Clipboard Copy
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
     8. Video Player Robustness & Fallback Handling
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
     9. Contact Form Validation & Submission
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
