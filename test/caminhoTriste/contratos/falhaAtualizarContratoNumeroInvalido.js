import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaAtualizarContratoNumeroInvalido(driver) {
    let bugDetectado = false;
    let mensagemBug = "";

    await allure.step("Navegando até as ações do contrato", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/contratos/17040/editar`);

            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Navegado até edição do contrato com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "400");
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
                    await inputTitulo.sendKeys('Contrato de Teste Automatizado - caminho triste');
                    await inputTitulo.sendKeys(Key.ENTER);
                    await inputTitulo.sendKeys(Key.TAB, Key.TAB);
                    await driver.sleep(2000);
                    await ctx.parameter("Status", "200");
                    await ctx.parameter("Descrição", "Campo título atualizado com sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Erro ao atualizar título");
                    throw error;
                }
            });

            // Atualizando o número
            await allure.step("Alterando o número", async (ctx) => {
                try {
                    const inputNumero = await driver.switchTo().activeElement()
                    await inputNumero.sendKeys('Teste Numero');
                    await driver.sleep(600); 

                    const campoNumero = await driver.switchTo().activeElement();
                    const valorFinal = await campoNumero.getAttribute('value');
                    
                    if(valorFinal != 'Teste Numero' ){
                        console.log("Campo 'Número' não aceitou letras — validação funcionando corretamente.");
                        await allure.parameter("Validação Campo Número", "Campo rejeitou letras corretamente.");
                    }
                    else{
                        console.log("Campo 'Número' aceitou letras — validação ausente.");
                        allure.label("bug", "Campo 'Número' aceita letras");
                        allure.issue("BUG-NUMERO-CAMPO", "Campo 'Número' aceita letras inválidas");
                        await allure.parameter("Validação Campo Número", "Aceitou letras (comportamento incorreto)");
                        bugDetectado = true;
                        mensagemBug = "BUG: contrato com número inválido foi salvo — falha de validação no campo Número.";
                    }

                    await driver.sleep(400);
                    await ctx.parameter("Status", "200");
                } catch (error) {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Erro ao atualizar número");
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

    await allure.step("Clicando no botão de atualizar", async (ctx) => {
        try {
            await driver.sleep(2000);

            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Salvar')]"));
    
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
    
            await botaoAtualizar.click();

            await driver.sleep(2000);
    
        } catch (error) {
            await allure.parameter("Status", "400");
            await tirarPrint(driver, "Erro inesperado no fluxo completo do teste");
            await assert.fail(`Erro inesperado no fluxo completo: ${error.message}`);
        }
        if(bugDetectado){
            await tirarPrint(driver, "Validacao falhou - numero com letra permitido");
            await assert.fail(mensagemBug);
        }
    });
}

export { falhaAtualizarContratoNumeroInvalido };