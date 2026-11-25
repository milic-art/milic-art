/**
 * ============================================================
 *  milic_art. TODO el contenido del sitio vive en este archivo.
 * ============================================================
 *
 *  Todo lo que está entre [corchetes] es un lugar para completar.
 *  Los textos que ya son reales (Discord, redes, reglas, herramientas)
 *  no tienen corchetes.
 *
 *  Para cambiar un dibujo: ponelo en public/art/ y escribí
 *  image: "/art/mi-dibujo.png". Si queda "" se ve el dibujo de relleno.
 */

export type PlaceId = "periodismo" | "diseno" | "dibujo" | "programacion" | "casita";

/** Un proyecto o caso de una disciplina. Todo entre [corchetes] se completa después. */
export type Project = {
  title: string;
  kind: string;
  fields: { label: string; value: string }[];
  link: string;
};

export type Discipline = {
  heading: string;
  kicker: string;
  intro: string;
  does: string[];
  forWhom: string;
  projectsLabel: string;
  projects: Project[];
  tools: string[];
  extraLabel: string;
  extra: string[];
  pricesLabel: string;
  prices: { name: string; price: string; detail: string }[];
  testimonialsLabel: string;
  testimonials: { quote: string; author: string }[];
  /** Solo para Redacción: diario o newsletter. */
  journal?: {
    label: string;
    intro: string;
    items: { title: string; date: string; summary: string }[];
    subscribe: string;
  };
  ctaLabel: string;
  ctaNote: string;
  /** Mensaje listo para copiar desde Contacto. */
  messageStarter: string;
};

const samplePrices = (a: string, b: string, c: string) => [
  { name: a, price: "[Precio base]", detail: "[Qué incluye]" },
  { name: b, price: "[Precio base]", detail: "[Qué incluye]" },
  { name: c, price: "[Precio base]", detail: "[Qué incluye]" },
];

const sampleTestimonials = [
  { quote: "[Frase de ejemplo de una persona o marca con la que trabajaste.]", author: "[Nombre, cargo o cuenta]" },
  { quote: "[Otra frase de ejemplo.]", author: "[Nombre, cargo o cuenta]" },
];

const pendingProject = (kind: string, fields: string[]): Project => ({
  title: "[Título]",
  kind: `[${kind}]`,
  fields: fields.map((label) => ({ label, value: `[${label}]` })),
  link: "",
});

