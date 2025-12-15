import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaAtualizarPessoa(driver) {
    await allure.step("Clicando na última pessoa", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css('tr[style*="cursor: pointer"]'));
    
            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado. Certifique-se de que há registros cadastrados para este teste.");
            }
    
            let ultimoIndice = linhas.length - 1;
            console.log(`Quantidade de resultados: ${linhas.length}`);
            console.log(`Clicando na última pessoa: ${ultimoIndice}`);
    
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", linhas[ultimoIndice]);
    
            await driver.wait(until.elementIsVisible(linhas[ultimoIndice]));
            await driver.wait(until.elementIsEnabled(linhas[ultimoIndice]));
    
            await driver.executeScript("arguments[0].click();", linhas[ultimoIndice]);
    
            await ctx.parameter("Status", "Sucesso");
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao clicar no último resultado:", error);
            await tirarPrint(driver, "Erro ao clicar no ultimo resultado");
            await assert.fail('Erro ao clicar no último resultado');
            throw error;
        }
    });


    await allure.step("Tentando atualizar com nome muito longo", async (ctx) => {
        try {
            const nomeInvalido = "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Este nome é muito longo.";
            
            await driver.sleep(500);
            
            await driver.actions()
                .sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB)
                .sendKeys(Key.TAB, Key.TAB, Key.TAB)
                .perform();

            await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform();
            
            await driver.actions().sendKeys(nomeInvalido).perform();
            
            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Atualizar')]")); 
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
            await botaoAtualizar.click();

            await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')));
            const mensagem = await driver.findElement(By.css('[role="alertdialog"] span#message-id'));
            const textoMensagem = await mensagem.getText();

            const mensagemEsperada = 'Erro: O nome não pode exceder 80 caracteres';

            if (textoMensagem.includes(mensagemEsperada)) {
                console.log("Teste de validação de nome longo passou com sucesso.");
                await ctx.parameter("Status", "200 - Validação OK");
            } else {
                throw new Error(`Mensagem de erro incorreta. Esperado incluir: "${mensagemEsperada}", mas encontrado: ${textoMensagem}`);
            }
        } catch (error) {
            await ctx.parameter("Status", "400 - Falha no Teste");
            await tirarPrint(driver, "Erro ao tentar atualizar com nome longo");
            await assert.fail(`Erro ao tentar atualizar com nome longo: ${error.message}`);
            throw error;
        }
    });
}


export { falhaAtualizarPessoa };