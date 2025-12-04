import { By, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function acessoIntimacoes(driver) {

    try {
        console.log("Acessando as intimações...");

        await allure.step("Clicando no botão para exibir o menu", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
                const botaoMenu = await driver.findElement(By.css('[data-testid="btn_side_menu"]'));
                await botaoMenu.click();
                await ctx.parameter("Status", "200");
                console.log("Menu clicado com sucesso!");
            } catch (error) {
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_clicar_no_botao_para_exibir_menu");
                await assert.fail('Erro ao clicar no botão para exibir menu');
                throw error;
            }
        });

        // STEP 2: CLICAR EM INTIMAÇÕES NO MENU LATERAL
         await allure.step("Clicando no botão de navegação do intimações", async (ctx) => {

            try {
                
                await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
                const linksMenu = await driver.findElements(By.className('menuLinks'));     
                
                if (linksMenu.length >= 3) {
                    await linksMenu[2].click();
                    console.log("Clique em Intimações realizado com sucesso!");
                    
                    // Valida a URL
                    await driver.wait(until.urlIs(`${obterBaseUrl()}/intimacoes`), 10000);
                    
                    await driver.sleep(3000);
                    await ctx.parameter("Status", "200");
                } else {
                    console.log("Não há elementos suficientes com a classe 'menuLinks' para achar Intimações.");
                    await ctx.parameter("Status", "400");
                    throw new Error("Menu de Intimações não encontrado na posição esperada.");
                }
                
            } catch (error) {
                console.error("Erro ao achar Intimações do menuLinks:", error);
                await ctx.parameter("Status", "400");
                await tirarPrint(driver, "Erro_ao_achar_intimacoes");
                await assert.fail('Erro ao acessar Intimações em menuLinks');
                throw error;
            }
        });

        console.log("Acesso ao módulo de Intimações com sucesso!");
    } catch (error) {
        console.error("Erro ao tentar acessar o módulo de Intimações:", error);
        await tirarPrint(driver, "Erro_geral_no_módulo_de_Intimações");
        throw error;
    }
}

export { acessoIntimacoes };