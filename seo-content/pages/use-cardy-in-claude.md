---
slug: /use-cardy-in-claude
pillar: 1 — Tools & Calculators
target_keyword: cardology mcp
intent: Navigational (connect Cardy to an AI assistant)
meta_title: Use Cardy in Claude — Cardology Connector (MCP) | Cardy
meta_description: Add Cardy to Claude or any MCP-compatible AI assistant and ask about birth cards, card meanings, today's cards and compatibility. Free, no login.
semantic_terms: [MCP, Model Context Protocol, Claude connector, AI assistant, birth card, cardology, destiny cards, compatibility]
status: complete
---

# Use Cardy in Claude

**Cardy has a free connector for Claude and other AI assistants, so you can ask about your cards in plain language.** Add one link and your assistant reads cardology from Cardy itself — the same calculations and card copy as the app — instead of guessing from memory or mixing it up with tarot.

## Add Cardy to Claude

1. In Claude, open **Settings → Connectors** and choose **Add custom connector**.
2. Name it **Cardy** and paste this URL:

<pre class="connector-url"><code>https://app.cardy.today/api/mcp</code></pre>

Save it, then start a new chat and ask about your cards.

Using **Claude Code**? Run:

<pre class="connector-url"><code>claude mcp add --transport http cardy https://app.cardy.today/api/mcp</code></pre>

Any other assistant that supports remote MCP servers can use the same URL. If you don't see a connector option, your plan or app may not support custom connectors yet.

## What you can ask

| Ask something like… | What Cardy returns |
|---|---|
| "What's my birth card? I was born July 14." | Your Birth Card (Inner Child), its archetype and full meaning |
| "What does the Queen of Hearts mean in cardology?" | The card's archetype and full meaning |
| "What are today's cards?" | The three cards of the day, each with its theme and guidance |
| "What does my week look like?" | The cards of the day for the next seven days |
| "What's ruling me right now?" | The zodiac season and your card for its ruling planet, plus which 52-day planet period of your year you're in and your card for that planet |
| "How compatible are July 14 and March 20?" | Your connection's theme, both Birth Cards and the card they make together |
| "How does cardology work? What do Spades mean?" | Cardy's Codex: how the cards are calculated, the suits, numbers, planets, the year's seven periods, zodiac seasons, karma cards and a glossary |

Each answer links to the rest of the reading in Cardy.

> 🎯 **CTA:** Want to try it without an assistant first? [Find my birth card →]

## What's free and what's in the app

| In your assistant (free) | In the Cardy app |
|---|---|
| Your Birth Card and its full meaning | Your Chosen Purpose and Highest Self cards |
| Any card's archetype and full meaning | Relationship copy and your karma cards |
| Today's cards and the week ahead | Daily readings against your own cards, narrated stories and reflections |
| Your current zodiac season and year-phase ruling cards | Your full card path: every planet card |
| How cardology works, and the whole Codex | Your own cards placed in it: card path, karma and readings |
| A compatibility theme and your combined Birth Card | The full reading: every planetary link, the 9-card grid and readings by relationship type |

## Cardy connector FAQ

**Do I need a Cardy account?**
No. The connector works without signing in. You only need an account for the full readings in the app.

**Does Cardy store my birthday?**
No. The connector calculates your cards from the date your assistant sends and keeps nothing. Only the month and day are used.

**Which assistants does it work with?**
Claude, Claude Code and any AI assistant that can connect to a remote MCP server.

> 🎯 **CLOSING CTA:** Your full readings, daily cards and compatibility are waiting in Cardy.

*Related: [What Is Cardology?] · [Destiny Cards Calculator] · [Cardology Compatibility] · [Birth Card Meanings]*
