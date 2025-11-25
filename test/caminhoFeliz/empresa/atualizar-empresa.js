import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { CapturaTela } from '../../comum/captura.js';

async function AtualizarEmpresa(driver) {

    await allure.step("Clicando na empresa encontrada", async (ctx) => {
        try {
            // Agora confiamos que a Pesquisa já filtrou certo
            const linhas = await driver.findElements(By.css("table tbody tr"));
            if (linhas.length === 0) throw new Error("Nenhum resultado.");
            
            const linhaAlvo = linhas[0];
            console.log(`Clicando no registro filtrado...`);

            await driver.executeScript(`
                const row = arguments[0];
                const tbody = row.closest('tbody');
                if (tbody) tbody.scrollTop = row.offsetTop;
            `, linhaAlvo);
            
            await driver.sleep(500);
            await driver.executeScript("arguments[0].click();", linhaAlvo);

            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar na empresa:", erro);
            throw erro;
        }
    });

    await allure.step("Aguardando gaveta e checkbox", async (ctx) => {
        try {
            await driver.sleep(2000); // Espera animação da gaveta
            const checkbox = await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), 10000);
            
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", checkbox);
            await driver.sleep(500);
            await driver.executeScript("arguments[0].click();", checkbox);
            
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
            await ctx.parameter("Status", "200");
        } catch (erro) {
            await CapturaTela(driver, "Erro_Checkbox_Gaveta");
            throw erro;
        }
    });

    await allure.step("Preenchendo Razão Social", async (ctx) => {
        try {
            await driver.sleep(1000);
            // Fallback simples se não achar por label
            try {
                const inputRazao = await driver.findElement(By.xpath("//label[contains(., 'Razão')]/following::input[1]"));
                await inputRazao.click();
            } catch (e) {
                await driver.actions().sendKeys(Key.TAB).perform();
            }
            
            await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform();
            await driver.actions().sendKeys("Nova Tech Solutions Ltda").perform();
            await ctx.parameter("Status", "200");
        } catch (erro) {
            console.warn("Erro não crítico na Razão Social:", erro.message);
        }
    });

    await allure.step("Alterando campo telefone", async (ctx) => {
        try {
            await driver.sleep(500);
            console.log("Buscando campo de Telefone...");

            // Busca pela Label para ser mais garantido
            const inputTelefone = await driver.wait(
                until.elementLocated(By.xpath("//label[contains(., 'Telefone') or contains(., 'Celular')]/following::input[1]")),
                5000
            );

            // Scroll e Focus JS para evitar 'could not be scrolled into view'
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", inputTelefone);
            await driver.sleep(500);
            await driver.executeScript("arguments[0].focus();", inputTelefone);
            
            // Clique normal
            await inputTelefone.click();
            
            await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform();
            await inputTelefone.sendKeys("11991234567");
            await driver.actions().sendKeys(Key.TAB).perform();

            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao atualizar telefone:", erro);
            await CapturaTela(driver, "Erro_atualizar_telefone");
            assert.fail(`Erro ao atualizar telefone: ${erro.message}`);
            throw erro;
        }
    });

    await allure.step("Clicando em Atualizar", async (ctx) => {
        try {
            const xpathBotao = "//button[(contains(., 'Atualizar') or contains(., 'Salvar'))]";
            const botaoAtualizar = await driver.wait(until.elementLocated(By.xpath(xpathBotao)), 5000);
            
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
            await driver.executeScript("arguments[0].click();", botaoAtualizar);

            await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')), 10000);
            const textoAlerta = await driver.findElement(By.css('[role="alertdialog"] span#message-id')).getText();

            if (textoAlerta.trim() === "Empresa alterada com sucesso!") {
                console.log("Sucesso confirmado!");
                await ctx.parameter("Status", "200");
            } else {
                await ctx.parameter("Status", "400");
                throw new Error(`Texto do alerta não encontrado. Esperado: "Empresa alterada com sucesso!", mas encontrado: "${textoAlerta}"`);
            }

        } catch (erro) {
            await CapturaTela(driver, "Erro_validacao_atualizar");
            throw erro;
        }
    });
}

export { AtualizarEmpresa };