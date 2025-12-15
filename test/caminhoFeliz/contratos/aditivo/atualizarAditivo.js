import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../../comum/tirarPrint.js"; 

async function atualizarAditivo(driver) {

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

    await allure.step("Clicando no botão de salvar/atualizar", async (ctx) => {
        try {
            await driver.sleep(2000);

            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Salvar')]")); 
    
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
    
            await botaoAtualizar.click();

            await driver.sleep(2000);
    
            await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')));
    
            const mensagem = await driver.findElement(By.css('[role="alertdialog"] span#message-id'));
            const textoMensagem = await mensagem.getText();
            
            const mensagemEsperada = 'Alterado com sucesso';
    
            if (textoMensagem === mensagemEsperada) {
                console.log("Contrato alterado com sucesso");
                await ctx.parameter("Status", "Sucesso");
            } else {
                await ctx.parameter("Status", "Erro");
                await assert.fail(`Alerta de sucesso não encontrado. Mensagem recebida: ${textoMensagem}`);
                throw new Error(`Texto do alerta não encontrado. Esperado: "${mensagemEsperada}", mas encontrado: ${textoMensagem}`);
            }
    
        } catch (error) {
            await ctx.parameter("Status", "Erro");
            await assert.fail('Erro ao clicar em salvar/atualizar');
            console.error("Erro ao clicar no botão de salvar/atualizar:", error.message);
            await tirarPrint(driver, "Erro ao clicar no botao de atualizar");
            throw error;
        }
    });
}


export { atualizarAditivo };