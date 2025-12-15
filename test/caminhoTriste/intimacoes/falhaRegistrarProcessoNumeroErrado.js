import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaRegistrarProcessoNumeroErrado(driver) {
    try {
        console.log("Iniciando teste de falha ao registrar processo com número errado...");

        // STEP 1: CLICANDO NO BOTÃO DE CADASTRAR ANDAMENTO
        await allure.step("Clicando no botão para cadastrar andamento", async (ctx) => {
            try {
                const botaoMenu = await driver.wait(
                    until.elementLocated(By.css('[data-testid="btn_register_progress_intimations"]')), 10000
                );
                await driver.wait(until.elementIsVisible(botaoMenu), 5000);
                await botaoMenu.click();
                await ctx.parameter("Status", "Sucesso");
                console.log("Botão clicado com sucesso!");

            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao clicar no botão para cadastrar andamento');
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_para_cadastrar_andamento");
                throw error;
            }
        });

        // STEP 2: INSERIR INPUT NÚMERO DO PROCESSO (NUP INVÁLIDO)
        await allure.step("Inserindo valor NUP inválido no campo de numero do processo", async (ctx) => {
            try {
                const nupInvalido = "0000"; 
                const inputNumero = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="input_number_process"]')), 10000
                );
                await inputNumero.click();
                await driver.actions().sendKeys(nupInvalido).sendKeys(Key.TAB).perform();
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                console.error("Erro ao inserir NUP inválido no campo numero do processo:", error);
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao inserir valor inválido no campo numero do processo');
                await tirarPrint(driver, "Erro_ao_inserir_valor_invalido_numero_processo");
                throw error;
            }
        });

        // STEP 3: VERIFICAR BOTÃO (Deve estar desabilitado)
        await allure.step("Verificando o botão desabilitado caso tente inserir um número errado", async (ctx) => {
            try {
                 const botaoSalvarProcesso = await driver.wait(
                    until.elementLocated(By.css('[data-testid="btn_save_process"]')), 10000
                );

                const estaDesabilitadoAttr = await botaoSalvarProcesso.getAttribute('disabled') !== null;
                const classes = await botaoSalvarProcesso.getAttribute('class');
                const temClasseDisabled = classes.includes('Mui-disabled');
                const ariaDisabled = await botaoSalvarProcesso.getAttribute('aria-disabled') === 'true';

                if (estaDesabilitadoAttr || temClasseDisabled || ariaDisabled) {
                    console.log('Sucesso: O botão está desabilitado conforme esperado (Número inválido).');
                    await ctx.parameter("Status", "200 - Validação OK");
                    await tirarPrint(driver, "Botao_salvar_desabilitado_numero_invalido");
                } else {
                     await ctx.parameter("Status", "400 - Falha");
                     await tirarPrint(driver, "Erro_botao_habilitado_indevidamente_numero_invalido");
                     throw new Error('Falha: O botão está habilitado, mas deveria estar desabilitado (Número inválido).');
                }

                await driver.sleep(3000);

            } catch (error) {
                console.error("Erro na validação do botão salvar (número errado):", error);
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro: Botão de salvar habilitado indevidamente ou não verificado');
                await tirarPrint(driver, "Erro_validacao_botao_salvar_numero_invalido");
                throw error;
            }
        });

    } catch (error) {
        console.error("Erro geral ao tentar registrar processo com número errado:", error);
        await tirarPrint(driver, "Erro_geral_registro_numero_errado");
        throw error;
    }
}

export { falhaRegistrarProcessoNumeroErrado };