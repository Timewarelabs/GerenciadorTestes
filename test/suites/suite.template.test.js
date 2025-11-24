import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { abrirSiteCenario } from "../caminhoFeliz/cenario-base.js";
import { setupAllure, enviarResultadosParaServidor } from "../../scripts/servicos-allure.js";
import { login } from "../comum/login.js";

describe("Validação de acesso ao site", function () {
  this.timeout(60000);
  let driver;

  before(async function () {
    console.log("Iniciando suíte de acesso ao site");
    setupAllure();
    configurarAmbiente();
    setupExecutor();

    driver = await configurarDriver();

    await login(driver);
  });

  after(async function () {
    console.log("Finalizando suíte de testes...");
    if (driver) await driver.quit();
    await enviarResultadosParaServidor();
  });

  it("Deve abrir o site do Google e validar o título da página", async function () {
    allure.parentSuite("Fluxo Básico");
    allure.suite("Acesso ao Site");
    allure.subSuite("Validação de Página Inicial");
    allure.label("Execução", `Run-${Date.now()}`);
    await abrirSiteCenario(driver);
  });
});
