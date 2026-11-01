# Design brief — milic_art portfolio

## Design read
For illustration clients, art directors and fellow artists who arrived from social media. The emotional register is cozy, curious, hand-made: a folded paper map you want to poke at.

## Concept spine
The site is a traveler's paper map of one artist's world. Four landmarks sit on a hand-drawn landscape, joined by dotted trails. Clicking a landmark opens a quest card, and a resident chibi guide (Pip) narrates the journey. The map IS the navigation and the brand: everything else is a page pinned onto it.

## Delivery tier
`editorial`, with the interactive map as the signature moment. Motion is motivated and local (glow, pop, sheet slide, page turn), never a scroll film.
Animation mode: non-animated — user picked Non-animated at intake (map explorer is the hero interaction).

## Locked palette
- Paper cream `#FBF3E4` (page ground)
- Warm beige `#EFE0C8` (terrain, ruled lines)
- Ink brown `#4B3A2A` (text, outlines)
- Soft orange `#E8874A` (single accent: trails, highlights, CTA)
- Moss green `#6E8B5A` (landscape mass, secondary brand)
- Sage `#A9BE8F` (soft hills, quiet fills)
- Chalk white `#FFFDF7` (sticker outlines, cards)
- Justification: these are the artist's own stated brand colors (cream, beige, soft orange, moss green), used as the whole identity; the palette is warm paper plus a single orange accent, so no competing accent enters the page.

## Locked type
- Display: `Baloo 2` (700/800) — rounded, friendly, sticker-like, holds short map labels without looking childish at small sizes.
- Body: `Nunito` (400/600/700) — rounded terminals, high legibility in panels and on phones.
- No serif anywhere: the brand is hand-drawn cute, not editorial heritage.

## Section plan
Single-screen world, not a scrolling page:
1. Map stage (full viewport, draggable and zoomable illustrated world, 4 landmark hotspots, trails)
2. Site chrome (wordmark on a paper tab, always-visible place menu, zoom pegs)
3. Mascot guide (screen-space companion with speech bubble)
2 and 3 overlay 1, so the layout families stay distinct: stage, chrome strip, speech card, quest-card sheet, full-screen image viewer.

Layout families: stage-with-overlays, paper notebook panel (desktop card / mobile bottom sheet), 2-column thumb grid, list rows with arrow, full-bleed lightbox. No consecutive repeats.

## Asset plan
All artwork is hand-authored SVG in the codebase so the artist can replace it:
- World: paper grain, hills, river, pine clusters, rocks, mushrooms, clouds, dotted trails, signposts
- Four landmark stickers: gallery house, quest board, artist cottage, mailbox
- Mascot: chibi guide with beret and paintbrush
- Six placeholder gallery scenes (one per grid slot), each swappable via a single `image` field
- `photo` fields for About portrait and OG cover, also swappable
- Favicon and social cover drawn in code from the same palette

## CTA inventory
Each with its own interaction identity, no shared button style:
- Landmark hotspot: hover glow plus rising label pill (map tab behaviour)
- Menu place tab: paper tab that lifts with a slight rotation
- Zoom pegs: round pegs that press down
- Gallery thumb: lift and tilt as if picked off a table
- Contact row: arrow slides, row tint warms
- Copy email stamp: stamp press, text flips to "Copied"
- Panel close: paper corner tab plus Esc hint
