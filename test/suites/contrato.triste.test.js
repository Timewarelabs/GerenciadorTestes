import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js";
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";


import { falhaCriarContratoComCamposVazios } from '../caminhoTriste/contratos/falhaCriarContratoComCamposVazios.js';
import { falhaCriarContratoComCampoNumero } from '../caminhoTriste/contratos/falhaCriarContratoComCampoNumero.js';
import { falhaCriarContratoComDataInvalida } from '../caminhoTriste/contratos/falhaCriarContratoComDataInvalida.js';
import { falhaAtualizarContratoSemCamposObrigatorios } from '../caminhoTriste/contratos/falhaAtualizarContratoSemCamposObrigatorios.js'; 
import { falhaAtualizarContratoNumeroInvalido } from '../caminhoTriste/contratos/falhaAtualizarContratoNumeroInvalido.js'; 
import { falhaAtualizarContratoDataInvalida } from '../caminhoTriste/contratos/falhaAtualizarContratoDataInvalida.js'; 

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe('TestesCaminhoTristeContrato', function() {
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


    it('TESTE: Deve falhar ao criar contrato com campos obrigatórios vazios', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Contrato");
        allure.subSuite("FalhaCriacaoCamposObrigatorios");
        await falhaCriarContratoComCamposVazios(driver);
    });

    it('TESTE: Deve falhar ao criar contrato com número inválido (letras em campo numérico)', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Contrato");
        allure.subSuite("FalhaCriacaoNumeroInvalido");
        await falhaCriarContratoComCampoNumero(driver);
    });

    it('TESTE: Deve falhar ao criar contrato com data inválida', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Contrato");
        allure.subSuite("FalhaCriacaoDataInvalida");
        await falhaCriarContratoComDataInvalida(driver);
    });
    

    it('TESTE: Deve falhar ao atualizar contrato removendo campos obrigatórios', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Contrato");
        allure.subSuite("FalhaAtualizacaoSemObrigatorios");
        await falhaAtualizarContratoSemCamposObrigatorios(driver);
    });

    it('TESTE: Deve falhar ao atualizar contrato com número inválido', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Contrato");
        allure.subSuite("FalhaAtualizacaoNumeroInvalido");
        await falhaAtualizarContratoNumeroInvalido(driver);
    });

    it('TESTE: Deve falhar ao atualizar contrato com data inválida', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Contrato");
        allure.subSuite("FalhaAtualizacaoDataInvalida");
        await falhaAtualizarContratoDataInvalida(driver);
    });

});