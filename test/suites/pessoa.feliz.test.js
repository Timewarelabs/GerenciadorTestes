import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js"; 
import { setupAllure, enviarResultadosParaServidor } from "../../scripts/servicos-allure.js";

import { criarPessoaObrigatoria } from '../caminhoFeliz/pessoa/criarPessoaObrigatorio.js';
import { criarPessoa } from '../caminhoFeliz/pessoa/criarPessoa.js'; 
import { atualizarPessoa } from '../caminhoFeliz/pessoa/atualizarPessoa.js';
import { atualizarNomePessoa } from "../caminhoFeliz/pessoa/atualizarNomePessoa.js"; 
import { cancelarExclusaoPessoa } from '../caminhoFeliz/pessoa/cancelarExclusaoPessoa.js'; 
import { excluirPessoa } from '../caminhoFeliz/pessoa/excluirPessoa.js'; 
import { buscarPessoa } from '../caminhoFeliz/pessoa/buscarPessoa.js';


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

    
    it('TESTE: Deve cadastrar pessoa preenchendo apenas campos obrigatórios', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("CadastroObrigatorio");
        await criarPessoaObrigatoria(driver); 
    });

    it('TESTE: Deve cadastrar pessoa preenchendo todos os campos', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("CadastroCompleto");
        await criarPessoa(driver); 
    });
        
    it('TESTE: Deve atualizar os dados da pessoa', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("AtualizacaoCompleta");
        await atualizarPessoa(driver);
    });

    it('TESTE: Deve atualizar apenas o nome da pessoa', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("AtualizacaoDeNome");
        await atualizarNomePessoa(driver); 
    });

    it('TESTE: Deve tentar excluir a pessoa e cancelar a operação', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("CancelamentoDeExclusao");
        await criarPessoaObrigatoria(driver); 
        await cancelarExclusaoPessoa(driver); 
    });

    it('TESTE: Deve excluir a pessoa após a confirmação', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("ExclusaoBemSucedida");
        await criarPessoaObrigatoria(driver); 
        await excluirPessoa(driver);
    });

    it('TESTE: Deve buscar uma pessoa pelo nome e validar o resultado', async function () {
        const termoBusca = "Vinícius";
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("BuscaPorNome");
        await buscarPessoa(driver, termoBusca);
    });
});