import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js"; // Ajuste o caminho se necessário
import { tirarPrint } from "../../comum/tirarPrint.js"; // Ajuste o caminho se necessário

async function validarSemana(driver) {
    try {
        console.log("Iniciando fluxo de seleção de agenda (Semana)...");

        await allure.step("Clicando no botão para exibir o menu", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
                const botaoMenu = await driver.findElement(By.css('[data-testid="btn_side_menu"]'));
                await botaoMenu.click();
                await ctx.parameter("Status", "200");
                console.log("Menu clicado com sucesso!");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_para_exibir_menu");
                assert.fail(`Erro ao clicar no botão para exibir menu: ${erro.message}`);
            }
        });

        await allure.step("Clicando no botão de navegação da agenda", async (ctx) => {
            try {
                await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
                const linksMenu = await driver.findElements(By.className('menuLinks'));

                if (linksMenu.length >= 6) {
                    await linksMenu[5].click();
                    console.log("Clique em Agenda realizado com sucesso!");
                    await ctx.parameter("Status", "200");
                } else {
                    console.log("Não há elementos suficientes com a classe 'menuLinks' para achar Agenda.");
                    await ctx.parameter("Status", "400");
                }
            } catch (erro) {
                console.error("Erro ao achar Agenda do menuLinks:", erro);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_achar_agenda");
                assert.fail(`Erro ao acessar Agenda em menuLinks: ${erro.message}`);
            }
        });

        await allure.step("Clicando no botão de seleção de período", async (ctx) => {
            try {
                const botaoPeriodo = await driver.wait(until.elementLocated(By.id('select-range-button')), 5000);
                await botaoPeriodo.click();
                await ctx.parameter("Status", "200");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_botao_range");
                assert.fail("Erro ao clicar no botão de seleção de período");
            }
        });

        await allure.step("Selecionando a opção 'Semana'", async (ctx) => {
            try {
                const opcaoSemana = await driver.wait(until.elementLocated(By.css('[data-testid="select_range_week"]')), 5000);
                await opcaoSemana.click();
                await ctx.parameter("Status", "200");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_selecionar_opcao_semana");
                assert.fail("Erro ao selecionar a opção de semana");
            }
        });

        console.log("Seleção de período 'Semana' concluída com sucesso!");
        await driver.get(`${obterBaseUrl()}/home`);

    } catch (erro) {
        console.error("Erro geral ao executar fluxo de agenda:", erro);
        await tirarPrint(driver, "Erro_geral_fluxo_agenda");
        throw erro;
    }
}

export { validarSemana };