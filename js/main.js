// Menu, register oblastí práva, hlavička pri scrolle, jemné objavenie sekcií, formulár (náhľad nič neodosiela).
(function () {
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var otvorene = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!otvorene));
      menu.classList.toggle('je-otvorene', !otvorene);
    });
  }

  var hlavicka = document.querySelector('.hlavicka');
  var naScroll = function () { hlavicka.classList.toggle('je-posunuta', window.scrollY > 40); };
  window.addEventListener('scroll', naScroll, { passive: true });
  naScroll();

  // Register: na počítači je vždy otvorené jedno heslo (panel vpravo), na mobile akordeón.
  var mobil = window.matchMedia('(max-width: 48rem)');
  document.querySelectorAll('[data-register]').forEach(function (reg) {
    var hesla = Array.prototype.slice.call(reg.querySelectorAll('.heslo'));
    var bok = reg.querySelector('.register-bok');
    function nastav(h, otvor) {
      h.classList.toggle('je-aktivne', otvor);
      h.querySelector('.heslo-tl').setAttribute('aria-expanded', String(otvor));
      h.querySelector('.heslo-panel').hidden = !otvor;
      if (otvor && bok) {
        bok.innerHTML = h.querySelector('.heslo-panel').innerHTML;
        bok.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
        bok.classList.remove('je-nove'); void bok.offsetWidth; bok.classList.add('je-nove');
      }
    }
    hesla.forEach(function (h) {
      var tl = h.querySelector('.heslo-tl');
      tl.addEventListener('click', function () {
        var otvorene = h.classList.contains('je-aktivne');
        if (mobil.matches) { nastav(h, !otvorene); return; }
        hesla.forEach(function (x) { nastav(x, x === h); });
      });
      if (window.matchMedia('(hover: hover)').matches) {
        tl.addEventListener('mouseenter', function () {
          if (mobil.matches || h.classList.contains('je-aktivne')) return;
          hesla.forEach(function (x) { nastav(x, x === h); });
        });
      }
    });
    var viac = reg.querySelector('.register-viac');
    if (viac) viac.addEventListener('click', function () { reg.classList.add('je-rozbaleny'); viac.setAttribute('aria-expanded', 'true'); });
    nastav(hesla[0], true);
    mobil.addEventListener('change', function () {
      if (!mobil.matches && !hesla.some(function (x) { return x.classList.contains('je-aktivne'); })) nastav(hesla[0], true);
    });
  });

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var prvky = document.querySelectorAll('.sekcia .wrap > *, .profil');
    var io = new IntersectionObserver(function (zaznamy) {
      zaznamy.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('je-videt'); io.unobserve(z.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    prvky.forEach(function (p) {
      if (p.getBoundingClientRect().top > window.innerHeight) { p.classList.add('objav'); io.observe(p); }
    });
  }

  document.querySelectorAll('form.formular').forEach(function (f) {
    var stav = f.querySelector('.formular-stav');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.querySelector('.past input').value) return;
      var endpoint = f.getAttribute('data-endpoint');
      if (f.getAttribute('data-demo') === '1' || !endpoint) {
        stav.textContent = 'Toto je náhľad webu, formulár zatiaľ nič neodosiela. Po spustení príde správa na info@akslamka.eu.';
        return;
      }
      stav.textContent = 'Odosielam…';
      fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); stav.textContent = 'Ďakujeme, správa bola odoslaná.'; })
        .catch(function () { stav.textContent = 'Odoslanie sa nepodarilo. Napíšte nám prosím na info@akslamka.eu.'; });
    });
  });
})();
