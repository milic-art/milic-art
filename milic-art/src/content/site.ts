/**
 * ============================================================
 *  milic_art. ALL site content lives in this one file.
 * ============================================================
 *
 *  You can edit anything here without touching the rest of the code.
 *
 *  HOW TO SWAP ARTWORK
 *  1. Drop your drawing into:  public/art/   (e.g. public/art/my-piece.png)
 *  2. Point to it with a leading slash:  image: "/art/my-piece.png"
 *  3. Leave `image` empty ("") to keep the built-in drawn placeholder.
 *
 *  Landmarks on the map work the same way: give a place an `image` path and
 *  your drawing replaces the built-in sticker. `x` and `y` are where it sits,
 *  as a percentage of the map (0 is left / top, 100 is right / bottom).
 */

/** A place on the map. `id` is used by the menu and the panels. */
export type PlaceId = "gallery" | "commissions" | "about" | "contact";

export const site = {
  /* ---------------------------------------------------------- brand + page */
  brand: {
    wordmark: "milic_art",
    owner: "Mili",
    role: "digital artist and illustrator",
    mapName: "The Artlands",
    mapNote: "A map of everything I make",
    footerNote: "All artwork belongs to milic_art. Please do not repost without credit.",
    builtNote: "Placeholder art is drawn in code so you can swap in your own drawings anytime.",
  },

  /** Browser tab + link preview text. */
  meta: {
    title: "milic_art | an illustrated little world",
    description:
      "The portfolio of milic_art: cozy illustrations, chibi characters and sticker sets. Explore a drawn map with a gallery, commission info, an about page and contact links.",
  },

  /* ------------------------------------------------------------- mascot */
  mascot: {
    name: "Pip",
    role: "map guide",
    greeting: "Welcome, traveler! Pick a place to explore.",
    /** Shown one at a time, gently rotating while nothing else is happening. */
    idle: [
      "Drag the map if you want a closer look.",
      "Every landmark opens a little page. Go on, poke one.",
      "I painted the river twice. Do not tell anyone.",
      "Snacks are not on the map. A design mistake, honestly.",
    ],
    /** Said when a visitor hovers or opens a place. */
    lines: {
      gallery:
        "The gallery tent holds my finished drawings. Mind the wet paint.",
      commissions:
        "The quest board is quiet right now. I still dust it every morning.",
      about:
        "That round cottage is where I draw. Mostly at night, always with tea.",
      contact:
        "The mailbox is my favourite spot. Letters always find their way.",
    },
    hint: "Shortcuts: press 1 to 4 for places, Esc closes a page.",
  },

  /* ------------------------------------------------------------ the map */
  map: {
    /** Small scene-setting line under the wordmark. */
    intro: "Four places, one paper world. Wander as much as you like.",
    dragHint: "Drag to wander",
    zoomHint: "Scroll or pinch to zoom",
    /** Dotted trail colours come from the palette in styles.css. */
    places: [
      {
        id: "gallery" as PlaceId,
        name: "Gallery",
        blurb: "Finished illustrations and work examples",
        x: 22,
        y: 36,
        /** Optional: "/art/my-gallery-landmark.png" */
        image: "",
      },
      {
        id: "commissions" as PlaceId,
        name: "Commissions",
        blurb: "Rules, prices and availability",
        x: 73,
        y: 27,
        image: "",
      },
      {
        id: "about" as PlaceId,
        name: "About Me",
        blurb: "Who I am, what I draw, my tools",
        x: 30,
        y: 72,
        image: "",
      },
      {
        id: "contact" as PlaceId,
        name: "Contact",
        blurb: "Social media, Discord and email",
        x: 76,
        y: 70,
        image: "",
      },
    ],
  },

  /* ------------------------------------------------------------ gallery */
  gallery: {
    heading: "The Gallery",
    kicker: "Finished drawings",
    intro:
      "Cozy scenes, chibi characters and sticker sheets. These six are placeholders so the walls are never empty, and every one can be replaced with your own piece.",
    /** Image paths live here. Empty string shows the drawn placeholder. */
    items: [
      {
        id: "windowsill",
        title: "Rainy Windowsill",
        year: "2025",
        medium: "Digital, Procreate",
        blurb: "A cat, three plants and one very slow afternoon.",
        description:
          "Study of soft window light, warm dust and a cat who refuses to move. Painted with a single textured brush and a lot of erasing.",
        image: "",
        variant: "windowsill" as const,
      },
      {
        id: "dragon-tea",
        title: "Tea With A Dragon",
        year: "2025",
        medium: "Digital, Photoshop",
        blurb: "A very polite dragon and a very small friend.",
        description:
          "Part of a storybook pitch about a forest that hands out tea to anyone who asks nicely.",
        image: "",
        variant: "dragonTea" as const,
      },
      {
        id: "lantern-path",
        title: "The Lantern Path",
        year: "2024",
        medium: "Digital, Clip Studio Paint",
        blurb: "Mushrooms taller than houses, one brave lantern.",
        description:
          "Night scene experiment: everything lit by one small orange light, nothing else allowed to glow.",
        image: "",
        variant: "lantern" as const,
      },
      {
        id: "owl-shop",
        title: "The Owl's Bookshop",
        year: "2025",
        medium: "Digital, Procreate",
        blurb: "Second hand books, first rate naps.",
        description:
          "A shop interior built from three shapes: arch, shelf, owl. The whole piece is about finding the coziest possible silhouette.",
        image: "",
        variant: "owlShop" as const,
      },
      {
        id: "campfire",
        title: "Pack Light, Dream Big",
        year: "2024",
        medium: "Digital, Photoshop",
        blurb: "Everything a small traveler needs, plus tea.",
        description:
          "Campfire piece from a sticker set about adventurers who always remember the kettle first.",
        image: "",
        variant: "campfire" as const,
      },
      {
        id: "frog-rain",
        title: "Frog Weather",
        year: "2026",
        medium: "Digital, Procreate",
        blurb: "A frog in a raincoat, entirely unbothered.",
        description:
          "Character warm up that turned into a postcard. The rain is drawn as tiny dashes, one layer, no blur.",
        image: "",
        variant: "frog" as const,
      },
    ],
  },

  /* -------------------------------------------------------- commissions */
  commissions: {
    heading: "Commissions",
    kicker: "Quest board",
    /** The status message visitors must see. */
    status: "No active quests right now. I'm working on my portfolio. Come back soon!",
    statusTag: "Quests closed",
    intro:
      "Here is how commissions usually work when the board is open. Read the rules first, then send a letter with your idea, your references and roughly when you need it.",
    payments: "Payment is half up front, half on delivery. Paypal or Ko-fi, invoiced in USD.",
    turnaround: "Small pieces: 3 to 5 days. Full illustrations: 1 to 2 weeks. Bigger packs: up to 3 weeks.",
    rules: [
      "One or two characters per piece, pets count as characters.",
      "Bring references or a clear written description. Both is best.",
      "Two rounds of small changes are included. Big re-draws start a new quote.",
      "Personal use, gifts and small streams are always fine.",
      "Commercial use, merch or book covers: tell me first and we adjust the price.",
      "I keep the right to post the finished piece in my portfolio unless you ask me not to.",
    ],
    prices: [
      {
        name: "Sketch portrait",
        price: "from $40",
        detail: "One character, waist up, clean lines, simple colour wash.",
        time: "3 to 5 days",
      },
      {
        name: "Full illustration",
        price: "from $120",
        detail: "One or two characters, painted background, one scene.",
        time: "1 to 2 weeks",
      },
      {
        name: "Character pack",
        price: "from $180",
        detail: "Reference sheet, three expressions and one sticker pose.",
        time: "2 to 3 weeks",
      },
    ],
    notDrawing: ["Heavy gore", "Realistic mecha", "Fetish art", "Anything hateful"],
    availability: "Books are closed. Next opening is planned for early next year.",
    ctaLabel: "Send a letter",
    ctaNote: "The mailbox is always open, even when the quest board is not.",
  },

  /* -------------------------------------------------------------- about */
  about: {
    heading: "About Me",
    kicker: "Little cottage",
    name: "Mili",
    intro:
      "I draw small worlds. Cozy rooms, chibi travelers, sticker sheets and the occasional polite dragon. If a drawing can make someone want to crawl inside it and take a nap, I consider it finished.",
    paragraphs: [
      "I have been posting art online since school, mostly on X and Instagram, and the best part has always been the people who collect a character and come back to see what they do next.",
      "Right now I am building a proper portfolio, which is why the quest board is resting. When it opens again I will take a small number of pieces at a time so every one gets the attention it needs.",
    ],
    draws: [
      "Cozy scenes and tiny rooms",
      "Chibi characters and mascots",
      "Sticker sets and emotes",
      "Storybook spreads",
      "Simple creature design",
    ],
    tools: [
      { name: "Procreate", note: "almost everything starts here" },
      { name: "Photoshop", note: "colour and last pass fixes" },
      { name: "Clip Studio Paint", note: "line art and perspective" },
      { name: "A very old pencil", note: "thumbnails, always on paper" },
    ],
    facts: [
      "Draws at night, with tea, always the same mug.",
      "Keeps a folder of unused moss textures.",
      "Names every cat in every drawing.",
    ],
    /** Optional: "/art/me.png" */
    portrait: "",
    signOff: "Thanks for wandering through. Pip will see you out.",
  },

  /* ------------------------------------------------------------ contact */
  contact: {
    heading: "Contact",
    kicker: "The mailbox",
    intro:
      "For commissions, collaboration or a friendly hello. I answer messages a few times a week, usually slower during deadlines.",
    email: "hello@milic.art",
    emailNote: "Best for commissions and anything with files attached.",
    links: [
      {
        id: "x",
        label: "X",
        handle: "@milic_art",
        url: "https://x.com/milic_art",
        note: "Sketch dumps and work in progress.",
      },
      {
        id: "discord",
        label: "Discord",
        handle: "milic_art",
        url: "",
        note: "Fastest for quick questions. Ask for the studio invite.",
      },
      {
        id: "instagram",
        label: "Instagram",
        handle: "@milic.art",
        url: "https://instagram.com/milic.art",
        note: "Finished pieces, once they are done.",
      },
    ],
    responseTime: "Usually replies in 2 to 4 days.",
    copyLabel: "Copy email",
    copiedLabel: "Copied",
  },

  /* -------------------------------------------------------------- labels */
  labels: {
    menu: "Places",
    openPlace: "Open",
    close: "Close",
    closeHint: "Esc",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetView: "Reset view",
    previous: "Previous",
    next: "Next",
    viewPiece: "Open full size",
    prices: "Prices",
    rules: "How it works",
    availability: "Availability",
    notDrawing: "Not drawn here",
    whatIDraw: "What I draw",
    tools: "Tools",
    littleFacts: "Small facts",
    selected: "Selected",
  },
};

export type SiteContent = typeof site;
