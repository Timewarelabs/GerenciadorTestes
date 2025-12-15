import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function bloqueandoProcesso(driver) {

    try {
        console.log("Bloqueando um processo no diario de justica...");

        // STEP 1: CLIQUE NO MENU LATERAL
        await allure.step("Clicando no botão lateral de cada processo", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_menu"]')), 10000);
                const botaoMenuPublicacao = await driver.findElement(By.css('[data-testid="btn_menu"]'));
                await botaoMenuPublicacao.click();
                
                console.log("Clique realizado com sucesso!");
                await ctx.parameter("Status", "Sucesso");

            } catch (error) {
                console.error("Erro ao clicar no botao lateral da publicacao:", error);
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_botao_lateral_publicacao");
                await assert.fail('Erro ao clicar no botao lateral da publicacao');
                throw error;
            }
        });

        // STEP 2: CLIQUE PARA BLOQUEAR PROCESSO
        await allure.step("Clicando no botão de bloquear processo", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_block_process"]')), 10000);
                const botaoBloquearProcesso = await driver.findElement(By.css('[data-testid="btn_block_process"]'));
                await botaoBloquearProcesso.click();
                console.log("Clique realizado com sucesso!");
                await ctx.parameter("Status", "Sucesso");

            } catch (error) {
                console.error("Erro ao clicar no botao de bloquear processo:", error);
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_clicar_botao_bloquear_processo");
                await assert.fail('Erro ao clicar no botao de bloquear processo');
                throw error;
            }
        });

        // STEP 3: CONFIRMANDO O BLOQUEIO DE PROCESSO
        await allure.step("Clicando no botão para confirmar bloqueio de processo", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="input_title_deadline"]')), 10000);
                const botaoConfirmarBloqueio = await driver.findElement(By.css('[data-testid="input_title_deadline"]'));
                await botaoConfirmarBloqueio.click();
                console.log("Clique realizado com sucesso!");
                await ctx.parameter("Status", "Sucesso");

            } catch (error) {
                console.error("Erro ao confirmar bloqueamento de processo:", error);
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro_ao_confirmar_bloqueamento_processo");
                await assert.fail('Erro ao ao confirmar bloqueamento de processo');
                throw error;
            }
        });
        
        console.log("Bloqueando um processo feito com sucesso!");

    } catch (error) {
        console.error("Erro ao tentar bloquear um processo:", error);
        await tirarPrint(driver, "Erro_geral_bloqueando_um_processo");
        throw error;
    }
}

export { bloqueandoProcesso };