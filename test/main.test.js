import { limparAllureResults, enviarResultadosParaServidor } from "../scripts/servicos-allure.js";
import { enviarEmail } from "../scripts/enviar-email.js";

global.__EXECUCAO_REGRESSIVA__ = true;

before(async () => {
  console.log("Execução Regressiva → limpando allure-results");
  await limparAllureResults();
});

await import("./suites/contrato.feliz.test.js");
await import("./suites/contrato.triste.test.js");
await import("./suites/empresa.feliz.test.js");
await import("./suites/empresa.triste.test.js");
await import("./suites/pessoa.feliz.test.js");
await import("./suites/pessoa.triste.test.js");

after(async () => {
  try {
    console.log("Execução Regressiva → enviando resultados");
    enviarResultadosParaServidor();
    enviarEmail();
  } catch (e) {
    console.log("Erro ao enviar resultados para o servidor.");
  }
});