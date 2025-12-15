import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaCriarProcesso(driver) {
    try {
        await allure.step("Acessando página de cadastro de processos", async (ctx) => {
            await driver.get(`${obterBaseUrl()}/processos/novo`); 
            const urlAtual = await driver.getCurrentUrl();
            allure.attachment("URL", urlAtual, "text/plain");
            await ctx.parameter("Status", "Sucesso");
            await ctx.parameter("Descrição", "Página de cadastro de processos acessada com sucesso");
        });

        await allure.step("Fechando o modal inicial 'Cadastro de processo'", async (ctx) => {
            try {
                const botaoFinalizar = await driver.wait( 
                    until.elementLocated(By.css('button[data-tour-elem="right-arrow"]')),
                    10000 
                );
                await driver.wait(until.elementIsVisible(botaoFinalizar), 5000);
                await driver.wait(until.elementIsEnabled(botaoFinalizar), 5000); 
                await botaoFinalizar.click();
                
                await ctx.parameter("Status", "Sucesso");
                await ctx.parameter("Descrição", "Modal 'Cadastro de processo' fechado com sucesso.");
                
                await driver.wait(until.stalenessOf(botaoFinalizar), 5000); 
                await driver.sleep(500); 
            } catch (error) {
                await ctx.parameter("Status", "Erro"); 
                console.warn("AVISO: Não foi possível fechar o modal 'Cadastro de processo'. Erro: " + error.message);
            }
        });

        await allure.step("Clicando no botão para salvar o processo (sem preencher dados)", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_save_process"]')), 10000);
                const btnSalvarProcesso = await driver.findElement(By.css('[data-testid="btn_save_process"]')); 
                console.log('Botao salvar encontrado');

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btnSalvarProcesso);

                await driver.wait(until.elementIsEnabled(btnSalvarProcesso), 60000);
                await btnSalvarProcesso.click();

                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                console.error('Erro: ', error)
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_salvar_processo");
                await assert.fail('Erro ao clicar no botão para salvar um processo: ' + error.message);
                throw error;
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
                    await ctx.parameter("Status", "200 - Validação OK");
                    await allure.parameter("Validação", "Sistema barrou corretamente o processo inválido");
                    await tirarPrint(driver, "Sadpath_Passou_-_Modal_de_erro_exibido");
                    console.log("Validação correta: o sistema exibiu o modal de erro.");
                } else {
                    await ctx.parameter("Status", "400 - Falha de Validação");
                    await allure.label("bug", "Mensagem de erro inesperada ou incorreta");
                    await allure.issue("BUG-004", "Mensagem incorreta ao salvar processo inválido");
                    await tirarPrint(driver, "BUG_-_Mensagem_errada_no_modal");
                    throw new Error(`BUG: Modal exibido com mensagem errada. Esperado: "Houve um problema", Encontrado: "${mensagem}"`);
                }
            } catch (error) {
                await ctx.parameter("Status", "400 - Modal não encontrado");
                await allure.label("bug", "Modal de erro ausente — falha de validação");
                await allure.issue("BUG-005", "Processo inválido foi aceito ou modal de erro não foi exibido");
                await tirarPrint(driver, "BUG_-_Modal_nao_exibido_apos_process_invalido");
                throw new Error("BUG: Modal de erro não foi exibido após tentar salvar processo inválido. O sistema pode ter aceitado o cadastro ou travado.");
            }
        });
        
    } catch (error) {
        await tirarPrint(driver, "Falha geral ao criar processo invalido");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao criar processo (Sad Path): " + error.message);
    }
}

export { falhaCriarProcesso };