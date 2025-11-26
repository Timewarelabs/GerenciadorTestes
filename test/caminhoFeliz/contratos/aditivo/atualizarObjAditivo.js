import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../../comum/tirarPrint.js"; 

async function atualizarObjAditivo(driver) {
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
                    await inputTitulo.sendKeys('Contrato de Teste Automatizado - Atualizado TESTE');
                    await inputTitulo.sendKeys(Key.ENTER);
                    await inputTitulo.sendKeys(Key.TAB);
                    await ctx.parameter("Status", "200");
                    await ctx.parameter("Descrição", "Campo título atualizado com sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Erro ao atualizar título");
                    throw error;
                }
            });

            await allure.step("Alterando o objeto/descrição", async (ctx) => {
                try {
                    await driver.sleep(2000);
                    await driver.actions().sendKeys('Teste Update - Objeto Aditivo').perform(); 
                    await driver.actions().sendKeys(Key.ENTER).perform();
                    await driver.actions().sendKeys(Key.TAB).perform();
                    await ctx.parameter("Status", "200");
                } catch (error) {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Erro ao atualizar objeto/descricao");
                    throw error;
                }
            });

            await driver.sleep(1000);
            await ctx.parameter("Status", "200");
        } catch (error) {
            console.error("Erro detalhado:", error.message);
            await ctx.parameter("Status", "400");
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
                await ctx.parameter("Status", "200");
            } else {
                await ctx.parameter("Status", "400");
                await assert.fail(`Alerta de sucesso não encontrado. Mensagem recebida: ${textoMensagem}`);
                throw new Error(`Texto do alerta não encontrado. Esperado: "${mensagemEsperada}", mas encontrado: ${textoMensagem}`);
            }
    
        } catch (error) {
            await ctx.parameter("Status", "400");
            await assert.fail('Erro ao clicar em salvar/atualizar');
            console.error("Erro ao clicar no botão de salvar/atualizar:", error.message);
            await tirarPrint(driver, "Erro ao clicar no botao de atualizar");
            throw error;
        }
    });
}


export { atualizarObjAditivo };