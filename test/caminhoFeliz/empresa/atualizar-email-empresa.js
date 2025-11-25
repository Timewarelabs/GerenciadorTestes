import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { CapturaTela } from '../../comum/captura.js';

async function AtualizarEmailEmpresa(driver) {
  
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
      console.error("Erro ao clicar:", erro);
      throw erro;
    }
  });

  await allure.step("Aguardando gaveta e checkbox", async (ctx) => {
    try {
      await driver.sleep(2000);
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

  await allure.step("Abrindo o editor", async (ctx) => {
    try {
      await driver.sleep(1000);
      let botaoEditar;
      try {
          botaoEditar = await driver.findElement(By.css('div[title="Editar"], button[title="Editar"]'));
      } catch (e) {
          try {
             botaoEditar = await driver.findElement(By.xpath("//*[contains(text(), 'Editar')]"));
          } catch (e2) {}
      }

      if (botaoEditar) {
          await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoEditar);
          await driver.sleep(500);
          await botaoEditar.click();
          await driver.sleep(1500);
      }
      await ctx.parameter("Status", "200");
    } catch (erro) {
      console.warn("Aviso editar:", erro);
    }
  });

  await allure.step("Atualizando E-mail", async (ctx) => {
    try {
      await driver.sleep(500);
      console.log("Buscando campo de E-mail...");
      
      const inputEmail = await driver.wait(
          until.elementLocated(By.xpath("//label[contains(., 'Email') or contains(., 'E-mail')]/following::input[1]")),
          5000
      );

      await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", inputEmail);
      await driver.sleep(500);
      
      await driver.executeScript("arguments[0].focus();", inputEmail);
      await inputEmail.click();
      
      await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform();
      await driver.sleep(200);
      
      const novoEmail = "emailAtualizado@gmail.com";
      await inputEmail.sendKeys(novoEmail);
      
      await driver.actions().sendKeys(Key.TAB).perform();
      const body = await driver.findElement(By.css('body'));
      await body.click();
      await driver.sleep(1000);

      // Verificação de valor (log apenas)
      const valorNoCampo = await inputEmail.getAttribute("value");
      if (valorNoCampo !== novoEmail) console.warn(`Aviso: Valor no campo difere (${valorNoCampo}).`);

      await ctx.parameter("Status", "200");
    } catch (erro) {
      await ctx.parameter("Status", "400");
      console.error("Erro ao atualizar e-mail:", erro);
      await CapturaTela(driver, "Erro_atualizar_email");
      assert.fail(`Erro ao atualizar o campo de email: ${erro.message}`);
      throw erro;
    }
  });

  await allure.step("Salvando", async (ctx) => {
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
      await CapturaTela(driver, "Erro_Salvar_Email");
      throw erro;
    }
  });
}

export { AtualizarEmailEmpresa };