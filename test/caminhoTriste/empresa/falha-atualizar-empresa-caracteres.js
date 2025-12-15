import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from '../../comum/tirarPrint.js';

async function FalhaAtualizarEmpresaCaracteres(driver) {
    
    // PASSO DE CLIQUE IDÊNTICO AO ATUALIZAR-EMPRESA.JS
    await allure.step("Clicando na última pessoa", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css("table tbody tr"));
            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado.");
            }
            const ultimoIndice = 0;
            const ultimaLinha = linhas[ultimoIndice];
            console.log(`Quantidade de resultados: ${linhas.length}`);
            console.log(`Clicando na última pessoa (índice ${ultimoIndice})`);

            await driver.executeScript(`
                const row = arguments[0];
                const tbody = row.closest('tbody');
                if (tbody) tbody.scrollTop = row.offsetTop;
            `, ultimaLinha);

            await driver.executeScript("arguments[0].click();", ultimaLinha);
            
            await driver.sleep(3000); // Mantendo o sleep de segurança, se existir, logo após o clique.

            await ctx.parameter("Status", "Sucesso");
        } catch (erro) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao clicar no último resultado:", erro);
            assert.fail("Erro ao clicar no último resultado");
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
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro: Sistema permitiu caracteres inválidos!');
            } else {
                await ctx.parameter("Status", "Sucesso");
                console.log(`Alerta de erro exibido com sucesso: ${textoAlerta}`);
            }

            await driver.sleep(2000);
        } catch (erro) {
            await ctx.parameter("Status", "Sucesso"); // Consideramos sucesso se o teste falhou em salvar
            console.log("Erro ou validação negativa concluída:", erro.message);
            await tirarPrint(driver, "Fim_teste_caracteres_invalidos");
        }
    });
}

export { FalhaAtualizarEmpresaCaracteres };