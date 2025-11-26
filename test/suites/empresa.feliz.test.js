import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { setupAllure, enviarResultadosParaServidor, limparAllureResults } from "../../scripts/servicos-allure.js";
import { login } from "../comum/login.js";

// Importando as funções de teste traduzidas
import { CriarEmpresaObrigatorio } from "../caminhoFeliz/empresa/criar-empresa-obrigatorio.js";
import { CriarEmpresa } from "../caminhoFeliz/empresa/criar-empresa.js";
import { AtualizarEmpresa } from "../caminhoFeliz/empresa/atualizar-empresa.js";
import { AtualizarEmailEmpresa } from "../caminhoFeliz/empresa/atualizar-email-empresa.js";
import { ExcluirEmpresa } from "../caminhoFeliz/empresa/excluir-empresa.js";
import { PesquisarEmpresa } from "../caminhoFeliz/empresa/pesquisar-empresa.js";

describe("Suíte de Testes - Caminho Feliz Empresa", function () {
    this.timeout(1200000); // Timeout ajustado conforme seu antigo
    let driver;

    before(async function () {
        console.log("Iniciando suíte de testes de empresa...");
        setupAllure();
        configurarAmbiente();
        setupExecutor();
        limparAllureResults

        driver = await configurarDriver();

        await login(driver);
    });

    after(async function () {
        console.log("Finalizando suíte de testes...");
        if (driver) await driver.quit();
        await enviarResultadosParaServidor();
    });

    it('Deve registrar empresa (apenas obrigatórios)', async function () {
        console.log("Teste: Criar empresa (obrigatórios)");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteCriarEmpresaObrigatorio");
        
        await CriarEmpresaObrigatorio(driver);
    });

    it('Deve registrar uma empresa completa', async function () {
        console.log("Teste: Criar empresa completa");
        allure.parentSuite("CaminhoFeliz");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteCriarEmpresa");
        
        await CriarEmpresa(driver);
    });

    it('Deve atualizar dados da empresa', async function () {
        console.log("Teste: Atualizar empresa");
        const cnpjPesquisa = "46.295.498/0001-68";
        
        allure.parentSuite("CaminhoFeliz");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteAtualizarEmpresa");
        
        await PesquisarEmpresa(driver, cnpjPesquisa);
        await AtualizarEmpresa(driver);
    });

    it('Deve atualizar e-mail da empresa', async function () {
        console.log("Teste: Atualizar e-mail da empresa");
        const cnpjPesquisa = "46.295.498/0001-68";
        
        allure.parentSuite("CaminhoFeliz");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteAtualizarEmailEmpresa");
        
        await PesquisarEmpresa(driver, cnpjPesquisa);
        await AtualizarEmailEmpresa(driver);
    });

    it('Deve excluir empresa', async function () {
        console.log("Teste: Excluir empresa");
        const cnpjPesquisa = "46.295.498/0001-68";
        
        allure.parentSuite("CaminhoFeliz");
        allure.suite("TesteEmpresa");
        allure.subSuite("TesteExcluirEmpresa");
        
        await PesquisarEmpresa(driver, cnpjPesquisa);
        await ExcluirEmpresa(driver);
    });
});