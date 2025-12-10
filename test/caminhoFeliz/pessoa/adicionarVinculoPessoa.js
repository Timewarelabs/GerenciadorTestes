import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function adicionarVinculoPessoa(driver) {

    await allure.step("Clicando no botao de adicionar vínculo à pessoa", async (ctx) => {
        try{
            const btnAdicionar = await driver.findElement(By.css('div[title="Adicionar"]'));
            await btnAdicionar.click();

            const btnProcesso = await driver.findElement(By.xpath('//li[contains(text(), "Processo")]'));
            await btnProcesso.click();
        }
        catch(error){
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_no_botao_Adicionar_Vinculo");
            throw new Error(`Erro ao clicar no botão Adicionar Vinculo: ${error.message}`);
        }});
        
    await allure.step("Preenchendo o formulário de vínculo de processo", async (ctx) => {
        try {
            await driver.actions().sendKeys(Key.TAB).sendKeys(Key.TAB).sendKeys(Key.TAB).keyDown(Key.CONTROL).sendKeys('v').keyUp(Key.CONTROL).perform();
            await driver.actions().sendKeys(Key.TAB).perform();
            await driver.sleep(3000);
            await driver.actions().sendKeys(Key.ENTER).perform();
            
            const inputTitulo = await driver.findElement(By.name('Título'));
            await inputTitulo.click();
            await driver.actions().sendKeys("Processo 1 instancia").perform();

        }catch(error){
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_no_botao_Adicionar_Vinculo");
            throw new Error(`Erro ao clicar no botão Adicionar Vinculo: ${error.message}`);
        }});

    await allure.step("Editando as partes", async (ctx) => {
        try{    
            const btnEditar = await driver.findElement(By.css('div[title="Editar"]'));
            await btnEditar.click();

            const inputPosicao = await driver.findElement(By.id('posicao'));
            await inputPosicao.click();
            await driver.actions().sendKeys("adm").sendKeys(Key.ENTER).perform();
            await driver.actions().sendKeys(Key.TAB).sendKeys(Key.TAB).sendKeys(Key.ENTER).perform();
            await driver.sleep(2000);

            const btnSalvar = await driver.findElement(By.xpath('//button[contains(., "SALVAR")]'));
            await btnSalvar.click();

            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Processo atualizado com sucesso')]")), 10000);
            const textoMensagem = await driver.findElement(By.xpath("//*[contains(text(), 'Processo atualizado com sucesso')]")).getText();

            assert.strictEqual(textoMensagem, "Processo atualizado com sucesso");
            await ctx.parameter("Status", "200");

            const btnFechar = await driver.findElement(By.css('button[aria-label="Close"]'));
            await btnFechar.click();
            await driver.sleep(10000);

        }catch(error){
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_no_botao_Adicionar_Vinculo");
            throw new Error(`Erro ao clicar no botão Adicionar Vinculo: ${error.message}`);
        }});

}

export { adicionarVinculoPessoa };