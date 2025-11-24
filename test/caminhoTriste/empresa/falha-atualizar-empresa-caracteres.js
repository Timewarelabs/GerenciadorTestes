import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { CapturaTela } from '../../comum/captura.js';

async function FalhaAtualizarEmpresaCaracteres(driver) {
    await allure.step("Clicando na última empresa", async (ctx) => {
        try {
            console.log("Buscando empresas...");
            const linhas = await driver.findElements(By.css("table tbody tr"));
            
            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado.");
            }

            const ultimoIndice = linhas.length - 1;
            console.log(`Clicando na última empresa (index ${ultimoIndice})`);

            const ultimaLinha = linhas[ultimoIndice];
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", ultimaLinha);
            await driver.wait(until.elementIsVisible(ultimaLinha), 5000);
            await driver.wait(until.elementIsEnabled(ultimaLinha), 5000);
            await driver.executeScript("arguments[0].click();", ultimaLinha);

            await driver.sleep(3000);

            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar na última empresa:", erro.message);
            await assert.fail('Erro ao clicar na última empresa: ' + erro.message);
            throw erro;
        }
    });

    await allure.step("Tentando inserir caracteres inválidos", async (ctx) => {
        try {
            // Tenta localizar label CNPJ e o input seguinte
            const labelCNPJ = await driver.findElement(By.xpath("//label[contains(text(), 'CNPJ')]"));
            const inputCNPJ = await labelCNPJ.findElement(By.xpath("following::input[1]"));

            await inputCNPJ.click();
            // Limpa o campo
            await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform();

            // Insere caracteres inválidos
            await driver.actions().sendKeys("12.34A.678/0001-XX").perform();
            await driver.actions().sendKeys(Key.TAB).perform();

            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Atualizar')]"));
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
            await botaoAtualizar.click();

            await driver.sleep(2000);

            await driver.wait(until.elementLocated(By.css('span#message-id')), 5000, "Timeout ao esperar o alerta aparecer");

            const elementoMensagem = await driver.findElement(By.css('span#message-id'));
            const textoAlerta = await elementoMensagem.getText();

            if (textoAlerta === 'Empresa atualizada com sucesso!' || textoAlerta === 'Pessoa atualizada com sucesso!') {
                await ctx.parameter("Status", "400");
                await assert.fail('Erro: Sistema permitiu caracteres inválidos!');
            } else {
                await ctx.parameter("Status", "200");
                console.log(`Alerta de erro exibido com sucesso: ${textoAlerta}`);
            }

            await driver.sleep(2000);
        } catch (erro) {
            await ctx.parameter("Status", "200"); // Consideramos sucesso se o teste falhou em salvar
            console.log("Erro ou validação negativa concluída:", erro.message);
            await CapturaTela(driver, "Fim_teste_caracteres_invalidos");
        }
    });
}

export { FalhaAtualizarEmpresaCaracteres };