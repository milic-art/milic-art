# milic_art: portfolio web

Mapa ilustrado con 4 lugares (Gallery, Commissions, About Me, Contact) y a Pip como guia.

## Como editar (sin tocar codigo)

Todos los textos, precios, links y datos estan en un solo archivo:

    src/content/site.ts

Para cambiar un dibujo:
1. Pone tu imagen en la carpeta `public/art/` (por ejemplo `public/art/mi-dibujo.png`).
2. En `site.ts` escribi la ruta: `image: "/art/mi-dibujo.png"`.
3. Si dejas `image: ""`, se ve el dibujo de ejemplo.

## Probarla en tu compu

Necesitas tener Node.js instalado (nodejs.org, version LTS).

    npm install
    npm run dev

Se abre en http://localhost:5173

## Publicarla gratis

1. Corre `npm run build`. Se crea la carpeta `dist`.
2. Entra a app.netlify.com/drop y arrastra la carpeta `dist`. Listo, ya tenes link.

Tambien podes subir el proyecto a GitHub y conectarlo con Netlify, Vercel o Cloudflare Pages
(comando de build: `npm run build`, carpeta de salida: `dist`).
