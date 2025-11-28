import fs from "fs";
import path from "path";

function configurarAmbiente() {
  const ambiente = {
    "Navegador": process.env.BROWSER || "Chrome",
    "Node": process.version || "Node",
    "Sistema Operacional": process.platform || "Windows",
    "URL Base": "aaspgerenciador.aasp.org.br"
  };

  const pasta = "allure-results";
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

  fs.writeFileSync(
    path.join(pasta, "environment.properties"),
    Object.entries(ambiente)
      .map(([chave, valor]) => `${chave}=${valor}`)
      .join("\n")
  );
}

export {configurarAmbiente}