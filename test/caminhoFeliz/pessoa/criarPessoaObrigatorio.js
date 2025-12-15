import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function criarPessoaObrigatoria(driver) {
    try {
        console.log("Iniciando cadastro de pessoa...");

        await allure.step("Acessando página de cadastro", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas/pessoas/novo/`);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_abrir_pagina");
                assert.fail('Erro ao acessar a página de cadastro');
            }
        });

        const xpathNome = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[1]/div[6]/div/div/input";
        await allure.step("Aguardando campo 'Nome'", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.xpath(xpathNome)), 15000);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_esperar_nome");
                assert.fail("Campo 'Nome' não encontrado");
            }
        });

        await allure.step("Preenchendo o campo 'Nome'", async (ctx) => {
            try {
                await preencherInputPorXPath(driver, xpathNome, 'Vinícius Nascimento Borges');
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_preencher_nome");
                assert.fail("Erro ao preencher o campo 'Nome'");
            }
        });

        const xpathSalvar = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[3]/div/button[1]";
        await allure.step("Rolando até o botão 'Salvar'", async (ctx) => {
            try {
                const btnSalvar = await driver.findElement(By.xpath(xpathSalvar));
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", btnSalvar);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_scroll_botao_salvar");
                assert.fail("Erro ao rolar até o botão 'Salvar'");
            }
        });

        await allure.step("Clicando no botão 'Salvar'", async (ctx) => {
            try {
                const btnSalvar = await driver.findElement(By.xpath(xpathSalvar));

                const habilitado = await btnSalvar.isEnabled();
                assert.ok(habilitado, "Botão 'Salvar' está desabilitado");

                await btnSalvar.click();

                const localizadorMensagem = By.xpath("//*[contains(text(), 'Pessoa incluída com sucesso')]");
                await driver.wait(until.elementLocated(localizadorMensagem), 10000);

                const mensagem = await driver.findElement(localizadorMensagem).getText();
                assert.strictEqual(mensagem, 'Pessoa incluída com sucesso!');
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "failed");
                await tirarPrint(driver, "Erro_click_botao_salvar");
                assert.fail("Erro ao clicar em 'Salvar' ou validar messagem");
            }
        });

        await allure.step("Finalizando cadastro", async (ctx) => {
            try {
                console.log("Cadastro de pessoa concluído!");
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_finalizar");
                assert.fail("Erro na finalização do cadastro");
            }
        });

    } catch (error) {
        console.error("Erro inesperado no cadastro:", error);
        await tirarPrint(driver, "Erro inesperado no cadastro");
        throw error;
    }
}

async function preencherInputPorXPath(driver, xpath, valor) {
    const input = await driver.findElement(By.xpath(xpath));
    await input.clear();
    await input.sendKeys(valor);
}

export { criarPessoaObrigatoria };