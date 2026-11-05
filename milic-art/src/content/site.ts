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
    role: "illustrator, designer, developer, writer and community manager",
    mapName: "Milicenda",
    mapNote: "A map of everything I make",
    footerNote: "All artwork belongs to milic_art. Please do not repost without credit.",
    builtNote: "Drawn and built little by little.",
  },

  /** Browser tab + link preview text. */
  meta: {
    title: "milic_art | Milicenda",
    description:
      "The portfolio of milic_art: illustration, design, code and writing, inside a drawn map you can explore.",
  },

  /* ------------------------------------------------------------- mascot */
  mascot: {
    name: "Clocky",
    role: "map guide",
    /** Clocky is a croc, not a person: these are sounds and little actions. */
    greeting: "*yawn* ...oh! Hi! Pick a place to explore.",
    /** Shown one at a time, gently rotating while nothing else is happening. */
    idle: [
      "Drag the map if you want a closer look.",
      "Every building opens a little page. Go on, poke one.",
      "*sniffs a sunflower*",
      "*chases a petal and misses*",
    ],
    /** Said when a visitor hovers or opens a place. */
    lines: {
      gallery: "*bounces* Finished drawings in here! Mind the paint.",
      commissions: "*sits next to the board* Closed for now, but I guard it.",
      about: "*points a paw* That's where milic lives. And naps.",
      contact: "*wags tail* Letters! I love letters.",
    },
    hint: "Shortcuts: press 1 to 4 for places, Esc closes a page.",
    /** Idea bank for later: sneeze when poked, hide face in paws when idle. */
    sneeze: "*achoo!*",
    asleep: "*zzz*",
  },

  /* ------------------------------------------------------------ the map */
  map: {
    /** Small scene-setting line under the wordmark. */
    intro: "Four places, one little world. Wander as much as you like.",
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
    intro: "My first finished pieces. More coming soon, and later this will be split by type of work.",
    /** Image paths live here. Empty string shows the drawn placeholder. */
    items: [
      {
        id: "halloween-oc",
        title: "Halloween OC",
        year: "2026",
        medium: "Digital, Krita",
        blurb: "An original character for a gachapon contest on Discord.",
        description: "Made for a Halloween gachapon contest in a Discord server.",
        image: "",
        variant: "lantern" as const,
      },
      {
        id: "minccino",
        title: "Minccino",
        year: "2026",
        medium: "Digital, Krita",
        blurb: "A Pokémon fanart.",
        description: "Fanart of Minccino.",
        image: "",
        variant: "windowsill" as const,
      },
    ],
  },

  /* -------------------------------------------------------- commissions */
  commissions: {
    heading: "Commissions",
    kicker: "Quest board",
    status: "Commissions are closed right now.",
    statusTag: "Closed",
    intro:
      "This is how commissions will work when I open them. Prices are a starting point and the exact numbers will be posted here soon.",
    payments: "No upfront payment. Payment details will be shared when the board opens.",
    turnaround: "It depends on the drawing. A sketch takes about 1 to 4 days.",
    rules: [
      "Big changes are not accepted once the lineart is done.",
      "I always ask you after the sketch, before going further.",
      "The finished drawing is delivered without a signature.",
      "From the finished sketch on, you can ask for a timelapse.",
      "You can also ask for the Krita file.",
      "Observations and notes are welcome at every step.",
      "Commissions are arranged through Discord.",
    ],
    prices: [
      { name: "Icon", price: "Soon", detail: "A small portrait for your profile.", time: "Depends on the drawing" },
      { name: "Bust", price: "Soon", detail: "Head and shoulders.", time: "Depends on the drawing" },
      { name: "Waist up", price: "Soon", detail: "From the waist up.", time: "Depends on the drawing" },
      { name: "Emotes and simple GIFs", price: "Soon", detail: "Small and expressive.", time: "Depends on the drawing" },
    ],
    notDrawing: ["Not sure? Ask me first and I'll tell you what I can do."],
    availability: "Closed for now. They open once the portfolio is ready.",
    ctaLabel: "Say hi on Discord",
    ctaNote: "You can write to me anytime, even when the board is closed.",
  },

  /* -------------------------------------------------------------- about */
  about: {
    heading: "About Me",
    kicker: "Little cottage",
    name: "milic",
    intro:
      "Hi, I'm milic! I illustrate, design, code, write, research and edit videos. I'm a community manager and a bit of a journalist: a little bit of everything. Here I share my art, with a soft spot for chibis.",
    paragraphs: [
      "I'm just getting started online. I share my art on X first, then on Instagram and other platforms, in English and Spanish.",
      "Right now I'm building this portfolio, which is why the quest board is closed. Commissions will open once it's ready, and the rules and prices will be posted here first.",
    ],
    draws: [
      "A little bit of everything. The Gallery shows more!",
    ],
    tools: [
      { name: "Krita", note: "where most drawings come to life" },
      { name: "Photopea", note: "quick edits and fixes" },
      { name: "Canva", note: "layouts and graphics" },
      { name: "Figma", note: "learning it to design my own world" },
      { name: "CapCut", note: "video editing" },
    ],
    facts: [
      "Loves dogs and penguins.",
      "Loves playing games.",
      "Still learning Figma, and this map is part of the practice.",
    ],
    /** Optional: "/art/me.png" */
    portrait: "",
    signOff: "Thanks for visiting! Clocky will walk you out.",
  },

  /* ------------------------------------------------------------ contact */
  contact: {
    heading: "Contact",
    kicker: "The mailbox",
    intro:
      "For commissions, collaboration or a friendly hello. I speak English and Spanish, and my hours are Argentina time.",
    /** Empty on purpose: the email block is hidden until you add one. */
    email: "",
    emailNote: "",
    links: [
      {
        id: "discord",
        label: "Discord",
        handle: "oshagang",
        url: "",
        note: "Fastest replies. Commissions are arranged here.",
      },
      {
        id: "instagram",
        label: "Instagram",
        handle: "@milic_art",
        url: "https://instagram.com/milic_art",
        note: "Finished pieces.",
      },
      {
        id: "x",
        label: "X",
        handle: "@milic_art",
        url: "https://x.com/milic_art",
        note: "Drawings and updates.",
      },
    ],
    responseTime: "I reply within 3 to 4 days at most, much faster on Discord.",
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
