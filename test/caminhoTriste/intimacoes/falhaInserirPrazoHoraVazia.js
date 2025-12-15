import { By, until, Key } from 'selenium-webdriver';
import * as allure from 'allure-js-commons';
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaInserirPrazoHoraVazia(driver) {
  console.log('Tentando inserir um prazo com hora vazia...');
  allure.parameter('Descrição', 'Tentando inserir um prazo com hora vazia...');

  const agora = new Date();
  const amanha = new Date(agora);
  amanha.setDate(agora.getDate() + 1);
  
  const dataAmanha = amanha.toLocaleDateString('pt-BR');
  const dataHoje = agora.toLocaleDateString('pt-BR');
  const horaAtual = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const tituloPrazo = `Alterado em ${dataHoje} às ${horaAtual}`;

  async function digitarLentamente(elementoInput, texto) {
    await elementoInput.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
    for (const char of texto) {
      await elementoInput.sendKeys(char);
      await driver.sleep(100);
    }
  }

  const cenarios = [
    { desc: 'Hora vazia', titulo: tituloPrazo, data: dataAmanha, hora: '' },
  ];

  // STEP 1: ABRIR MODAL DE INSERÇÃO DE PRAZO
  await allure.step('Clicando no botão de inserir prazo', async (ctx) => {
    try {
      const xpathBotaoRelogio = '/html/body/div/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div/div[1]/div/div/div/div[1]/ul/li[2]/ul[1]/li/div[2]/div[1]/div/div[1]/div/div/button';
      
      const btnInserir = await driver.findElement(By.xpath(xpathBotaoRelogio));
      await btnInserir.click();
      console.log('Ícone de relógio clicado!');
      await ctx.parameter('Status', '200');
    } catch (err) {
      console.error('Erro ao abrir modal de prazo:', err);
      await ctx.parameter('Status', '400');
      allure.parameter('Descrição', 'Não conseguiu abrir o modal de inserir prazo');
      await tirarPrint(driver, 'Erro_Abrir_Modal');
      assert.fail('Falha ao clicar no ícone de inserir prazo');
      throw err;
    }
  });

  // STEP 3: Teste (Preenchimento e Validação)
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

      const btnSalvar = await driver.findElement(By.css('[data-testid="btn_save_deadline"]'));
      await driver.executeScript('arguments[0].scrollIntoView({behavior:"smooth",block:"center"});', btnSalvar);
      await driver.sleep(300);
      await btnSalvar.click();

      await driver.executeScript('window.scrollTo(0,0);');
      await driver.sleep(500);
      
      const mensagensNaTela = await Promise.all(
        (await driver.findElements(By.css('p'))).map(el => el.getText())
      );
      
      const validacoesEsperadas = [
        'É obrigatório informar um título',
        'É obrigatório informar uma data',
        'É obrigatório informar um horário'
      ];
      
      const encontrouErro = validacoesEsperadas.some(val => mensagensNaTela.some(t => t.includes(val)));

      if (!encontrouErro) {
        await tirarPrint(driver, "Erro_validacao_hora_ausente");
        throw new Error('Nenhuma mensagem de validação apareceu (Esperado falha na hora)');
      }
      
      console.log("Mensagem de erro (Hora) exibida corretamente");
      await tirarPrint(driver, "Validacao_erro_hora_sucesso");
      await ctx.parameter('Status', '200');
    });
  }

  // STEP 4: Fechar modal 
  await allure.step("Fechando o modal", async (ctx) => {
    try {
      try {
          const btnFechar = await driver.findElement(By.css('button[aria-label="Close"]'));
          await btnFechar.click();
      } catch (e) {
          await driver.actions().sendKeys(Key.ESCAPE).perform();
      }
      
      await ctx.parameter('Status', '200');
    } catch (err) {
      console.error('Erro ao fechar modal:', err);
      await ctx.parameter('Status', '400');
      await tirarPrint(driver, 'Erro_Fechar_Modal');
    }
  });

  console.log('Teste de “hora vazia” finalizado.');
}

export { falhaInserirPrazoHoraVazia };