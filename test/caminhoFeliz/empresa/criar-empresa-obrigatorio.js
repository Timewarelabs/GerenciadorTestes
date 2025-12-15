import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { tirarPrint } from '../../comum/tirarPrint.js';

async function CriarEmpresaObrigatorio(driver) {
    try {
        console.log("Iniciando cadastro de empresa...");

        await allure.step("Acessando página de cadastro de empresa", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas/empresas/novo/`);
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                console.error("Erro ao acessar a página de cadastro de empresa:", erro.message);
                await assert.fail('Erro ao acessar página de gerenciamento');
                await tirarPrint(driver, "Erro ao acessar a página de cadastro de empresa");
                throw erro;
            }
        });

        await allure.step("Marcando checkbox de aceite", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), 15000);
                await driver.findElement(By.css('input[type="checkbox"]')).click();

                await driver.actions().sendKeys(Key.TAB, Key.ENTER, 10000).perform();
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "failed");
                console.error("Erro ao marcar checkbox:", erro.message);
                await tirarPrint(driver, "Erro ao marcar checkbox");
                await assert.fail('Erro ao ativar modo manual');
                throw new Error(`Teste falhou: ${erro.message}`);
            }
        });

        await allure.step("Preenchendo os dados da empresa", async (ctx) => {
            try {
                await driver.actions().sendKeys(Key.TAB, Key.TAB, 'Tech Solutions Ltda').perform();
                await driver.actions().sendKeys(Key.TAB, 'Tech Soluções').perform();
                await driver.sleep(1500);
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                console.error("Erro ao preencher os dados da empresa:", erro.message);
                await assert.fail('Erro ao preencher campos');
                throw erro;
            }
        });

        await allure.step("Clicando no botão de registro", async (ctx) => {
            try {
                const botaoRegistrar = await driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[3]/div/button[1]"));
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoRegistrar);
                await botaoRegistrar.click();

                await driver.wait(until.elementLocated(By.id('message-id')), 5000, "Timeout ao esperar o alerta aparecer");

                const elementoMensagem = await driver.findElement(By.id('message-id'));
                const textoAlerta = await elementoMensagem.getText();

                if (textoAlerta === 'Empresa incluída com sucesso!') {
                    await ctx.parameter("Status", "Sucesso");
                } else {
                    await ctx.parameter("Status", "Erro");
                    await assert.fail('Alerta de sucesso não encontrado');
                    throw new Error(`Texto do alerta não encontrado. Esperado: "Empresa incluída com sucesso!", mas encontrado: ${textoAlerta}`);
                }

            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                console.error("Erro ao clicar no botão de registro:", erro.message);
                await assert.fail('Erro ao clicar no botão de registro');
                await tirarPrint(driver, "Erro ao clicar no botão de registro");
                throw erro;
            }
        });

        await allure.step("Finalizando cadastro", async (ctx) => {
            try {
                console.log("Cadastro de empresa concluído!");
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro durante a finalização ao cadastro');
                console.error("Erro durante a finalização do cadastro:", erro.message);
                await tirarPrint(driver, "Erro durante a finalização do cadastro");
                throw erro;
            }
        });

    } catch (erro) {
        console.error("Erro ao tentar registrar a empresa:", erro);
        await tirarPrint(driver, "Erro geral no cadastro");
        throw erro;
    }
}

export { CriarEmpresaObrigatorio };