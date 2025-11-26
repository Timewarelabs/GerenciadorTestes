import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../../comum/tirarPrint.js"; 

async function excluirAditivo(driver) {

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

            await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();

            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Botão excluir clicado e confirmado com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar no botão excluir:", error);
            await tirarPrint(driver, "Erro ao clicar no botao excluir");
            throw error;
        }
    });

    await allure.step("Verificando mensagem de sucesso", async (ctx) => {
        try {
            await driver.sleep(2000);
            await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')));
    
            const mensagem = await driver.findElement(By.css('[role="alertdialog"] span#message-id'));
            const textoMensagem = await mensagem.getText();
            
            const mensagemSucessoEsperada = 'Aditivo excluído com sucesso';
            
            if (textoMensagem === mensagemSucessoEsperada) {
                console.log("Aditivo excluído com sucesso");
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", mensagemSucessoEsperada);
            } else {
                await ctx.parameter("Status", "400");
                await assert.fail(`Alerta de sucesso não encontrado. Mensagem recebida: ${textoMensagem}`);
                throw new Error(`Texto do alerta não encontrado. Esperado: "${mensagemSucessoEsperada}", mas encontrado: ${textoMensagem}`);
            }
    
        } catch (error) {
            await ctx.parameter("Status", "400");
            await assert.fail('Erro ao verificar mensagem de sucesso');
            console.error("Erro ao verificar mensagem de sucesso:", error.message);
            await tirarPrint(driver, "Erro ao verificar mensagem de sucesso");
            throw error;
        }
    });
}

export { excluirAditivo };