export const site = {
  brand: {
    wordmark: "milic_art",
    owner: "Mili",
    role: "periodista investigadora, diseñadora, dibujante y programadora",
    mapName: "Milicenda",
    mapNote: "El mapa de todo lo que hago",
    footerNote: "Todas las obras pertenecen a milic_art. Por favor, no las repostees sin dar crédito.",
    builtNote: "Dibujado y armado de a poquito.",
  },

  meta: {
    title: "milic_art | Periodismo, diseño, dibujo y programación",
    description:
      "Portfolio de milic_art: periodismo de investigación, diseño y redes sociales, dibujo, papelería y programación de webs y juegos.",
  },

  mascot: {
    name: "Clocky",
    role: "guía del mapa",
    greeting: "¡Hola! Tocá un edificio y te llevo.",
    idle: [
      "Arrastrá el mapa para mirar más de cerca.",
      "Cada edificio es un trabajo distinto. Tocá el que te interese.",
      "Si querés ir directo a algo, probá el botón Ver como lista.",
      "¿Querés escribirme? El buzón está en la Casita.",
    ],
    lines: {
      periodismo: "Acá se investiga y se escribe. ¡Silencio, por favor!",
      diseno: "Acá se diseñan piezas y se cuidan las redes.",
      dibujo: "¡Dibujos terminados y encargos! Cuidado con la pintura.",
      programacion: "Acá se arman webs, juegos y pantallas.",
      casita: "Ahí vive milic. Y ahí está el buzón: ¡me encantan las cartas!",
    },
    hint: "Atajos: tocá del 1 al 5 para abrir lugares, Esc cierra la página.",
    poke: "Tocar a Clocky",
  },

  map: {
    intro: "Cinco lugares, un mundito. Recorrelo como quieras.",
    dragHint: "Arrastrá para recorrer",
    zoomHint: "Scroll o pellizco para acercar",
    /** x, y: lugar en pantallas anchas. px, py: lugar en pantallas altas (celular). */
    places: [
      { id: "periodismo" as PlaceId, name: "Redacción", short: "Redacción", blurb: "Periodismo e investigación", x: 20, y: 30, px: 57, py: 22, image: "" },
      { id: "diseno" as PlaceId, name: "Estudio", short: "Estudio", blurb: "Diseño y redes sociales", x: 50, y: 24, px: 43, py: 36, image: "" },
      { id: "dibujo" as PlaceId, name: "Taller de dibujo", short: "Dibujo", blurb: "Galería, encargos y papelería", x: 80, y: 30, px: 57, py: 50, image: "" },
      { id: "programacion" as PlaceId, name: "Laboratorio", short: "Lab", blurb: "Webs, juegos y UI/UX", x: 28, y: 74, px: 43, py: 64, image: "" },
      { id: "casita" as PlaceId, name: "Casita", short: "Casita", blurb: "Sobre mí y contacto", x: 72, y: 74, px: 57, py: 78, image: "" },
    ],
  },

  /* ---------------------------------------------------------- periodismo */
  periodismo: {
    heading: "Redacción",
    kicker: "Periodismo e investigación",
    intro:
      "Soy comunicadora y periodista investigadora. Acá están mis notas e investigaciones. [Temas que cubro y cómo trabajo.]",
    does: [
      "Investigo y verifico información sobre [temas o áreas].",
      "Escribo notas y reportajes para [medios o formatos].",
      "Redacto textos de comunicación: [tipo de textos o contenidos].",
    ],
    forWhom: "[Medios, organizaciones o proyectos para los que escribo.]",
    projectsLabel: "Notas e investigaciones",
    projects: [
      pendingProject("nota o investigación", ["Dónde se publicó", "Fecha", "De qué trata", "Qué descubrió o cambió"]),
      pendingProject("nota o investigación", ["Dónde se publicó", "Fecha", "De qué trata", "Qué descubrió o cambió"]),
      pendingProject("nota o investigación", ["Dónde se publicó", "Fecha", "De qué trata", "Qué descubrió o cambió"]),
    ] as Project[],
    tools: ["[Herramientas de investigación]", "[Herramientas de edición]"],
    extraLabel: "Formación y reconocimientos",
    extra: ["[Estudios]", "[Premios, becas o menciones]", "[Medios donde publiqué]"],
    pricesLabel: "Colaboraciones y precios base",
    prices: samplePrices("[Nota o artículo]", "[Investigación a pedido]", "[Asesoría de comunicación]"),
    testimonialsLabel: "Qué dicen",
    testimonials: sampleTestimonials,
    journal: {
      label: "Diario",
      intro: "[Una frase sobre qué vas a contar acá: novedades, procesos, lo que estás investigando.]",
      items: [
        { title: "[Título de la entrada]", date: "[Fecha]", summary: "[Resumen de una línea]" },
        { title: "[Título de la entrada]", date: "[Fecha]", summary: "[Resumen de una línea]" },
      ],
      subscribe: "[Enlace para suscribirte al newsletter]",
    },
    ctaLabel: "Escribime por una nota o investigación",
    ctaNote: "Contame de qué se trata y te respondo.",
    messageStarter: "Hola Mili, te escribo por una nota o investigación periodística: [contame de qué se trata].",
  } satisfies Discipline,

  /* -------------------------------------------------------------- diseño */
  diseno: {
    heading: "Estudio",
    kicker: "Diseño y redes sociales",
    intro:
      "Diseño piezas gráficas y gestiono redes sociales como community manager. [Estilo y tipo de marcas con las que trabajo.]",
    does: [
      "Diseño piezas para redes: [posteos, historias, banners].",
      "Gestiono cuentas: [planificación, publicación, respuesta a la comunidad].",
      "Armo identidades visuales: [logos, paletas, guías].",
      "Edito videos cortos: [reels, clips].",
    ],
    forWhom: "[Marcas, emprendimientos u organizaciones con las que trabajo.]",
    projectsLabel: "Casos de redes y diseño",
    projects: [
      pendingProject("caso", ["Cliente o cuenta", "Objetivo", "Qué hice", "Resultado"]),
      pendingProject("caso", ["Cliente o cuenta", "Objetivo", "Qué hice", "Resultado"]),
      pendingProject("caso", ["Cliente o cuenta", "Objetivo", "Qué hice", "Resultado"]),
    ] as Project[],
    tools: ["Canva", "Figma", "Photopea", "CapCut"],
    extraLabel: "Cómo trabajo",
    extra: ["[Paso 1: diagnóstico de la cuenta]", "[Paso 2: propuesta]", "[Paso 3: producción y seguimiento]"],
    pricesLabel: "Servicios y precios base",
    prices: samplePrices("[Pack de piezas para redes]", "[Gestión mensual de redes]", "[Identidad visual]"),
    testimonialsLabel: "Qué dicen",
    testimonials: sampleTestimonials,
    ctaLabel: "Escribime por diseño o redes",
    ctaNote: "Contame qué cuenta o marca tenés y qué necesitás.",
    messageStarter: "Hola Mili, te escribo por diseño o redes sociales: [contame qué cuenta o marca tenés y qué necesitás].",
  } satisfies Discipline,

  /* -------------------------------------------------------- programación */
  programacion: {
    heading: "Laboratorio",
    kicker: "Webs, juegos y UI/UX",
    intro:
      "Programo webs y webjuegos y diseño interfaces (UI/UX). Esta página es uno de mis proyectos. [Qué me gusta construir.]",
    does: [
      "Programo webs: [portfolios, sitios para emprendimientos].",
      "Desarrollo webjuegos: [tipos de juegos o prototipos].",
      "Diseño interfaces UI/UX: [pantallas, flujos, prototipos en Figma].",
      "Armo kits para crear páginas: un zip con el código y una guía paso a paso, para personalizar sin programar.",
    ],
    forWhom: "[Proyectos propios, clientes o game jams para los que programo.]",
    projectsLabel: "Proyectos",
    projects: [
      {
        title: "Milicenda (esta web)",
        kind: "Web con mapa explorable",
        fields: [
          { label: "Qué es", value: "Mi portfolio, dibujado como un mapa para recorrer." },
          { label: "Hecho con", value: "React, Vite, TypeScript y Tailwind." },
          { label: "Mi rol", value: "[Mi rol: diseño, dibujo y código]" },
          { label: "Qué aprendí", value: "[Qué aprendí y qué cambiaría]" },
        ],
        link: "",
      },
      {
        title: "Kit para armar páginas (zip)",
        kind: "Producto digital · próximamente",
        fields: [
          { label: "Qué incluye", value: "Código listo, un bloque de ajustes para editar, looks prediseñados y una guía en PDF." },
          { label: "Para quién", value: "Personas que quieren una página linda sin escribir código." },
          { label: "Precio", value: "[Precio o \"pagá lo que quieras\"]" },
          { label: "Disponibilidad", value: "[Fecha de salida]" },
        ],
        link: "",
      },
      pendingProject("webjuego o prototipo", ["Rol", "Herramientas", "Problema que resuelve", "Resultado"]),
      pendingProject("proyecto de UI/UX", ["Rol", "Herramientas", "Problema que resuelve", "Resultado"]),
    ] as Project[],
    tools: ["Figma", "React", "TypeScript", "[Motor de juegos]"],
    extraLabel: "Cómo trabajo un proyecto",
    extra: ["[Paso 1: idea y alcance]", "[Paso 2: prototipo]", "[Paso 3: prueba con gente real]"],
    pricesLabel: "Servicios y precios base",
    prices: samplePrices("[Web simple]", "[Prototipo de UI/UX]", "[Kit para armar páginas (zip)]"),
    testimonialsLabel: "Qué dicen",
    testimonials: sampleTestimonials,
    ctaLabel: "Escribime por una web o un juego",
    ctaNote: "Contame la idea, aunque todavía esté verde.",
    messageStarter: "Hola Mili, te escribo por una web, un juego o una interfaz: [contame la idea].",
  } satisfies Discipline,

  /* ------------------------------------------------------------- dibujo */
  gallery: {
    heading: "Galería",
    kicker: "Dibujos terminados",
    intro: "Mis primeras obras terminadas. Van a sumarse más, separadas por tipo de trabajo.",
    items: [
      {
        id: "halloween-oc",
        title: "OC de Halloween",
        year: "2026",
        medium: "Digital, Krita",
        blurb: "Personaje original de Halloween.",
        description: "Hecho para un concurso de gachapon de Halloween en un servidor de Discord.",
        image: "",
        variant: "lantern" as const,
      },
      {
        id: "minccino",
        title: "Minccino",
        year: "2026",
        medium: "Digital, Krita",
        blurb: "Fanart de Pokémon.",
        description: "Fanart de Minccino.",
        image: "",
        variant: "windowsill" as const,
      },
    ],
  },

  commissions: {
    heading: "Encargos",
    kicker: "Tablón de misiones",
    status: "Los encargos están cerrados por ahora.",
    statusTag: "Cerrado",
    intro:
      "Así van a funcionar los encargos cuando los abra. Los precios son una base. Los valores exactos se publican acá.",
    payments: "No pido pago por adelantado. Los datos de pago se comparten cuando abra el tablón.",
    turnaround: "Depende del dibujo. Un boceto tarda de 1 a 4 días.",
    rules: [
      "Después del lineart no acepto cambios grandes.",
      "Te consulto después del boceto, antes de seguir.",
      "Entrego el dibujo final sin firma.",
      "Con el boceto terminado podés pedir un timelapse.",
      "También podés pedir el archivo de Krita.",
      "Podés dejar observaciones en cada paso.",
      "Acordamos los encargos por Discord.",
    ],
    prices: [
      { name: "Ícono", price: "[Precio]", detail: "Un retrato chico para tu perfil.", time: "[Tiempo]" },
      { name: "Busto", price: "[Precio]", detail: "Cabeza y hombros.", time: "[Tiempo]" },
      { name: "Medio cuerpo", price: "[Precio]", detail: "De la cintura para arriba.", time: "[Tiempo]" },
      { name: "Emotes y GIFs simples", price: "[Precio]", detail: "Chiquitos y expresivos.", time: "[Tiempo]" },
    ],
    notDrawing: ["[Qué no dibujo]"],
    availability: "Cerrado por ahora. Abro cuando el portfolio esté listo.",
    ctaLabel: "Saludame por Discord",
    ctaNote: "Podés escribirme aunque el tablón esté cerrado.",
    testimonialsLabel: "Qué dicen",
    testimonials: sampleTestimonials,
    tabGallery: "Galería",
    tabCommissions: "Encargos",
    tabStationery: "Papelería",
  },

  /* ----------------------------------------------------------- papelería */
  stationery: {
    heading: "Papelería",
    kicker: "Cosas para el escritorio",
    intro: "Hago papelería con mis ilustraciones. [Cómo se fabrica y cómo se compra.]",
    items: [
      { name: "Washi tapes", detail: "[Diseños, medidas y cantidad por rollo]", price: "[Precio]" },
      { name: "Stickers", detail: "[Tamaños y acabado, por ejemplo mate o brillante]", price: "[Precio]" },
      { name: "Sticker sheets", detail: "[Qué diseños trae cada hoja]", price: "[Precio]" },
      { name: "Memo pads", detail: "[Tamaño y cantidad de hojas]", price: "[Precio]" },
      { name: "Prints", detail: "[Tamaños y papel]", price: "[Precio]" },
    ],
    availability: "[Disponibilidad: dónde y cuándo se pueden comprar]",
    ctaLabel: "Escribime por papelería",
    ctaNote: "Preguntame por stock, envíos o pedidos.",
    messageStarter: "Hola Mili, te escribo por tu papelería (washi tapes, stickers, memo pads, sticker sheets o prints): [contame qué te interesa].",
  },

  /* -------------------------------------------------------------- about */
  about: {
    heading: "Sobre mí",
    kicker: "Casita",
    name: "milic",
    intro:
      "Soy milic: comunicadora y periodista investigadora, diseñadora, community manager, dibujante y programadora. También escribo, edito videos y hago papelería: washi tapes, stickers, memo pads, sticker sheets y prints. Dibujo con debilidad por los chibis.",
    paragraphs: [
      "Comparto mi arte primero en X, y después en Instagram y otras plataformas. Publico en español y en inglés.",
      "Estoy armando este portfolio. Por eso los encargos están cerrados. Cuando esté listo, los abro y publico las reglas y los precios.",
    ],
    nowLabel: "Novedades",
    now: ["[Fecha]: [en qué estoy trabajando]", "[Fecha]: [qué estoy aprendiendo]"],
    tools: [
      { name: "Krita", note: "dibujo la mayoría de mis obras" },
      { name: "Photopea", note: "ediciones y arreglos rápidos" },
      { name: "Canva", note: "diseño de piezas y gráficos" },
      { name: "Figma", note: "estoy aprendiendo a diseñar interfaces" },
      { name: "CapCut", note: "edición de video" },
    ],
    facts: [
      "Me encantan los perros y los pingüinos.",
      "Me encanta jugar.",
      "Sigo aprendiendo Figma. Este mapa es parte de la práctica.",
    ],
    portrait: "",
    signOff: "Gracias por visitar. Clocky te acompaña a la salida.",
  },

  /* ------------------------------------------------------------ contact */
  contact: {
    heading: "Contacto",
    kicker: "El buzón",
    intro:
      "Escribime por encargos, colaboraciones o para saludar. Hablo español e inglés. Mi horario es el de Argentina.",
    pickLabel: "¿Qué necesitás?",
    pickHint: "Elegí una opción. Armo un mensaje que podés copiar y enviarme por Discord.",
    messageLabel: "Tu mensaje",
    otherMessage: "Hola Mili, te escribo por: [contame qué necesitás].",
    email: "",
    emailNote: "",
    links: [
      {
        id: "discord",
        label: "Discord",
        handle: "oshagang",
        url: "",
        note: "Es la vía más rápida. Acá acordamos los encargos.",
      },
      {
        id: "instagram",
        label: "Instagram",
        handle: "@milic_art",
        url: "https://instagram.com/milic_art",
        note: "Piezas terminadas y papelería.",
      },
      {
        id: "x",
        label: "X",
        handle: "@milic_art",
        url: "https://x.com/milic_art",
        note: "Dibujos y novedades.",
      },
      {
        id: "cv",
        label: "CV y kit de prensa",
        handle: "[Enlace]",
        url: "",
        note: "[Currículum y presentación para medios y marcas.]",
      },
    ],
    responseTime: "Respondo en 3 a 4 días como máximo. Por Discord respondo más rápido.",
    copyLabel: "Copiar mensaje",
    copiedLabel: "¡Copiado!",
    copyFail: "No pude copiar. Seleccioná el texto y copialo a mano.",
  },

  labels: {
    menu: "Lugares",
    openPlace: "Abrir",
    close: "Cerrar",
    closeHint: "Esc",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    resetView: "Reiniciar vista",
    previous: "Anterior",
    next: "Siguiente",
    viewPiece: "Ver en grande",
    prices: "Precios",
    rules: "Cómo funciona",
    availability: "Disponibilidad",
    notDrawing: "Lo que no dibujo",
    tools: "Herramientas",
    littleFacts: "Datos chiquitos",
    whatIDo: "Qué hago",
    forWhom: "Para quién",
    pending: "Falta completar",
    visit: "Abrir proyecto",
    basePrices: "Precio base",
    list: "Ver como lista",
    map: "Ver mapa",
    write: "Escribime",
    tabAbout: "Sobre mí",
    tabContact: "Contacto",
    prevPlace: "Lugar anterior",
    nextPlace: "Lugar siguiente",
  },
};

export type SiteContent = typeof site;
