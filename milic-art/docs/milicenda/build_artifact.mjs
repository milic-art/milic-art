// Arma un HTML único y autocontenido (para el artifact): JS, CSS e imágenes incrustados.
// Uso: node docs/milicenda/build_artifact.mjs  ->  dist-artifact/index.html
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
execSync("npx vite build --outDir dist-artifact --emptyOutDir", { cwd: root, stdio: "inherit", env: { ...process.env, ARTIFACT: "1" } });
const dist = path.join(root, "dist-artifact");
let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");

// assets de la isla como data URI (clave = ruta relativa dentro de milicenda-assets)
const base = path.join(root, "public", "milicenda-assets");
const assets = {};
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f.endsWith(".png") && !f.endsWith("_x8.png")) {
      assets[path.relative(base, full).split(path.sep).join("/")] = "data:image/png;base64," + fs.readFileSync(full).toString("base64");
    }
  }
})(base);

const esc = (s) => s.replace(/<\/script/gi, "<\\/script");
html = html.replace(/<link[^>]*rel="icon"[^>]*>/g, "");
html = html.replace(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g, (_, href) => `<style>${fs.readFileSync(path.join(dist, href), "utf8")}</style>`);
let js = "";
html = html.replace(/<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/g, (_, src) => {
  js = fs.readFileSync(path.join(dist, src), "utf8");
  return "";
});
const inject = `<script>window.__ASSETS__=${JSON.stringify(assets)};</script><script type="module">${esc(js)}</script>`;
html = html.replace("</body>", () => `${inject}</body>`);
fs.writeFileSync(path.join(dist, "artifact.html"), html);
// versión sin doctype/html/head/body: la herramienta de artifacts agrega su propio esqueleto
const headInner = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>/, "").replace(/<meta name="viewport"[^>]*>/, "");
const bodyInner = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(path.join(dist, "artifact-fragment.html"), headInner + "\n<style>body{background:#fbf3e4;color:#4b3a2a}</style>\n" + bodyInner);
console.log("artifact.html", (html.length / 1048576).toFixed(2), "MiB");
