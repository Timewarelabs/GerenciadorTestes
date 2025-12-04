import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaRegistrarProcessoVazio(driver) {
    try {
        console.log("Iniciando teste de falha ao registrar processo/andamento vazio...");

        // STEP 1: CLICANDO NO BOTÃO DE CADASTRAR ANDAMENTO
        await allure.step("Clicando no botão para cadastrar andamento", async (ctx) => {
            try {
                const botaoMenu = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="btn_register_progress_intimations"]')), 10000
                );
                await driver.wait(until.elementIsVisible(botaoMenu), 5000);
                await botaoMenu.click();
                await ctx.parameter("Status", "200");
                console.log("Botão clicado com sucesso!");

            } catch (error) {
                await ctx.parameter("Status", "400");
                await assert.fail('Erro ao clicar no botão para cadastrar andamento');
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_para_cadastrar_andamento");
                throw error;
            }
        });

        // STEP 2: VERIFICAR BOTÃO DESABILITADO
        await allure.step("Verificando se o botão salvar está desabilitado", async (ctx) => {
            try {
                 const botaoSalvarProcesso = await driver.wait( 
                    until.elementLocated(By.css('[data-testid="btn_save_process"]')), 10000
                );

                const estaDesabilitadoAttr = await botaoSalvarProcesso.getAttribute('disabled') !== null;
                const classes = await botaoSalvarProcesso.getAttribute('class');
                const temClasseDisabled = classes.includes('Mui-disabled'); 
                const ariaDisabled = await botaoSalvarProcesso.getAttribute('aria-disabled') === 'true';

                if (estaDesabilitadoAttr || temClasseDisabled || ariaDisabled) {
                    console.log('Sucesso: O botão está desabilitado conforme esperado.');
                    await ctx.parameter("Status", "200 - Validação OK");
                    await tirarPrint(driver, "Botao_salvar_desabilitado_corretamente");
                } else {
                     await ctx.parameter("Status", "400 - Falha");
                     await tirarPrint(driver, "Erro_botao_habilitado_indevidamente");
                     throw new Error('Falha: O botão está habilitado, mas deveria estar desabilitado (Campos vazios).');
                }
                await driver.sleep(3000);

            } catch (error) {
                console.error("Erro na validação do botão salvar:", error);
                await ctx.parameter("Status", "400");
                await assert.fail('Erro: Botão de salvar habilitado indevidamente ou não encontrado');
                await tirarPrint(driver, "Erro_validacao_botao_salvar");
                throw error;
            }
        });

    } catch (error) {
        console.error("Erro geral ao tentar registrar processo vazio:", error);
        await tirarPrint(driver, "Erro_geral_registro_vazio");
        throw error;
    }
}

export { falhaRegistrarProcessoVazio };