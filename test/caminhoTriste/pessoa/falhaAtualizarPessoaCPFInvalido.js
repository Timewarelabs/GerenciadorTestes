import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function falhaAtualizarPessoaCPFInvalido(driver) {
    await allure.step("Acessando Página e buscando pessoa pelo nome", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/pessoas-empresas`);
            await ctx.parameter("Status", "200");

            try {
                const botaoFechar = await driver.wait( 
                    until.elementLocated(By.css(".reactour__helper button.sc-bxivhb")),
                    5000
                );
                await driver.wait(until.elementIsVisible(botaoFechar), 5000);
                await botaoFechar.click();
                await ctx.parameter("Popup", "Fechado");
            } catch {
                await ctx.parameter("Popup", "Não encontrado ou já fechado");
            }

            const barraBusca = await driver.wait( 
                until.elementLocated(By.css("input[placeholder='Buscar pessoas ou empresas']")),
                5000
            );
            await driver.wait(until.elementIsVisible(barraBusca), 5000);
            await barraBusca.click();

            const nomeBusca = "Vinícius Nascimento Borges"; 
            await driver.actions().sendKeys(nomeBusca).perform();
            await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();

            await driver.sleep(3000);
            await ctx.parameter("Busca", `Busca realizada para: ${nomeBusca}`);

            await driver.executeScript("window.scrollBy(0, 800)");
            await driver.sleep(1000);

        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_acessar_ou_buscar_pessoa");
            assert.fail(`Erro ao acessar página ou buscar pessoa: ${error.message}`);
        }
    });

    await allure.step("Clicando na última pessoa", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css('tr[style*="cursor: pointer"]')); 
            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado.");
            }
            const ultimaLinha = linhas[linhas.length - 1]; 

            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", ultimaLinha);
            await driver.wait(until.elementIsVisible(ultimaLinha), 5000);
            await driver.wait(until.elementIsEnabled(ultimaLinha), 5000);
            await driver.executeScript("arguments[0].click();", ultimaLinha);

            await ctx.parameter("Status", "200");
        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_clicar_na_ultima_pessoa");
            assert.fail("Erro ao clicar no último resultado");
        }
    });

    await allure.step("Tentando atualizar com CPF inválido", async (ctx) => {
        try {
            const cpfInvalido = "123.456.789-00"; 
            await driver.sleep(500);

            const inputCpf = await driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[1]/div[2]/div/div/input")); 
            await driver.wait(until.elementIsVisible(inputCpf), 5000);
            await driver.wait(until.elementIsEnabled(inputCpf), 5000);
            await inputCpf.click();

            await driver.actions()
                .keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL)
                .sendKeys(Key.BACK_SPACE)
                .sendKeys(cpfInvalido)
                .perform();

            await driver.sleep(2000);

            const btnAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Atualizar')]")); 
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", btnAtualizar);
            await btnAtualizar.click();

            const modal = await driver.wait(
                until.elementLocated(By.xpath("/html/body/div[4]/div[2]/div")),
                5000
            );
            await driver.wait(until.elementIsVisible(modal), 5000);

            const mensagem = await modal.getText();

            if (mensagem.includes("CPF inválido")) {
                console.log("Modal com erro de CPF inválido exibido com sucesso (Sad Path OK)");
                await ctx.parameter("Status", "200 - Validação OK");
            } else {
                await ctx.parameter("Status", "400 - ERRO DE TESTE");
                await tirarPrint(driver, "Erro_modal_CPF_invalido_inesperado");
                throw new Error(`Mensagem incorreta no modal. Esperado conter: "CPF inválido", recebido: "${mensagem}"`);
            }

        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_modal_CPF_invalido");
            assert.fail(`Erro ao tentar atualizar com CPF inválido: ${error.message}`);
        }
    });
}

export { falhaAtualizarPessoaCPFInvalido };