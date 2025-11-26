import * as allure from "allure-js-commons";
import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js"; 
import { setupAllure, enviarResultadosParaServidor } from "../../scripts/servicos-allure.js";

import { falhaCriarPessoa } from '../caminhoTriste/pessoa/falhaCriarPessoa.js'; 
import { falhaAtualizarPessoa } from '../caminhoTriste/pessoa/falhaAtualizarPessoa.js'; 
import { falhaAtualizarPessoaObrigatoria } from '../caminhoTriste/pessoa/falhaAtualizarPessoaObrigatoria.js'; 
import { falhaAtualizarPessoaCPFInvalido } from '../caminhoTriste/pessoa/falhaAtualizarPessoaCPFInvalido.js'; 
import { buscarPessoa } from "../caminhoFeliz/pessoa/buscarPessoa.js";


describe('TestesCaminhoTristePessoa', function() { 
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

    
    it('TESTE: Deve falhar ao cadastrar pessoa com campo obrigatório Nome vazio', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Pessoa");
        allure.subSuite("FalhaCadastroObrigatorio");
        await falhaCriarPessoa(driver); 
    });

    it('TESTE: Deve falhar ao atualizar pessoa com campo Nome muito longo', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Pessoa");
        allure.subSuite("FalhaAtualizacaoNomeLongo");
        const termoBusca = "Vinícius Nascimento Borges";
        await buscarPessoa(driver, termoBusca);
        await falhaAtualizarPessoa(driver); 
    });

    it('TESTE: Deve falhar ao atualizar pessoa com campo obrigatório vazio', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Pessoa");
        allure.subSuite("FalhaAtualizacaoObrigatoria");
        const termoBusca = "Vinícius Nascimento Borges";
        await buscarPessoa(driver, termoBusca);
        await falhaAtualizarPessoaObrigatoria(driver); 
    });

    it('TESTE: Deve falhar ao atualizar pessoa com CPF inválido', async function() {
        allure.parentSuite("CaminhoTriste");
        allure.suite("Pessoa");
        allure.subSuite("FalhaAtualizacaoCPFInvalido");
        const termoBusca = "Vinícius Nascimento Borges";
        await buscarPessoa(driver, termoBusca);
        await falhaAtualizarPessoaCPFInvalido(driver); 
    });
});