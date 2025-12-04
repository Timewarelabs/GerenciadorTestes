import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js"; 
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";

import { ProcessoDeRegistro } from "../caminhoFeliz/intimacoes/ProcessoDeRegistro.js";
import { acessoIntimacoes } from "../caminhoFeliz/intimacoes/acessoIntimacoes.js";
import { acessarIntimacoesPublicadasNoDiarioOficial } from "../caminhoFeliz/intimacoes/acessarIntimacoesPublicadasNoDiarioOficial.js";
import { processosBloqueados } from "../caminhoFeliz/intimacoes/processosBloqueados.js";
import { bloqueandoProcesso } from "../caminhoFeliz/intimacoes/bloqueandoProcesso.js";
import { adicionandoPrazoNasIntimacoes } from "../caminhoFeliz/intimacoes/adicionandoPrazoNasIntimacoes.js";

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe("Testes Caminho Feliz Intimações", function () {
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

    it('Deve acessar Intimações', async function() {
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Intimações");
        allure.subSuite("AcessoIntimações");
        await acessoIntimacoes(driver);
    });

    it("Deve salvar um processo com o numero NUP", async function () {
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Intimações");
        allure.subSuite("ProcessoDeRegistro");
        await acessoIntimacoes(driver);
        await ProcessoDeRegistro(driver);
    });

    it('Deve ver as ultimas publicações de intimações no diário de justiça', async function() {
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Intimações");
        allure.subSuite("VerUltimasIntimacoesDiarioJustica");
        await acessoIntimacoes(driver);
        await acessarIntimacoesPublicadasNoDiarioOficial(driver);
    });

    it('Deve bloquear um processo', async function() {
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Intimações");
        allure.subSuite("BloquearProcesso");
        await bloqueandoProcesso(driver);
    });

    it('Deve ver processos bloqueados', async function() {
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Intimações");
        allure.subSuite("VerProcessosBloqueados");
        await acessoIntimacoes(driver);
        await processosBloqueados(driver);
    });

    it('Deve adicionar prazo nas intimações', async function() {
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Intimações");
        allure.subSuite("AdicionarPrazoNasIntimacoes");
        await acessoIntimacoes(driver);
        await acessarIntimacoesPublicadasNoDiarioOficial(driver);
        await adicionandoPrazoNasIntimacoes(driver);
    });
});