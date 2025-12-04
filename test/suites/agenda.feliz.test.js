import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";
import { login } from "../comum/login.js";
import { validarSemana } from '../caminhoFeliz/agenda/validarSemana.js'; 
import { validarDia } from '../caminhoFeliz/agenda/validarDia.js';
import { validarMes } from '../caminhoFeliz/agenda/validarMes.js'; 
import { validarFiltroPrazoIntimacoes } from '../caminhoFeliz/agenda/validarFiltroPrazoIntimacoes.js'; 
import { validarFiltroCompromisso } from '../caminhoFeliz/agenda/validarFiltroCompromisso.js';
import { validarFiltroTarefas } from '../caminhoFeliz/agenda/validarFiltroTarefas.js'; 
import { criarTarefa } from "../caminhoFeliz/agenda/criarTarefa.js"; 
import { criarCompromisso } from "../caminhoFeliz/agenda/criarCompromisso.js"; 

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe('Testes Caminho Feliz Agenda', function () {
    this.timeout(1200000); // 20 minutos
    let driver;

    before(async function () {
        console.log("Iniciando suíte de testes de Agenda...");
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

    it('Deve selecionar "Semana" nas opções da agenda', async function () {
        console.log("Teste: Seleção de semana na agenda");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("ValidarSemana");
        await validarSemana(driver);
    });

    it('Deve selecionar "Dia" nas opções da agenda', async function () {
        console.log("Teste: Seleção de dia na agenda");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("ValidarDia");
        await validarDia(driver);
    });

    it('Deve selecionar "Mês" nas opções da agenda', async function () {
        console.log("Teste: Seleção de mês na agenda");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("ValidarMes");
        await validarMes(driver);
    });

    it('Deve selecionar "Prazo de Intimações" nas opções de filtro', async function () {
        console.log("Teste: Filtro de Prazo de Intimações");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("ValidarFiltroPrazoIntimacoes");
        await validarFiltroPrazoIntimacoes(driver);
    });

    it('Deve selecionar "Compromissos" nas opções de filtro', async function () {
        console.log("Teste: Filtro de Compromissos");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("ValidarFiltroCompromisso");
        
        await criarCompromisso(driver);
        await validarFiltroCompromisso(driver);
    });

    it('Deve selecionar "Tarefas" nas opções de filtro', async function () {
        console.log("Teste: Filtro de Tarefas");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("ValidarFiltroTarefas");
        
        await criarTarefa(driver);
        await validarFiltroTarefas(driver);
    });

    it('Deve criar uma Tarefa com sucesso', async function () {
        console.log("Teste: Criar Tarefa");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("CriarTarefa");
        await criarTarefa(driver);
    });

    it('Deve criar um Compromisso com sucesso', async function () {
        console.log("Teste: Criar Compromisso");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("Agenda");
        allure.subSuite("CriarCompromisso");
        await criarCompromisso(driver);
    });
});