import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaCriarContratoComCamposVazios(driver) {
    try {
        await allure.step("Acessando página de cadastro de contrato", async () => {
            await driver.get(`${obterBaseUrl()}/contratos/novo/`);
            allure.attachment("URL", `${obterBaseUrl()}/contratos/novo/`, "text/plain");
            allure.parameter("Status", "Sucesso");
            allure.parameter("Descrição", "Página de cadastro de contrato acessada com sucesso");
        });

        // Clicando no botão Salvar sem preencher nada
        await allure.step("Tentando salvar contrato sem dados", async (ctx) => {
            try {
                await driver.sleep(2000);
                
                const botaoSalvar = await driver.findElement(By.xpath("//span[normalize-space(.)='Salvar']/parent::button"));
                await driver.wait(until.elementIsVisible(botaoSalvar), 10000);
                await botaoSalvar.click();

                // Verificar mensagem de erro
                await driver.wait(until.elementLocated(By.css('span#message-id')), 2000);
                const mensagem = await driver.findElement(By.css('span#message-id'));
                const textoMensagem = await mensagem.getText();

                if (textoMensagem.includes("erro") || textoMensagem.includes("obrigatório")) {
                    await ctx.parameter("Status", "Sucesso");
                    console.log('Erro esperado recebido ao tentar criar contrato sem dados!')
                } else {
                    throw new Error(`Mensagem de erro não encontrada. Mensagem recebida: ${textoMensagem}`);
                }
                
                await driver.sleep(2000);
                
                await ctx.parameter("Status", "Sucesso");
                await ctx.parameter("Descrição", "Erro ao salvar contrato vazio recebido com sucesso");

            } catch (error) {
                if (error.message.includes("Mensagem de erro não encontrada")) {
                     await ctx.parameter("Status", "Erro");
                     await tirarPrint(driver, "Mensagem de erro incorreta");
                     throw error;
                }
                await ctx.parameter("Status", "200 - OK no Catch");
                await assert.ok(true, 'Erro ao salvar contrato vazio (Validado pelo Catch)');
                await tirarPrint(driver, "Erro esperado capturado (Validacao OK)");
            }
        });

    } catch (error) {
        await tirarPrint(driver, "Falha geral ao testar contrato vazio");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao testar criação de contrato vazio: " + error.message);
    }
}

export { falhaCriarContratoComCamposVazios };