/* =============================================
   YIRI SERVICES - Script Principal
   Menu, navigation, interactions
   W2K-Digital | 2025
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Menu hamburger mobile --- */
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navOverlay = document.querySelector('.nav-overlay');
  const body = document.body;

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = navMenu.classList.contains('active');
      if (isOpen) {
        fermerMenu();
      } else {
        ouvrirMenu();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', fermerMenu);
    }
  }

  function ouvrirMenu() {
    navMenu.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    body.style.overflow = 'hidden';
    hamburger.innerHTML = '<i class="fas fa-times"></i>';
  }

  function fermerMenu() {
    navMenu.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    body.style.overflow = '';
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  }

  /* --- Dropdown menu (mobile) --- */
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      // Sur mobile uniquement
      if (window.innerWidth < 1025) {
        e.preventDefault();
        const parent = this.closest('.nav-dropdown');
        parent.classList.toggle('open');
      }
    });
  });

  /* --- Header shrink au scroll --- */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* --- Scroll to top --- */
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Smooth scroll pour liens ancres --- */
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        // Fermer menu mobile si ouvert
        if (navMenu && navMenu.classList.contains('active')) {
          fermerMenu();
        }
      }
    });
  });

  /* --- Page active dans la navigation --- */
  const currentPage = window.location.pathname.split('/').pop() || 'accueil.html';
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  /* --- FAQ Accordéon --- */
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      const parent = this.closest('.faq-item');
      const isActive = parent.classList.contains('active');

      // Fermer tous les autres
      document.querySelectorAll('.faq-item.active').forEach(function (item) {
        item.classList.remove('active');
      });

      // Ouvrir celui cliqué (si pas déjà ouvert)
      if (!isActive) {
        parent.classList.add('active');
      }
    });
  });

  /* --- Validation formulaire contact basique --- */
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;

      // Réinitialiser erreurs
      this.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('error');
      });

      // Valider champs requis
      const requiredFields = this.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
          group.classList.add('error');
          isValid = false;
        }
      });

      // Valider email
      const emailField = this.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          emailField.closest('.form-group').classList.add('error');
          isValid = false;
        }
      }

      // Valider téléphone
      const telField = this.querySelector('input[type="tel"]');
      if (telField && telField.value) {
        const telRegex = /^[\+]?[0-9\s\-]{8,}$/;
        if (!telRegex.test(telField.value)) {
          telField.closest('.form-group').classList.add('error');
          isValid = false;
        }
      }

      if (isValid) {
        // Succès - afficher message
        var successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.style.cssText = 'background: #10b981; color: #fff; padding: 16px; border-radius: 8px; text-align: center; margin-top: 16px; font-weight: 600;';
        successMsg.textContent = 'Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.';
        this.appendChild(successMsg);
        this.reset();

        // Retirer message après 5s
        setTimeout(function () {
          successMsg.remove();
        }, 5000);
      }
    });
  }

  /* --- Lazy loading support (natif) --- */
  if ('loading' in HTMLImageElement.prototype) {
    // Le navigateur supporte lazy loading natif
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(function (img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  }

  /* --- Fermer menu au redimensionnement --- */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1025 && navMenu && navMenu.classList.contains('active')) {
      fermerMenu();
    }
  });

});
