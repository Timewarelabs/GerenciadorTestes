import { definirNavegador } from "./global.config.js";

const navegador = process.argv[2]?.toLowerCase();

if (!navegador || (navegador !== "chrome" && navegador !== "firefox")) {
  console.log("❗ Uso correto: npm run definir:navegador:chrome ou npm run definir:navegador:firefox");
  process.exit(1);
}

definirNavegador(navegador);
