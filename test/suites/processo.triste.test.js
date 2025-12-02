import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js"; 
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";

import { falhaCriarProcesso } from "../caminhoTriste/processos/falhaCriarProcesso.js";
import { falhaCriarProcessoSemInstancia } from "../caminhoTriste/processos/falhaCriarProcessoSemInstancia.js";
import { falhaCriarProcessoSemPartes } from "../caminhoTriste/processos/falhaCriarProcessoSemPartes.js";

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe("Testes Caminho Feliz Pessoa", function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        console.log("Iniciando suíte de acesso ao site");
        setupAllure();
        configurarAmbiente();
        setupExecutor();
        if (!isRegressivo) {
            console.log("Execução MODULAR → limpando allure-results");
            limparAllureResults();
        }

        driver = await configurarDriver();
        await login(driver);
    });

    after(async function () {
        console.log("Finalizando suíte de testes...");
        if (driver) await driver.quit();
        
        if (!isRegressivo) {
            console.log("Execução MODULAR → enviando resultados");
            await enviarResultadosParaServidor();
        }
    });

    it('Deve falhar ao cadastrar processo', async function() {
        console.log("Teste de falha na criação de processo");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Processo");
        allure.subSuite("FalhaCriarProcesso");
        await falhaCriarProcesso(driver); 
    });

    it('Deve falhar ao cadastrar processo sem instância', async function() {
        console.log("Teste de falha na criação de processo sem instância");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Processo");
        allure.subSuite("FalhaCriarProcessoSemInstancia");
        await falhaCriarProcessoSemInstancia(driver); 
    });

    it('Deve falhar ao cadastrar processo sem partes', async function() {
        console.log("Teste de falha na criação de processo sem partes");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Processo");
        allure.subSuite("FalhaCriarProcessoSemPartes");
        await falhaCriarProcessoSemPartes(driver); 
    });

});