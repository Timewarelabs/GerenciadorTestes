import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function buscarPessoa(driver) {
    try {
        await allure.step("Acessando Página de Registro", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas`);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao acessar pagina de pesquisa");
                assert.fail('Erro ao acessar página de gerenciamento');
            }
        });

        await allure.step("Fechando popup de introdução", async (ctx) => {
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

        await allure.step("Clicando no input de pesquisa e preenchendo nome", async (ctx) => {
            try {
                const barraBusca = await driver.wait(
                    until.elementLocated(By.css("input[placeholder='Buscar pessoas ou empresas']")),
                    5000
                );
                await driver.wait(until.elementIsVisible(barraBusca), 5000);
                await barraBusca.click();

                const nomeBusca = "Vinícius Nascimento Borges";
                await driver.actions().sendKeys(nomeBusca).perform();

                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao preencher input de pesquisa");
                assert.fail('Input de pesquisa não encontrado');
            }
        });

        await allure.step("Clicando no botão Pesquisar via TABs + ENTER", async (ctx) => {
            try {
                await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
                await driver.sleep(3000);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao clicar no botao pesquisar");
                assert.fail('Erro ao clicar no botão pesquisar');
            }
        });

        await allure.step("Rolando a página para visualizar resultados", async (ctx) => {
            try {
                await driver.executeScript("window.scrollBy(0, 800)");
                await driver.sleep(1000);
                await ctx.parameter("Status", "Sucesso");
            } catch (error) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro na rolagem da pagina");
                assert.fail('Rolagem da página falhou');
            }
        });

        await allure.step("Verificando resultados na tabela e tirando print", async (ctx) => {
            try {
                const xpathCorpoTabela = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div/div[2]/div/div[2]/div/div/table/tbody";
                const corpoTabela = await driver.wait(until.elementLocated(By.xpath(xpathCorpoTabela)), 5000);
                const linhas = await corpoTabela.findElements(By.css("tr"));

                if (linhas.length === 0) {
                    await ctx.parameter("Resultados", "Nenhuma linha encontrada na tabela");
                    assert.fail("Nenhum resultado encontrado na tabela.");
                }

                let nomeEncontrado = false;
                for (const linha of linhas) {
                    const cells = await linha.findElements(By.css("td"));
                    const nome = await cells[1].getText();

                    if (nome.includes("Vinícius Nascimento Borges")) {
                        nomeEncontrado = true;
                        break;
                    }
                }

                if (nomeEncontrado) {
                    await tirarPrint(driver, "Resultado Pesquisa com Sucesso"); 
                    await ctx.parameter("Resultados", `Pessoa encontrada: Vinícius Nascimento Borges`);
                } else {
                    await ctx.parameter("Resultados", "Pessoa não encontrada na tabela");
                    assert.fail("Pessoa 'Vinícius Nascimento Borges' não encontrada nos resultados.");
                }
            } catch (error) {
                await tirarPrint(driver, "Erro na Verificacao Resultados"); 
                await ctx.parameter("Erro na verificação", error.message);
                throw error;
            }
        });

    } catch (error) {
        console.error("Erro no processo de busca:", error);
        await tirarPrint(driver, "Erro inesperado no fluxo de busca"); 
        assert.fail("Erro inesperado no fluxo de busca");
    }
}

export { buscarPessoa };