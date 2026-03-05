/* =============================================
   W2K AUTO-SCROLL PREMIUM MODULE
   Défilement automatique intelligent
   W2K-Digital | 2025
   ============================================= */

var W2KAutoScroll = (function () {

  /* Configuration par défaut */
  var config = {
    speed: 'slow',
    pauseDuration: 12,
    inactivityDelay: 45,
    showIndicator: true
  };

  var state = {
    isScrolling: false,
    isPaused: false,
    currentSection: 0,
    sections: [],
    timer: null,
    inactivityTimer: null,
    indicator: null,
    startDelay: 3000
  };

  /* Vitesses de défilement en ms */
  var speeds = {
    slow: 1500,
    medium: 1000,
    fast: 600
  };

  /* Initialisation */
  function init(options) {
    /* Fusionner options */
    if (options) {
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          config[key] = options[key];
        }
      }
    }

    /* Récupérer sections */
    state.sections = document.querySelectorAll('[data-autoscroll]');
    if (state.sections.length === 0) return;

    /* Créer indicateur visuel */
    if (config.showIndicator) {
      creerIndicateur();
    }

    /* Écouter interactions utilisateur */
    ecouterInteractions();

    /* Démarrer après délai initial */
    setTimeout(function () {
      demarrerAutoScroll();
    }, state.startDelay);
  }

  /* Créer indicateur visuel */
  function creerIndicateur() {
    state.indicator = document.createElement('div');
    state.indicator.className = 'w2k-scroll-indicator';
    state.indicator.title = 'Auto-scroll actif';
    document.body.appendChild(state.indicator);
  }

  /* Démarrer auto-scroll */
  function demarrerAutoScroll() {
    if (state.isPaused) return;
    state.isScrolling = true;

    if (state.indicator) {
      state.indicator.classList.remove('paused');
    }

    /* Planifier prochain scroll */
    planifierProchainScroll();
  }

  /* Planifier scroll vers section suivante */
  function planifierProchainScroll() {
    clearTimeout(state.timer);

    state.timer = setTimeout(function () {
      if (state.isPaused) return;

      state.currentSection++;

      /* Vérifier si fin de page */
      if (state.currentSection >= state.sections.length) {
        /* Redirection vers page suivante */
        var nextPage = document.body.dataset.nextPage;
        if (nextPage) {
          setTimeout(function () {
            window.location.href = nextPage;
          }, config.pauseDuration * 1000);
          return;
        } else {
          /* Boucle sur la même page */
          state.currentSection = 0;
        }
      }

      /* Scroller vers section */
      scrollerVersSection(state.currentSection);

      /* Planifier suivant */
      planifierProchainScroll();

    }, config.pauseDuration * 1000);
  }

  /* Scroller vers une section */
  function scrollerVersSection(index) {
    if (index < 0 || index >= state.sections.length) return;

    var section = state.sections[index];
    var headerHeight = 80;
    var top = section.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }

  /* Mettre en pause */
  function pause() {
    state.isPaused = true;
    state.isScrolling = false;
    clearTimeout(state.timer);
    clearTimeout(state.inactivityTimer);

    if (state.indicator) {
      state.indicator.classList.add('paused');
    }

    /* Reprendre après inactivité */
    state.inactivityTimer = setTimeout(function () {
      reprendre();
    }, config.inactivityDelay * 1000);
  }

  /* Reprendre */
  function reprendre() {
    state.isPaused = false;

    /* Trouver section actuelle visible */
    detecterSectionVisible();

    /* Redémarrer */
    demarrerAutoScroll();
  }

  /* Détecter section visible */
  function detecterSectionVisible() {
    var scrollPos = window.scrollY + window.innerHeight / 2;

    for (var i = 0; i < state.sections.length; i++) {
      var section = state.sections[i];
      var rect = section.getBoundingClientRect();
      var sectionTop = rect.top + window.scrollY;
      var sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        state.currentSection = i;
        break;
      }
    }
  }

  /* Écouter interactions utilisateur */
  function ecouterInteractions() {
    var events = ['click', 'touchstart', 'wheel', 'keydown'];

    events.forEach(function (eventType) {
      document.addEventListener(eventType, function () {
        if (state.isScrolling || !state.isPaused) {
          pause();
        } else {
          /* Réinitialiser timer inactivité */
          clearTimeout(state.inactivityTimer);
          state.inactivityTimer = setTimeout(function () {
            reprendre();
          }, config.inactivityDelay * 1000);
        }
      }, { passive: true });
    });

    /* Scroll manuel */
    var lastScrollTop = 0;
    var scrollTimeout;
    window.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        var currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollTop) > 50) {
          if (!state.isPaused) {
            pause();
          }
        }
        lastScrollTop = currentScroll;
      }, 100);
    }, { passive: true });
  }

  /* API publique */
  return {
    init: init,
    pause: pause,
    reprendre: reprendre
  };

})();
