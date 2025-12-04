import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function ProcessoDeRegistro(driver) {
    try {
        console.log("Iniciando Processo de Registro (Andamento)...");

        // STEP 1: CLICANDO NO BOTÃO DE CADASTRAR ANDAMENTO
        await allure.step("Clicando no botão para cadastrar andamento", async (ctx) => {
            try {
                const btnMenu = await driver.wait(
                    until.elementLocated(By.css('[data-testid="btn_register_progress_intimations"]')), 10000
                );
                await driver.wait(until.elementIsVisible(btnMenu), 5000);
                await btnMenu.click();
                await ctx.parameter("Status", "200");
                console.log("Botão de menu clicado com sucesso!");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_para_cadastrar_andamento");
                await assert.fail('Erro ao clicar no botão para cadastrar andamento: ' + error.message);
                throw error;
            }
        });

        // STEP 2: GERAR NÚMERO NUP ALEATÓRIO
        await allure.step("Gerando numero NUP aleatorio", async (ctx) => {
            try {
                await driver.get('https://processogerador.paulosales.com.br/');
                const inputCopiar = await driver.findElement(By.css('[title="Copie com ctrl+c"]')); 
                await inputCopiar.click();
                await driver.actions().keyDown(Key.CONTROL).sendKeys('c').keyUp(Key.CONTROL).perform();
            } catch (error) {
                console.error("Erro ao copiar um numero NUP:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_copiar_numero_NUP");
                await assert.fail('Erro ao copiar numero NUP: ' + error.message);
                throw error;
            }
        });

        // STEP 3: INSERIR INPUT NÚMERO DO PROCESSO
        await allure.step("Inserindo valor NUP no campo de numero do processo", async (ctx) => {
            try {
                await driver.navigate().back();
                const inputNumero = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="input_number_process"]')), 10000
                );
                await inputNumero.click();
                await driver.actions().keyDown(Key.CONTROL).sendKeys('v').keyUp(Key.CONTROL).sendKeys(Key.TAB).perform();
                await ctx.parameter("Status", "200");
            } catch (error) {
                console.error("Erro ao inserir 'NUP' no campo numero do processo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_inserir_valor_numero_processo");
                await assert.fail('Erro ao inserir valor no campo numero do processo');
                throw error;
            }
        });

        // STEP 4: SALVAR PROCESSO
        await allure.step("Clique no botao para salvar processo/andamento", async (ctx) => {
            try {
                const btnSalvarProcesso = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="btn_save_process"]')), 10000
                );
                
                await driver.wait(until.elementIsVisible(btnSalvarProcesso), 5000);
                await driver.wait(until.elementIsEnabled(btnSalvarProcesso), 5000);

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btnSalvarProcesso);

                await driver.sleep(1000); 
                await btnSalvarProcesso.click();
                console.log("Processo salvo com sucesso!");
                await driver.sleep(2000);
                await ctx.parameter("Status", "200");
            } catch (error) {
                console.error("Erro ao clicar no botao e salvar processo:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_salvar_processo");
                await assert.fail('Erro ao clicar no botao e salvar processo');
                throw error;
            }
        });

        // STEP 5: CLIQUE NO BOTÃO CARREGAR DADOS
        await allure.step("Clique no botao para carregar dados", async (ctx) => {
            try {
                const btnCarregarDados = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="btn_load_data"]')), 10000
                );
                
                await driver.wait(until.elementIsVisible(btnCarregarDados), 5000);
                await driver.wait(until.elementIsEnabled(btnCarregarDados), 5000);

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btnCarregarDados);

                await driver.sleep(1000); 
                await btnCarregarDados.click();
                console.log("Dados carregados com sucesso!");
                await driver.sleep(6000); 
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao clicar no botao de carregar dados:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_carregar_dados");
                await assert.fail('Erro ao clicar no botao de carregar dados');
                throw error;
            }
        });

        // STEP 6: CLIQUE NO BOTÃO DE FECHAR POP UP
        await allure.step("Clique no botao para fechar modal", async (ctx) => {
            try {
                const btnFecharModal = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="btn_close_modal"]')), 10000
                );
                
                await driver.wait(until.elementIsVisible(btnFecharModal), 5000);
                await driver.wait(until.elementIsEnabled(btnFecharModal), 5000);

                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", btnFecharModal);

                await driver.sleep(1000); 
                await btnFecharModal.click();
                console.log("Modal fechado!");
                await driver.sleep(6000);
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao clicar no botao de fechar modal:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_fechar_modal");
                await assert.fail('Erro ao clicar no botao de fechar modal');
                throw error;
            }
        });

    } catch (error) {
        console.error("Erro ao tentar salvar processo/andamento:", error);
        await tirarPrint(driver, "Erro_geral_no_ProcessoDeRegistro");
        throw error;
    }
}

export { ProcessoDeRegistro };