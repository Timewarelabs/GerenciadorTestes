import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';

import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";


async function buscarContrato(driver) {
    try {
        await allure.step("Acessando página de contratos", async () => {
            try {
                await driver.get(`${obterBaseUrl()}/contratos/`);
                allure.attachment("URL", `${obterBaseUrl()}/contratos/`, "text/plain");
                allure.parameter("Status", "200");
                allure.parameter("Descrição", "Página de contratos acessada com sucesso");
            } catch (error) {
                await tirarPrint(driver, "Erro ao acessar pagina de contratos");
                throw error;
            }
        });

        await allure.step("Fechando popup de introdução", async (ctx) => {
            try {
                const botaoFechar = await driver.wait(
                    until.elementLocated(By.css(".reactour__helper button.sc-bxivhb")), 
                    5000
                );
                await driver.wait(until.elementIsVisible(botaoFechar), 5000);
                await botaoFechar.click();
                await ctx.parameter("Popup", "Fechado");
            } catch (error) {
                await ctx.parameter("Popup", "Não encontrado ou erro ao fechar");
            }
        });

        await allure.step("Clicando no input de pesquisa", async (ctx) => {
            try {
                const barraBusca = await driver.wait(
                    until.elementLocated(By.css("input[placeholder='Buscar contrato']")));
                await driver.wait(until.elementIsVisible(barraBusca));
                await barraBusca.click();
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao encontrar input de pesquisa");
                assert.fail('Input não encontrado');
            }
        });

        await allure.step("Pesquisando pelo nome do contrato", async (ctx) => {
            try {
                await driver.actions().sendKeys('Contrato de Teste Automatizado').perform();
                console.log('Inserindo contrato de pesquisa')
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao digitar termo de busca");
                throw error;
            }
        });

        await allure.step("Clicando em pesquisar", async (ctx) => {
            try {
                await driver.sleep(2000);
                await driver.actions().sendKeys(Key.TAB).sendKeys(Key.ENTER).perform();
                await driver.sleep(3000);
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao clicar no botao pesquisar");
                assert.fail('Botão de pesquisa não encontrado');
            }
        });

        await allure.step("Rolando a página para visualizar resultados", async (ctx) => {
            try {
                await driver.executeScript("window.scrollBy(0, 800)");
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro na rolagem da pagina");
                assert.fail('Rolagem falhou');
            }
        });

        await allure.step("Verificando resultado da busca", async (ctx) => {
            try {
                await driver.sleep(3000);
                await tirarPrint(driver, "Resultado da busca de contrato");
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Screenshot do resultado capturado com sucesso");

            } catch (error) {
                await ctx.parameter("Status", "400");
                console.error("Erro ao capturar screenshot do resultado:", error.message);
                await tirarPrint(driver, "Erro ao verificar resultado da busca");
                throw error;
            }
        });

    } catch (error) {

        await tirarPrint(driver, "Falha geral ao buscar contrato");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao buscar contrato: " + error.message);
    }
}

export { buscarContrato };