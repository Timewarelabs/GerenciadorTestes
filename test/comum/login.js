import { By, until } from "selenium-webdriver";
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "./tirarPrint.js";
import { obterBaseUrl } from "../config/global.config.js";

async function login(driver) {
    try {
        await allure.step("Acessando Página", async (ctx) => {
            try {
                await driver.manage().setTimeouts({ implicit: 5000 });
                await driver.get(`${obterBaseUrl()}/home`);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Falhou");
                console.error("Erro ao acessar a página:", error.message);
                await tirarPrint(driver, "Erro ao acessar a página");
                throw error;
            }
        });

        await allure.step("Inserindo o número AASP", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.id('mat-input-0')), 30000);
                await driver.findElement(By.id('mat-input-0')).sendKeys('15');
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Falhou");
                console.error("Erro ao inserir o número AASP:", error.message);
                await tirarPrint(driver, "Erro ao inserir o número AASP");
                throw error;
            }
        });

        await allure.step("Inserindo a senha", async (ctx) => {
            try {
                await driver.findElement(By.id('mat-input-1')).sendKeys('1234');
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Falhou");
                console.error("Erro ao inserir a senha:", error.message);
                await tirarPrint(driver, "Erro ao inserir a senha");
                throw error;
            }
        });

        await allure.step("Clicando no botão de login", async (ctx) => {
            try {
                const loginButton = await driver.findElement(By.css('button[title="Acessar"]'));
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", loginButton);
                await loginButton.click();
                await ctx.parameter("Status", "Sucesso");

                await driver.sleep(5000);

                let erroElementos = await driver.findElements(By.css("div.msg-error.ng-star-inserted p"));
                if (erroElementos.length > 0) {
                    let errorMessage = await erroElementos[0].getText();
                    assert(!errorMessage.includes("Número AASP / CPF e senha inválidos."), 
                           "Informe o código AASP ou CPF");
                    assert(!errorMessage.includes("Informe o código AASP ou CPF."),
                            "Insira as informações nos campos");
                }

                let urlAtual = await driver.getCurrentUrl();
                assert(urlAtual.includes('/home'), 
                       `Erro de login: a URL não foi alterada para /home. A URL atual é ${urlAtual}`);

                console.log('Login efetuado com sucesso');
                await ctx.parameter("Status", "Sucesso");

            } catch (error) {
                await ctx.parameter("Status", "Falhou");
                console.error("Erro ao clicar no botão de login:", error.message);
                await tirarPrint(driver, "Erro ao clicar no botão de login");
                throw error;
            }
        });
    } catch (error) {
        console.error('Erro durante o login:', error.message);
        await tirarPrint(driver, "Erro durante o login");
        throw error;
    }
}

export { login };