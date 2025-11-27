import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from '../../comum/tirarPrint.js';

async function AtualizarEmpresa(driver) {

    await allure.step("Clicando na última pessoa", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css("table tbody tr"));
            if (linhas.length === 1) {
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

            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar no último resultado:", erro);
            assert.fail("Erro ao clicar no último resultado");
            throw erro;
        }
    });

    await allure.step("Marcando checkbox de aceite", async (ctx) => {
        try {
            const caixaSelecao = await driver.wait(
                until.elementLocated(By.css('input[type="checkbox"]')),
                10000
            );
            await caixaSelecao.click();
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_marcar_checkbox");
            assert.fail("Erro ao marcar checkbox");
            throw erro;
        }
    });

    await allure.step("Preenchendo o campo 'Razão social'", async (ctx) => {
        try {
            await driver.sleep(1000);
            await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
            await driver.actions().sendKeys("Nova Tech Solutions Ltda").perform();
            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao preencher o campo 'Razão social':", erro);
            await tirarPrint(driver, "Erro_preencher_razao_social");
            assert.fail("Erro ao preencher o campo Razão social");
            throw erro;
        }
    });

    await allure.step("Alterando campo telefone", async (ctx) => {
        try {
            await driver.sleep(500);
            await driver.actions()
                .sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.ENTER)
                .perform();
            await driver.sleep(500);
            const campoTelefone = await driver.findElement(
                By.xpath("/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[2]/div/div[2]/div[2]/div/div/input")
            );
            await driver.wait(until.elementIsVisible(campoTelefone), 5000);
            await campoTelefone.click();
            await driver.actions()
                .sendKeys("11991234567", Key.TAB, Key.ENTER)
                .perform();
            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao atualizar telefone:", erro);
            await tirarPrint(driver, "Erro_atualizar_telefone");
            assert.fail("Erro ao atualizar telefone");
            throw erro;
        }
    });

    await allure.step("Clicando no botão de atualizar", async (ctx) => {
        try {
            const botaoAtualizar = await driver.findElement(
                By.xpath("//button[contains(., 'Atualizar')]")
            );
            await driver.executeScript(
                "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
                botaoAtualizar
            );

            await botaoAtualizar.click();

            await driver.sleep(1500);

            await driver.wait(
                until.elementLocated(By.css('[role="alertdialog"] span#message-id')),
                5000
            );
            const textoAlerta = await driver
                .findElement(By.css('[role="alertdialog"] span#message-id'))
                .getText();

            if (textoAlerta !== "Empresa alterada com sucesso!") {
                throw new Error(
                    `Esperado: "Empresa alterada com sucesso!", mas encontrado: "${textoAlerta}"`
                );
            }
            console.log("Empresa alterada com sucesso!");
            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar em atualizar:", erro);
            await tirarPrint(driver, "Erro_clicar_atualizar");
            assert.fail("Erro ao clicar no botão de atualizar ou validação falhou");
            throw erro;
        }
    });
}

export { AtualizarEmpresa };