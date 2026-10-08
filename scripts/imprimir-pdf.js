/**
 * Imprime los descargables de docs/imprimibles a PDF.
 *
 *   node scripts/imprimir-pdf.js                 todos
 *   node scripts/imprimir-pdf.js plan-12-semanas uno
 *
 * Usa Chrome o Edge en modo headless, que ya están instalados en cualquier
 * Windows: montar Puppeteer para esto serían 300 MB de node_modules para
 * generar nueve folios.
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const ORIGEN = path.join(RAIZ, "docs", "imprimibles");

/**
 * Los cuatro de la masterclass son gratuitos y se sirven desde public/.
 * Los del curso son de pago: su PDF se queda fuera de public/ y se sube al
 * bucket privado a mano.
 */
const PUBLICOS = new Set([
  "hoja-de-puntuacion",
  "checklist-siete-puntos",
  "mapa-musical",
  "dia-d-y-maleta",
]);

const NAVEGADORES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

function buscarNavegador() {
  const encontrado = NAVEGADORES.find((p) => fs.existsSync(p));
  if (!encontrado) {
    console.error("No encuentro Chrome ni Edge. Instala uno de los dos.");
    process.exit(1);
  }
  return encontrado;
}

function destino(nombre) {
  return PUBLICOS.has(nombre)
    ? path.join(RAIZ, "public", "masterclass", nombre + ".pdf")
    : path.join(ORIGEN, nombre + ".pdf");
}

function imprimir(navegador, nombre) {
  const html = path.join(ORIGEN, nombre + ".html");
  if (!fs.existsSync(html)) {
    console.error(`  ${nombre}: no existe ${path.relative(RAIZ, html)}`);
    return false;
  }

  const salida = destino(nombre);
  fs.mkdirSync(path.dirname(salida), { recursive: true });

  execFileSync(navegador, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    // Margen para que bajen las fuentes de Google antes de imprimir. Sin esto
    // el PDF sale con la tipografía de respaldo y canta.
    "--virtual-time-budget=10000",
    "--no-pdf-header-footer",
    `--print-to-pdf=${salida}`,
    "file:///" + html.replace(/\\/g, "/"),
  ], { stdio: "ignore" });

  const kb = Math.round(fs.statSync(salida).size / 1024);
  console.log(`  ${nombre} -> ${path.relative(RAIZ, salida)} (${kb} KB)`);
  return true;
}

const pedidos = process.argv.slice(2).map((n) => n.replace(/\.html$/, ""));
const todos = fs
  .readdirSync(ORIGEN)
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""));

const lista = pedidos.length ? pedidos : todos;
const navegador = buscarNavegador();

console.log(`Imprimiendo ${lista.length} documento(s):`);
const fallos = lista.filter((n) => !imprimir(navegador, n));

if (fallos.length) {
  console.error(`\n${fallos.length} no se han podido imprimir.`);
  process.exit(1);
}
console.log("\nListo.");
