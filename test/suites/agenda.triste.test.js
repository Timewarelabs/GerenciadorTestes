import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js";
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";
import { falhaCriarTarefaVazia } from "../caminhoTriste/agenda/falhaCriarTarefaVazia.js";
import { falhaCriarCompromissoTituloVazio } from "../caminhoTriste/agenda/falhaCriarCompromissoTituloVazio.js";
import { falhaCriarCompromissoDataVazia } from "../caminhoTriste/agenda/falhaCriarCompromissoDataVazia.js";
import { falhaCriarCompromissoHoraVazia } from "../caminhoTriste/agenda/falhaCriarCompromissoHoraVazia.js";
import { falhaCriarCompromissoApenasTitulo } from "../caminhoTriste/agenda/falhaCriarCompromissoApenasTitulo.js";
import { falhaCriarCompromissoApenasData } from "../caminhoTriste/agenda/falhaCriarCompromissoApenasData.js";
import { falhaCriarCompromissoApenasHora } from "../caminhoTriste/agenda/falhaCriarCompromissoApenasHora.js";
import { falhaCriarCompromissoVazio } from "../caminhoTriste/agenda/falhaCriarCompromissoVazio.js";

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe('Testes Caminho Triste Agenda', function () {
    this.timeout(1200000); 
    let driver;

    before(async function () {
        console.log("Iniciando suíte de testes (Caminho Triste - Agenda)...");
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

    it('Não deve criar tarefa com campos vazios (Validação de cenários)', async function () {
        console.log("Teste: Falha ao criar tarefa vazia");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarTarefaVazia");
        await falhaCriarTarefaVazia(driver);
    });

    it('Não deve criar compromisso sem título', async function () {
        console.log("Teste: Falha ao criar compromisso (Sem Título)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoTituloVazio");
        await falhaCriarCompromissoTituloVazio(driver);
    });

    it('Não deve criar compromisso sem data', async function () {
        console.log("Teste: Falha ao criar compromisso (Sem Data)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoDataVazia");
        await falhaCriarCompromissoDataVazia(driver);
    });

    it('Não deve criar compromisso sem horário', async function () {
        console.log("Teste: Falha ao criar compromisso (Sem Horário)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoHoraVazia");
        await falhaCriarCompromissoHoraVazia(driver);
    });

    it('Não deve criar compromisso preenchendo apenas o título', async function () {
        console.log("Teste: Falha ao criar compromisso (Apenas Título)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoApenasTitulo");
        await falhaCriarCompromissoApenasTitulo(driver);
    });

    it('Não deve criar compromisso preenchendo apenas a data', async function () {
        console.log("Teste: Falha ao criar compromisso (Apenas Data)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoApenasData");
        await falhaCriarCompromissoApenasData(driver);
    });

    it('Não deve criar compromisso preenchendo apenas a hora', async function () {
        console.log("Teste: Falha ao criar compromisso (Apenas Hora)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoApenasHora");
        await falhaCriarCompromissoApenasHora(driver);
    });

    it('Não deve criar compromisso com todos os campos vazios', async function () {
        console.log("Teste: Falha ao criar compromisso (Tudo Vazio)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("Agenda");
        allure.subSuite("FalhaCriarCompromissoVazio");
        await falhaCriarCompromissoVazio(driver);
    });
});