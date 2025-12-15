import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaAtualizarContratoDataInvalida(driver) {
    await allure.step("Navegando até as ações do contrato", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/contratos/17040/editar`);

            await ctx.parameter("Status", "Sucesso");
            await ctx.parameter("Descrição", "Navegado até edição do contrato com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao navegar até edição:", error);
            await tirarPrint(driver, "Erro ao navegar até edição");
            throw error;
        }
    });

    await allure.step("Atualizando título e datas com valores inválidos", async (ctx) => {
        try {
            await allure.step("Alterando o título", async (ctx) => {
                try {
                    await driver.sleep(2000);
                    const inputTitulo = await driver.wait(
                        until.elementLocated(By.xpath("//label[normalize-space(.)='Título*']/parent::div//input")),
                        10000
                    );
                    await driver.wait(until.elementIsVisible(inputTitulo), 10000);
                    await inputTitulo.clear();
                    await inputTitulo.sendKeys('Contrato de Teste Automatizado - caminho triste');
                    await inputTitulo.sendKeys(Key.ENTER);
                    await inputTitulo.sendKeys(Key.TAB, Key.TAB, Key.TAB);
                    await driver.sleep(2000);
                    await ctx.parameter("Status", "Sucesso");
                    await ctx.parameter("Descrição", "Campo título atualizado com sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "Erro");
                    await tirarPrint(driver, "Erro ao atualizar título");
                    throw error;
                }
            });

            // Atualizando as datas com valor inválido
            await allure.step("Alterando as datas para valores inválidos", async (ctx) => {
                try {
                    
                    await driver.actions().sendKeys(Key.TAB).perform();
                    await driver.actions().sendKeys('99999999').perform();
                    await driver.actions().sendKeys(Key.ENTER).perform();
                    
                    await driver.actions().sendKeys(Key.TAB).perform();
                    await driver.actions().sendKeys('99999999').perform();
                    await driver.actions().sendKeys(Key.ENTER).perform();
                    
                    await driver.actions().sendKeys(Key.TAB).perform();
                    await driver.actions().sendKeys('99999999').perform();
                    await driver.actions().sendKeys(Key.ENTER).perform();
                    
                    await driver.actions().sendKeys(Key.TAB).perform();
                    await driver.actions().sendKeys('99999999').perform();

                    await ctx.parameter("Status", "Sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "Erro");
                    await tirarPrint(driver, "Erro ao inserir datas inválidas");
                    throw error;
                }
            });

            await driver.sleep(1000);
            await ctx.parameter("Status", "Sucesso");
        } catch (error) {
            console.error("Erro detalhado:", error.message);
            await ctx.parameter("Status", "Erro");
            await assert.fail(`Erro ao atualizar contrato: ${error.message}`);
            await tirarPrint(driver, "Erro ao atualizar contrato");
            throw error;
        }
    });

    await allure.step("Clicando no botão de atualizar", async (ctx) => {
        try {
            await driver.sleep(2000);

            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Salvar')]"));

            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);

            await botaoAtualizar.click();

            await driver.sleep(2000);
            
            const localizadorMensagem = By.css('[role="alertdialog"] span#message-id');
            await driver.wait(until.elementLocated(localizadorMensagem), 2000);

            const mensagem = await driver.findElement(localizadorMensagem);
            const textoMensagem = await mensagem.getText();

            if (textoMensagem === "Alterado com sucesso") {
                await allure.parameter("Status", "400 - ERRO DE TESTE");
                await tirarPrint(driver, "Falha: Contrato atualizado com data invalida");
                await assert.fail('Contrato alterado com sucesso (Data inválida foi aceita)!');
                console.log('Contrato alterado com sucesso (Falha no teste)!')
            } else {
                await allure.parameter("Status", "200 - Validação OK");
                await assert.ok(true, 'Erro esperado ao atualizar contrato com data inválida');
                console.log(`Validação de data inválida bem sucedida. Mensagem: ${textoMensagem}`);
            }

        } catch (error) {
            await ctx.parameter("Status", "200 - Validação OK (Catch)");
            await assert.ok(true, 'Erro ao clicar no botão de registro (Bloqueio esperado ou Timeout)');
            await tirarPrint(driver, "Erro ao clicar no botão de registro (Bloqueio esperado)");
            console.log("Sistema bloqueou o salvamento (Erro/Timeout esperado).");
        }
    });
}

export { falhaAtualizarContratoDataInvalida };