import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function atualizarPessoa(driver) { 
    try {
        await allure.step("Acessando Página de Pesquisa de Pessoas", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas`);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao acessar pagina de pessoas");
                assert.fail("Erro ao acessar página de pessoas");
            }
        });

        await allure.step("Fechando popup de introdução (se existir)", async (ctx) => {
            try {
                const botaoFechar = await driver.wait( 
                    until.elementLocated(By.css(".reactour__helper button.sc-bxivhb")),
                    5000
                );
                await driver.wait(until.elementIsVisible(botaoFechar), 5000);
                await botaoFechar.click();
                await ctx.parameter("Popup", "Fechado");
            } catch (error) {
                await ctx.parameter("Popup", "Não encontrado ou erro ao fechar");
            }
        });

        await allure.step("Buscando pessoa pelo nome", async (ctx) => {
            try {
                const barraBusca = await driver.wait( 
                    until.elementLocated(By.css("input[placeholder='Buscar pessoas ou empresas']")),
                    5000
                );
                await barraBusca.click();
                const nomeBusca = "Vinícius Nascimento Borges";
                await driver.actions().sendKeys(nomeBusca).perform();

                await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
                await driver.sleep(3000);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao buscar pessoa");
                assert.fail("Erro ao buscar pessoa");
            }
        });

        await allure.step("Clicando na primeira linha da tabela de resultados", async (ctx) => {
            try {
                const linhas = await driver.findElements(By.css("table tbody tr"));
                if (linhas.length === 0) throw new Error("Nenhum resultado encontrado.");
                const primeiraLinha = linhas[0];

                await driver.executeScript(`
                    const row = arguments[0];
                    const tbody = row.closest('tbody');
                    if (tbody) tbody.scrollTop = row.offsetTop;
                `, primeiraLinha);

                await driver.executeScript("arguments[0].click();", primeiraLinha);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao clicar na pessoa");
                assert.fail("Erro ao clicar na pessoa");
                throw error;
            }
        });

        await allure.step("Alterando o campo 'Nome da Mãe'", async (ctx) => {
            try {
                await driver.actions().sendKeys(
                    Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB,
                    Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB
                ).perform();

                await driver.actions().sendKeys("Maria de Lourdes Borges Atualizado").perform();

                await driver.sleep(2000);

                await driver.actions().sendKeys(Key.ENTER).perform();

                await driver.sleep(2000);

                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                console.error("Erro ao preencher o campo 'Nome da Mãe':", error.message);
                await tirarPrint(driver, "Erro ao preencher nome mae");
                assert.fail("Erro ao preencher o campo Nome da Mãe");
            }
        });

        await allure.step("Scrolle até o botão 'Atualizar' e clique para salvar", async (ctx) => {
              try {
                const xpathBtnSalvar = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[3]/div/button[1]"; 
                const btnSalvar = await driver.wait(until.elementLocated(By.xpath(xpathBtnSalvar)), 10000); 
        
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", btnSalvar);
                await driver.wait(until.elementIsVisible(btnSalvar), 5000);
                await driver.wait(until.elementIsEnabled(btnSalvar), 5000);
        
                await btnSalvar.click();
        
                const localizadorMensagem = await driver.wait( 
                  until.elementLocated(By.xpath("//*[contains(text(), 'Pessoa alterada com sucesso')]")),
                  10000
                );
                const textoMensagem = await localizadorMensagem.getText();
                assert.strictEqual(textoMensagem, "Pessoa alterada com sucesso!");
        
                await ctx.parameter("Status", "Sucesso");
              } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao salvar atualizacao");
                throw error;
              }
            });

    } catch (error) {
        console.error("Erro no fluxo de atualização:", error);
        await tirarPrint(driver, "Erro inesperado na atualizacao");
        throw error;
    }
}

export { atualizarPessoa };