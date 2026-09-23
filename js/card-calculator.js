/**
 * Cardy Client-Side Cardology Engine
 * Powers interactive tools on /destiny-cards-calculator, /find-my-birth-card, and /destiny-cards-relationship-chart
 */

(function () {
  'use strict';

  const SUITS = [
    { name: 'Hearts', symbol: '♥', color: '#E84A3B' },
    { name: 'Clubs', symbol: '♣', color: '#DCD6E8' },
    { name: 'Diamonds', symbol: '♦', color: '#E84A3B' },
    { name: 'Spades', symbol: '♠', color: '#DCD6E8' }
  ];

  const RANKS = [
    '', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'
  ];

  const CARD_PROFILES = {
    // Hearts
    'Ace of Hearts': {
      slug: 'ace-of-hearts',
      archetype: 'The Desire for Love & Awakening',
      desc: 'The pioneer of the heart. You possess a restless craving for affection, creative expression, and new emotional horizons. Passionate and magnetic, your primary life lesson is cultivating inner self-love so you do not chase validation at the expense of your own peace.'
    },
    '2 of Hearts': {
      slug: '2-of-hearts',
      archetype: "The Lover's Card & Sacred Union",
      desc: 'Deeply devoted, affectionate, and wired for intimate partnership. You flourish when sharing your life and projects with a kindred spirit, learning to overcome codependency so your unions remain equal and empowering.'
    },
    '3 of Hearts': {
      slug: '3-of-hearts',
      archetype: 'The Creative Explorer & Variety',
      desc: 'An expressive artist and social butterfly gifted with immense charm, playful wit, and emotional curiosity. Your central challenge is romantic and creative indecision—learning that depth of commitment yields far richer joy than endless novelty.'
    },
    '4 of Hearts': {
      slug: '4-of-hearts',
      archetype: 'The Marriage Card & Emotional Security',
      desc: 'Stable, loyal, and deeply protective of family and lifelong companions. You are the emotional foundation of your community, learning to release emotional stubbornness and trust life when relationships require growth.'
    },
    '5 of Hearts': {
      slug: '5-of-hearts',
      archetype: 'The Restless Heart & Emotional Adventurer',
      desc: 'Curious, freedom-loving, and driven by an appetite for emotional adventure and travel. Your fulfillment comes when you learn to sustain deep emotional roots without feeling an urge to flee when intimacy deepens.'
    },
    '6 of Hearts': {
      slug: '6-of-hearts',
      archetype: 'The Peacemaker & Karmic Love',
      desc: 'A natural healer and diplomat centered on peace, fairness, and domestic responsibility. Your vital life lesson is learning healthy boundaries: forgiving without enabling, and knowing when an old emotional debt has already been paid.'
    },
    '7 of Hearts': {
      slug: '7-of-hearts',
      archetype: 'The Spiritual Lover & Unconditional Heart',
      desc: 'A card of high emotional sensitivity, deep intuition, and spiritual awakening through love. When you elevate your love beyond possessiveness into unconditional compassion, your intuitive and healing gifts shine brilliantly.'
    },
    '8 of Hearts': {
      slug: '8-of-hearts',
      archetype: 'The Card of Emotional Magnetism & Charm',
      desc: 'Magnetic, captivating, and socially formidable. You hold a natural gift for charming crowds and commanding affection without force, called to wield this emotional authority with genuine integrity and kindness.'
    },
    '9 of Hearts': {
      slug: '9-of-hearts',
      archetype: 'The Universal Giver & Sacred Completion',
      desc: 'Compassionate, generous, and attuned to the broader human condition. By embracing release with an open heart rather than resisting endings, you graduate from personal attachments into profound universal wisdom.'
    },
    '10 of Hearts': {
      slug: '10-of-hearts',
      archetype: 'The Radiant Community & Social Success',
      desc: 'Charismatic, uplifting, and born to shine in front of groups. While you effortlessly gain public admiration, your challenge is maintaining genuine, grounded emotional intimacy in private life away from the applause.'
    },
    'Jack of Hearts': {
      slug: 'jack-of-hearts',
      archetype: 'The Devoted Sacrifice & Youthful Romantic',
      desc: 'Playful, idealistic, and driven by selfless devotion to the people and causes you love. Your path involves grounding your ideals in reality so you do not sacrifice your well-being for unreciprocated dreams.'
    },
    'Queen of Hearts': {
      slug: 'queen-of-hearts',
      archetype: 'The Loving Mother & Empathetic Nurturer',
      desc: 'Warm, regal, highly intuitive, and instinctively supportive. You radiate unconditional empathy and domestic beauty, with the lifelong lesson of honoring your own needs with the same care you offer to others.'
    },
    'King of Hearts': {
      slug: 'king-of-hearts',
      archetype: 'The Master of the Heart & Emotional Patriarch',
      desc: 'Wise, protective, composed, and fatherly. You command natural authority in relationships, maintaining emotional mastery and fair leadership even amidst crisis while leading with a compassionate heart.'
    },

    // Clubs
    'Ace of Clubs': {
      slug: 'ace-of-clubs',
      archetype: 'The Seeker of Truth & Spark of Curiosity',
      desc: 'Fueled by an unquenchable thirst for knowledge, books, and fresh ideas. Your challenge is overcoming mental anxiety and over-analysis by pairing your brilliant mental spark with intuitive stillness and decisive action.'
    },
    '2 of Clubs': {
      slug: '2-of-clubs',
      archetype: 'The Inquisitive Conversationalist & Mental Match',
      desc: 'Gifted in dialogue, debate, and intellectual companionship. You think best out loud with someone who sharpens your intellect, learning to quiet mental restlessness and trust your own independent judgment.'
    },
    '3 of Clubs': {
      slug: '3-of-clubs',
      archetype: 'The Creative Genius & Mental Dynamo',
      desc: 'A rapid-fire writer, speaker, or innovator bursting with creative concepts. Your central challenge is focus: resisting the urge to juggle too many ideas at once so your most brilliant visions reach completion.'
    },
    '4 of Clubs': {
      slug: '4-of-clubs',
      archetype: 'The Structured Mind & Stable Knowledge',
      desc: 'Grounded, practical, organized, and mentally resilient. You excel at building frameworks and methodologies that stand the test of time, learning to remain intellectually flexible with modern evidence.'
    },
    '5 of Clubs': {
      slug: '5-of-clubs',
      archetype: 'The Inquisitive Traveler & Mental Wanderer',
      desc: 'Hungry for adventure, philosophical shifts, and diverse viewpoints. You despise intellectual monotony, thriving when you channel your restless curiosity into purposeful travel and deep specialized study.'
    },
    '6 of Clubs': {
      slug: '6-of-clubs',
      archetype: 'The Messenger of Truth & Intuitive Clarity',
      desc: 'Calm, reliable, and deeply committed to intellectual integrity. You carry a natural talent for recognizing universal truths, tested to stand firm in your convictions without compromising simply to avoid debate.'
    },
    '7 of Clubs': {
      slug: '7-of-clubs',
      archetype: 'The Spiritual Intellect & Overcoming Worry',
      desc: 'Intuitive, visionary, and philosophically inclined. When you train your mind to focus on spiritual faith and positive visualization rather than worst-case scenarios, your mind becomes an instrument of remarkable inspiration.'
    },
    '8 of Clubs': {
      slug: '8-of-clubs',
      archetype: 'The Mental Powerhouse & Intellectual Authority',
      desc: 'Mentally formidable, persuasive, and exceptionally disciplined. You possess intense focus and executive intelligence, capable of achieving remarkable intellectual milestones through steady concentration.'
    },
    '9 of Clubs': {
      slug: '9-of-clubs',
      archetype: 'The Universal Thinker & Philosophical Completion',
      desc: 'Broad-minded, philanthropic, and naturally wise. You synthesize complex worldviews and mentor others, continually releasing obsolete philosophies to make room for higher spiritual understanding.'
    },
    '10 of Clubs': {
      slug: '10-of-clubs',
      archetype: 'The Radiant Teacher & Public Brilliance',
      desc: 'Exceptionally articulate, widely read, and born to communicate to the public. You succeed as a teacher, author, or public strategist, balancing your intense mental output with physical restoration.'
    },
    'Jack of Clubs': {
      slug: 'jack-of-clubs',
      archetype: 'The Clever Strategist & Creative Trickster',
      desc: 'Ingenious, witty, charismatic, and always ten steps ahead. Your destiny asks you to anchor your razor-sharp cleverness in unwavering ethics, using your inventive mind to build rather than outmaneuver.'
    },
    'Queen of Clubs': {
      slug: 'queen-of-clubs',
      archetype: 'The Intuitive Counselor & Practical Queen',
      desc: 'Perceptive, hardworking, and gifted with razor-sharp business instincts and intuitive foresight. Your growth lies in delegating responsibilities and guarding against mental exhaustion from carrying everyone’s problems.'
    },
    'King of Clubs': {
      slug: 'king-of-clubs',
      archetype: 'The Master of the Mind & Executive Intellect',
      desc: 'Commanding, strategic, authoritative, and visionary. You are an intellectual heavyweight whose mental clarity allows you to govern enterprises and philosophies with quiet confidence and impartial justice.'
    },

    // Diamonds
    'Ace of Diamonds': {
      slug: 'ace-of-diamonds',
      archetype: 'The Ambition for Worth & Financial Drive',
      desc: 'Enterprising, self-reliant, and motivated by tangible achievement. You possess a keen eye for commerce and asset creation, learning that authentic wealth begins with unshakeable inner self-esteem.'
    },
    '2 of Diamonds': {
      slug: '2-of-diamonds',
      archetype: 'The Business Partner & Dealmaker',
      desc: 'Diplomatic, commercially savvy, and skilled in collaborative enterprise. You generate wealth through joint ventures, learning to value equal reciprocity and make sure love is never treated as a transactional bargain.'
    },
    '3 of Diamonds': {
      slug: '3-of-diamonds',
      archetype: 'The Financial Innovator & Multiple Interests',
      desc: 'Versatile, entrepreneurial, and creative in commerce. You often juggle multiple income streams and ventures, thriving when you overcome financial anxiety and commit to your core enterprise.'
    },
    '4 of Diamonds': {
      slug: '4-of-diamonds',
      archetype: 'The Bedrock of Wealth & Material Security',
      desc: 'Methodical, hardworking, and dedicated to building enduring financial stability. You are the rock of family and business assets, learning to release fear of scarcity and enjoy the fruits of your labor.'
    },
    '5 of Diamonds': {
      slug: '5-of-diamonds',
      archetype: 'The Commercial Adventurer & Changing Fortunes',
      desc: 'Free-spirited, adaptive, and drawn to diverse ventures, trading, and travel. You understand market cycles intuitively, learning to cultivate internal stability amidst external economic shifts.'
    },
    '6 of Diamonds': {
      slug: '6-of-diamonds',
      archetype: 'The Settler of Debts & Financial Balancer',
      desc: 'Fair, generous, and committed to financial integrity and karmic settling. You have a steady money karma and an instinct for equitable compensation, challenged to charge what you are truly worth.'
    },
    '7 of Diamonds': {
      slug: '7-of-diamonds',
      archetype: 'The Spiritual Millionaire & True Value',
      desc: 'Intuitive, discerning, and spiritually tested around money. You discover that when you fixate on material scarcity you struggle, but when you align with purpose and trust divine timing, abundance flows freely.'
    },
    '8 of Diamonds': {
      slug: '8-of-diamonds',
      archetype: 'The Sun Card of Wealth & Executive Power',
      desc: 'Imposing, prosperous, and naturally influential in business. You wield executive clout and financial magnetism with ease, born to manage large capital and use your wealth to elevate your community.'
    },
    '9 of Diamonds': {
      slug: '9-of-diamonds',
      archetype: 'The Philanthropist & Release of Material Ego',
      desc: 'Generous, worldly, and driven by higher humanitarian values over mere accumulation. You learn that true richness lies in giving back, releasing material control, and sharing abundance freely.'
    },
    '10 of Diamonds': {
      slug: '10-of-diamonds',
      archetype: 'The Pinnacle of Success & Commercial Titan',
      desc: 'Highly ambitious, capable, and born for grand-scale prosperity. You possess the drive to build prominent businesses and achieve public renown, learning to ground your self-worth in character over balance sheets.'
    },
    'Jack of Diamonds': {
      slug: 'jack-of-diamonds',
      archetype: 'The Enterprising Trader & Charming Promoter',
      desc: 'Shrewd, persuasive, and magnetically creative in sales, technology, and enterprise. You spot opportunities before anyone else, called to hold the highest ethical standards in every deal.'
    },
    'Queen of Diamonds': {
      slug: 'queen-of-diamonds',
      archetype: 'The Gracious Patron & Business Maven',
      desc: 'Elegant, astute, and gifted with a refined appreciation for quality and craftsmanship. You cultivate and protect capital with grace, learning to balance generosity with personal boundaries.'
    },
    'King of Diamonds': {
      slug: 'king-of-diamonds',
      archetype: 'The Master of Commerce & Industry Titan',
      desc: 'Decisive, authoritative, and seasoned in the laws of value and enterprise. You sit comfortably atop financial hierarchies, leading with pragmatic strength, executive vision, and honor.'
    },

    // Spades
    'Ace of Spades': {
      slug: 'ace-of-spades',
      archetype: 'The Secret of Transformation & Inner Will',
      desc: 'The ancient card of profound metamorphosis, ambition, and spiritual awakening. You possess immense resolve to overcome hardship, discovering that true power emerges when you align your labor with spiritual devotion.'
    },
    '2 of Spades': {
      slug: '2-of-spades',
      archetype: 'The Dedicated Partner & Fellowship of Labor',
      desc: 'Reliable, loyal, and committed to common causes in work and craftsmanship. You excel in long-term professional partnerships, learning to balance devotion to duty with your own personal well-being.'
    },
    '3 of Spades': {
      slug: '3-of-spades',
      archetype: 'The Master Craftsman & Creative Effort',
      desc: 'Energetic, multitalented, and capable of turning physical effort into fine art. You excel across varied trades or design disciplines, challenged to avoid chronic overwork through focused moderation.'
    },
    '4 of Spades': {
      slug: '4-of-spades',
      archetype: 'The Unshakable Foundation & Pillar of Health',
      desc: 'Resilient, grounded, and possessing an iron constitution and work ethic. You build enduring structures and take pride in dependable labor, learning flexibility when life invites new methods.'
    },
    '5 of Spades': {
      slug: '5-of-spades',
      archetype: 'The Restless Wanderer & Life Reinventor',
      desc: 'Dynamic, bold, and unafraid of major career transitions or physical relocations. When you anchor your transformations to a meaningful spiritual or professional mission, your adaptability becomes your greatest superpower.'
    },
    '6 of Spades': {
      slug: '6-of-spades',
      archetype: 'The Card of Fate & The Steadfast Laborer',
      desc: 'Steadfast, karmically disciplined, and aligned with personal destiny. You understand that actions carry consequences, navigating work and health with unwavering integrity and calm endurance under pressure.'
    },
    '7 of Spades': {
      slug: '7-of-spades',
      archetype: 'The Spiritual Healer & Faith Under Pressure',
      desc: 'Deep, mystical, and resilient. You often encounter pivotal lessons around health or demanding workloads, discovering that inner faith and mindfulness dissolve outer obstacles into profound healing gifts.'
    },
    '8 of Spades': {
      slug: '8-of-spades',
      archetype: 'The Power of Labor & Unstoppable Willpower',
      desc: 'Formidable, healing, and possessing immense stamina and executive drive. You overcome enormous obstacles through perseverance, learning to temper your iron will with gentleness and rest.'
    },
    '9 of Spades': {
      slug: '9-of-spades',
      archetype: 'The Universal Sage & The Great Completion',
      desc: 'Philosophically profound, compassionate, and spiritually mature. You assist others through life’s major endings and transformations, carrying the deck’s oldest wisdom into selfless service.'
    },
    '10 of Spades': {
      slug: '10-of-spades',
      archetype: 'The Titan of Achievement & Public Mastery',
      desc: 'The card of towering career success, supreme effort, and monumental accomplishment. You have the stamina to carry entire enterprises, challenged to step back and replenish your spiritual well-being.'
    },
    'Jack of Spades': {
      slug: 'jack-of-spades',
      archetype: 'The Visionary Initiate & Spiritual Actor',
      desc: 'Clever, mystical, charismatic, and multifaceted. You operate with ease between spiritual awareness and practical mastery, called to channel your creative vision into transformative work.'
    },
    'Queen of Spades': {
      slug: 'queen-of-spades',
      archetype: 'The Sovereign of Self-Mastery & Practical Wisdom',
      desc: 'Disciplined, capable, intuitive, and deeply authoritative. You combine spiritual insight with organizational prowess, inspiring others through selfless service and quiet dignity.'
    },
    'King of Spades': {
      slug: 'king-of-spades',
      archetype: 'The Crown of Wisdom & Supreme Master',
      desc: 'The highest card in the entire deck. Regal, principled, and seasoned by life’s ultimate lessons, you hold innate authority across work, philosophy, and leadership, governing with impartial grace.'
    },

    // Joker
    'The Joker': {
      slug: 'the-joker',
      archetype: 'The Cosmic Wildcard (December 31)',
      desc: 'Bound by no single suit or fixed trajectory. Born on December 31, you embody pure adaptability, theatricality, independence, and wit, capable of mirroring any card in the deck and writing your own rules.'
    }
  };

  /**
   * Calculates Birth Card from Month and Day using the Cardology Solar Value formula
   * Solar Value = 55 - (2 * Month + Day)
   */
  function calculateBirthCard(month, day) {
    if (!month || !day) return null;
    month = parseInt(month, 10);
    day = parseInt(day, 10);

    // December 31 is the 365th day, ruled by the Joker
    if (month === 12 && day === 31) {
      const jProfile = CARD_PROFILES['The Joker'];
      return {
        name: 'The Joker',
        rank: 'Joker',
        suit: 'Wildcard',
        symbol: '🃏',
        color: '#E84A3B',
        solarValue: 0,
        archetype: jProfile.archetype,
        slug: jProfile.slug,
        desc: jProfile.desc,
        summary: jProfile.desc
      };
    }

    let solarVal = 55 - (2 * month + day);
    if (solarVal <= 0) {
      solarVal += 52;
    }

    const suitIndex = Math.floor((solarVal - 1) / 13);
    const rankIndex = ((solarVal - 1) % 13) + 1;

    const suit = SUITS[suitIndex] || SUITS[0];
    const rank = RANKS[rankIndex] || `${rankIndex}`;
    const cardName = `${rank} of ${suit.name}`;
    const cardId = `${suit.name}-${rank}`;
    const profile = CARD_PROFILES[cardName] || {
      slug: suit.name.toLowerCase(),
      archetype: 'Inner Child',
      desc: `${cardName} sits in the suit of ${suit.name}.`
    };

    return {
      id: cardId,
      name: cardName,
      rank: rank,
      suit: suit.name,
      symbol: suit.symbol,
      color: suit.color,
      solarValue: solarVal,
      archetype: profile.archetype,
      slug: profile.slug,
      desc: profile.desc,
      summary: profile.desc
    };
  }

  // Authentic Grand Solar Spread Charts from Cardy (LifePathCalculator.swift)
  const EARTH_CHART = [
    'Clubs-10', 'Diamonds-8', 'Spades-King', 'Hearts-3', 'Clubs-Ace',
    'Clubs-Queen', 'Spades-10', 'Clubs-5', 'Diamonds-3', 'Spades-Ace',
    'Hearts-7', 'Diamonds-7', 'Spades-5', 'Hearts-Jack', 'Clubs-9',
    'Spades-9', 'Hearts-2', 'Hearts-King', 'Diamonds-King', 'Hearts-6',
    'Clubs-4', 'Diamonds-2', 'Spades-Jack', 'Clubs-8', 'Diamonds-6',
    'Spades-4', 'Hearts-10', 'Diamonds-10', 'Spades-8', 'Hearts-Ace',
    'Diamonds-Ace', 'Diamonds-Queen', 'Hearts-5', 'Clubs-3', 'Spades-3',
    'Hearts-9', 'Clubs-7', 'Diamonds-5', 'Spades-Queen', 'Clubs-Jack',
    'Diamonds-9', 'Spades-7', 'Clubs-2', 'Clubs-King', 'Diamonds-Jack',
    'Hearts-4', 'Diamonds-4', 'Spades-2', 'Hearts-8', 'Clubs-6',
    'Spades-6', 'Hearts-Queen'
  ];

  const HEAVEN_CHART = [
    'Spades-Jack', 'Spades-Queen', 'Spades-King', 'Hearts-Ace', 'Hearts-2',
    'Hearts-3', 'Hearts-4', 'Hearts-5', 'Hearts-6', 'Hearts-7',
    'Hearts-8', 'Hearts-9', 'Hearts-10', 'Hearts-Jack', 'Hearts-Queen',
    'Hearts-King', 'Clubs-Ace', 'Clubs-2', 'Clubs-3', 'Clubs-4',
    'Clubs-5', 'Clubs-6', 'Clubs-7', 'Clubs-8', 'Clubs-9',
    'Clubs-10', 'Clubs-Jack', 'Clubs-Queen', 'Clubs-King', 'Diamonds-Ace',
    'Diamonds-2', 'Diamonds-3', 'Diamonds-4', 'Diamonds-5', 'Diamonds-6',
    'Diamonds-7', 'Diamonds-8', 'Diamonds-9', 'Diamonds-10', 'Diamonds-Jack',
    'Diamonds-Queen', 'Diamonds-King', 'Spades-Ace', 'Spades-2', 'Spades-3',
    'Spades-4', 'Spades-5', 'Spades-6', 'Spades-7', 'Spades-8',
    'Spades-9', 'Spades-10'
  ];

  const PLANET_OFFSETS = [
    { name: 'Moon', offset: -1, subtitle: 'Nurturing & guidance', desc: 'The Moon represents emotional sanctuary and our inner world. One partner guides, comforts, and nurtures the other, creating instinctive emotional safety.' },
    { name: 'Mercury', offset: 1, subtitle: 'Communication', desc: 'A Mercury connection makes you feel deeply heard and seen. Ideas, curiosity, and thoughts flow effortlessly between you in lively mental harmony.' },
    { name: 'Venus', offset: 2, subtitle: 'Love & comfort', desc: 'A classic sweet romantic connection. Brings magnetic affection, mutual appreciation for beauty, and an instinctive desire to cherish one another.' },
    { name: 'Mars', offset: 3, subtitle: 'Action & drive', desc: 'Electric physical chemistry and mutual motivation. This connection activates you to take bold action, though it can ignite fiery passions.' },
    { name: 'Jupiter', offset: 4, subtitle: 'Growth & expansion', desc: 'The most benevolent link in the deck. You bring each other good fortune, generosity, emotional expansion, and natural forgiveness.' },
    { name: 'Saturn', offset: 5, subtitle: 'Structure & lessons', desc: 'A grounded, serious bond built for longevity. One partner brings essential structure and discipline, teaching maturity and building lasting foundations.' },
    { name: 'Uranus', offset: 6, subtitle: 'Innovation & change', desc: 'An unconventional, exciting connection that sparks originality. You push each other beyond old limits and liberate each other in unexpected ways.' },
    { name: 'Neptune', offset: 7, subtitle: 'Dreams & inspiration', desc: 'A dreamy, mystical bond that feels written in the stars. You connect on an unspoken spiritual frequency with deep empathy and creative wonder.' },
    { name: 'Pluto', offset: 8, subtitle: 'Deep transformation', desc: 'A powerful, fated connection of death and rebirth. This bond pushes you both to shed outgrown layers and undergo profound personal evolution.' },
    { name: 'North Node', offset: 9, subtitle: 'Destiny & direction', desc: 'A destined connection pointing toward your highest evolutionary path. Being together feels like stepping directly into your future purpose.' }
  ];

  /**
   * Determine planetary connection between two birth cards using Cardy's LifePathCalculator engine
   */
  function calculateConnection(card1, card2) {
    if (!card1 || !card2) return null;

    if (card1.name === card2.name) {
      return {
        type: 'Sun Connection · Shared Identity',
        badge: 'Same Sun (Cosmic Twin)',
        description: 'You two share the exact same Birth Card! You walk similar life paths and understand one another at the deepest level — looking at each other is like looking in a mirror.'
      };
    }

    const id1 = card1.id;
    const id2 = card2.id;

    // Check Earth Chart (Direct & Reverse)
    const idx1E = EARTH_CHART.indexOf(id1);
    const idx2E = EARTH_CHART.indexOf(id2);

    if (idx1E !== -1 && idx2E !== -1) {
      for (const p of PLANET_OFFSETS) {
        if (EARTH_CHART[(idx1E + p.offset + 52) % 52] === id2) {
          return {
            type: `${p.name} Connection · ${p.subtitle}`,
            badge: `${p.name} (Earth Path)`,
            description: `Person 2 is Person 1's ${p.name} card on the Earth Chart. ${p.desc}`
          };
        }
        if (EARTH_CHART[(idx2E + p.offset + 52) % 52] === id1) {
          return {
            type: `${p.name} Connection · ${p.subtitle}`,
            badge: `${p.name} (Earth Path)`,
            description: `Person 1 is Person 2's ${p.name} card on the Earth Chart. ${p.desc}`
          };
        }
      }
    }

    // Check Heaven Chart (Direct & Reverse)
    const idx1H = HEAVEN_CHART.indexOf(id1);
    const idx2H = HEAVEN_CHART.indexOf(id2);

    if (idx1H !== -1 && idx2H !== -1) {
      for (const p of PLANET_OFFSETS) {
        if (HEAVEN_CHART[(idx1H + p.offset + 52) % 52] === id2) {
          return {
            type: `${p.name} Connection · ${p.subtitle}`,
            badge: `${p.name} (Heaven Path)`,
            description: `Person 2 is Person 1's ${p.name} card on the Heaven Chart. ${p.desc}`
          };
        }
        if (HEAVEN_CHART[(idx2H + p.offset + 52) % 52] === id1) {
          return {
            type: `${p.name} Connection · ${p.subtitle}`,
            badge: `${p.name} (Heaven Path)`,
            description: `Person 1 is Person 2's ${p.name} card on the Heaven Chart. ${p.desc}`
          };
        }
      }
    }

    // Composite Synthesis Fallback (Sum of values mod 52 from Cardy CardCalculator)
    let compVal = card1.solarValue + card2.solarValue;
    if (compVal > 52) compVal -= 52;
    const compSuit = SUITS[Math.floor((compVal - 1) / 13)] || SUITS[0];
    const compRank = RANKS[((compVal - 1) % 13) + 1] || 'Ace';

    return {
      type: 'Composite Resonance · Geometric Harmony',
      badge: 'Composite Synergy',
      description: `Your cards unite to produce a composite synergy of the ${compRank} of ${compSuit.name}, combining your energies into shared purpose and magnetic creative potential.`
    };
  }

  // Populate Day Dropdowns based on month
  function setupDayPopulator(monthSelect, daySelect) {
    if (!monthSelect || !daySelect) return;

    function updateDays() {
      const month = parseInt(monthSelect.value, 10);
      const prevVal = daySelect.value;
      daySelect.innerHTML = '<option value="" disabled selected>Day</option>';

      if (!month) return;

      let daysInMonth = 31;
      if ([4, 6, 9, 11].includes(month)) daysInMonth = 30;
      else if (month === 2) daysInMonth = 29; // allow leap year

      for (let d = 1; d <= daysInMonth; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        if (prevVal && parseInt(prevVal, 10) === d) {
          opt.selected = true;
        }
        daySelect.appendChild(opt);
      }
    }

    monthSelect.addEventListener('change', updateDays);
    updateDays();
  }

  // Initialize Tools
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Destiny Cards Calculator (/destiny-cards-calculator)
    const calcMonth = document.getElementById('birth-month');
    const calcDay = document.getElementById('birth-day');
    const calcBtn = document.getElementById('btn-calculate-cards');
    const card1Preview = document.getElementById('card-1-preview');

    if (calcMonth && calcDay) {
      setupDayPopulator(calcMonth, calcDay);

      if (calcBtn && card1Preview) {
        calcBtn.addEventListener('click', () => {
          const card = calculateBirthCard(calcMonth.value, calcDay.value);
          if (!card) {
            alert('Please select both your birth month and day.');
            return;
          }

          card1Preview.innerHTML = `
            <div class="revealed-card-badge" style="color: ${card.color}">${card.symbol}</div>
            <span class="card-title" style="color: ${card.color}">${card.name}</span>
            <span class="card-badge free-badge">Card 1 · Revealed</span>
            <p class="card-subtext">${card.summary}</p>
          `;

          // Smooth scroll to results
          const results = document.getElementById('calculator-results');
          if (results) results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    }

    // 2. Find My Birth Card Finder (/find-my-birth-card)
    const lookupMonth = document.getElementById('lookup-month');
    const lookupDay = document.getElementById('lookup-day');
    const lookupBtn = document.getElementById('btn-find-card');
    const revealedFace = document.getElementById('revealed-card-face');
    const cardNameHeadline = document.getElementById('card-name-headline');
    const cardSummaryText = document.getElementById('card-summary-text');

    if (lookupMonth && lookupDay) {
      setupDayPopulator(lookupMonth, lookupDay);

      if (lookupBtn && revealedFace) {
        lookupBtn.addEventListener('click', () => {
          const card = calculateBirthCard(lookupMonth.value, lookupDay.value);
          if (!card) {
            alert('Please select both your birth month and day.');
            return;
          }

          revealedFace.innerHTML = `
            <div class="card-corner top-left" style="color: ${card.color}">
              <span class="card-val">${card.rank}</span>
              <span class="card-icon">${card.symbol}</span>
            </div>
            <div class="card-center">
              <span class="card-center-symbol" style="color: ${card.color}; font-size: 56px;">${card.symbol}</span>
            </div>
            <div class="card-corner bottom-right" style="color: ${card.color}">
              <span class="card-val">${card.rank}</span>
              <span class="card-icon">${card.symbol}</span>
            </div>
          `;

          if (cardNameHeadline) {
            cardNameHeadline.textContent = card.archetype ? `${card.name} — ${card.archetype}` : card.name;
          }
          if (cardSummaryText) {
            cardSummaryText.innerHTML = `
              <p style="margin-bottom: 12px; line-height: 1.6; font-size: 15px; color: rgba(255, 244, 244, 0.9);">${card.desc || card.summary}</p>
              <a href="/birth-card-meanings#${card.slug}" style="color: #FF8A80; font-weight: 600; text-decoration: underline; font-size: 14px;">Read full ${card.name} profile & lessons ↗</a>
            `;
          }

          const output = document.getElementById('lookup-output');
          if (output) output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    }

    // 3. Relationship Chart Tool (/destiny-cards-relationship-chart)
    const p1Month = document.getElementById('p1-month');
    const p1Day = document.getElementById('p1-day');
    const p2Month = document.getElementById('p2-month');
    const p2Day = document.getElementById('p2-day');
    const chartBtn = document.getElementById('btn-calculate-connection');

    if (p1Month && p1Day && p2Month && p2Day) {
      setupDayPopulator(p1Month, p1Day);
      setupDayPopulator(p2Month, p2Day);

      if (chartBtn) {
        chartBtn.addEventListener('click', () => {
          const card1 = calculateBirthCard(p1Month.value, p1Day.value);
          const card2 = calculateBirthCard(p2Month.value, p2Day.value);

          if (!card1 || !card2) {
            alert('Please select birthdays for both Person 1 and Person 2.');
            return;
          }

          const conn = calculateConnection(card1, card2);

          const titleEl = document.getElementById('detected-connection-title');
          const typeEl = document.getElementById('detected-type-name');
          const p1El = document.getElementById('p1-card-display');
          const p2El = document.getElementById('p2-card-display');

          if (titleEl) titleEl.textContent = conn.type;
          if (typeEl) typeEl.textContent = conn.description;
          if (p1El) p1El.innerHTML = `Person 1: <strong style="color: ${card1.color}">${card1.name}</strong>`;
          if (p2El) p2El.innerHTML = `Person 2: <strong style="color: ${card2.color}">${card2.name}</strong>`;

          const preview = document.getElementById('chart-result-preview');
          if (preview) {
            preview.style.display = 'block';
            preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }
    }
  });
})();
