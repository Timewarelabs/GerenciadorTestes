import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function falhaCriarPessoa(driver) {
    try {
        console.log("Iniciando cadastro de pessoa...");

        await allure.step("Acessando página de cadastro", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas/pessoas/novo/`);
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao acessar página de cadastro");
                assert.fail(`Erro ao acessar a página de cadastro: ${error.message}`);
            }
        });

        const xpathNome = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[1]/div[6]/div/div/input";
        await allure.step("Aguardando campo 'Nome' carregar", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.xpath(xpathNome)), 15000);
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao esperar o campo 'Nome'");
                assert.fail(`Erro ao esperar o campo 'Nome': ${error.message}`);
            }
        });

        await allure.step("Preenchendo o campo 'Nome' com valor vazio", async (ctx) => {
            try {
                const nomeInput = await driver.findElement(By.xpath(xpathNome));
                await nomeInput.clear();
                await nomeInput.sendKeys('');
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao preencher o campo 'Nome' com vazio");
                assert.fail(`Erro ao preencher o campo 'Nome': ${error.message}`);
            }
        });

        await allure.step("Clicando no botão de registro (Salvar)", async (ctx) => {
            const xpathBotaoSalvar = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[3]/div/button[1]";
            try {
                const botao = await driver.findElement(By.xpath(xpathBotaoSalvar));
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botao);
                await botao.click();

                // Aguarda alerta
                await driver.wait(until.elementLocated(By.css('.jss2922.jss2930.jss2958.jss2966.jss2985.jss1545')), 5000);

                const mensagem = await driver.findElement(By.css('.jss2922.jss2930.jss2958.jss2966.jss2985.jss1545 #message-id'));
                const textoMensagem = await mensagem.getText();

                if (textoMensagem === 'Empresa incluída com sucesso!') {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Cadastro deveria falhar, mas foi bem-sucedido");
                    assert.fail('Cadastro foi realizado com sucesso, mas esperava-se falha.');
                } else {
                    await ctx.parameter("Status", "200");
                }

            } catch (error) {
                await ctx.parameter("Status", "200");
                await tirarPrint(driver, "Erro ao clicar no botão de registro");
                console.warn("Esperado erro ao tentar cadastrar pessoa:", error.message);
            }
        });

        await allure.step("Finalizando tentativa de cadastro", async (ctx) => {
            try {
                console.log("Tentativa de cadastro concluída.");
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro na finalização");
                assert.fail(`Erro na finalização: ${error.message}`);
            }
        });

    } catch (error) {
        console.error("Erro geral na tentativa de cadastro:", error);
        await tirarPrint(driver, "Erro geral na tentativa de cadastro");
        throw error;
    }
}

export { falhaCriarPessoa };