import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from '../../comum/tirarPrint.js';

async function AtualizarEmailEmpresa(driver) {
  // PASSO 1: Clicar na última empresa
  await allure.step("Clicando na última empresa", async (ctx) => {
    try {
      // busca todas as linhas de resultado
      const linhas = await driver.findElements(By.css("table tbody tr"));
      if (linhas.length === 0) {
        throw new Error("Nenhum resultado encontrado.");
      }
      const ultimoIndice = 0;
      const ultimaLinha = linhas[ultimoIndice];
      console.log(`Quantidade de resultados: ${linhas.length}`);
      console.log(`Clicando na última empresa (índice ${ultimoIndice})`);

      await driver.executeScript(
        `const row = arguments[0];
         const tbody = row.closest('tbody');
         if (tbody) tbody.scrollTop = row.offsetTop;`,
        ultimaLinha
      );

      await driver.executeScript("arguments[0].click();", ultimaLinha);

      await ctx.parameter("Status", "Sucesso");
    } catch (erro) {
      await ctx.parameter("Status", "Erro");
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
      await ctx.parameter("Status", "Sucesso");
    } catch (erro) {
      await ctx.parameter("Status", "Erro");
      await tirarPrint(driver, "Erro_ao_marcar_checkbox");
      assert.fail("Erro ao marcar checkbox");
      throw erro;
    }
  });

  await allure.step("Abrindo o editor de endereço", async (ctx) => {
    try {
      await driver.executeScript("window.scrollBy(0, 300)");
      await driver.sleep(500);
      await driver.executeScript("window.scrollBy(0, 300)");
      await driver.sleep(500);

      let botaoEditar;
      try {
        botaoEditar = await driver.findElement(By.css('div[title="Editar"]'));
      } catch {
        botaoEditar = await driver.findElement(
          By.xpath("//div[@role='button' and @title='Editar']")
        );
      }

      await driver.executeScript("arguments[0].click();", botaoEditar);
      await ctx.parameter("Status", "Sucesso");
    } catch (erro) {
      await ctx.parameter("Status", "Erro");
      console.error("Erro ao abrir editor de endereço:", erro);
      await tirarPrint(driver, "Erro_abrir_editor_endereco");
      assert.fail("Erro ao abrir editor de endereço");
      throw erro;
    }
  });

  await allure.step("Atualizando o campo de email", async (ctx) => {
    try {
      await driver.sleep(2000);
      await tirarPrint(driver, "Antes_de_localizar_campo_email");

      let campoEmail;
      try {
        campoEmail = await driver.findElement(By.css('input[value="Contato Teste"]'));
      } catch {
        campoEmail = await driver.findElement(By.css('.jss2559.jss2583.jss2567 input'));
      }

      await tirarPrint(driver, "Campo_email_encontrado");

      await driver.executeScript(
        "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
        campoEmail
      );
      await campoEmail.click();
      await tirarPrint(driver, "Apos_clicar_campo_email");

      await driver.actions()
        .sendKeys(Key.TAB, Key.TAB, "emailAtualizado@gmail.com", Key.ENTER)
        .perform();
      await tirarPrint(driver, "Apos_preencher_email");

      await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
      await ctx.parameter("Status", "Sucesso");
    } catch (erro) {
      await ctx.parameter("Status", "Erro");
      console.error("Erro ao atualizar o campo de email:", erro);
      await tirarPrint(driver, "Erro_atualizar_email");
      assert.fail("Erro ao atualizar o campo de email");
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
      await ctx.parameter("Status", "Sucesso");
    } catch (erro) {
      await ctx.parameter("Status", "Erro");
      console.error("Erro ao clicar no botão de atualizar:", erro);
      await tirarPrint(driver, "Erro_clicar_atualizar");
      assert.fail("Erro ao clicar no botão de atualizar ou validação falhou");
      throw erro;
    }
  });
}

export { AtualizarEmailEmpresa };