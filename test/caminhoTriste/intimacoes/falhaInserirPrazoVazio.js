import { By, until, Key } from 'selenium-webdriver';
import * as allure from 'allure-js-commons';
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaInserirPrazoVazio(driver) {
  console.log("Tentando inserir um prazo com campos vazios...");
  allure.parameter("Descrição", "Tentando inserir um prazo com campos vazios...");

  const agora = new Date();
  const amanha = new Date(agora);
  amanha.setDate(agora.getDate() + 1);
  const dataAmanha = amanha.toLocaleDateString('pt-BR');
  const dataHoje = agora.toLocaleDateString('pt-BR');
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const tituloPrazo = `Alterado em ${dataHoje} às ${horaAtual}`;

  async function digitarLentamente(elementoInput, texto) {
    await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    for (const char of texto) {
      await elementoInput.sendKeys(char);
      await driver.sleep(100);
    }
  }

  const cenarios = [
    { desc: "Todos vazios", titulo: "", data: "", hora: "" }
  ];

  await allure.step("Clicando no botão de inserir prazo", async (ctx) => {
    try {
      await driver.sleep(3000);
      const btnInserir = await driver.findElement(By.xpath("/html/body/div/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div/div[1]/div/div/div/div[1]/ul/li[2]/ul[1]/li/div[2]/div[1]/div/div[1]/div/div/button"));
      await btnInserir.click();
      console.log("Ícone de relógio clicado");
      await ctx.parameter("Status", "Sucesso");
    } catch (err) {
      console.error("Erro ao clicar no botão de inserir prazo:", err);
      await ctx.parameter("Status", "Erro");
      allure.parameter("Descrição", "Erro ao clicar no botão de inserir prazo");
      await tirarPrint(driver, "Erro_ao_clicar_botao_inserir_prazo");
      assert.fail("Falha ao abrir modal de prazo");
      throw err;
    }
  });

  // STEP 2: TESTE
  for (const cenario of cenarios) {
    await allure.step(`Executando cenário: ${cenario.desc}`, async (ctx) => {
      const inputTitulo = await driver.findElement(By.css('[data-testid="input_title_deadline"]'));
      await inputTitulo.clear();
      if (cenario.titulo) await digitarLentamente(inputTitulo, cenario.titulo);

      const inputData = await driver.findElement(By.css('[data-testid="input_date_deadline"]'));
      await inputData.clear();
      if (cenario.data) await digitarLentamente(inputData, cenario.data);

      const inputHora = await driver.findElement(By.css('[data-testid="input_hour_deadline"]'));
      await inputHora.clear();
      if (cenario.hora) await digitarLentamente(inputHora, cenario.hora);

      const botaoSalvar = await driver.findElement(By.css('[data-testid="btn_save_deadline"]'));
      await driver.executeScript("arguments[0].scrollIntoView({behavior:'smooth',block:'center'});", botaoSalvar);
      await driver.sleep(300);
      await botaoSalvar.click();

      await driver.executeScript("window.scrollTo(0, 0);");
      await driver.sleep(500);
      
      const textosValidacao = await Promise.all(
        (await driver.findElements(By.css('p'))).map(el => el.getText())
      );
      
      const validacoesEsperadas = [
        'É obrigatório informar um título',
        'É obrigatório informar uma data',
        'É obrigatório informar um horário'
      ];
      
      const encontrouErro = validacoesEsperadas.some(val => textosValidacao.some(t => t.includes(val)));

      if (!encontrouErro) {
        await tirarPrint(driver, "Erro_validacao_ausente");
        throw new Error("Nenhuma mensagem de validação apareceu (Esperado falha ao salvar vazio)");
      }
      
      console.log("Mensagem de erro exibida corretamente (Sucesso no Sad Path)");
      await tirarPrint(driver, "Validacao_erro_campos_vazios_sucesso");
      await ctx.parameter("Status", "Sucesso");
    });
  }

  // STEP 4: FECHAR MODAL
  await allure.step("Fechando o modal", async (ctx) => {
    try {
      try {
          const btnFechar = await driver.findElement(By.css('button[aria-label="Close"]'));
          await btnFechar.click();
      } catch (e) {
          await driver.actions().sendKeys(Key.ESCAPE).perform();
      }

      console.log("Modal fechado com sucesso");
      await ctx.parameter("Status", "Sucesso");
    } catch (err) {
      console.error("Erro ao fechar o modal:", err);
      await ctx.parameter("Status", "Erro");
      allure.parameter("Descrição", "Erro ao fechar o modal");
      await tirarPrint(driver, "Erro_ao_fechar_modal");    }
  });

  console.log("Teste de campos vazios finalizado.");
}

export { falhaInserirPrazoVazio };