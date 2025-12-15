import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";


async function excluirContrato(driver) {
    await allure.step("Navegando até as ações do contrato", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/contratos/`);
            await ctx.parameter("Status", "Sucesso");
            await ctx.parameter("Descrição", "Navegando até listagem de contrato com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao navegar até listagem:", error);
            await tirarPrint(driver, "Erro ao navegar até listagem");
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
            
            allure.parameter("Status", "Sucesso");
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

            allure.parameter("Status", "Sucesso");
            allure.parameter("Descrição", "Primeiro contrato da lista clicado com sucesso.");
        } catch (error) {
            allure.parameter("Status", "Erro");
            await tirarPrint(driver, "Erro_ao_clicar_no_primeiro_contrato");
            throw new Error(`Erro ao clicar no contrato: ${error.message}`);
        }
    });

    await allure.step("Clicando no botão de excluir", async (ctx) => {
        try {
            const botaoExcluir = await driver.wait( 
                until.elementLocated(By.css('div[title="Excluir"]')),
                10000
            );
            await driver.wait(until.elementIsVisible(botaoExcluir), 10000);
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoExcluir);
            await driver.sleep(1000);
            await botaoExcluir.click();

            await driver.sleep(1000);

            // Confirma a exclusão no modal
            await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();

            await ctx.parameter("Status", "Sucesso");
            await ctx.parameter("Descrição", "Botão excluir clicado e confirmado com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao clicar no botão excluir:", error);
            await tirarPrint(driver, "Erro ao clicar no botao excluir");
            throw error;
        }
    });

    await allure.step("Verificando mensagem de sucesso da exclusão", async (ctx) => {
        try {
            await driver.sleep(2000);
            await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')));
    
            const mensagem = await driver.findElement(By.css('[role="alertdialog"] span#message-id'));
            const textoMensagem = await mensagem.getText(); 
            
            const mensagemEsperada = 'Excluído com sucesso';
            
            if (textoMensagem === mensagemEsperada) {
                console.log("Contrato excluído com sucesso");
                await ctx.parameter("Status", "Sucesso");
            } else {
                await ctx.parameter("Status", "Erro");
                await assert.fail(`Alerta de sucesso não encontrado. Mensagem recebida: ${textoMensagem}`);
                throw new Error(`Texto do alerta não encontrado. Esperado: "${mensagemEsperada}", mas encontrado: ${textoMensagem}`);
            }
    
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            await assert.fail('Erro ao verificar mensagem de sucesso');
            console.error("Erro ao verificar mensagem de sucesso:", error.message);
            await tirarPrint(driver, "Erro ao verificar mensagem de sucesso");
            throw error;
        }
    });
}

export { excluirContrato };