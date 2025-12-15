import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function cancelarExclusaoPessoa(driver) { 

    await allure.step("Clicando no botão de exclusão", async (ctx) => {
        try {
            await driver.wait(until.elementLocated(By.css('div[title="Excluir"]')), 10000);
            await driver.findElement(By.css('div[title="Excluir"]')).click();

            await driver.sleep(1000);

            await driver.actions().sendKeys(Key.TAB).sendKeys(Key.TAB).sendKeys(Key.ENTER).perform();
            await driver.sleep(2000);
            await ctx.parameter("Status", "Sucesso");

            await allure.step("Verificando se o registro permanece", async (ctx) => {
                try {
                    const nomeEsperado = "Vinícius Nascimento Borges";
                    const inputNome = await driver.wait(
                        until.elementLocated(By.xpath(`//label[normalize-space(.)='Nome*']/parent::div//input | //input[@value='${nomeEsperado}']`)), 
                        10000, 
                        "Input do nome não encontrado ou não visível após cancelamento."
                    );

                    const valorAtual = await inputNome.getAttribute('value');
                    
                    assert.strictEqual(
                        valorAtual, 
                        nomeEsperado, 
                        `Falha na validação Sad Path: O valor do campo Nome não corresponde ao esperado. Esperado: "${nomeEsperado}", Atual: "${valorAtual}"`
                    );

                    await ctx.parameter("Status", "Sucesso");
                    await ctx.parameter("Resultado", `Registro permaneceu. Nome no campo: "${valorAtual}"`);
                    console.log("O registro não foi excluído");

                } catch (error) {
                    await ctx.parameter("Status", "Erro");
                    console.error("BUG: Registro foi excluído ao clicar em cancelar a operação", error.message);
                    await tirarPrint(driver, "BUG: Registro excluído após cancelamento da operação");
                    await assert.fail('BUG: Registro foi excluído ao clicar em cancelar a operação');
                    throw error;
                }

            });
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao clicar em exclusão ou validar fluxo:", error.message);
            await assert.fail('Erro ao clicar no botão de exclusão ou no fluxo de cancelamento');
            await tirarPrint(driver, "Erro ao clicar no botao de exclusao");
            throw error;
        }
    });
}


export { cancelarExclusaoPessoa };