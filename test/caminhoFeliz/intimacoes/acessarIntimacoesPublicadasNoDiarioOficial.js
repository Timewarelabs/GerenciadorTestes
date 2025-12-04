import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function acessarIntimacoesPublicadasNoDiarioOficial(driver) {

    try {
        console.log("Acessando as intimações publicadas no diario de justica...");

        // STEP 1: CLICAR PARA MOSTRAR PUBLICACOES NO DIARIO DE JUSTICA
        await allure.step("Clicando no botão para visualizar publicacoes no diario de justica", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_latest_publications"]')), 10000);
                const botaoUltimasPublicacoes = await driver.findElement(By.css('[data-testid="btn_latest_publications"]')); 
                await botaoUltimasPublicacoes.click();
                
                await driver.sleep(30000);
                console.log("Clique realizado com sucesso!");
                
                // Espera pelo carregamento da lista
                await driver.wait(until.elementLocated(By.css('[data-testid="list_group"]')), 600000);
                const grupoLista = await driver.findElement(By.css('[data-testid="list_group"]'));
                await driver.wait(until.elementIsVisible(grupoLista), 10000);
                
                await driver.sleep(5000);
                await ctx.parameter("Status", "200");

            } catch (error) {
                console.error("Erro ao clicar o botao de ultimas publicacoes:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_botao_ultimas_publicacoes");
                await assert.fail('Erro ao clicar no botao de ultimas publicacoes');
                throw error;
            }
        });

        console.log("Visualizacao de ultimas publicacoes do diario de justica feita com sucesso!");
    } catch (error) {
        console.error("Erro ao tentar visualizar publicacoes do diario de justica:", error);
        await tirarPrint(driver, "Erro_geral_na_visualizacao_do_diario_de_justica");
        throw error;
    }
}

export { acessarIntimacoesPublicadasNoDiarioOficial };