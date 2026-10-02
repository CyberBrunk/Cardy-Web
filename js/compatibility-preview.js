/*
 * Compatibility preview for /cardology-compatibility.
 *
 * Mirrors the iOS app exactly:
 *  - Birth cards:   Supabase edge function `get-birth-cards` (card 1 by date, card 2 by
 *                   zodiac offset on the Earth chart, card 3 = card 1 + card 2).
 *  - Compat cards:  CardCalculator.calculateCompatibilityTable (3 x 3 = 9 cards).
 *  - Planets:       LifePathCalculator.calculatePlanetaryCompatibility, counted the way
 *                   PlanetaryCompatibilitySummarySection does (unique planets per direction).
 *  - Karma cards:   the `karma_cards` table, embedded below.
 * The only difference: the app gets the zodiac sign from an ephemeris using the birth year;
 * here it comes from standard date ranges, so a cusp birthday can land one sign over.
 *
 * Visitors see each person's first card, the first compatibility card, and one planet.
 */
(function () {
  'use strict';

  // ---------- Card math (same as the app and the get-birth-cards function) ----------
  const SUITS = ['Hearts', 'Clubs', 'Diamonds', 'Spades'];
  const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
  const JOKER = 'Joker';

  function cardToValue(id) {
    const [suit, rank] = id.split('-');
    return SUITS.indexOf(suit) * 13 + RANKS.indexOf(rank) + 1;
  }
  function valueToCard(v) {
    const n = ((v - 1) % 52) + 1;
    return SUITS[Math.floor((n - 1) / 13)] + '-' + RANKS[(n - 1) % 13];
  }
  function addCards(a, b) {
    let sum = cardToValue(a) + cardToValue(b);
    if (sum > 52) sum -= 52;
    return valueToCard(sum);
  }

  const EARTH = ['Clubs-10','Diamonds-8','Spades-King','Hearts-3','Clubs-Ace','Clubs-Queen','Spades-10','Clubs-5','Diamonds-3','Spades-Ace','Hearts-7','Diamonds-7','Spades-5','Hearts-Jack','Clubs-9','Spades-9','Hearts-2','Hearts-King','Diamonds-King','Hearts-6','Clubs-4','Diamonds-2','Spades-Jack','Clubs-8','Diamonds-6','Spades-4','Hearts-10','Diamonds-10','Spades-8','Hearts-Ace','Diamonds-Ace','Diamonds-Queen','Hearts-5','Clubs-3','Spades-3','Hearts-9','Clubs-7','Diamonds-5','Spades-Queen','Clubs-Jack','Diamonds-9','Spades-7','Clubs-2','Clubs-King','Diamonds-Jack','Hearts-4','Diamonds-4','Spades-2','Hearts-8','Clubs-6','Spades-6','Hearts-Queen'];
  const HEAVEN = ['Spades-Jack','Spades-Queen','Spades-King'].concat(
    RANKS.map((r) => 'Hearts-' + r), RANKS.map((r) => 'Clubs-' + r),
    RANKS.map((r) => 'Diamonds-' + r), RANKS.slice(0, 10).map((r) => 'Spades-' + r));

  // karma_cards: card_id -> [blessing_card_id, duty_card_id]
  const KARMA = {
    'Clubs-10':['Spades-4','Spades-Jack'],'Clubs-2':['Hearts-King','Spades-Ace'],'Clubs-3':['Diamonds-King','Diamonds-5'],'Clubs-4':['Hearts-6','Clubs-5'],'Clubs-5':['Clubs-4','Hearts-5'],'Clubs-6':['Diamonds-2','Spades-8'],'Clubs-7':['Spades-Jack','Diamonds-8'],'Clubs-8':['Clubs-8','Clubs-8'],'Clubs-9':['Diamonds-6','Hearts-Queen'],'Clubs-Ace':['Hearts-2','Hearts-2'],'Clubs-Jack':['Hearts-10','Diamonds-Jack'],'Clubs-King':['Spades-8','Spades-2'],'Clubs-Queen':['Diamonds-10','Hearts-3'],
    'Diamonds-10':['Spades-Queen','Clubs-Queen'],'Diamonds-2':['Diamonds-Ace','Clubs-6'],'Diamonds-3':['Diamonds-Queen','Hearts-6'],'Diamonds-4':['Hearts-5','Spades-5'],'Diamonds-5':['Clubs-3','Diamonds-9'],'Diamonds-6':['Spades-3','Clubs-9'],'Diamonds-7':['Hearts-9','Hearts-9'],'Diamonds-8':['Clubs-7','Spades-Queen'],'Diamonds-9':['Diamonds-5','Diamonds-Queen'],'Diamonds-Ace':['Hearts-Ace','Diamonds-2'],'Diamonds-Jack':['Clubs-Jack','Spades-3'],'Diamonds-King':['Spades-7','Clubs-3'],'Diamonds-Queen':['Diamonds-9','Diamonds-3'],
    'Hearts-10':['Spades-5','Clubs-Jack'],'Hearts-2':['Clubs-Ace','Clubs-Ace'],'Hearts-3':['Clubs-Queen','Hearts-Ace'],'Hearts-4':['Spades-10','Spades-4'],'Hearts-5':['Clubs-5','Diamonds-4'],'Hearts-6':['Diamonds-3','Clubs-4'],'Hearts-7':['Spades-Ace','Hearts-8'],'Hearts-8':['Hearts-7','Spades-7'],'Hearts-9':['Diamonds-7','Diamonds-7'],'Hearts-Ace':['Hearts-3','Diamonds-Ace'],'Hearts-Jack':['Hearts-Jack','Hearts-Jack'],'Hearts-King':['Spades-9','Clubs-2'],'Hearts-Queen':['Clubs-9','Spades-10'],
    'Spades-10':['Hearts-Queen','Hearts-4'],'Spades-2':['Clubs-King','Spades-6'],'Spades-3':['Diamonds-Jack','Diamonds-6'],'Spades-4':['Hearts-4','Clubs-10'],'Spades-5':['Diamonds-4','Hearts-10'],'Spades-6':['Spades-2','Spades-9'],'Spades-7':['Hearts-8','Diamonds-King'],'Spades-8':['Clubs-6','Clubs-King'],'Spades-9':['Spades-6','Hearts-King'],'Spades-Ace':['Clubs-2','Hearts-7'],'Spades-Jack':['Clubs-10','Clubs-7'],'Spades-King':['Spades-King','Spades-King'],'Spades-Queen':['Diamonds-8','Diamonds-10']
  };

  // Zodiac -> spaces along the Earth chart for card 2 (get-birth-cards zodiacMap)
  const ZODIAC_SPACES = { aries: 3, taurus: 2, gemini: 1, cancer: -1, leo: 6, virgo: 1, libra: 2, scorpio: 8, sagittarius: 4, capricorn: 5, aquarius: 6, pisces: 7 };
  // [sign, month, first day] in calendar order
  const ZODIAC_STARTS = [['capricorn',1,1],['aquarius',1,20],['pisces',2,19],['aries',3,21],['taurus',4,20],['gemini',5,21],['cancer',6,21],['leo',7,23],['virgo',8,23],['libra',9,23],['scorpio',10,23],['sagittarius',11,22],['capricorn',12,22]];
  function zodiacFor(m, d) {
    let sign = 'capricorn';
    for (const [s, sm, sd] of ZODIAC_STARTS) if (m > sm || (m === sm && d >= sd)) sign = s;
    return sign;
  }

  function birthCards(m, d) {
    if (m === 12 && d === 31) return [JOKER, JOKER, JOKER];
    let v = 55 - (2 * m + d);
    if (v <= 0) v += 52;
    const card1 = valueToCard(v);
    const idx = EARTH.indexOf(card1);
    const card2 = EARTH[(idx + ZODIAC_SPACES[zodiacFor(m, d)] + 52) % 52];
    return [card1, card2, addCards(card1, card2)];
  }

  // CardCalculator.calculateCompatibilityTable, first cell (their card 1 x your card 1)
  function firstCompatibilityCard(you, them) {
    const youJoker = you.includes(JOKER), themJoker = them.includes(JOKER);
    if (youJoker || themJoker) return themJoker ? you[0] : them[0];
    return addCards(them[0], you[0]);
  }

  // ---------- Planets (LifePathCalculator) ----------
  // Lookup order for a target card among the subject's planet cards. The app reads a
  // Swift dictionary here, whose order is unspecified; this fixes karma first.
  const PLANET_STEPS = [['moon', -1], ['mercury', 1], ['venus', 2], ['mars', 3], ['jupiter', 4], ['saturn', 5], ['uranus', 6], ['neptune', 7], ['pluto', 8], ['result', 9], ['lesson', 10]];
  const COMPAT_PLANETS = ['sun', 'blessingKarma', 'dutyKarma', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'result'];

  function relationship(subject, target, chart) {
    const idx = chart.indexOf(subject);
    if (idx === -1) return null;
    const karma = KARMA[subject];
    if (karma && karma[0] === target) return 'blessingKarma';
    if (karma && karma[1] === target) return 'dutyKarma';
    for (const [planet, step] of PLANET_STEPS) {
      if (chart[(idx + step + 52) % 52] === target) return planet;
    }
    return null;
  }

  function planetaryCompatibility(you, them) {
    const results = [];
    you.forEach((u, ui) => them.forEach((t, ti) => {
      if (u === t) {
        results.push({ planet: 'sun', direction: 'youToThem', ui, ti });
        results.push({ planet: 'sun', direction: 'themToYou', ui, ti });
      }
    }));
    for (const chart of [EARTH, HEAVEN]) {
      you.forEach((u, ui) => them.forEach((t, ti) => {
        if (u === t) return;
        const add = (planet, direction) => {
          if (!planet || !COMPAT_PLANETS.includes(planet)) return;
          const karmic = planet === 'blessingKarma' || planet === 'dutyKarma';
          if (!karmic || chart === EARTH) results.push({ planet, direction, ui, ti });
        };
        add(relationship(u, t, chart), 'themToYou'); // they hold one of your planet spots
        add(relationship(t, u, chart), 'youToThem'); // you hold one of theirs
      }));
    }
    return results;
  }

  // ---------- Copy (from the app's PlanetaryCompatibilityInfo) ----------
  const PLANET_INFO = {
    sun:           { name: 'Sun', glyph: '☉', you: 'You two share one of your main three cards, and "play with" many of the same cards in the game of life.', them: 'You two share one of your main three cards, and "play with" many of the same cards in the game of life.' },
    blessingKarma: { name: 'Karma+', glyph: 'K+', you: "Your energy is meant to bless {{NAME}}'s energy in this lifetime. This is a fated connection.", them: "{{NAME}}'s energy is meant to bless yours in this lifetime. This is a fated connection." },
    dutyKarma:     { name: 'Karma−', glyph: 'K−', you: "Your energy is meant to challenge {{NAME}}'s energy in this lifetime; they have a duty to work with your card. This is a fated connection.", them: "{{NAME}}'s energy is meant to challenge yours in this lifetime; you have a duty to work with their card. This is a fated connection." },
    moon:          { name: 'Moon', glyph: '☽', you: 'You are meant to be a guide for {{NAME}}, holding them and supporting their growth in this life.', them: '{{NAME}} is meant to be a guide for you, holding you and supporting your growth in this life.' },
    mercury:       { name: 'Mercury', glyph: '☿', you: "You are meant to make {{NAME}} feel seen and heard, like they can express themselves to you in a way they can't to other people.", them: "{{NAME}} is meant to make you feel seen and heard, like you can express yourself to them in a way you can't to other people." },
    venus:         { name: 'Venus', glyph: '♀', you: 'You are meant to teach {{NAME}} about love, providing care or comfort to them in some way.', them: '{{NAME}} is meant to teach you about love, providing care or comfort to you in some way.' },
    mars:          { name: 'Mars', glyph: '♂', you: 'Your energy activates {{NAME}}, for better or worse. You are meant to spur movement in them.', them: "{{NAME}}'s energy activates you, for better or worse. They are meant to spur movement in you." },
    jupiter:       { name: 'Jupiter', glyph: '♃', you: 'You are meant to expand {{NAME}}. Your energy brings opportunity and luck to theirs.', them: '{{NAME}} is meant to expand you. Their energy brings opportunity and luck to yours.' },
    saturn:        { name: 'Saturn', glyph: '♄', you: 'You are meant to ground {{NAME}}; your energy is a reality check to theirs. You may see their faults more clearly than others.', them: '{{NAME}} is meant to ground you; their energy is a reality check to yours. They may see your faults more clearly than others.' },
    uranus:        { name: 'Uranus', glyph: '♅', you: 'You are meant to change {{NAME}}, to enlighten them or free them in an unusual or unexpected way.', them: '{{NAME}} is meant to change you, to enlighten you or free you in an unusual or unexpected way.' },
    neptune:       { name: 'Neptune', glyph: '♆', you: 'You are meant to inspire {{NAME}}. Your energy may be a muse to theirs, or they may idealize you, so be real with them.', them: '{{NAME}} is meant to inspire you. Their energy may be a muse to yours, but beware of delusion.' },
    pluto:         { name: 'Pluto', glyph: '♇', you: "You are a force of transformation in {{NAME}}'s life. Whether easily or painstakingly, your energy is meant to help theirs evolve.", them: '{{NAME}} is a force of transformation in your life. Whether easily or painstakingly, their energy is meant to help yours evolve.' },
    result:        { name: 'North Node', glyph: '☊', you: "Something about your energy represents where {{NAME}}'s energy is meant to head in this lifetime. Be a teacher to them.", them: "Something about {{NAME}}'s energy represents where your energy is meant to head in this lifetime. Let them be a teacher to you." }
  };
  const ROLES = ['Inner Child', 'Chosen Purpose', 'Highest Self'];

  function fillName(text, name) {
    const n = name || 'your person';
    return text.replace(/(^|[.;!?]\s+)\{\{NAME\}\}/g, (m, pre) => pre + (name ? n : 'Your person'))
               .replace(/\{\{NAME\}\}/g, n);
  }
  function cardLabel(id) {
    if (id === JOKER) return 'The Joker';
    const [suit, rank] = id.split('-');
    return rank + ' of ' + suit;
  }
  function cardArt(id) {
    if (id === JOKER) return null;
    const [suit, rank] = id.split('-');
    return '/assets/cards/' + suit.toLowerCase() + '-' + rank.toLowerCase() + '.webp';
  }
  function cardSlug(id) {
    return id === JOKER ? 'the-joker' : cardLabel(id).toLowerCase().replace(/ /g, '-');
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- UI ----------
  const root = document.getElementById('compatPreview');
  if (!root) return;
  const $ = (sel) => root.querySelector(sel);
  const track = window.cardyTrack || function () {};

  function populateDays(monthSel, daySel) {
    const m = parseInt(monthSel.value, 10);
    const prev = daySel.value;
    const max = m ? new Date(2024, m, 0).getDate() : 31;
    daySel.innerHTML = '<option value="" disabled selected>Day</option>';
    for (let d = 1; d <= max; d++) {
      const o = document.createElement('option');
      o.value = d; o.textContent = d;
      if (String(d) === prev) o.selected = true;
      daySel.appendChild(o);
    }
  }
  [['#cpYouMonth', '#cpYouDay'], ['#cpThemMonth', '#cpThemDay']].forEach(([ms, ds]) => {
    const mSel = $(ms), dSel = $(ds);
    populateDays(mSel, dSel);
    mSel.addEventListener('change', () => { populateDays(mSel, dSel); clearInvalid(); });
    dSel.addEventListener('change', clearInvalid);
  });

  function clearInvalid() {
    root.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    $('#cpHint').hidden = true;
  }

  function faceHtml(id, extraClass) {
    const art = cardArt(id);
    const label = cardLabel(id);
    if (art) return '<img class="cp-card ' + (extraClass || '') + '" src="' + art + '" alt="' + label + '" width="400" height="592" />';
    return '<div class="cp-card cp-card--joker ' + (extraClass || '') + '" role="img" aria-label="The Joker"><span>🃏</span><strong>Joker</strong></div>';
  }
  function lockedBacks(n) {
    let html = '<div class="cp-locked" aria-hidden="true">';
    for (let i = 0; i < Math.min(n, 3); i++) html += '<span class="cp-mini-back"></span>';
    return html + '</div>';
  }

  function render(you, them, name) {
    const compat = firstCompatibilityCard(you, them);
    const results = planetaryCompatibility(you, them);

    // Unique planets per direction, the way the app lists them
    const unique = new Map();
    results.forEach((r) => {
      const key = r.direction + ':' + r.planet;
      if (!unique.has(key)) unique.set(key, r);
      else if (r.ui === 0 && r.ti === 0) unique.set(key, r); // prefer the first-card pairing
    });
    const list = Array.from(unique.values()).sort((a, b) =>
      ((b.ui === 0 && b.ti === 0) - (a.ui === 0 && a.ti === 0)) ||
      (COMPAT_PLANETS.indexOf(a.planet) - COMPAT_PLANETS.indexOf(b.planet)) ||
      (a.direction === 'youToThem' ? -1 : 1));
    const shown = list[0] || null;
    const more = Math.max(0, list.length - 1);
    const who = name ? escapeHtml(name) : 'Them';
    const whose = name ? escapeHtml(name) + "'s" : 'Their';

    let planetHtml;
    if (shown) {
      const info = PLANET_INFO[shown.planet];
      const arrow = shown.planet === 'sun' ? 'You ↔ ' + who : (shown.direction === 'youToThem' ? 'You → ' + who : who + ' → You');
      const via = (shown.ui === 0 && shown.ti === 0) ? 'Between your Inner Child cards'
        : 'Between your ' + ROLES[shown.ui] + ' and ' + (name ? escapeHtml(name) + "'s" : 'their') + ' ' + ROLES[shown.ti];
      planetHtml =
        '<div class="cp-planet">' +
          '<div class="cp-planet-glyph" aria-hidden="true">' + info.glyph + '</div>' +
          '<div class="cp-planet-body">' +
            '<div class="cp-planet-head"><strong>' + info.name + '</strong><span>' + arrow + '</span></div>' +
            '<p>' + escapeHtml(fillName(shown.direction === 'youToThem' ? info.you : info.them, name)) + '</p>' +
            '<small>' + via + '</small>' +
          '</div>' +
        '</div>' +
        (more ? '<p class="cp-more"><span class="cp-more-dots" aria-hidden="true">' + '<i></i>'.repeat(Math.min(more, 6)) + '</span><strong>+' + more + ' more planetary connection' + (more === 1 ? '' : 's') + '</strong> between your cards, unlocked in the app</p>'
              : '<p class="cp-more">This is the only planetary connection between your three cards and theirs.</p>');
    } else {
      planetHtml = (you[0] === JOKER || them[0] === JOKER)
        ? '<p class="cp-none">The Joker sits outside the planetary charts, so it has no planets to share. Its bond runs through the <strong>9 compatibility cards</strong>, where the Joker takes on the other person\'s cards.</p>'
        : '<p class="cp-none">None of your three cards sit on each other\'s planets, so your bond runs through your <strong>9 compatibility cards</strong> instead. That\'s common, and it isn\'t a bad sign.</p>';
    }

    $('#cpResult').innerHTML =
      '<div class="cp-pair">' +
        '<figure class="cp-person">' + faceHtml(you[0]) + '<figcaption><span>Your Inner Child</span><strong>' + cardLabel(you[0]) + '</strong></figcaption>' + lockedBacks(2) + '<small>+2 more cards</small></figure>' +
        '<div class="cp-plus" aria-hidden="true">+</div>' +
        '<figure class="cp-person">' + faceHtml(them[0]) + '<figcaption><span>' + whose + ' Inner Child</span><strong>' + cardLabel(them[0]) + '</strong></figcaption>' + lockedBacks(2) + '<small>+2 more cards</small></figure>' +
      '</div>' +
      '<div class="cp-block">' +
        '<div class="cp-block-label">Your first compatibility card</div>' +
        '<div class="cp-compat">' + faceHtml(compat, 'cp-card--sm') +
          '<div><strong class="cp-compat-name">' + cardLabel(compat) + '</strong><p>The energy your Inner Child cards create together.</p>' +
          '<a href="/birth-card-meanings#' + cardSlug(compat) + '" data-placement="compat_result">Read about the ' + cardLabel(compat) + ' →</a>' +
          '<p class="cp-more"><span><strong>+8 more compatibility cards</strong>, one for every pairing of your three cards</span></p></div>' +
        '</div>' +
      '</div>' +
      '<div class="cp-block">' +
        '<div class="cp-block-label">' + (shown ? 'A planet between you' : 'Planetary connections') + '</div>' + planetHtml +
      '</div>' +
      '<div class="cp-cta">' +
        '<p>See all ' + (shown ? list.length + ' planet' + (list.length === 1 ? '' : 's') + ', ' : '') + '9 compatibility cards, and both full profiles in Cardy.</p>' +
        '<div class="cp-cta-row">' +
          '<a class="cp-btn cp-btn--app" href="https://apps.apple.com/us/app/cardy-reflections/id6757249840" target="_blank" rel="noopener" data-placement="compat_result">Unlock in the App</a>' +
          '<a class="cp-btn cp-btn--web" href="https://app.cardy.today" target="_blank" rel="noopener" data-placement="compat_result">Web App (Android) →</a>' +
        '</div>' +
      '</div>';
    $('#cpResult').hidden = false;

    track('web_compat_calculated', {
      your_card: cardLabel(you[0]), their_card: cardLabel(them[0]), compat_card: cardLabel(compat),
      shown_planet: shown ? shown.planet : 'none', total_planets: list.length, has_name: !!name
    });
    return { compat, list };
  }

  $('#cpSubmit').addEventListener('click', () => {
    const fields = ['#cpYouMonth', '#cpYouDay', '#cpThemMonth', '#cpThemDay'].map((s) => $(s));
    const missing = fields.filter((f) => !f.value);
    if (missing.length) {
      missing.forEach((f) => f.classList.add('is-invalid'));
      $('#cpHint').hidden = false;
      missing[0].focus();
      track('web_compat_invalid', { missing: missing.length });
      return;
    }
    const [ym, yd, tm, td] = fields.map((f) => parseInt(f.value, 10));
    const name = $('#cpThemName').value.trim().slice(0, 30);
    render(birthCards(ym, yd), birthCards(tm, td), name);
    const r = $('#cpResult');
    if (r.getBoundingClientRect().top > window.innerHeight * 0.6) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Store clicks from the result
  root.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.href.includes('apps.apple.com')) track('web_store_clicked', { store: 'app_store', placement: 'compat_result', page: 'compatibility' });
    else if (a.href.includes('app.cardy.today')) track('web_store_clicked', { store: 'web_app', placement: 'compat_result', page: 'compatibility' });
  });

  // Exposed for testing against the app's logic
  window.__cardyCompat = { birthCards, firstCompatibilityCard, planetaryCompatibility, zodiacFor };
})();
