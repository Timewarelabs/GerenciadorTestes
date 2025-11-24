import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import fs from 'fs';
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";

async function PesquisarEmpresa(driver, termo) {
    try {
        await allure.step("Acessando Página de Registro", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas`);
                await ctx.parameter("Status", "200");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                assert.fail('Erro ao acessar página de gerenciamento');
                throw erro;
            }
        });

        await allure.step("Fechando popup de introdução", async (ctx) => {
            try {
                const botaoFechar = await driver.wait(
                    until.elementLocated(By.css(".reactour__helper button.sc-bxivhb")),
                    5000
                );
                await botaoFechar.click();
                await ctx.parameter("Popup", "Fechado");
            } catch {
                await ctx.parameter("Popup", "Não encontrado");
            }
        });

        let barraPesquisa;
        await allure.step("Clicando no input de pesquisa", async (ctx) => {
            try {
                barraPesquisa = await driver.wait(
                    until.elementLocated(By.css("input[placeholder='Buscar pessoas ou empresas']")),
                    10000
                );
                await barraPesquisa.click();
                await ctx.parameter("Status", "200");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                assert.fail('Input de pesquisa não encontrado');
                throw erro;
            }
        });

        await allure.step("Pesquisando pelo nome do usuário", async (ctx) => {
            if (typeof termo !== 'string' || !termo.trim()) {
                throw new Error("Parâmetro `termo` deve ser uma string não vazia");
            }
            await barraPesquisa.sendKeys(termo, Key.ENTER);
            console.log('Inserindo termo de pesquisa:', termo);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Aguardando resultados", async (ctx) => {
            await driver.sleep(2000);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Rolando a página para visualizar resultados", async (ctx) => {
            await driver.executeScript("window.scrollBy(0, 800)");
            await ctx.parameter("Status", "200");
        });

        await allure.step("Verificando resultados e tirando print", async (ctx) => {
            const resultados = await driver.findElements(By.xpath("/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div/div[2]/div/div[2]/div/div/table/tbody/tr"));

            if (resultados.length === 3) {
                console.log(`Resultados encontrados: ${resultados.length}, tirando screenshot...`);
                const captura = await driver.takeScreenshot();
                const carimboTempo = new Date().toISOString().replace(/[:.]/g, '-');
                const caminhoCaptura = `screenshots/resultado-pesquisa-${carimboTempo}.png`;

                if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
                fs.writeFileSync(caminhoCaptura, captura, 'base64');

                allure.attachment("Resultado da Pesquisa",
                    Buffer.from(captura, 'base64'), 'image/png');
                await ctx.parameter("Resultados", `Encontrados: ${resultados.length} empresas`);
                await ctx.parameter("Screenshot", caminhoCaptura);
            } else {
                console.log("Quantidade inesperada de resultados:", resultados.length);
            }
        });

    } catch (erro) {
        console.error("Erro no processo de busca:", erro);
        throw erro;
    }
}

export { PesquisarEmpresa };