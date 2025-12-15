import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { tirarPrint } from "../../comum/tirarPrint.js";

async function validarDia(driver) {
    try {
        console.log("Iniciando fluxo de seleção de dia...");

        await allure.step("Clicando no botão para exibir o menu", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
                const botaoMenu = await driver.findElement(By.css('[data-testid="btn_side_menu"]'));
                await botaoMenu.click();
                await ctx.parameter("Status", "Sucesso");
                console.log("Menu clicado com sucesso!");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_para_exibir_menu");
                assert.fail('Erro ao clicar no botão para exibir menu');
            }
        });

        await allure.step("Clicando no botão de navegação da agenda", async (ctx) => {
            try {
                await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
                const linksMenu = await driver.findElements(By.className('menuLinks'));

                if (linksMenu.length >= 6) {
                    await linksMenu[5].click();
                    console.log("Clique em Agenda realizado com sucesso!");
                    await ctx.parameter("Status", "Sucesso");
                } else {
                    console.log("Não há elementos suficientes com a classe 'menuLinks' para achar Agenda.");
                    await ctx.parameter("Status", "Erro");
                }
            } catch (erro) {
                console.error("Erro ao achar Agenda do menuLinks:", erro);
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_achar_agenda");
                assert.fail('Erro ao acessar Agenda em menuLinks');
            }
        });

        await allure.step("Clicando no botão de seleção de período", async (ctx) => {
            try {
                const botaoPeriodo = await driver.wait(until.elementLocated(By.id('select-range-button')), 5000);
                await botaoPeriodo.click();
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_botao_range");
                assert.fail("Erro ao clicar no botão de seleção de período");
            }
        });

        await allure.step("Selecionando a opção 'Dia'", async (ctx) => {
            try {
                const opcaoDia = await driver.wait(until.elementLocated(By.css('[data-testid="select_range_day"]')), 5000);
                await opcaoDia.click();
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_selecionar_opcao_dia");
                assert.fail("Erro ao selecionar a opção de dia");
            }
        });

        console.log("Seleção de período 'Dia' concluída com sucesso!");
        await driver.get(`${obterBaseUrl()}/home`);

    } catch (erro) {
        console.error("Erro geral ao executar fluxo de dia:", erro);
        await tirarPrint(driver, "Erro_geral_fluxo_dia");
        throw erro;
    }
}

export { validarDia };