import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function processosBloqueados(driver) {

    try {
        console.log("Acessando as intimações publicadas no diario de justica..."); 

        // STEP 1: CLICAR NO BOTAO DE PROCESSOS BLOQUEADOS
        await allure.step("Clicando no botão para visualizar processos bloqueados", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_blocked_process"]')), 10000);
                const botaoProcessosBloqueados = await driver.findElement(By.css('[data-testid="btn_blocked_process"]')); 
                await botaoProcessosBloqueados.click();
                
                await driver.sleep(1000); 
                console.log("Clique realizado com sucesso!");
                await ctx.parameter("Status", "Sucesso");

            } catch (error) {
                console.error("Erro ao clicar o botao de processos bloqueados:", error);
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao clicar no botao de processos bloqueados');
                await tirarPrint(driver, "Erro_ao_clicar_botao_processos_bloqueados");
                throw error;
            }
        });

        console.log("Visualizacao de processos bloqueados feita com sucesso!");
    } catch (error) {
        console.error("Erro ao tentar visualizar os processos bloqueados:", error);
        await tirarPrint(driver, "Erro_geral_na_visualizacao_de_processos_bloqueados");
        throw error;
    }
}

export { processosBloqueados };