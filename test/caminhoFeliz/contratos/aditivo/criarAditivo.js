import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../../config/global.config.js"; 

async function criarAditivo(driver) {
    await allure.step("Navegando até as ações do contrato", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/contratos/`);
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Navegando até listagem de contrato com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao navegar até edição:", error);
            await tirarPrint(driver, "Erro ao navegar até listagem de contratos");
            throw error;
        }
    });

    await allure.step("Fechando o modal de tour/boas-vindas", async () => {
        try {
            const botaoFechar = await driver.wait( 
                until.elementLocated(By.css('button.sc-bxivhb.eTpeTG.sc-bdVaJa.jRQxUV')),
                15000 
            );
            await driver.wait(until.elementIsVisible(botaoFechar), 5000);
            await driver.wait(until.elementIsEnabled(botaoFechar), 5000);
            await botaoFechar.click();
            
            allure.parameter("Status", "200");
            allure.parameter("Descrição", "Modal de tour fechado com sucesso.");
            
            await driver.wait(until.stalenessOf(botaoFechar), 5000);
            await driver.sleep(500); 
        } catch (error) {
            allure.parameter("Status", "202"); 
            allure.parameter("Aviso", "Modal de tour não encontrado ou erro ao fechar. Continuando...");
        }
    });

    await allure.step("Clicando no primeiro contrato da lista", async () => {
        try {
            await driver.wait(
                until.elementLocated(By.css("tbody tr")),
                15000
            );

            try {
                const spinner = await driver.findElement(By.css("svg.MuiCircularProgress-svg"));
                await driver.wait(until.elementIsNotVisible(spinner), 10000);
            } catch (_) {
            }

            await driver.sleep(500);

            const linhasContrato = await driver.findElements(By.css("tbody tr"));

            if (linhasContrato.length === 0) {
                await tirarPrint(driver, "Nenhum_contrato_encontrado");
                throw new Error("Nenhum contrato encontrado na tabela.");
            }

            const primeiraLinha = linhasContrato[0]; 

            await driver.wait(until.elementIsVisible(primeiraLinha), 10000);
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", primeiraLinha);
            await driver.sleep(300);

            await driver.executeScript("arguments[0].click();", primeiraLinha);

            allure.parameter("Status", "200");
            allure.parameter("Descrição", "Primeiro contrato da lista clicado com sucesso.");
        } catch (error) {
            allure.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_no_primeiro_contrato");
            throw new Error(`Erro ao clicar no contrato: ${error.message}`);
        }
    });

    await allure.step("Criando aditivo", async (ctx) => {
        try {
            const botaoAditivo = await driver.wait( 
                until.elementLocated(By.css("div[title='Criar aditivo'] button")),
                10000
            );
            await driver.wait(until.elementIsVisible(botaoAditivo), 5000);
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", botaoAditivo);
            await driver.sleep(300);
            await driver.executeScript("arguments[0].click();", botaoAditivo);
            await driver.sleep(500);

            await driver.actions().sendKeys(Key.ARROW_DOWN).perform();
            await driver.sleep(200);
            await driver.actions().sendKeys(Key.ENTER).perform();
            await driver.sleep(1000);

            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Menu de aditivo selecionado com sucesso.");
        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_abrir_menu_aditivo");
            console.error("Erro ao abrir menu de aditivo:", error.message);
            await assert.fail('Erro ao abrir menu de aditivo: ' + error.message);
        }
    });

    await allure.step("Clicando no botão Criar", async (ctx) => {
        try {
            await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            await driver.sleep(1000);

            const botaoCriar = await driver.wait( 
                until.elementLocated(By.xpath("//button[.//span[text()='Criar']]")),
                10000
            );
            await driver.wait(until.elementIsVisible(botaoCriar), 5000);
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", botaoCriar);
            await driver.sleep(300);
            await driver.executeScript("arguments[0].click();", botaoCriar);
            await driver.sleep(4000)

            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Botão Criar clicado com sucesso.");
        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_botao_criar");
            console.error("Erro ao clicar no botão Criar:", error.message);
            await assert.fail('Erro ao clicar no botão Criar: ' + error.message);
        }
    });
}

export { criarAditivo };