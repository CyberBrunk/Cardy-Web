# Cardy SEO Content Library

Targeted SEO pages for **cardy.today** capturing 20 high-intent keyword clusters around Cardology / Destiny Cards.

- **Domain:** cardy.today
- **Tagline / closing beat:** "Play your cards right."
- **Voice:** mystical but math-grounded ("an ancient mathematical system encoded in a standard deck," "your birthday is a coordinate in the card calendar"). Modern, warm, precise.
- **Each page file:** `pages/<slug>.md` with YAML frontmatter (slug, meta title, meta description, target keyword) + ship-ready body copy.

---

## Locked decisions (read before building or writing new pages)

### 1. The real 3-card system (verified in the app code)
Cardy calculates **three** cards from a birthday — not one, and NOT "karma cards":

| Card | Name | How it's calculated |
|------|------|---------------------|
| Card 1 | **Inner Child** | Birth Card, from birth **date** (month + day) |
| Card 2 | **Chosen Purpose** | Card 1 shifted by the user's **zodiac sign's ruling planet** (this is where astrology feeds in) |
| Card 3 | **Highest Self** | Card 1 + Card 2 combined |

Source: `Cardy/Models/BirthCardService.swift`, `Cardy/Views/Home/MainCardsSystemView.swift`.
**Positioning angle:** cardology doesn't compete with astrology — it *incorporates* the zodiac sign into Card 2, and adds a birth-date layer, so two people with the same sun sign but different birthdays get different cards. More personal.

### 2. Karma cards are a SEPARATE, deeper layer
Two cards tied to the Birth Card, part of the Life Path spread:
- **Supporting Karma Card** = Cardy's **Blessing Card** (Karma +) — a gift.
- **Challenging Karma Card** = Cardy's **Duty Card** (Karma −) — a lesson.

Copy targets the search terms (*supporting* / *challenging*) but bridges to the in-app names (*Blessing* / *Duty*) so pages match what users see after downloading. Source: `Cardy/Models/CardDetailService.swift`, `LifePathCalculator.swift`.

### 3. CTA / reveal rule (tease-and-gate — matches the app paywall)
The app onboarding shows the **Birth Card free** and gates the full 3-card reveal + readings behind a trial. The web mirrors that exact line so there's no bait-and-switch:

- ✅ **Free on web + as the CTA hook:** the Birth Card (Card 1 / Inner Child).
- ✅ **Free reference content:** generic card meanings, suit/rank guides, history, comparisons.
- 🔒 **"Unlock in the app" hook:** Cards 2 & 3 (Chosen Purpose, Highest Self), karma cards, full written readings, daily narrated stories, compatibility.

**CTA copy rule:** every CTA promises the **Birth Card free**; everything else is the in-app unlock. Never promise "all 3 cards free" on web.

### 4. Calculator behavior (for the Pillar 1 tool pages, when built)
- Reveal Card 1 (Inner Child) live.
- Cards 2 & 3 shown face-down / blurred → "reveal free in the app" download CTA.
- Compatibility tools: show that a connection exists + its type; gate the actual result.

---

## Content architecture — 5 pillars, 20 pages

Status: ✅ full copy written · ⚪ outline only (Step 2) · ⚠️ coming-soon framing (no live tool)

### Pillar 1 — Tools & Calculators (Action intent)
| # | Keyword | Slug | Status |
|---|---------|------|--------|
| 2 | destiny cards calculator | `/destiny-cards-calculator` | ⚪ |
| 3 | find my birth card | `/find-my-birth-card` | ⚪ |
| 12 | cardology yearly spread | `/cardology-yearly-spread` | ⚪ ⚠️ coming-soon |
| 20 | destiny cards relationship chart | `/destiny-cards-relationship-chart` | ⚪ |

### Pillar 2 — Foundations & Beginner Education (Informational)
| # | Keyword | Slug | Status |
|---|---------|------|--------|
| 1 | what is cardology | `/what-is-cardology` | ✅ |
| 18 | how to read destiny cards | `/how-to-read-destiny-cards` | ✅ |
| 13 | 52 cards of destiny | `/52-cards-of-destiny` | ✅ |
| 7 | playing card astrology | `/playing-card-astrology` | ✅ |
| 17 | cardology vs astrology | `/cardology-vs-astrology` | ✅ |
| 11 | robert lee camp destiny cards | `/robert-lee-camp-destiny-cards` | ✅ |

### Pillar 3 — Card Meanings & Karma Cards (Informational / directory)
| # | Keyword | Slug | Status |
|---|---------|------|--------|
| 6 | destiny cards meaning | `/destiny-cards-meaning` | ✅ |
| 14 | birth card meanings | `/birth-card-meanings` | ✅ |
| 5 | what are my karma cards | `/what-are-karma-cards` | ✅ |
| 15 | challenging karma card | `/challenging-karma-card` | ✅ |
| 16 | supporting karma card | `/supporting-karma-card` | ✅ |

### Pillar 4 — Love & Compatibility (Exploratory)
| # | Keyword | Slug | Status |
|---|---------|------|--------|
| 4 | cardology compatibility | `/cardology-compatibility` | ⚪ |
| 9 | love cards compatibility | `/love-cards-compatibility` | ⚪ |

### Pillar 5 — Advanced Cardology (Niche/Technical)
| # | Keyword | Slug | Status |
|---|---------|------|--------|
| 8 | grand solar spread | `/grand-solar-spread` | ⚪ ⚠️ coming-soon |
| 10 | mystical family of seven | `/mystical-family-of-seven` | ⚪ |
| 19 | fixed cards cardology | `/fixed-cards-cardology` | ⚪ |

---

## Internal linking

`[bracketed links]` in the page bodies are internal-link placeholders — resolve each to the matching slug above. Every page links up to its pillar and across to 3–4 siblings, funneling toward the Pillar 1 tools and the app download.

## Not yet scoped
- **52 individual card-meaning pages** (Ace♥ … King♠ + Joker) — a natural Phase 2 programmatic-SEO wave, linked from `/destiny-cards-meaning`.
- **FAQ schema (JSON-LD)** — every page has an FAQ H2 ready to mark up.

## Open items to confirm
- #7 / #11 history & bio claims are deliberately hedged; firm up if you have verified facts.
- "12 years of Katie the Card Lady's practice" (from paywall copy) is used on some pages — confirm OK for marketing use.
