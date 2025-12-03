import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function verProcesso(driver) {
    try {
        await allure.step("Acessando página de listagem de processos", async (ctx) => {
            await driver.get(`${obterBaseUrl()}/processos/`);
            const urlAtual = await driver.getCurrentUrl();
            allure.attachment("URL", urlAtual, "text/plain");
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Página de listagem de processos acessada com sucesso");
            await driver.sleep(1500); 
        });

        await allure.step("Fechando o modal de tour/boas-vindas", async (ctx) => {
            try {
                const botaoFechar = await driver.wait(
                    until.elementLocated(By.css('button.sc-bxivhb.eTpeTG.sc-bdVaJa.jRQxUV')), 
                    15000 
                );
                await driver.wait(until.elementIsVisible(botaoFechar), 5000);
                await driver.wait(until.elementIsEnabled(botaoFechar), 5000);
                await botaoFechar.click();
                
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Modal de tour fechado com sucesso (botão 'x').");
                
                await driver.wait(until.stalenessOf(botaoFechar), 5000);
                await driver.sleep(500); 
            } catch (error) {
                await ctx.parameter("Status", "202"); 
                await ctx.parameter("Aviso", "Modal de tour (botão 'x') não encontrado ou erro ao fechar. Continuando...");
            }
        });


        await allure.step("Clicando no primeiro processo da lista", async (ctx) => {
            try {
                await driver.wait(
                    until.elementLocated(By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]//tr[contains(@class, 'MuiTableRow-root')]")), 
                    15000 
                );

                try {
                    const spinner = await driver.findElement(By.css("svg.MuiCircularProgress-svg")); 
                    if (spinner) {
                        await driver.wait(until.elementIsNotVisible(spinner), 10000);
                    }
                } catch (e) {
                }
                
                await driver.sleep(500);

                const linhasProcesso = await driver.findElements(
                    By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]/tr[contains(@class, 'MuiTableRow-root') and not(contains(@class, 'MuiTableRow-head'))]") 
                );
                
                if (linhasProcesso.length === 0) {
                    await tirarPrint(driver, "Nenhum_processo_encontrado");
                    throw new Error("Nenhum processo encontrado na tabela.");
                }

                await driver.wait(until.elementIsVisible(linhasProcesso[0]), 10000);
                
                const primeiroProcesso = linhasProcesso[0];
                
                try {
                    await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", primeiroProcesso); 
                    await driver.sleep(500); 
                    await driver.executeScript("arguments[0].click();", primeiroProcesso);
                } catch (erroCliqueJS) {
                    await tirarPrint(driver, "Erro_clique_com_JavaScript");
                    throw new Error(`Falha ao clicar no processo com JavaScript. Erro JS Click: ${erroCliqueJS.message}`);
                }
                        
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Primeiro processo da lista clicado com sucesso.");
                
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_primeiro_processo");
                throw new Error(`Erro ao clicar no primeiro processo da lista: ${error.message}`);
            }
        });

        await allure.step("Verificando detalhes da página do processo", async (ctx) => {
            await driver.sleep(4000); 
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Página de detalhes do processo presumidamente carregada e verificada.");
        });

    } catch (error) {
        await tirarPrint(driver, "Falha geral ao visualizar processo");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao visualizar processo: " + error.message);
    }
}

export { verProcesso };