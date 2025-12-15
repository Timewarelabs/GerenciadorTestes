import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js"; 
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";

import { criarProcesso } from '../caminhoFeliz/processos/criarProcesso.js';
import { verProcesso } from '../caminhoFeliz/processos/verProcesso.js';
import { excluirProcesso } from "../caminhoFeliz/processos/excluirProcesso.js"; 
import { bloquearProcesso } from "../caminhoFeliz/processos/bloquearProcesso.js"; 
import { adicionandoNumeroComplementar } from "../caminhoFeliz/processos/adicionandoNumeroComplementar.js";

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe("Testes Caminho Feliz Processos", function () {
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

    it('Deve cadastrar processo', async function() {
        console.log("Teste de criação de processo");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Processo");
        allure.subSuite("CriarProcesso");
        await criarProcesso(driver); 
    });
    
    it('Deve ver processo', async function() {
        console.log("Teste de visualização de processo");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Processo");
        allure.subSuite("VerProcesso");
        await verProcesso(driver); 
    });

    it('Deve excluir processo', async function() {
        console.log("Teste de exclusão de processo");   
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Processo");
        allure.subSuite("ExcluirProcesso");
        await excluirProcesso(driver); 
    });

    it('Deve bloquear processo', async function() {
        console.log("Teste de bloqueio de processo");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Processo");
        allure.subSuite("BloquearProcesso");
        await bloquearProcesso(driver); 
    });

    it('Deve adicionar ao processo', async function() {
        console.log("Teste de adicionar número complementar ao processo");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Processo");
        allure.subSuite("AdicionarNumeroComplementar");
        await adicionandoNumeroComplementar(driver); 
    });
});