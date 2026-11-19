/** Textos chicos de ayuda. Editalos cuando quieras. */
export const hints = {
  welcomeTitle: "¿Qué estás buscando?",
  welcomeSub: "Elegí un camino o recorré el mapa.",
  welcomeDismiss: "Explorar solo",
  discovered: (n: number, total: number) => `${n} de ${total} lugares visitados`,
  yawn: "*aaaah*",
  allDiscovered: "¡Visitaste todos los lugares! Gracias por recorrer.",
  paths: [
    { label: "Quiero leer investigaciones", id: "periodismo" as const },
    { label: "Necesito diseño o redes", id: "diseno" as const },
    { label: "Quiero un dibujo", id: "dibujo" as const },
    { label: "Quiero una web o un juego", id: "programacion" as const },
  ],
};
