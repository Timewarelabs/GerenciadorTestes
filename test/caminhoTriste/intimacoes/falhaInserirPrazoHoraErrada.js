import { By, until, Key } from 'selenium-webdriver';
import * as allure from 'allure-js-commons';
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaInserirPrazoHoraErrada(driver) {
  console.log("Tentando inserir um prazo com hora errada...");
  allure.parameter("Descrição", "Tentando inserir um prazo com hora errada...");
        
  const agora = new Date();
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  
  const dataAmanha = amanha.toLocaleDateString('pt-BR');
  const dataHoje = agora.toLocaleDateString('pt-BR'); 
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false}); 
  const tituloPrazo = `Alterado em ${dataHoje} às ${horaAtual}`;
  const horaInvalida = '9999'; 

  async function digitarLentamente(elementoInput, texto) {
    await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    for (const char of texto) {
        await elementoInput.sendKeys(char);
        await driver.sleep(100);
    }
  }
        
  const cenarios = [
      { desc: "Hora inválida", titulo: tituloPrazo, data: dataAmanha, hora: horaInvalida },
  ];

  // STEP 1: CLIQUE PARA ABRIR MODAL
  await allure.step("Clicando no botão de inserir prazo", async (ctx) => {
      try {
        const xpathBotaoRelogio = "/html/body/div/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div/div[1]/div/div/div/div[1]/ul/li[2]/ul[1]/li/div[2]/div[1]/div/div[1]/div/div/button";
        await driver.wait(until.elementLocated(By.xpath(xpathBotaoRelogio)), 10000);
        const btnInserir = await driver.findElement(By.xpath(xpathBotaoRelogio));
        await btnInserir.click();
        console.log("Clique no ícone de relógio!");
        await ctx.parameter("Status", "200");
      } catch (error) {
        console.error("Erro ao clicar no botao de inserir prazo do processo:", error);
        await ctx.parameter("Status", "400");
        await tirarPrint(driver, "Erro_ao_clicar_botao_inserir_prazo");
        await assert.fail('Erro ao clicar no botao de inserir prazo do processo');
        throw error;
      }
  });

  // STEP 2: TESTE
  for (const cenario of cenarios) {
    await allure.step(`Executando cenário: ${cenario.desc}`, async (ctx) => {
        try {
            const inputTitulo = await driver.findElement(By.css('[data-testid="input_title_deadline"]'));
            await inputTitulo.click();
            await inputTitulo.clear(); 
            console.log("Estado do título:", cenario.titulo);
            if (cenario.titulo) await digitarLentamente(inputTitulo, cenario.titulo);

            const inputData = await driver.findElement(By.css('[data-testid="input_date_deadline"]'));
            await inputData.click(); 
            await inputData.clear();
            console.log("Estado da data:", cenario.data);
            if (cenario.data) await digitarLentamente(inputData, cenario.data);

            const inputHora = await driver.findElement(By.css('[data-testid="input_hour_deadline"]'));
            await inputHora.click(); 
            await inputHora.clear(); 
            console.log("Estado da hora:", cenario.hora);
            if (cenario.hora) await digitarLentamente(inputHora, cenario.hora);

            const btnSalvar = await driver.findElement(By.css('[data-testid="btn_save_deadline"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", btnSalvar);
            await driver.sleep(3000);
            await btnSalvar.click();

            await driver.executeScript("window.scrollTo(0, 0);");
            await driver.sleep(3000);
            
            
            const elementoMensagem = await driver.wait(until.elementLocated(By.id('message-id')), 5000);
            await driver.wait(until.elementIsVisible(elementoMensagem), 5000);
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", elementoMensagem);
            const textoErro = await elementoMensagem.getText();
            console.log('Mensagem visível:', textoErro);

            if (textoErro) {
                 await ctx.parameter("Status", "200");
                 await allure.parameter("Validação", "Mensagem de erro exibida com sucesso");
                 await tirarPrint(driver, "Erro_hora_invalida_exibido");
            } else {
                 await ctx.parameter("Status", "400");
                 await tirarPrint(driver, "Erro_hora_invalida_nao_exibido");
                 throw new Error("Mensagem de erro não foi exibida.");
            }

        } catch (error) {
            console.error("Erro durante execução do cenário:", error);
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro_ao_visualizar_mensagem_erro");
            throw error;
        }
    });
  }

  // STEP 3: CLICAR NO BOTÃO "CLOSE" PARA FECHAR O MODAL
  await allure.step("Clicando no botão 'Close' para fechar o modal", async (ctx) => {
    try {
        try {
             await driver.sleep(1000);
             const btnFechar = await driver.findElement(By.css('button[aria-label="Close"]'));
             await driver.executeScript("arguments[0].scrollTop = 0;", btnFechar);
             await driver.wait(until.elementIsVisible(btnFechar), 5000);
             await driver.wait(until.elementIsEnabled(btnFechar), 5000);
             await btnFechar.click();
        } catch (e) {
             await driver.actions().sendKeys(Key.ESCAPE).perform();
        }

        console.log("Modal fechado com sucesso!");
        await ctx.parameter("Status", "200");
        await driver.sleep(2000);
    } catch (error) {
        console.error("Erro ao fechar o modal:", error);
        await ctx.parameter("Status", "400");
        await tirarPrint(driver, "Erro_ao_fechar_modal");
    }
  }); 

  console.log("Verificação de salvar prazo com hora errada efetuada com sucesso!");
}

export { falhaInserirPrazoHoraErrada };