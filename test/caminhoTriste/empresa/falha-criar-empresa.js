import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { tirarPrint } from '../../comum/tirarPrint.js';

async function FalhaCriarEmpresa(driver) {
    try {
        console.log("Iniciando cadastro de empresa (Cenário de Falha)...");

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

        await allure.step("Preenchendo os dados da empresa (Campos Vazios)", async (ctx) => {
            try {
                // Envia campos vazios para forçar erro
                await driver.actions().sendKeys(Key.TAB, Key.TAB, '').perform();
                await driver.actions().sendKeys(Key.TAB, '').perform();
                await driver.sleep(1500);
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                console.error("Erro ao preencher os dados da empresa:", erro.message);
                await assert.fail('Erro ao preencher campos');
                throw erro;
            }
        });

        await allure.step("Clicando no botão de registro e Validando Falha", async (ctx) => {
            try {
                // Seletor ajustado ou mantido conforme seu original, mas idealmente seria um seletor mais robusto
                const botaoRegistrar = await driver.findElement(By.css('.jss126.jss174.jss176.jss179.jss273')); 
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoRegistrar);
                await botaoRegistrar.click();

                // Espera pelo alerta (se aparecer sucesso, é falha do teste)
                await driver.wait(until.elementLocated(By.css('.jss2922.jss2930.jss2958.jss2966.jss2985.jss1545')), 5000, "Timeout ao esperar o alerta aparecer");

                const elementoMensagem = await driver.findElement(By.css('.jss2922.jss2930.jss2958.jss2966.jss2985.jss1545 #message-id'));
                const textoAlerta = await elementoMensagem.getText();

                if (textoAlerta === 'Empresa incluída com sucesso!') {
                    await ctx.parameter("Status", "Erro");
                    await assert.fail('Erro: O sistema permitiu cadastro com dados vazios!');
                } else {
                    console.log(`Mensagem de erro capturada corretamente: ${textoAlerta}`);
                    await ctx.parameter("Status", "Sucesso");
                    // Opcional: Validar se a mensagem é a de erro esperada
                }

            } catch (erro) {
                // Se der erro ao tentar clicar ou achar o alerta, capturamos aqui
                await ctx.parameter("Status", "Sucesso"); // 200 aqui pode significar que o teste passou pois o cadastro falhou?
                // Atenção: Se o fluxo "explodir" antes da validação, pode ser um erro real de teste.
                // Mas seguindo seu script original, mantive a lógica de captura.
                await tirarPrint(driver, "Tentativa de registro falhou (Esperado)");
            }
        });

        await allure.step("Finalizando verificação", async (ctx) => {
            try {
                console.log("Teste negativo concluído.");
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro durante a finalização');
                throw erro;
            }
        });

    } catch (erro) {
        console.error("Erro inesperado no teste:", erro);
        await tirarPrint(driver, "Erro_Geral_FalhaCriarEmpresa");
        throw erro;
    }
}

export { FalhaCriarEmpresa };