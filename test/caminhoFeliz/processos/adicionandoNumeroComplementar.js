import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
// Importando o serviço de screenshot padronizado (subindo 3 pastas para chegar em test/comum)
import { tirarPrint } from "../../comum/tirarPrint.js"; 
// Ajustando caminho para a config (subindo 2 pastas para chegar em config)
import { obterBaseUrl } from "../../config/global.config.js"; 

// Renomeada: addingComplementaryNumber -> adicionandoNumeroComplementar
async function adicionandoNumeroComplementar(driver) {
    try {
        await allure.step("Acessando página de listagem de processos", async (ctx) => {
            await driver.get(`${obterBaseUrl()}/processos/`); // Usando config
            const urlAtual = await driver.getCurrentUrl();
            allure.attachment("URL", urlAtual, "text/plain");
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Página de listagem de processos acessada com sucesso");
            await driver.sleep(1500); 
        });

        await allure.step("Fechando o modal de tour/boas-vindas", async (ctx) => {
            try {
                const botaoFechar = await driver.wait( // Renomeada: closeButton
                    until.elementLocated(By.css('button.sc-bxivhb.eTpeTG.sc-bdVaJa.jRQxUV')), 
                    15000 
                );
                await driver.wait(until.elementIsVisible(botaoFechar), 5000);
                await driver.wait(until.elementIsEnabled(botaoFechar), 5000);
                await botaoFechar.click();
                
                await ctx.parameter("Status", "200");
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

                const linhasProcesso = await driver.findElements( // Renomeada: linesProcess
                    By.xpath("//tbody[contains(@class, 'MuiTableBody-root')]/tr[contains(@class, 'MuiTableRow-root') and not(contains(@class, 'MuiTableRow-head'))]") 
                );
                
                if (linhasProcesso.length === 0) {
                    await tirarPrint(driver, "Nenhum_processo_encontrado");
                    throw new Error("Nenhum processo encontrado na tabela.");
                }

                await driver.wait(until.elementIsVisible(linhasProcesso[0]), 10000);
                
                const primeiroProcesso = linhasProcesso[0]; // Renomeada: firstProcess
                
                try {
                    await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", primeiroProcesso); 
                    await driver.sleep(500); 
                    await driver.executeScript("arguments[0].click();", primeiroProcesso);
                } catch (erroCliqueJS) { // Renomeada: jsClickError
                    await tirarPrint(driver, "Erro_clique_com_JavaScript");
                    throw new Error(`Falha ao clicar no processo com JavaScript. Erro JS Click: ${erroCliqueJS.message}`);
                }
                        
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Primeiro processo da lista clicado com sucesso.");
                
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_primeiro_processo");
                throw new Error(`Erro ao clicar no primeiro processo da lista: ${error.message}`);
            }
        });

        await allure.step("Preenchendo o campo: Número do Processo Complementar", async (ctx) => {
            try {
                const campoInput = await driver.wait( // Renomeada: inputField -> campoInput
                    until.elementLocated(By.css('[data-testid="complementary_number_process"]')), 
                    10000
                );
                await driver.wait(until.elementIsVisible(campoInput), 10000);
                await campoInput.clear(); 
                await campoInput.sendKeys('456');
                await driver.sleep(1500)
                
                await ctx.parameter("Status", "200");
                await ctx.parameter("Campo", "Número do Processo Complementar");
                await ctx.parameter("Valor", '456');
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_preencher_campo_Numero_Processo_Complementar");
                throw error;
            }
        });

        await allure.step("Expandindo seção '1ª Instância'", async (ctx) => {
            try {
                const botaoPrimeiraInstancia = await driver.wait( // Renomeada: buttonFirstInstance
                    until.elementLocated(By.xpath("//button[.//span[contains(text(), '1ª Instância')]]")),
                    10000
                );

                await driver.wait(until.elementIsVisible(botaoPrimeiraInstancia), 5000);
                await driver.wait(until.elementIsEnabled(botaoPrimeiraInstancia), 5000);

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", botaoPrimeiraInstancia);
                await driver.sleep(1000);

                await driver.executeScript(`
                    const element = arguments[0];
                    const event = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    element.dispatchEvent(event);
                `, botaoPrimeiraInstancia);

                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Seção '1ª Instância' expandida com sucesso.");
                await driver.sleep(1000);

            } catch (error) {
                await tirarPrint(driver, "Erro_ao_clicar_em_primeira_instancia");
                throw new Error("Erro ao clicar em '1ª Instância': " + error.message);
            }
        });


        await allure.step("Preenchendo o campo 'Título'", async (ctx) => {
            try {
                const inputTitulo = await driver.wait( // Renomeada: inputTitle
                    until.elementLocated(By.css('input[name="Título"]')),
                    10000
                );

                await driver.wait(until.elementIsVisible(inputTitulo), 5000);
                await inputTitulo.clear();
                await inputTitulo.sendKeys("teste");
                await driver.actions().sendKeys(Key.TAB).perform();
                await driver.sleep(1000)

                await ctx.parameter("Status", "200");
                await ctx.parameter("Campo", "Título");
                await ctx.parameter("Valor", "teste");
                await driver.sleep(2000);
            } catch (error) {
                await tirarPrint(driver, "Erro_ao_preencher_campo_Titulo");
                throw new Error("Erro ao preencher campo 'Título': " + error.message);
            }
        });

        await allure.step("Criando parte de processo", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_parts"]')), 10000);
                const btnAdicionarPartes = await driver.findElement(By.css('[data-testid="btn_parts"]')); // Renomeada: btnAddParts
                
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btnAdicionarPartes);
                await driver.sleep(500);
                
                await driver.executeScript("arguments[0].click();", btnAdicionarPartes);
                await driver.sleep(1000);

                const btnFecharModal = await driver.findElements(By.css('button.sc-bxivhb.eTpeTG.sc-bdVaJa.jRQxUV')); // Renomeada: closeModalBtn
                if (btnFecharModal.length > 0) {
                    await driver.executeScript("arguments[0].click();", btnFecharModal[0]);
                    await driver.sleep(1000); 
                }                                
                const inputParte = await driver.wait(until.elementLocated(By.id("parte")), 10000); // Renomeada: inputPart

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", inputParte);
                await inputParte.click();
                await driver.sleep(500);

                await inputParte.sendKeys('t');
                await driver.sleep(500);

                const botaoAdicionar = await driver.wait( // Renomeada: addButton
                    until.elementLocated(By.xpath("//p[normalize-space(.)='ADICIONAR NOVA PESSOA']")),
                    10000
                );
                await botaoAdicionar.click();

                await driver.sleep(1000);

                const inputCpf = await driver.wait( // Renomeada: inputCPF
                    until.elementLocated(By.css('div[data-testid="input_cpf"] input[type="text"]')),
                    10000
                );

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", inputCpf);
                await inputCpf.click();
                await driver.sleep(500);

                await inputCpf.sendKeys('28905486860');
                await driver.sleep(550);
                await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.ENTER).perform();

                const inputPosicao = await driver.wait( // Renomeada: positionInput
                    until.elementLocated(By.name('posicao')),
                    10000
                );
                await inputPosicao.click();
                await inputPosicao.sendKeys('adm', Key.ENTER);
                await driver.sleep(1000);

                const checkboxCliente = await driver.wait( // Renomeada: clientCheckbox
                    until.elementLocated(By.xpath("//label[contains(., 'Esta parte é cliente')]//input[@type='checkbox']")),
                    10000
                );
                await checkboxCliente.click();
                await driver.sleep(1000);
                await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.ENTER).perform();
 
                await ctx.parameter("Status", "200");
                await ctx.parameter("Descrição", "Parte do processo adicionada com sucesso");
            } catch (error) {
                await ctx.parameter("Status", "400");
                console.error("Erro ao criar parte do processo:", error.message);
                await tirarPrint(driver, "Erro ao criar parte do processo");
                throw error;
            }
        });

        await allure.step("Clicando no botão para salvar o processo", async (ctx) => {
            try {
                await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                await driver.sleep(1000); 

                await driver.wait(until.elementLocated(By.css('[data-testid="btn_save_process"]')), 10000);
                const btnSalvarProcesso = await driver.findElement(By.css('[data-testid="btn_save_process"]')); // Renomeada: btnSaveProcess
                console.log('Botão encontrado');

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btnSalvarProcesso);

                await driver.wait(until.elementIsEnabled(btnSalvarProcesso), 60000);
                await btnSalvarProcesso.click();
                await driver.sleep(3000);

                await ctx.parameter("Status", "200");
                console.log("Botão de salvar processo clicado com sucesso!");

            } catch (error) {
                console.error('Erro: ', error)
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_salvar_processo");
                throw error; // Removido assert.fail redundante com throw
            }
        });

    } catch (error) {
        // Usando o serviço padronizado no catch principal
        await tirarPrint(driver, "Falha geral ao adicionar numero complementar");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao alterar processo: " + error.message);
    }
}

// Removida a função takeScreenshot local

export { adicionandoNumeroComplementar };