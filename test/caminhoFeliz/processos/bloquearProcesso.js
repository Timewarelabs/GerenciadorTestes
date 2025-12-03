import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function bloquearProcesso(driver) {
    let primeiroProcesso = null;

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
                await driver.wait(until.stalenessOf(botaoFechar), 5000);
                await driver.sleep(500);
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Modal de tour fechado com sucesso.");
            } catch {
                await ctx.parameter("Status", "202");
                await ctx.parameter("Aviso", "Modal de tour não encontrado. Continuando...");
            }
        });

        await allure.step("Localizando o primeiro processo na lista", async (ctx) => {
            try {
                await driver.wait(
                    until.elementLocated(By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]//tr[contains(@class, 'MuiTableRow-root')]")),
                    15000
                );

                try {
                    const spinner = await driver.findElement(By.css("svg.MuiCircularProgress-svg"));
                    await driver.wait(until.elementIsNotVisible(spinner), 10000);
                } catch {}

                const linhasProcesso = await driver.findElements(
                    By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]/tr[contains(@class, 'MuiTableRow-root') and not(contains(@class, 'MuiTableRow-head'))]")
                );

                if (linhasProcesso.length === 0) {
                    await tirarPrint(driver, "Nenhum_processo_encontrado_para_bloquear");
                    throw new Error("Nenhum processo encontrado na tabela para bloquear.");
                }

                await driver.wait(until.elementIsVisible(linhasProcesso[0]), 10000);

                primeiroProcesso = linhasProcesso[0];
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Primeiro processo localizado com sucesso.");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_localizar_primeiro_processo_para_bloquear");
                throw new Error(`Erro ao localizar primeiro processo para bloquear: ${error.message}`);
            }
        });

        await allure.step("Clicando no botão de opções", async (ctx) => {
            try {
                const botaoOpcoes = await primeiroProcesso.findElement(By.xpath(".//button[@aria-label='Opções']")); // Renomeada: optionsButton
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", botaoOpcoes);
                await driver.wait(until.elementIsVisible(botaoOpcoes), 5000);
                await driver.wait(until.elementIsEnabled(botaoOpcoes), 5000);
                await botaoOpcoes.click();
                await driver.sleep(300);
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Botão de opções clicado com sucesso.");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_clicar_opcoes_processos");
                throw new Error(`Erro ao clicar no botão de opções: ${error.message}`);
            }
        });

        await allure.step("Clicando na opção 'Bloquear processo'", async (ctx) => {
            try {
                await driver.sleep(1000);

                const opcaoBloquear = await driver.wait(
                    until.elementLocated(By.xpath("/html/body/div[4]/div[2]/ul/li[2]")),
                    10000 
                );

                await driver.wait(until.elementIsVisible(opcaoBloquear), 5000);
                await driver.wait(until.elementIsEnabled(opcaoBloquear), 5000);
                await opcaoBloquear.click();

                await driver.sleep(1000);
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Opção 'Bloquear processo' clicada com sucesso.");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_clicar_Bloquear_processo");
                throw new Error(`Erro ao clicar na opção 'Bloquear processo': ${error.message}`);
            }
        });

    } catch (error) {
        try {
            await tirarPrint(driver, "Erro_fatal_bloquearProcesso");
        } catch {}
        allure.attachment("Erro", error.message, "text/plain");
        throw new Error(`Falha ao bloquear processo: ${error.message}`);
    }
}

export { bloquearProcesso };