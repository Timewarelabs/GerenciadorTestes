import * as allure from "allure-js-commons";
import fs from 'fs';
import path from 'path';

import { configurarDriver } from "../config/navegador.config.js";
import { configurarAmbiente } from "../config/ambienteAllure.js";
import { setupExecutor } from "../config/executor.js";
import { login } from "../comum/login.js";
import { setupAllure, enviarResultadosParaServidor } from "../../scripts/servicos-allure.js";

import { criarContrato } from '../caminhoFeliz/contratos/criarContrato.js';
import { criarContratoObrigatorio } from '../caminhoFeliz/contratos/criarContratoObrigatorio.js';
import { buscarContrato } from '../caminhoFeliz/contratos/buscarContrato.js';
import { atualizarContrato } from "../caminhoFeliz/contratos/atualizarContrato.js";
import { atualizarObjContrato } from "../caminhoFeliz/contratos/atualizarObjContrato.js";
import { excluirContrato } from "../caminhoFeliz/contratos/excluirContrato.js";

import { criarAditivo } from "../caminhoFeliz/contratos/aditivo/criarAditivo.js";
import { atualizarAditivo } from "../caminhoFeliz/contratos/aditivo/atualizarAditivo.js";
import { atualizarObjAditivo } from "../caminhoFeliz/contratos/aditivo/atualizarObjAditivo.js";
import { excluirAditivo } from '../caminhoFeliz/contratos/aditivo/excluirAditivo.js';
import { lerAditivo } from '../caminhoFeliz/contratos/aditivo/lerAditivo.js';


describe('TestesFluxoFelizContrato', function() {
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


    it('TESTE: Deve cadastrar um contrato completo', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("CadastroCompleto");
        await criarContrato(driver);
    });

    it('TESTE: Deve cadastrar contrato apenas com campos obrigatórios', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("CadastroObrigatorio");
        await criarContratoObrigatorio(driver);
    });

    it('TESTE: Deve buscar um contrato pelo nome', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("BuscaPorNome");
        await buscarContrato(driver);
    });

    it('TESTE: Deve atualizar um contrato', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AtualizacaoCompleta");
        await atualizarContrato(driver);
    });

    it('TESTE: Deve atualizar o objeto do contrato', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AtualizacaoObjeto");
        await atualizarObjContrato(driver);
    });

    it('TESTE: Deve excluir um contrato', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("Exclusao");
        await excluirContrato(driver);
    });


    it('TESTE: Deve criar um aditivo', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AditivoCriacao");
        await criarAditivo(driver);
    });

    it('TESTE: Deve atualizar um aditivo', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AditivoAtualizacao");
        await atualizarAditivo(driver);
    });

    it('TESTE: Deve atualizar o objeto do aditivo', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AditivoAtualizacaoObjeto");
        await atualizarObjAditivo(driver);
    });

    it('TESTE: Deve excluir um aditivo', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AditivoExclusao");
        await criarAditivo(driver);
        await excluirAditivo(driver);
    });

    it('TESTE: Deve visualizar/ler um aditivo', async function() {
        allure.parentSuite("FluxoFeliz");
        allure.suite("Contrato");
        allure.subSuite("AditivoLeitura");
        await lerAditivo(driver);
    });
});