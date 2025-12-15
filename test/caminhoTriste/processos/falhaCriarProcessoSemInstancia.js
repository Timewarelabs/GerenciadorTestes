import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaCriarProcessoSemInstancia(driver) {
    try {
        await allure.step("Acessando página de listagem de processos", async (ctx) => {
            await driver.get(`${obterBaseUrl()}/processos/`);
            const urlAtual = await driver.getCurrentUrl();
            allure.attachment("URL", urlAtual, "text/plain");
            await ctx.parameter("Status", "Sucesso");
            await ctx.parameter("Descrição", "Página de listagem de processos acessada com sucesso");
            await driver.sleep(1500); 
        });

        await allure.step("Fechando o modal de tour/boas-vindas", async (ctx) => {
            try {
                const botaoFechar = await driver.wait(
                    until.elementLocated(By.css('button.sc-bxivhb.eTpeTG.sc-bdVaJa.jRQxUV')),
                    15000 
                );
                await driver.wait(until.elementIsVisible(botaoFechar), 5000);
                await driver.wait(until.elementIsEnabled(botaoFechar), 5000);
                await botaoFechar.click();
                
                await ctx.parameter("Status", "Sucesso");
                await ctx.parameter("Descrição", "Modal de tour fechado com sucesso (botão 'x').");
                
                await driver.wait(until.stalenessOf(botaoFechar), 5000);
                await driver.sleep(500); 
            } catch (error) {
                await ctx.parameter("Status", "202"); 
                await ctx.parameter("Aviso", "Modal de tour (botão 'x') não encontrado ou erro ao fechar. Continuando...");
            }
        });

        await allure.step("Clicando no primeiro processo da lista", async (ctx) => {
            try {
                await driver.wait(
                    until.elementLocated(By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]//tr[contains(@class, 'MuiTableRow-root')]")),
                    15000 
                );

                try {
                    const spinner = await driver.findElement(By.css("svg.MuiCircularProgress-svg")); 
                    if (spinner) {
                        await driver.wait(until.elementIsNotVisible(spinner), 10000);
                    }
                } catch (e) {
                }
                
                await driver.sleep(500);

                const linhasProcesso = await driver.findElements(
                    By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]/tr[contains(@class, 'MuiTableRow-root') and not(contains(@class, 'MuiTableRow-head'))]") 
                );
                
                if (linhasProcesso.length === 0) {
                    await tirarPrint(driver, "Nenhum_processo_encontrado");
                    throw new Error("Nenhum processo encontrado na tabela.");
                }

                await driver.wait(until.elementIsVisible(linhasProcesso[0]), 10000);
                
                const primeiroProcesso = linhasProcesso[0];

                try {
                    await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", primeiroProcesso);
                    await driver.sleep(500); 
                    await driver.executeScript("arguments[0].click();", primeiroProcesso);
                } catch (erroCliqueJS) {
                    await tirarPrint(driver, "Erro_clique_com_JavaScript");
                    throw new Error(`Falha ao clicar no processo com JavaScript. Erro JS Click: ${erroCliqueJS.message}`);
                }
                        
                await ctx.parameter("Status", "Sucesso");
                await ctx.parameter("Descrição", "Primeiro processo da lista clicado com sucesso.");
                
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_no_primeiro_processo");
                throw new Error(`Erro ao clicar no primeiro processo da lista: ${error.message}`);
            }
        });

        await allure.step("Clicando no botão para salvar o processo (sem preencher instância)", async (ctx) => {
            try {
                await driver.sleep(1000); 
                await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                await driver.sleep(1000); 
                
                const btnSalvarProcesso = await driver.wait(
                    until.elementLocated(By.css('[data-testid="btn_save_process"]')),
                    10000
                );
                console.log('Botão encontrado');

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btnSalvarProcesso);
                await driver.sleep(500);

                await driver.wait(until.elementIsEnabled(btnSalvarProcesso), 10000);

                await driver.executeScript("arguments[0].click();", btnSalvarProcesso);
                await driver.sleep(2000);

                await ctx.parameter("Status", "Sucesso");
                console.log("Botão de salvar processo clicado com sucesso!");

            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_salvar_processo");
                throw new Error("Erro ao clicar no botão para salvar um processo: " + error.message);
            }
        });

        await allure.step("Verificando se modal de erro foi exibido", async (ctx) => {
            try {
                const tituloModalErro = await driver.wait(
                    until.elementLocated(By.xpath("//h6[contains(text(), 'Houve um problema')]")),
                    5000
                );
                const mensagem = await tituloModalErro.getText();

                if (mensagem.includes("Houve um problema")) {
                    await ctx.parameter("Status", "Sucesso");
                    await allure.parameter("Validação", "Sistema barrou corretamente o processo inválido");
                    await tirarPrint(driver, "Sadpath_Passou_-_Modal_de_erro_exibido");
                    console.log("Validação correta: o sistema exibiu o modal de erro.");
                } else {
                    await ctx.parameter("Status", "Erro");
                    await allure.label("bug", "Mensagem de erro inesperada ou incorreta");
                    await allure.issue("BUG-004", "Mensagem incorreta ao salvar processo inválido");
                    await tirarPrint(driver, "BUG_-_Mensagem_errada_no_modal");
                    throw new Error("BUG: Modal exibido com mensagem errada.");
                }
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await allure.label("bug", "Mensagem de erro não apareceu — falha de validação");
                await allure.issue("BUG-005", "Processo inválido foi aceito ou modal de erro não foi exibido");
                await tirarPrint(driver, "BUG_-_Modal_nao_exibido_apos_process_invalido");
                throw new Error("BUG: Modal de erro não foi exibido após tentar salvar processo inválido.");
            }
        });

    } catch (error) {
        await tirarPrint(driver, "Falha geral ao criar processo sem instancia");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao salvar processo sem instância: " + error.message);
    }
}

export { falhaCriarProcessoSemInstancia };