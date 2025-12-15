import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js"; 
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";

import { acessoIntimacoes } from "../caminhoFeliz/intimacoes/acessoIntimacoes.js"; 
import { acessarIntimacoesPublicadasNoDiarioOficial } from "../caminhoFeliz/intimacoes/acessarIntimacoesPublicadasNoDiarioOficial.js";
import { falhaInserirPrazoHoraErrada } from "../caminhoTriste/intimacoes/falhaInserirPrazoHoraErrada.js";
import { falhaInserirPrazoDataVazia } from "../caminhoTriste/intimacoes/falhaInserirPrazoDataVazia.js";
import { falhaInserirPrazoVazio } from "../caminhoTriste/intimacoes/falhaInserirPrazoVazio.js";
import { falhaInserirPrazoHoraVazia } from "../caminhoTriste/intimacoes/falhaInserirPrazoHoraVazia.js";
import { falhaInserirPrazoTituloVazio } from "../caminhoTriste/intimacoes/falhaInserirPrazoTituloVazio.js";
import { falhaRegistrarProcessoVazio } from "../caminhoTriste/intimacoes/falhaRegistrarProcessoVazio.js";
import { falhaRegistrarProcessoNumeroErrado } from "../caminhoTriste/intimacoes/falhaRegistrarProcessoNumeroErrado.js";

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe("Testes Caminho Triste Intimações", function () {
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

    it('Deve checar se o botão salvar é desabilitado caso inserir numero errado', async function() {
        console.log("Teste de falha ao registrar processo com número errado");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaRegistrarProcessoNumeroErrado");
        await acessoIntimacoes(driver);
        await falhaRegistrarProcessoNumeroErrado(driver); 
    });

    it('Deve checar se o botao de salvar é desabilitado ao tentar registrar processo vazio', async function() {
        console.log("Teste de falha ao registrar processo vazio");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaRegistrarProcessoVazio");
        await acessoIntimacoes(driver);
        await falhaRegistrarProcessoVazio(driver); 
    });

    it('Deve checar se o botao salvar é desabilitado ao tentar salvar a hora errada', async function() {
        console.log("Teste de falha ao inserir prazo com hora errada");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaInserirPrazoHoraErrada");
        await acessoIntimacoes(driver);
        await acessarIntimacoesPublicadasNoDiarioOficial(driver);
        await falhaInserirPrazoHoraErrada(driver); 
    });

    it('Deve checar se não salva se tentar salvar um prazo sem titulo', async function() {
        console.log("Teste de falha ao inserir prazo com título vazio");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaInserirPrazoTituloVazio");
        await falhaInserirPrazoTituloVazio(driver); 
    });

    it('Deve checar se nao salva se tentar salvar um prazo sem data', async function() {
        console.log("Teste de falha ao inserir prazo com data vazia");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaInserirPrazoDataVazia");
        await falhaInserirPrazoDataVazia(driver); 
    });

    it('Deve checar se nao salva se tentar salvar um prazo sem hora', async function() {
        console.log("Teste de falha ao inserir prazo com hora vazia");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaInserirPrazoHoraVazia");
        await falhaInserirPrazoHoraVazia(driver); 
    });

    it('Deve checar se nao salva se tentar salvar um prazo vazio', async function() {
        console.log("Teste de falha ao inserir prazo vazio");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Intimações");
        allure.subSuite("FalhaInserirPrazoVazio");
        await falhaInserirPrazoVazio(driver); 
    });
});