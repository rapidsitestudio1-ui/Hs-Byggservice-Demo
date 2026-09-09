/* =============================================================
   HS Byggservice — interaktion
   Ingen ramverkskod, inga externa beroenden.
   ============================================================= */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===================== Årtal i sidfoten ===================== */
  const arEl = $('#ar');
  if (arEl) arEl.textContent = String(new Date().getFullYear());

  /* ===================== Mobilmeny ===================== */
  (() => {
    const toggle = $('.nav-toggle');
    const nav = $('#huvudmeny');
    const scrim = $('.nav-scrim');
    if (!toggle || !nav || !scrim) return;

    const mq = window.matchMedia('(max-width: 900px)');
    let open = false;

    const setOpen = (next) => {
      open = next;
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      scrim.hidden = !open;
      // Låt scrim få en frame innan opaciteten animeras.
      if (open) requestAnimationFrame(() => scrim.classList.add('is-open'));
      else scrim.classList.remove('is-open');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        const first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener('click', () => setOpen(!open));
    scrim.addEventListener('click', () => { setOpen(false); toggle.focus(); });

    nav.addEventListener('click', (e) => {
      if (e.target.closest('a') && mq.matches) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); }
      if (e.key !== 'Tab' || !open) return;
      const items = $$('a, button', nav).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Återställ menyn när vi går tillbaka till desktopbredd.
    mq.addEventListener('change', (e) => { if (!e.matches && open) setOpen(false); });
  })();

  /* ===================== Sidhuvudets skuggläge ===================== */
  (() => {
    const header = $('.site-header');
    if (!header) return;
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(sentinel);
  })();

  /* ===================== Aktiv länk i menyn ===================== */
  (() => {
    const links = $$('.nav__link[href^="#"]');
    if (!links.length) return;
    const map = new Map();
    links.forEach((link) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) map.set(target, link);
    });
    if (!map.size) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-current'));
        map.get(entry.target)?.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    map.forEach((_, target) => observer.observe(target));
  })();

  /* ===================== Före / efter ===================== */
  (() => {
    const wrap = $('#compare');
    const range = $('#compare-range');
    if (!wrap || !range) return;

    const apply = () => wrap.style.setProperty('--split', `${range.value}%`);
    range.addEventListener('input', apply);

    // Klick och drag var som helst i bilden flyttar reglaget.
    const fromPointer = (clientX) => {
      const r = wrap.getBoundingClientRect();
      const pct = ((clientX - r.left) / r.width) * 100;
      range.value = String(Math.min(100, Math.max(0, pct)));
      apply();
    };
    let dragging = false;
    wrap.addEventListener('pointerdown', (e) => { dragging = true; fromPointer(e.clientX); });
    window.addEventListener('pointermove', (e) => { if (dragging) fromPointer(e.clientX); });
    window.addEventListener('pointerup', () => { dragging = false; });
    // Avbruten gest (t.ex. systemgest på mobil) ska också släppa reglaget.
    window.addEventListener('pointercancel', () => { dragging = false; });

    apply();
  })();

  /* ===================== Projektkarusell ===================== */
  (() => {
    const track = $('#projekt-track');
    if (!track) return;
    const buttons = $$('[data-carousel]');
    const step = () => {
      const first = track.querySelector('.project');
      return first ? first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0') : track.clientWidth;
    };

    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 1;
      buttons.forEach((b) => {
        const isPrev = b.dataset.carousel === 'prev';
        b.disabled = isPrev ? track.scrollLeft <= 1 : track.scrollLeft >= max;
      });
    };

    buttons.forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: b.dataset.carousel === 'prev' ? -step() : step(), behavior: reduceMotion() ? 'auto' : 'smooth' });
    }));

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ===================== FAQ — flikar ===================== */
  (() => {
    const tabs = $$('.faq__tab');
    if (!tabs.length) return;

    const select = (tab, focus = true) => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab) => tab.addEventListener('click', () => select(tab, false)));

    $('.faq__tabs')?.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        select(tabs[(i + keys[e.key] + tabs.length) % tabs.length]);
      } else if (e.key === 'Home') { e.preventDefault(); select(tabs[0]); }
      else if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1]); }
    });
  })();

  /* ===================== FAQ — dragspel ===================== */
  (() => {
    const buttons = $$('.acc__btn');
    if (!buttons.length) return;

    // Pågående animation per panel. Utan detta hinner en stängning som
    // avbryts av en ny öppning ändå köra sin onfinish och dölja panelen,
    // så att aria-expanded="true" pekar på något osynligt.
    const pagaende = new WeakMap();
    const avbryt = (panel) => {
      const anim = pagaende.get(panel);
      if (anim) { anim.onfinish = null; anim.cancel(); pagaende.delete(panel); }
    };

    const close = (btn, animate = true) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel || btn.getAttribute('aria-expanded') !== 'true') return;
      btn.setAttribute('aria-expanded', 'false');
      avbryt(panel);
      if (!animate || reduceMotion()) { panel.hidden = true; panel.style.overflow = ''; return; }
      const anim = panel.animate(
        [{ height: panel.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
        { duration: 220, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
      panel.style.overflow = 'hidden';
      pagaende.set(panel, anim);
      anim.onfinish = () => { pagaende.delete(panel); panel.hidden = true; panel.style.overflow = ''; };
    };

    const open = (btn) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.setAttribute('aria-expanded', 'true');
      avbryt(panel);
      panel.hidden = false;
      if (reduceMotion()) { panel.style.overflow = ''; return; }
      panel.style.overflow = 'hidden';
      const anim = panel.animate(
        [{ height: '0px', opacity: 0 }, { height: panel.scrollHeight + 'px', opacity: 1 }],
        { duration: 260, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
      pagaende.set(panel, anim);
      anim.onfinish = () => { pagaende.delete(panel); panel.style.overflow = ''; };
    };

    buttons.forEach((btn) => btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Håll ett svar öppet i taget inom samma flik.
      const group = btn.closest('.faq__panel');
      if (group) $$('.acc__btn', group).forEach((other) => { if (other !== btn) close(other); });
      isOpen ? close(btn) : open(btn);
    }));
  })();

  /* ===================== Offertformulär ===================== */
  (() => {
    const form = $('#offertformular');
    if (!form) return;

    const status = $('.form__status', form);
    const submit = $('button[type=submit]', form);
    let sending = false;

    const REGLER = {
      namn: (v) => {
        if (!v.trim()) return 'Fyll i ditt namn.';
        if (v.trim().length < 2) return 'Namnet verkar för kort.';
        return '';
      },
      epost: (v) => {
        if (!v.trim()) return 'Fyll i din e-postadress.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Kontrollera e-postadressen, den ser inte komplett ut.';
        return '';
      },
      telefon: (v) => {
        if (!v.trim()) return '';                       // frivilligt
        if (!/^[+(\d][\d\s()-]{5,}$/.test(v.trim())) return 'Kontrollera telefonnumret.';
        return '';
      },
      meddelande: (v) => {
        if (!v.trim()) return 'Skriv några rader om ditt projekt.';
        if (v.trim().length < 10) return 'Berätta gärna lite mer, minst tio tecken.';
        return '';
      }
    };

    const faltet = (namn) => form.elements[namn];
    const felrutan = (el) => document.getElementById(el.getAttribute('aria-describedby'));

    const visaFel = (el, text) => {
      const ruta = felrutan(el);
      if (text) {
        el.setAttribute('aria-invalid', 'true');
        if (ruta) { ruta.textContent = text; ruta.hidden = false; }
      } else {
        el.removeAttribute('aria-invalid');
        if (ruta) { ruta.textContent = ''; ruta.hidden = true; }
      }
      return !text;
    };

    const kontrollera = (namn) => {
      const el = faltet(namn);
      if (!el) return true;
      return visaFel(el, REGLER[namn](el.value));
    };

    // Validera vid blur, och rensa felet så fort användaren rättar sig.
    Object.keys(REGLER).forEach((namn) => {
      const el = faltet(namn);
      if (!el) return;
      el.addEventListener('blur', () => kontrollera(namn));
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') kontrollera(namn);
      });
    });

    const sattStatus = (text, typ) => {
      status.textContent = text;
      status.className = 'form__status' + (typ ? ' form__status--' + typ : '');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;                              // skyddar mot dubbla utskick

      const trasiga = Object.keys(REGLER).filter((n) => !kontrollera(n));
      if (trasiga.length) {
        sattStatus('Kontrollera de markerade fälten.', 'fel');
        faltet(trasiga[0]).focus();
        return;
      }

      sending = true;
      submit.disabled = true;
      const etikett = submit.textContent;
      submit.textContent = 'Skickar …';
      sattStatus('');

      try {
        // Utan tidsgräns kan knappen fastna i "Skickar …" om nätet tystnar.
        const avbrytare = new AbortController();
        const klocka = setTimeout(() => avbrytare.abort(), 15000);
        const svar = await fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString(),
          signal: avbrytare.signal
        }).finally(() => clearTimeout(klocka));
        if (!svar.ok) throw new Error('HTTP ' + svar.status);

        // Ersätt formuläret med en tydlig kvittens.
        const klar = document.createElement('div');
        klar.className = 'form__done';
        klar.innerHTML =
          '<h3>Tack för din förfrågan!</h3>' +
          '<p>Vi har tagit emot ditt meddelande och hör av oss så snart vi kan. ' +
          'Är det bråttom får du gärna ringa oss direkt.</p>';
        form.replaceWith(klar);
        klar.setAttribute('tabindex', '-1');
        klar.focus({ preventScroll: true });
      } catch {
        sending = false;
        submit.disabled = false;
        submit.textContent = etikett;
        sattStatus('Meddelandet kunde inte skickas just nu. Ring 072 861 61 87 eller mejla HSbyggservice@hotmail.com så hjälper vi dig.', 'fel');
      }
    });
  })();

})();
