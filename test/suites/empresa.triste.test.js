import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";
import { login } from "../comum/login.js";

// Importando cenários (Caminho Feliz - necessário para setup/pesquisa)
import { PesquisarEmpresa } from "../caminhoFeliz/empresa/pesquisar-empresa.js";

// Importando cenários (Caminho Triste - Sad Path)
import { FalhaCriarEmpresa } from "../caminhoTriste/empresa/falha-criar-empresa.js";
import { FalhaAtualizarEmpresaCNPJ } from "../caminhoTriste/empresa/falha-atualizar-empresa-cnpj.js";
import { FalhaAtualizarEmpresaCaracteres } from "../caminhoTriste/empresa/falha-atualizar-empresa-caracteres.js";

const isRegressivo = global.__EXECUCAO_REGRESSIVA__ === true;

describe("Testes Caminho Triste Empresa", function () {
    this.timeout(1200000);
    let driver;

    before(async function () {
        console.log("Iniciando suíte de testes (Caminho Triste)...");
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

    it('Deve falhar ao registrar empresa (campos obrigatórios)', async function () {
        console.log("Teste: Falha ao criar empresa (obrigatórios)");
        allure.parentSuite("CaminhoTriste");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteFalhaCriarEmpresaObrigatorio");
        
        await FalhaCriarEmpresa(driver);
    });

    it('Deve falhar ao atualizar empresa com CNPJ inválido', async function () {
        console.log("Teste: Falha ao atualizar CNPJ inválido");
        const cnpjPesquisa = "51.690.476/0001-32";
        
        allure.parentSuite("CaminhoTriste");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteFalhaAtualizarEmpresaCNPJ");
        
        await PesquisarEmpresa(driver, cnpjPesquisa);
        await FalhaAtualizarEmpresaCNPJ(driver);
    });

    it('Deve falhar ao atualizar empresa com caracteres inválidos', async function () {
        console.log("Teste: Falha ao atualizar caracteres inválidos");
        const cnpjPesquisa = "51.690.476/0001-32";
        
        allure.parentSuite("CaminhoTriste");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteFalhaAtualizarEmpresaCaracteres");
        
        await PesquisarEmpresa(driver, cnpjPesquisa);
        await FalhaAtualizarEmpresaCaracteres(driver);
    });
});