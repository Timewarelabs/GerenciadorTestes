import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from '../../comum/tirarPrint.js';

async function ExcluirEmpresa(driver) {

    await allure.step("Clicando na penúltima pessoa", async (ctx) => {
      try {
        const linhas = await driver.findElements(By.css("table tbody tr"));
        if (linhas.length === 0) {
          throw new Error("Nenhum resultado encontrado.");
        }
        const ultimoIndice = 0;
        const ultimaLinha = linhas[ultimoIndice];
        console.log(`Quantidade de resultados: ${linhas.length}`);
        console.log(`Clicando na penúltima pessoa (índice ${ultimoIndice})`);
    
        await driver.executeScript(`
          const row = arguments[0];
          const tbody = row.closest('tbody');
          if (tbody) tbody.scrollTop = row.offsetTop;
        `, ultimaLinha);
    
        await driver.executeScript("arguments[0].click();", ultimaLinha);
    
        await ctx.parameter("Status", "200");
      } catch (erro) {
        await ctx.parameter("Status", "400");
        console.error("Erro ao clicar no último resultado:", erro);
        assert.fail("Erro ao clicar no último resultado");
        throw erro;
      }
    });

    await allure.step("Clicando no botão de delete", async (ctx) => {
        try {
            await driver.wait(until.elementLocated(By.css('div[title="Excluir"]')), 10000);
            await driver.findElement(By.css('div[title="Excluir"]')).click();

            await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.ENTER).perform();
            await driver.sleep(1000);
            await ctx.parameter("Status", "200");

            await allure.step("Validando alerta de exclusão", async (ctx) => {
                try {
                    const mensagem = await driver.wait(until.elementLocated(By.css('[role="alertdialog"] span#message-id')), 10000);
                    const textoMensagem = await mensagem.getText();

                    if (textoMensagem.trim() === 'Empresa excluída com sucesso!') {
                        await ctx.parameter("Status", "200");
                    } else {
                        throw new Error(`Texto inesperado no alerta: ${textoMensagem}`);
                    }
                } catch (erro) {
                    await ctx.parameter("Status", "400");
                    await tirarPrint(driver, "Erro_alerta_exclusao");
                    assert.fail('Erro ao validar alerta de exclusão: ' + erro.message);
                }
            });

        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar em delete:", erro.message);
            await tirarPrint(driver, "Erro_delete_empresa");
            throw erro;
        }
    });
}

export { ExcluirEmpresa };