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

export type PlaceId =
  | "periodismo"
  | "diseno"
  | "dibujo"
  | "programacion"
  | "about"
  | "contact";

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
  ctaLabel: string;
  ctaNote: string;
  /** Mensaje listo para copiar desde Contacto. */
  messageStarter: string;
};

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
    title: "milic_art | Milicenda",
    description:
      "Portfolio de milic_art: periodismo de investigación, diseño y redes, dibujo y encargos, programación de webs, juegos y UI/UX. Dentro de un mapa dibujado para explorar.",
  },

  mascot: {
    name: "Clocky",
    role: "guía del mapa",
    greeting: "*bostezo* ...¡ah! ¡Hola! Elegí un lugar para explorar.",
    idle: [
      "Arrastrá el mapa para mirar más de cerca.",
      "Cada edificio es un trabajo distinto. Tocá el que te interese.",
      "*huele un girasol*",
      "*persigue un pétalo y no lo agarra*",
    ],
    lines: {
      periodismo: "*se pone anteojitos* Acá se investiga y se escribe. ¡Silencio, por favor!",
      diseno: "*mira las paletas de colores* Acá se diseñan piezas y se cuidan las redes.",
      dibujo: "*rebota* ¡Dibujos terminados y encargos! Cuidado con la pintura.",
      programacion: "*mueve la cola* Acá se arman webs, juegos y pantallas. A veces explotan, pero poquito.",
      about: "*señala con la patita* Ahí vive milic. Y duerme siestas.",
      contact: "*mueve la cola* ¡Cartas! ¡Me encantan las cartas!",
    },
    hint: "Atajos: tocá del 1 al 6 para abrir lugares, Esc cierra la página.",
    sneeze: "*¡achís!*",
    asleep: "*zzz*",
    poke: "Tocar a Clocky",
  },

  map: {
    intro: "Seis lugares, un mundito. Recorrelo como quieras.",
    dragHint: "Arrastrá para recorrer",
    zoomHint: "Scroll o pellizco para acercar",
    places: [
      {
        id: "periodismo" as PlaceId,
        name: "Redacción",
        short: "Redacción",
        blurb: "Periodismo e investigación",
        x: 20,
        y: 30,
        image: "",
      },
      {
        id: "diseno" as PlaceId,
        name: "Estudio",
        short: "Estudio",
        blurb: "Diseño y redes sociales",
        x: 50,
        y: 22,
        image: "",
      },
      {
        id: "dibujo" as PlaceId,
        name: "Taller de dibujo",
        short: "Dibujo",
        blurb: "Galería y encargos",
        x: 80,
        y: 30,
        image: "",
      },
      {
        id: "programacion" as PlaceId,
        name: "Laboratorio",
        short: "Lab",
        blurb: "Webs, juegos y UI/UX",
        x: 20,
        y: 72,
        image: "",
      },
      {
        id: "about" as PlaceId,
        name: "Sobre mí",
        short: "Yo",
        blurb: "Quién soy y qué herramientas uso",
        x: 50,
        y: 76,
        image: "",
      },
      {
        id: "contact" as PlaceId,
        name: "Contacto",
        short: "Contacto",
        blurb: "Redes, Discord y mail",
        x: 80,
        y: 72,
        image: "",
      },
    ],
  },

  /* ---------------------------------------------------------- periodismo */
  periodismo: {
    heading: "Redacción",
    kicker: "Periodismo e investigación",
    intro:
      "Soy comunicadora y periodista investigadora. Acá van mis notas e investigaciones. [Una o dos frases sobre qué temas cubro y cómo trabajo.]",
    does: [
      "Investigación periodística: [temas o áreas].",
      "Notas y reportajes: [medios o formatos].",
      "Comunicación: [qué tipo de textos o contenidos].",
    ],
    forWhom: "[Para quién escribo: medios, organizaciones, proyectos propios.]",
    projectsLabel: "Notas e investigaciones",
    projects: [
      pendingProject("nota o investigación", ["Dónde se publicó", "Fecha", "De qué trata", "Qué descubrió o cambió"]),
      pendingProject("nota o investigación", ["Dónde se publicó", "Fecha", "De qué trata", "Qué descubrió o cambió"]),
      pendingProject("nota o investigación", ["Dónde se publicó", "Fecha", "De qué trata", "Qué descubrió o cambió"]),
    ] as Project[],
    tools: ["[Herramientas de investigación]", "[Herramientas de edición]"],
    extraLabel: "Formación y reconocimientos",
    extra: ["[Estudios]", "[Premios, becas o menciones]", "[Medios donde publiqué]"],
    ctaLabel: "Escribime por una nota o investigación",
    ctaNote: "Contame de qué se trata y te respondo.",
    messageStarter: "Hola Mili, te escribo por una nota o investigación periodística: [contame de qué se trata].",
  } satisfies Discipline,

  /* -------------------------------------------------------------- diseño */
  diseno: {
    heading: "Estudio",
    kicker: "Diseño y redes sociales",
    intro:
      "Diseño piezas y me ocupo de las redes sociales como community manager. [Una frase sobre el estilo o el tipo de marcas con las que trabajo.]",
    does: [
      "Diseño de piezas para redes: [posteos, historias, banners].",
      "Community management: [planificación, publicación, respuesta a la comunidad].",
      "Identidad visual: [logos, paletas, guías].",
      "Edición de video corto: [reels, clips].",
    ],
    forWhom: "[Para quién trabajo: marcas, emprendimientos, organizaciones.]",
    projectsLabel: "Casos de redes y diseño",
    projects: [
      pendingProject("caso", ["Cliente o cuenta", "Objetivo", "Qué hice", "Resultado"]),
      pendingProject("caso", ["Cliente o cuenta", "Objetivo", "Qué hice", "Resultado"]),
      pendingProject("caso", ["Cliente o cuenta", "Objetivo", "Qué hice", "Resultado"]),
    ] as Project[],
    tools: ["Canva", "Figma", "Photopea", "CapCut"],
    extraLabel: "Servicios y precios base",
    extra: ["[Servicio 1: precio]", "[Servicio 2: precio]", "[Servicio 3: precio]"],
    ctaLabel: "Escribime por diseño o redes",
    ctaNote: "Contame qué cuenta o marca tenés y qué necesitás.",
    messageStarter: "Hola Mili, te escribo por diseño o redes sociales: [contame qué cuenta o marca tenés y qué necesitás].",
  } satisfies Discipline,

  /* -------------------------------------------------------- programación */
  programacion: {
    heading: "Laboratorio",
    kicker: "Webs, juegos y UI/UX",
    intro:
      "Programo webs y webjuegos, y diseño interfaces (UI/UX). Esta misma página es uno de mis proyectos. [Una frase sobre qué me gusta construir.]",
    does: [
      "Webs: [portfolios, sitios para emprendimientos].",
      "Webjuegos: [tipos de juegos o prototipos].",
      "UI/UX: [pantallas, flujos, prototipos en Figma].",
    ],
    forWhom: "[Para quién programo: proyectos propios, clientes, game jams.]",
    projectsLabel: "Proyectos",
    projects: [
      {
        title: "Milicenda (esta web)",
        kind: "Web con mapa explorable",
        fields: [
          { label: "Qué es", value: "Mi portfolio, dibujado como un mapa que se recorre." },
          { label: "Hecho con", value: "React, Vite, TypeScript y Tailwind." },
          { label: "Mi rol", value: "[Mi rol: diseño, dibujo y código]" },
          { label: "Qué aprendí", value: "[Qué aprendí y qué cambiaría]" },
        ],
        link: "",
      },
      pendingProject("webjuego o prototipo", ["Rol", "Herramientas", "Problema que resuelve", "Resultado"]),
      pendingProject("proyecto de UI/UX", ["Rol", "Herramientas", "Problema que resuelve", "Resultado"]),
    ] as Project[],
    tools: ["Figma", "React", "TypeScript", "[Motor de juegos]"],
    extraLabel: "Cómo trabajo un proyecto",
    extra: ["[Paso 1: idea y alcance]", "[Paso 2: prototipo]", "[Paso 3: prueba con gente real]"],
    ctaLabel: "Escribime por una web o un juego",
    ctaNote: "Contame la idea, aunque todavía esté verde.",
    messageStarter: "Hola Mili, te escribo por una web, un juego o una interfaz: [contame la idea].",
  } satisfies Discipline,

  /* ------------------------------------------------------------- dibujo */
  gallery: {
    heading: "Galería",
    kicker: "Dibujos terminados",
    intro: "Mis primeras obras terminadas. Vienen más, y después esto se va a separar por tipo de trabajo.",
    items: [
      {
        id: "halloween-oc",
        title: "OC de Halloween",
        year: "2026",
        medium: "Digital, Krita",
        blurb: "Un personaje original para un concurso de gachapon en Discord.",
        description: "Hecho para un concurso de gachapon de Halloween en un servidor de Discord.",
        image: "",
        variant: "lantern" as const,
      },
      {
        id: "minccino",
        title: "Minccino",
        year: "2026",
        medium: "Digital, Krita",
        blurb: "Un fanart de Pokémon.",
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
      "Así van a funcionar los encargos cuando los abra. Los precios son una base y los números exactos los voy a publicar acá.",
    payments: "Sin pago por adelantado. Los datos de pago se comparten cuando abra el tablón.",
    turnaround: "Depende del dibujo. Un boceto tarda más o menos de 1 a 4 días.",
    rules: [
      "No se aceptan cambios grandes una vez hecho el lineart.",
      "Siempre te consulto después del boceto, antes de seguir.",
      "El dibujo final se entrega sin firma.",
      "Desde el boceto terminado podés pedir un timelapse.",
      "También podés pedir el archivo de Krita.",
      "Las observaciones y notas son bienvenidas en cada paso.",
      "Los encargos se acuerdan por Discord.",
    ],
    prices: [
      { name: "Ícono", price: "[Precio]", detail: "Un retrato chico para tu perfil.", time: "[Tiempo]" },
      { name: "Busto", price: "[Precio]", detail: "Cabeza y hombros.", time: "[Tiempo]" },
      { name: "Medio cuerpo", price: "[Precio]", detail: "De la cintura para arriba.", time: "[Tiempo]" },
      { name: "Emotes y GIFs simples", price: "[Precio]", detail: "Chiquitos y expresivos.", time: "[Tiempo]" },
    ],
    notDrawing: ["[Qué no dibujo]"],
    availability: "Cerrado por ahora. Abre cuando el portfolio esté listo.",
    ctaLabel: "Saludame por Discord",
    ctaNote: "Podés escribirme cuando quieras, aunque el tablón esté cerrado.",
    tabGallery: "Galería",
    tabCommissions: "Encargos",
  },

  /* -------------------------------------------------------------- about */
  about: {
    heading: "Sobre mí",
    kicker: "Casita",
    name: "milic",
    intro:
      "¡Hola, soy milic! Soy comunicadora y periodista investigadora, diseño, dibujo, programo, escribo y edito videos. Soy community manager y un poco de todo. Acá comparto mi trabajo, con debilidad por los chibis.",
    paragraphs: [
      "Estoy empezando en internet. Comparto mi arte primero en X, después en Instagram y otras plataformas, en español e inglés.",
      "Ahora estoy armando este portfolio, por eso el tablón de encargos está cerrado. Cuando esté listo los abro y publico primero las reglas y los precios.",
    ],
    nowLabel: "Ahora",
    now: ["[En qué estoy trabajando ahora]", "[Qué estoy aprendiendo]"],
    tools: [
      { name: "Krita", note: "donde nacen la mayoría de los dibujos" },
      { name: "Photopea", note: "ediciones y arreglos rápidos" },
      { name: "Canva", note: "diagramación y gráficos" },
      { name: "Figma", note: "lo estoy aprendiendo para diseñar mi propio mundo" },
      { name: "CapCut", note: "edición de video" },
    ],
    facts: [
      "Le encantan los perros y los pingüinos.",
      "Le encanta jugar.",
      "Todavía está aprendiendo Figma, y este mapa es parte de la práctica.",
    ],
    portrait: "",
    signOff: "¡Gracias por visitar! Clocky te acompaña a la salida.",
  },

  /* ------------------------------------------------------------ contact */
  contact: {
    heading: "Contacto",
    kicker: "El buzón",
    intro:
      "Para encargos, colaboraciones o un saludo. Hablo español e inglés y mi horario es el de Argentina.",
    pickLabel: "¿Qué necesitás?",
    pickHint: "Elegí una opción y te armo un mensaje para copiar y mandarme por Discord.",
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
        note: "Respuestas más rápidas. Los encargos se acuerdan acá.",
      },
      {
        id: "instagram",
        label: "Instagram",
        handle: "@milic_art",
        url: "https://instagram.com/milic_art",
        note: "Piezas terminadas.",
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
    responseTime: "Respondo en 3 a 4 días como máximo, mucho más rápido por Discord.",
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
    visit: "Ver",
    prevPlace: "Lugar anterior",
    nextPlace: "Lugar siguiente",
  },
};

export type SiteContent = typeof site;
