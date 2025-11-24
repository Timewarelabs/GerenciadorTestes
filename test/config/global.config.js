import fs from "fs";
import path from "path";

// Configurações de Navegador

const ARQUIVO_CONFIG = path.join(process.cwd(), "test", "config", "navegador-escolhido.json");

export function definirNavegador(nomeNavegador) {
  const config = { navegador: nomeNavegador.toLowerCase() };
  fs.writeFileSync(ARQUIVO_CONFIG, JSON.stringify(config, null, 2));
  console.log(`Navegador configurado para: ${nomeNavegador}`);
}

export function obterNavegadorAtual() {
  try {
    const dados = fs.readFileSync(ARQUIVO_CONFIG, "utf8");
    return JSON.parse(dados).navegador;
  } catch {
    console.log("Navegador padrão: Firefox");
    return "firefox";
  }
}

// Configurações de Ambiente

const ARQUIVO_AMBIENTE = path.join(process.cwd(), "test", "config", "ambiente-escolhido.json");

export function definirAmbiente(nomeAmbiente) {
  const config = { ambiente: nomeAmbiente.toLowerCase() };
  fs.writeFileSync(ARQUIVO_AMBIENTE, JSON.stringify(config, null, 2));
  console.log(`Ambiente configurado para: ${nomeAmbiente}`);
}

export function obterAmbienteAtual() {
  try {
    if (fs.existsSync(ARQUIVO_AMBIENTE)) {
      const config = JSON.parse(fs.readFileSync(ARQUIVO_AMBIENTE, "utf8"));
      return config.ambiente;
    }
  } catch {
    console.log("Arquivo de ambiente não encontrado. Usando 'prod' como padrão.");
  }
  return "prod"; 
}

export function obterBaseUrl() {
  const ambiente = obterAmbienteAtual();

  return ambiente === "prod"
    ? "https://jurisprudencia.aasp.org.br":
    ambiente === "homolog" ?
    "https://jurisprudencia.homolog.aasp.org.br" :
    "localhost:3000";
}