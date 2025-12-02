import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
// Importando o serviço de screenshot padronizado (subindo 3 pastas para chegar em test/comum)
import { tirarPrint } from "../../comum/tirarPrint.js"; 
// Ajustando caminho para a config (subindo 2 pastas para chegar em config)
// Nota: O seu original usava 'http://localhost:3000', vou manter a importação mas usar a URL hardcoded se preferir, 
// ou substituir por obterBaseUrl() se o localhost for o padrão do config. Vou assumir o padrão do config para consistência.
import { obterBaseUrl } from "../../config/global.config.js"; 

// Renomeada: createProcess -> criarProcesso
async function criarProcesso(driver) {
    try {
        await allure.step("Acessando página de listagem de processos", async (ctx) => {
            await driver.get(`${obterBaseUrl()}/processos/`); // Usando config para URL base
            const urlAtual = await driver.getCurrentUrl();
            allure.attachment("URL", urlAtual, "text/plain");
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Página de listagem de processos acessada com sucesso");
        });

        await allure.step("Clicando no botão Novo Processo para abrir o formulário", async (ctx) => {
            try {
                const btnNovoProcesso = await driver.wait( // Renomeada: btnNewProcess -> btnNovoProcesso
                    until.elementLocated(By.css('[data-testid="btn_new_process"]')), 
                    15000
                );
                await driver.wait(until.elementIsVisible(btnNovoProcesso), 10000);
                await btnNovoProcesso.click();
                
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Botão 'Novo Processo' clicado com sucesso");
                await driver.sleep(1000); 
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_Novo_Processo");
                throw new Error(`Erro ao clicar no botão Novo Processo: ${error.message}`);
            }
        });

        await allure.step("Gerando numero NUP aleatorio", async (ctx) => {
            try {
                // Abre nova aba ou navega para o gerador
                await driver.get('https://processogerador.paulosales.com.br/');
                
                const inputCopiar = await driver.findElement(By.css('[title="Copie com ctrl+c"]')); // Renomeada: input -> inputCopiar
                await inputCopiar.click();
                // Copia o NUP
                await driver.actions().keyDown(Key.CONTROL).sendKeys('c').keyUp(Key.CONTROL).perform();
                await driver.sleep(1000)

                // Volta para a aplicação principal
                await driver.navigate().back();

            } catch (error) {
                console.error("Erro ao copiar um numero NUP:", error);
                await ctx.parameter("Status", "400");
                await assert.fail('Erro ao copiar numero NUP');
                await tirarPrint(driver, "Erro_ao_copiar_numero_NUP");
                throw error;
            }
        });

        await allure.step("Fechando o modal inicial 'Cadastro de processo' (Tour)", async (ctx) => {
            try {
                // O navigate().back() já foi feito no passo anterior para voltar do gerador
                // Se o modal aparecer após o back(), tentamos fechar.
                
                const botaoFinalizar = await driver.wait( // Renomeada: finishButton -> botaoFinalizar
                    until.elementLocated(By.css('button[data-tour-elem="right-arrow"]')),
                    10000 
                );
                await driver.wait(until.elementIsVisible(botaoFinalizar), 5000);
                await driver.wait(until.elementIsEnabled(botaoFinalizar), 5000); 
                await botaoFinalizar.click();
                
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Modal 'Cadastro de processo' fechado com sucesso.");
                
                await driver.wait(until.stalenessOf(botaoFinalizar), 5000); 
                await driver.sleep(500); 
            } catch (error) {
                await ctx.parameter("Status", "202"); 
                // Não falha o teste se o tour não aparecer, apenas avisa e tira print opcional
                // await takeScreenshot(driver, "Erro_ao_fechar_modal_Cadastro_de_Processo"); 
                console.warn("AVISO: Não foi possível fechar o modal 'Cadastro de processo' (pode não ter aparecido). Erro: " + error.message);
            }
        });

        // Preenchendo os campos diretamente
        await allure.step("Preenchendo o campo: Número do Processo Principal", async (ctx) => {
            try {
                const campoInput = await driver.wait( // Renomeada: inputField -> campoInput
                    until.elementLocated(By.css('[data-testid="input_number_process"]')), 
                    10000
                );
                await driver.wait(until.elementIsVisible(campoInput), 10000);
                await campoInput.clear(); 
                await campoInput.click();
                // Cola o NUP copiado anteriormente
                await driver.actions().keyDown(Key.CONTROL).sendKeys('v').keyUp(Key.CONTROL).sendKeys(Key.TAB).perform(); 
                await driver.sleep(1500)
                
                await ctx.parameter("Status", "200");
                await ctx.parameter("Campo", "Número do Processo Principal");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_preencher_campo_Numero_Processo_Principal");
                throw error;
            }
        });

        await allure.step("Clicando no botão para salvar o processo", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_save_process"]')), 10000);
                const btnSalvarProcesso = await driver.findElement(By.css('[data-testid="btn_save_process"]')); // Renomeada: btnSaveProcess
                console.log('Botao salvar encontrado');

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btnSalvarProcesso);

                await driver.wait(until.elementIsEnabled(btnSalvarProcesso), 60000);
                await btnSalvarProcesso.click();
                
                const textoModalSucesso = await driver.wait( // Renomeada: successModalText -> textoModalSucesso
                    until.elementLocated(By.xpath("//p[contains(text(), 'Processo Cadastrado!')]")),
                    60000 
                );
                await driver.wait(until.elementIsVisible(textoModalSucesso), 5000);
                
                await ctx.parameter("Confirmação", "Modal de sucesso detectado");
                await driver.sleep(1000);
                await ctx.parameter("Status", "200");
                console.log('Processo cadastrado com sucesso!');

            } catch (error) {
                console.error('Erro: ', error)
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_salvar_processo");
                await assert.fail('Erro ao clicar no botão para salvar um processo: ' + error.message);
            }
        });

    } catch (error) {
        // Usando o serviço padronizado no catch principal
        await tirarPrint(driver, "Falha geral ao criar processo");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao criar processo: " + error.message);
    }
}

// Removida a função takeScreenshot local

export { criarProcesso };