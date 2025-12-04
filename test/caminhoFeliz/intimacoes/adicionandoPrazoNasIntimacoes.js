import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function adicionandoPrazoNasIntimacoes(driver) {

    console.log("Acessando as intimações publicadas no diario de justica...");
    allure.parameter("Descrição", "Acessando as intimações publicadas no diário de justiça...");

    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(amanha.getDate() + 1);
    
    const dataAmanha = amanha.toLocaleDateString('pt-BR'); 
    const dataHoje = agora.toLocaleDateString('pt-BR'); 
    const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false}); 
    const tituloPrazo = `Alterado em ${dataHoje} às ${horaAtual}`;
    
    async function digitarLentamente(elementoInput, texto) {
        await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
        for (const char of texto) {
            await elementoInput.sendKeys(char);
            await driver.sleep(100);
        }
    }

    try {
        // STEP 1: CLIQUE PARA ABRIR MODAL (ÍCONE DE RELÓGIO)
        await allure.step("Clicando no botão de inserir prazo", async (ctx) => {
            try {
                const xpathBotaoRelogio = "/html/body/div/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div/div[1]/div/div/div/div[1]/ul/li[2]/ul[1]/li/div[2]/div[1]/div/div[1]/div/div/button";
                
                await driver.wait(until.elementLocated(By.xpath(xpathBotaoRelogio)), 10000);
                const botaoInserirPrazo = await driver.findElement(By.xpath(xpathBotaoRelogio));
                await botaoInserirPrazo.click();
                
                console.log("Clique no ícone de relógio!");
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao clicar no botao de inserir prazo do processo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_botao_inserir_prazo");
                await assert.fail('Erro ao clicar no botao de inserir prazo do processo');
                throw error;
            }
        });

        // STEP 2: ALTERANDO TITULO
        await allure.step("Inserindo titulo", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="input_title_deadline"]')), 10000);
                const inputTituloPrazo = await driver.findElement(By.css('[data-testid="input_title_deadline"]'));
                await inputTituloPrazo.click();
                await inputTituloPrazo.clear(); 
                await inputTituloPrazo.sendKeys(tituloPrazo); 
                console.log("Titulo alterado com sucesso");
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao editar titulo do prazo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_editar_titulo");
                await assert.fail('Erro ao editar titulo do prazo');
                throw error;
            }
        });

        // STEP 3: ALTERANDO DATA
        await allure.step("Inserindo data", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="input_date_deadline"]')), 10000);
                const inputDataPrazo = await driver.findElement(By.css('[data-testid="input_date_deadline"]'));
                await inputDataPrazo.click(); 
                await inputDataPrazo.clear(); 
                await digitarLentamente(inputDataPrazo, dataAmanha);
                console.log("Data alterada com sucesso");
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao editar data do prazo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_editar_data");
                await assert.fail('Erro ao editar data do prazo');
                throw error;
            }
        });

        // STEP 4: ALTERANDO HORA
        await allure.step("Inserindo hora", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="input_hour_deadline"]')), 10000);
                const inputHoraPrazo = await driver.findElement(By.css('[data-testid="input_hour_deadline"]')); 
                await inputHoraPrazo.click(); 
                await inputHoraPrazo.clear(); 
                await digitarLentamente(inputHoraPrazo, horaAtual);
                console.log("Hora alterada com sucesso");
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao editar horario do prazo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_editar_horario");
                await assert.fail('Erro ao editar horario do prazo');
                throw error;
            }
        });

        // STEP 5: SALVANDO
        await allure.step("Clicando no botão de salvar", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_save_deadline"]')), 10000);
                const botaoSalvarPrazo = await driver.findElement(By.css('[data-testid="btn_save_deadline"]'));
                
                await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", botaoSalvarPrazo);
                await driver.sleep(3000);
                await botaoSalvarPrazo.click();
                await driver.sleep(3000);
                console.log("Clique no botão de salvar!");
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao clicar no botao de salvar prazo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_botao_salvar_prazo");
                await assert.fail('Erro ao clicar no botao de salvar prazo');
                throw error;
            }
        });

        // STEP 6: CLIQUE PARA ABRIR MODAL NOVAMENTE (Para verificação)
        await allure.step("Clicando no botão de inserir prazo (reabertura para validação)", async (ctx) => {
            try {
                const xpathBotaoRelogio = "/html/body/div/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div/div[1]/div/div/div/div[1]/ul/li[2]/ul[1]/li/div[2]/div[1]/div/div[1]/div/div/button";
                await driver.wait(until.elementLocated(By.xpath(xpathBotaoRelogio)), 10000);
                const botaoInserirPrazo = await driver.findElement(By.xpath(xpathBotaoRelogio));
                await botaoInserirPrazo.click();
                console.log("Clique no ícone de relógio (reabertura)!");
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao clicar no botao de inserir prazo do processo (reabertura):", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_reabrir_modal_prazo");
                await assert.fail('Erro ao clicar no botao de inserir prazo do processo para validação');
                throw error;
            }
        });

        // STEP 7: VERIFICANDO CAMPOS INSERIDOS
        await allure.step("Verificando se os campos foram preenchidos corretamente", async (ctx) => {
            try {
                const inputTitulo = await driver.wait(until.elementLocated(By.css('[data-testid="input_title_deadline"]')), 10000);
                const inputData = await driver.wait(until.elementLocated(By.css('[data-testid="input_date_deadline"]')), 10000);
                const inputHora = await driver.wait(until.elementLocated(By.css('[data-testid="input_hour_deadline"]')), 10000); 

                const valorTitulo = await inputTitulo.getAttribute('value'); 
                const valorData = await inputData.getAttribute('value'); 
                const valorHora = await inputHora.getAttribute('value'); 

                console.log(`Verificando título: esperado "${tituloPrazo}", encontrado "${valorTitulo}"`);
                console.log(`Verificando data: esperado "${dataAmanha}", encontrado "${valorData}"`);
                console.log(`Verificando hora: esperado "${horaAtual}", encontrado "${valorHora}"`);
                
                await allure.parameter("Validação Título", `Esperado: "${tituloPrazo}" | Encontrado: "${valorTitulo}"`);
                await allure.parameter("Validação Data", `Esperado: "${dataAmanha}" | Encontrado: "${valorData}"`);
                await allure.parameter("Validação Hora", `Esperado: "${horaAtual}" | Encontrado: "${valorHora}"`);

                assert.strictEqual(valorTitulo, tituloPrazo, 'O título salvo não corresponde ao inserido');
                assert.strictEqual(valorData, dataAmanha, 'A data salva não corresponde à inserida');
                assert.strictEqual(valorHora, horaAtual, 'A hora salva não corresponde à inserida');

                await ctx.parameter("Status", "200");
                console.log("Verificação dos campos concluída com sucesso!");

            } catch (error) {
                await ctx.parameter("Status", "400");
                console.error("Erro ao verificar os campos:", error);
                await tirarPrint(driver, "Erro_ao_verificar_campos_prazo");
                await assert.fail('Erro ao verificar se os dados foram salvos corretamente: ' + error.message);
                throw error;
            }
        });
          
        console.log("Inserção de prazo feita com sucesso!");
        allure.parameter("Status", "200");
        allure.parameter("Descrição", "Inserção de prazo feita com sucesso");

    } catch (error) {
        console.error("Erro ao tentar inserir um prazo:", error);
        await tirarPrint(driver, "Erro_geral_na_insercao_de_prazo");
        throw error;
    }
}

export { adicionandoPrazoNasIntimacoes };