import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login as fazerLogin } from "../comum/login.js"; 
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
  let loginSucesso = false;

    before(async function() {
        if (global.sharedDriver && global.isLoggedIn) {
            driver = global.sharedDriver;
            loginSucesso = true;
        } else { 
            console.log("Iniciando suíte de testes (Setup e Login)...");
            setupAllure(); 
            configurarAmbiente(); 
            setupExecutor();
            
            driver = await configurarDriver(); 

            try {
                await fazerLogin(driver);
                loginSucesso = true;
                global.isLoggedIn = true; 
                console.log("Login inicial concluído com sucesso.");
            } catch (error) {
                console.error('Login inicial falhou no before hook. Testes serão pulados.');
                loginSucesso = false;
                throw error; 
            }
        }
    });

    after(async function() {
        console.log("Finalizando suíte de testes...");
        if (driver && !global.sharedDriver) {
            await driver.quit();
        }
        await enviarResultadosParaServidor();
    });

    
    it('TESTE: Deve cadastrar pessoa preenchendo apenas campos obrigatórios', async function() {
        if (!loginSucesso) return;
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("CadastroObrigatorio");
        await criarPessoaObrigatoria(driver); 
    });

    it('TESTE: Deve cadastrar pessoa preenchendo todos os campos', async function() {
        if (!loginSucesso) return;
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("CadastroCompleto");
        await criarPessoa(driver); 
    });
        
    it('TESTE: Deve atualizar os dados da pessoa', async function() {
        if (!loginSucesso) return;
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("AtualizacaoCompleta");
        await atualizarPessoa(driver);
    });

    it('TESTE: Deve atualizar apenas o nome da pessoa', async function() {
        if (!loginSucesso) return;
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("AtualizacaoDeNome");
        await atualizarNomePessoa(driver); 
    });

    it('TESTE: Deve tentar excluir a pessoa e cancelar a operação', async function() {
        if (!loginSucesso) return;
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("CancelamentoDeExclusao");
        await criarPessoaObrigatoria(driver); 
        await cancelarExclusaoPessoa(driver); 
    });

    it('TESTE: Deve excluir a pessoa após a confirmação', async function() {
        if (!loginSucesso) return;
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("ExclusaoBemSucedida");
        await criarPessoaObrigatoria(driver); 
        await excluirPessoa(driver);
    });

    it('TESTE: Deve buscar uma pessoa pelo nome e validar o resultado', async function () {
        if(!loginSucesso) return;
        const termoBusca = "Vinícius";
        allure.parentSuite("FluxoFeliz");
        allure.suite("Pessoa");
        allure.subSuite("BuscaPorNome");
        await buscarPessoa(driver, termoBusca);
    });
});