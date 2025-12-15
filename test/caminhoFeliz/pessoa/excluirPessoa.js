import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 


async function excluirPessoa(driver) {

    await allure.step("Clicando no botão de exclusão", async (ctx) => {
        try {
            await driver.wait(until.elementLocated(By.css('div[title="Excluir"]')), 10000);
            await driver.findElement(By.css('div[title="Excluir"]')).click();

            await driver.sleep(1000);

            await driver.actions().sendKeys(Key.TAB).sendKeys(Key.TAB).sendKeys(Key.TAB).sendKeys(Key.ENTER).perform();
            await driver.sleep(2000);
            await ctx.parameter("Status", "Sucesso");

            await allure.step("Verificando a mensagem de sucesso da exclusão", async (ctx) => {
                try {
                    const mensagem = await driver.findElement(By.css('[role="alertdialog"] span#message-id'));
                    const textoMensagem = await mensagem.getText(); 

                    const mensagemEsperada = 'Pessoa excluída com sucesso!';
                    if (textoMensagem === mensagemEsperada) {
                        await ctx.parameter("Status", "Sucesso");
                        await ctx.parameter("Resultado", `Mensagem: "${textoMensagem}"`);
                        console.log("Pessoa excluída com sucesso.");
                    } else {

                        assert.strictEqual(textoMensagem, mensagemEsperada, 
                            `Texto do alerta não corresponde. Esperado: "${mensagemEsperada}", encontrado: "${textoMensagem}"`);
                    }
                } catch (error) {
                    await ctx.parameter("Status", "Erro");
                    await tirarPrint(driver, "Erro ao validar mensagem de exclusao");
                    await assert.fail('Alerta de sucesso de exclusão não encontrado');
                    throw error;
                }

            });
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro no fluxo de exclusão:", error.message);
            await assert.fail('Erro ao clicar no botão de exclusão ou no fluxo');
            await tirarPrint(driver, "Erro no fluxo de exclusao");
            throw error;
        }
    });
}


export { excluirPessoa };