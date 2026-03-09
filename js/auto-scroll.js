/* =============================================
   W2K AUTO-SCROLL - DÉFILEMENT CONTINU LENT
   Scroll du haut vers le bas puis next page
   W2K-Digital | 2025
   ============================================= */

var W2KAutoScroll = (function () {

  var config = {
    pixelsParSeconde: 30,
    inactivityDelay: 30,
    showIndicator: true
  };

  var state = {
    actif: false,
    paused: false,
    animationId: null,
    inactivityTimer: null,
    indicator: null,
    lastTime: null,
    ignoreEvents: false
  };

  function init(options) {
    if (options) {
      if (options.speed === 'slow') config.pixelsParSeconde = 25;
      if (options.speed === 'medium') config.pixelsParSeconde = 45;
      if (options.speed === 'fast') config.pixelsParSeconde = 70;
      if (options.inactivityDelay) config.inactivityDelay = options.inactivityDelay;
      if (options.showIndicator !== undefined) config.showIndicator = options.showIndicator;
    }

    if (config.showIndicator) creerIndicateur();
    ecouterInteractions();

    /* Démarrer après 3 secondes */
    setTimeout(function () {
      demarrer();
    }, 3000);
  }

  function creerIndicateur() {
    state.indicator = document.createElement('div');
    state.indicator.className = 'w2k-scroll-indicator';
    document.body.appendChild(state.indicator);
  }

  /* Démarrer le défilement continu */
  function demarrer() {
    state.actif = true;
    state.paused = false;
    state.lastTime = null;
    if (state.indicator) state.indicator.classList.remove('paused');
    defiler();
  }

  /* Boucle de défilement pixel par pixel */
  function defiler() {
    if (!state.actif || state.paused) return;

    state.animationId = requestAnimationFrame(function (timestamp) {
      if (!state.lastTime) state.lastTime = timestamp;

      var delta = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;

      var pixels = config.pixelsParSeconde * delta;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var currentScroll = window.scrollY;

      /* Si on est en bas de page → next page */
      if (currentScroll >= maxScroll - 5) {
        var nextPage = document.body.dataset.nextPage;
        if (nextPage) {
          window.location.href = nextPage;
          return;
        } else {
          /* Boucle : retour en haut */
          state.ignoreEvents = true;
          window.scrollTo(0, 0);
          setTimeout(function () {
            state.ignoreEvents = false;
          }, 300);
        }
      }

      /* Scroller de quelques pixels */
      state.ignoreEvents = true;
      window.scrollBy(0, pixels);

      /* Debloquer après micro-délai */
      setTimeout(function () {
        state.ignoreEvents = false;
      }, 50);

      /* Continuer */
      defiler();
    });
  }

  /* Pause */
  function pause() {
    if (state.paused) return;
    state.paused = true;
    state.lastTime = null;
    if (state.animationId) cancelAnimationFrame(state.animationId);
    if (state.indicator) state.indicator.classList.add('paused');
    clearTimeout(state.inactivityTimer);

    /* Reprendre après inactivité */
    state.inactivityTimer = setTimeout(function () {
      reprendre();
    }, config.inactivityDelay * 1000);
  }

  /* Reprendre */
  function reprendre() {
    state.paused = false;
    state.lastTime = null;
    if (state.indicator) state.indicator.classList.remove('paused');
    defiler();
  }

  /* Interactions utilisateur */
  function ecouterInteractions() {
    ['touchstart', 'wheel', 'keydown'].forEach(function (evt) {
      document.addEventListener(evt, function () {
        if (state.ignoreEvents) return;
        if (!state.paused && state.actif) {
          pause();
        } else if (state.paused) {
          clearTimeout(state.inactivityTimer);
          state.inactivityTimer = setTimeout(function () {
            reprendre();
          }, config.inactivityDelay * 1000);
        }
      }, { passive: true });
    });

    /* Clic → pause sauf liens */
    document.addEventListener('click', function (e) {
      if (state.ignoreEvents) return;
      if (e.target.closest('a') || e.target.closest('button')) return;
      if (!state.paused && state.actif) {
        pause();
      }
    }, { passive: true });
  }

  return {
    init: init,
    pause: pause,
    reprendre: reprendre
  };

})();
