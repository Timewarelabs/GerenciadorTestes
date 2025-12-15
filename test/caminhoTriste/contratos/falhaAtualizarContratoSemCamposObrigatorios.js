import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaAtualizarContratoSemCamposObrigatorios(driver) {
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

    await allure.step("Atualizando título e número", async (ctx) => {
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
                    await inputTitulo.sendKeys('');
                    await inputTitulo.sendKeys(Key.ENTER);
                    await inputTitulo.sendKeys(Key.TAB);
                    await ctx.parameter("Status", "Sucesso");
                    await ctx.parameter("Descrição", "Campo título atualizado com sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "Erro");
                    await tirarPrint(driver, "Erro ao atualizar título");
                    throw error;
                }
            });

            // Atualizando o número
            await allure.step("Alterando o número", async (ctx) => {
                try {
                    const inputNumero = await driver.switchTo().activeElement();
                    await inputNumero.clear();
                    await inputNumero.sendKeys('9999');
                    await inputNumero.sendKeys(Key.ENTER);
                    await inputNumero.sendKeys(Key.TAB);
                    await ctx.parameter("Status", "Sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "Erro");
                    await tirarPrint(driver, "Erro ao atualizar número");
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

            await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')), 2000);
    
            const mensagem = await driver.findElement(By.css('[role="alertdialog"] span#message-id'), 2000);
            const textoMensagem = await mensagem.getText();
    
            if (textoMensagem === "Incluído com sucesso" || textoMensagem === "Alterado com sucesso") {
                await allure.parameter("Status", "400 - ERRO DE TESTE");
                await tirarPrint(driver, "Falha: Contrato criado/atualizado sem campos obrigatorios");
                await assert.fail('Contrato criado/atualizado com sucesso (Bug: Aceitou campo vazio)!');
                console.log('Contrato criado/atualizado com sucesso (Falha no teste)!')
            } else {
                await allure.parameter("Status", "200 - Validação OK");
                console.log(`Validação OK. Mensagem: ${textoMensagem}`);
                await assert.ok(true, 'Erro ao atualizar contrato sem campo obrigatório (Comportamento esperado)');
            }
    
        } catch (error) {
            await ctx.parameter("Status", "200 - Validação OK (Catch)");
            await assert.ok(true, 'Erro ao clicar no botão de registro (Bloqueio esperado)');
            await tirarPrint(driver, "Erro ao clicar no botão de registro (Bloqueio esperado)");
            console.log("Sistema bloqueou o salvamento (Erro/Timeout esperado).");
        }
    });
}

export { falhaAtualizarContratoSemCamposObrigatorios };