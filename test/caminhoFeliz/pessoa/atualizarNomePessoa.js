import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function atualizarNomePessoa(driver) {
  try {
    const nomeAnterior = "Vinícius Nascimento Borges";
    const nomeNovo = "Vinícius Borges Atualizado";

    await allure.step("Acessando página de pessoas/empresas", async (ctx) => {
     try {
        await driver.get(`${obterBaseUrl()}/pessoas-empresas`);
        await ctx.parameter("Status", "Sucesso");
     } catch (error) {
        await tirarPrint(driver, "Erro ao acessar pagina de pessoas");
        throw error;
     }
    });

    await allure.step("Fechando popup de introdução (se houver)", async (ctx) => {
     try {
        const btnFechar = await driver.wait(
         until.elementLocated(By.css(".reactour__helper button.sc-bxivhb")),
         5000
        );
        await btnFechar.click();
        await ctx.parameter("Popup", "Fechado");
     } catch (_) {
        await ctx.parameter("Popup", "Não exibido");
     }
    });

    await allure.step("Preenchendo campo de busca", async (ctx) => {
     try {
        const campoBusca = await driver.findElement(
         By.css("input[placeholder='Buscar pessoas ou empresas']")
        );
        await campoBusca.click();
        await campoBusca.clear();
        await campoBusca.sendKeys(nomeAnterior);
        await driver.actions().sendKeys("\uE004\uE004\uE007").perform(); // TAB, TAB, ENTER
        await driver.sleep(3000);
        await ctx.parameter("Busca", nomeAnterior);
      } catch (error) {
        await tirarPrint(driver, "Erro ao preencher campo de busca");
        throw error;
      }
    });

    await allure.step("Clicando no primeiro resultado", async (ctx) => {
      try {
        const linhas = await driver.findElements(By.css("table tbody tr"));
        assert.ok(linhas.length > 0, "Nenhum resultado encontrado na tabela");
        const primeiraLinha = linhas[0];

        await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", primeiraLinha);
        await driver.executeScript("arguments[0].click();", primeiraLinha);
        await ctx.parameter("Status", "Sucesso");
      } catch (error) {
        await tirarPrint(driver, "Erro ao clicar no primeiro resultado");
        throw error;
      }
    });

    await allure.step("Alterando nome da pessoa", async (ctx) => {
      try {
        const xpathInputNome = "/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[1]/div[6]/div/div/input";
        const inputNome = await driver.wait(until.elementLocated(By.xpath(xpathInputNome)), 10000);

        await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", inputNome);
        await inputNome.clear();
        await inputNome.sendKeys(nomeNovo);
        await ctx.parameter("Novo Nome", nomeNovo);

        await driver.sleep(2000);
      } catch (error) {
        await tirarPrint(driver, "Erro ao alterar nome da pessoa");
        throw error;
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
        await tirarPrint(driver, "Erro ao clicar no botao de salvar edicao");
        throw error;
      }
    });

  } catch (error) {
    console.error("Erro ao editar pessoa:", error);
    await tirarPrint(driver, "Erro geral durante a edicao"); 
    assert.fail("Erro durante a edição da pessoa.");
  }
}

export { atualizarNomePessoa };