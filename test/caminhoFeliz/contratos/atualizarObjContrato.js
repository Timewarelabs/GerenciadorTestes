import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";


async function atualizarObjContrato(driver) {
    await allure.step("Navegando até as ações do contrato", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/contratos/`);
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Navegando até listagem de contrato com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao navegar até listagem:", error);
            await tirarPrint(driver, "Erro ao navegar até listagem");
            throw error;
        }
    });

    await allure.step("Fechando o modal de tour/boas-vindas", async () => {
        try {
            const botaoFechar = await driver.wait(
                until.elementLocated(By.css('button.sc-bxivhb.eTpeTG.sc-bdVaJa.jRQxUV')),
                15000 
            );
            await driver.wait(until.elementIsVisible(botaoFechar), 5000);
            await driver.wait(until.elementIsEnabled(botaoFechar), 5000);
            await botaoFechar.click();
            
            allure.parameter("Status", "200");
            allure.parameter("Descrição", "Modal de tour fechado com sucesso.");
            
            await driver.wait(until.stalenessOf(botaoFechar), 5000);
            await driver.sleep(500); 
        } catch (error) {
            allure.parameter("Status", "202"); 
            allure.parameter("Aviso", "Modal de tour não encontrado ou erro ao fechar. Continuando...");
        }
    });

    await allure.step("Clicando no primeiro contrato da lista", async () => {
        try {
            await driver.wait(
                until.elementLocated(By.css("tbody tr")),
                15000
            );

            try {
                const spinner = await driver.findElement(By.css("svg.MuiCircularProgress-svg"));
                await driver.wait(until.elementIsNotVisible(spinner), 10000);
            } catch (_) {
            }

            await driver.sleep(500);

            const linhasContrato = await driver.findElements(By.css("tbody tr"));

            if (linhasContrato.length === 0) {
                await tirarPrint(driver, "Nenhum_contrato_encontrado");
                throw new Error("Nenhum contrato encontrado na tabela.");
            }

            const primeiraLinha = linhasContrato[0];

            await driver.wait(until.elementIsVisible(primeiraLinha), 10000);
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", primeiraLinha);
            await driver.sleep(300);

            await driver.executeScript("arguments[0].click();", primeiraLinha);

            allure.parameter("Status", "200");
            allure.parameter("Descrição", "Primeiro contrato da lista clicado com sucesso.");
        } catch (error) {
            allure.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_no_primeiro_contrato");
            throw new Error(`Erro ao clicar no contrato: ${error.message}`);
        }
    });
    
    await allure.step("Atualizando título e objeto", async (ctx) => {
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
                    await inputTitulo.sendKeys('Contrato de Teste Automatizado - Atualizado');
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

            await allure.step("Alterando o objeto", async (ctx) => {
                try {
                    const inputObjeto = await driver.wait( 
                        until.elementLocated(By.xpath("(//textarea[not(@tabindex='-1') and not(@readonly)])[1]")),
                        10000
                    );
                    await driver.wait(until.elementIsVisible(inputObjeto), 10000);
                    await driver.executeScript("arguments[0].click();", inputObjeto);

                    await driver.sleep(500); 

                    await inputObjeto.clear();
                    await inputObjeto.sendKeys("teste automatizado");
                    await inputObjeto.sendKeys(Key.TAB);

                    await ctx.parameter("Status", "200");
                    await ctx.parameter("Descrição", "Campo objeto atualizado com sucesso");
                } catch (error) {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Erro ao atualizar objeto");
                    throw new Error("Erro ao atualizar contrato: " + error.message); 
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
                await assert.fail('Alerta de sucesso não encontrado');
                throw new Error(`Texto do alerta não encontrado. Esperado: "${mensagemEsperada}", mas encontrado: ${textoMensagem}`);
            }
    
        } catch (error) {
            await ctx.parameter("Status", "400");
            await assert.fail('Erro ao clicar em salvar/atualizar');
            console.error("Erro ao clicar no botão de salvar/atualizar:", error.message);
            await tirarPrint(driver, "Erro ao clicar no botão de atualizar");
            throw error;
        }
    });
}

export { atualizarObjContrato };