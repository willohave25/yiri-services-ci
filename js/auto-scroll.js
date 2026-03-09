/* =============================================
   W2K AUTO-SCROLL PREMIUM MODULE
   Défilement automatique intelligent
   W2K-Digital | 2025
   ============================================= */

var W2KAutoScroll = (function () {

  var config = {
    speed: 'slow',
    pauseDuration: 20,
    inactivityDelay: 45,
    showIndicator: true
  };

  var state = {
    isAutoScrolling: false,
    isPaused: false,
    currentSection: 0,
    sections: [],
    timer: null,
    inactivityTimer: null,
    indicator: null,
    startDelay: 5000,
    ignoreScroll: false
  };

  /* Durée animation scroll en ms */
  var speeds = {
    slow: 2500,
    medium: 1800,
    fast: 1000
  };

  /* Initialisation */
  function init(options) {
    if (options) {
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          config[key] = options[key];
        }
      }
    }

    state.sections = document.querySelectorAll('[data-autoscroll]');
    if (state.sections.length === 0) return;

    if (config.showIndicator) {
      creerIndicateur();
    }

    ecouterInteractions();

    /* Démarrage après délai initial */
    setTimeout(function () {
      state.isPaused = false;
      planifierProchainScroll();
      majIndicateur();
    }, state.startDelay);
  }

  /* Indicateur visuel */
  function creerIndicateur() {
    state.indicator = document.createElement('div');
    state.indicator.className = 'w2k-scroll-indicator';
    state.indicator.title = 'Auto-scroll actif';
    document.body.appendChild(state.indicator);
  }

  function majIndicateur() {
    if (!state.indicator) return;
    if (state.isPaused) {
      state.indicator.classList.add('paused');
    } else {
      state.indicator.classList.remove('paused');
    }
  }

  /* Planifier prochain scroll */
  function planifierProchainScroll() {
    clearTimeout(state.timer);

    state.timer = setTimeout(function () {
      if (state.isPaused) return;

      state.currentSection++;

      /* Fin de page - page suivante ou boucle */
      if (state.currentSection >= state.sections.length) {
        var nextPage = document.body.dataset.nextPage;
        if (nextPage) {
          window.location.href = nextPage;
          return;
        } else {
          state.currentSection = 0;
        }
      }

      scrollerVersSection(state.currentSection, function () {
        planifierProchainScroll();
      });

    }, config.pauseDuration * 1000);
  }

  /* Animation scroll lente et progressive */
  function scrollerVersSection(index, callback) {
    if (index < 0 || index >= state.sections.length) return;

    var section = state.sections[index];
    var headerHeight = 80;
    var targetTop = section.getBoundingClientRect().top + window.scrollY - headerHeight;
    var startTop = window.scrollY;
    var distance = targetTop - startTop;

    if (Math.abs(distance) < 5) {
      if (callback) callback();
      return;
    }

    var duration = speeds[config.speed] || 2500;
    var startTime = null;

    /* Bloquer detection scroll pendant animation */
    state.ignoreScroll = true;
    state.isAutoScrolling = true;

    function animer(currentTime) {
      if (state.isPaused) {
        state.ignoreScroll = false;
        state.isAutoScrolling = false;
        return;
      }

      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);

      /* Easing doux ease-in-out */
      var ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      window.scrollTo(0, startTop + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animer);
      } else {
        /* Fin animation - debloquer apres court delai */
        setTimeout(function () {
          state.ignoreScroll = false;
          state.isAutoScrolling = false;
        }, 200);
        if (callback) callback();
      }
    }

    requestAnimationFrame(animer);
  }

  /* Mettre en pause */
  function pause() {
    if (state.isPaused) return;
    state.isPaused = true;
    state.isAutoScrolling = false;
    clearTimeout(state.timer);
    clearTimeout(state.inactivityTimer);
    majIndicateur();

    state.inactivityTimer = setTimeout(function () {
      reprendre();
    }, config.inactivityDelay * 1000);
  }

  /* Reprendre */
  function reprendre() {
    state.isPaused = false;
    detecterSectionVisible();
    majIndicateur();
    planifierProchainScroll();
  }

  /* Detecter section visible */
  function detecterSectionVisible() {
    var scrollPos = window.scrollY + window.innerHeight / 2;

    for (var i = 0; i < state.sections.length; i++) {
      var section = state.sections[i];
      var sectionTop = section.offsetTop;
      var sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        state.currentSection = i;
        break;
      }
    }
  }

  /* Ecouter interactions utilisateur */
  function ecouterInteractions() {
    ['touchstart', 'wheel', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, function () {
        if (!state.isPaused) {
          pause();
        } else {
          clearTimeout(state.inactivityTimer);
          state.inactivityTimer = setTimeout(function () {
            reprendre();
          }, config.inactivityDelay * 1000);
        }
      }, { passive: true });
    });

    /* Scroll manuel - ignorer pendant auto-scroll */
    var scrollTimeout;
    window.addEventListener('scroll', function () {
      if (state.ignoreScroll || state.isAutoScrolling) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        if (!state.isPaused && !state.isAutoScrolling) {
          pause();
        }
      }, 150);
    }, { passive: true });
  }

  return {
    init: init,
    pause: pause,
    reprendre: reprendre
  };

})();
