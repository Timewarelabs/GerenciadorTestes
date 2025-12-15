import { By, until, Key } from 'selenium-webdriver';
import * as allure from 'allure-js-commons';
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaInserirPrazoDataVazia(driver) {
  console.log("Tentando inserir um prazo com data vazia...");
  allure.parameter("Descrição", "Tentando inserir um prazo com data vazia...");
        
  const agora = new Date();
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  const dataAmanha = amanha.toLocaleDateString('pt-BR');
  const dataHoje = agora.toLocaleDateString('pt-BR'); 
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false}); 
  const tituloPrazo = `Alterado em ${dataHoje} às ${horaAtual}`;

  async function digitarLentamente(elementoInput, texto) {
    await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    for (const char of texto) {
        await elementoInput.sendKeys(char);
        await driver.sleep(100);
    }
  }
        
  const cenarios = [
      { desc: "Data vazia", titulo: tituloPrazo, data: "", hora: horaAtual },
  ];
    
  // STEP 1: CLIQUE PARA ABRIR MODAL
  await allure.step("Clicando no botão de inserir prazo", async (ctx) => {
      try {
        const xpathBotaoRelogio = "/html/body/div/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div/div[1]/div/div/div/div[1]/ul/li[2]/ul[1]/li/div[2]/div[1]/div/div[1]/div/div/button";
        await driver.wait(until.elementLocated(By.xpath(xpathBotaoRelogio)), 10000);
        const btnInserir = await driver.findElement(By.xpath(xpathBotaoRelogio));
        await btnInserir.click();
        console.log("Clique no ícone de relógio!");
        await ctx.parameter("Status", "Sucesso");
      } catch (error) {
        console.error("Erro ao clicar no botao de inserir prazo do processo:", error);
        await ctx.parameter("Status", "Erro");
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
            await inputTitulo.clear(); 
            if (cenario.titulo) await digitarLentamente(inputTitulo, cenario.titulo);

            const inputData = await driver.findElement(By.css('[data-testid="input_date_deadline"]'));
            await inputData.clear(); 
            if (cenario.data) await digitarLentamente(inputData, cenario.data);

            const inputHora = await driver.findElement(By.css('[data-testid="input_hour_deadline"]'));
            await inputHora.clear(); 
            if (cenario.hora) await digitarLentamente(inputHora, cenario.hora);

            const btnSalvar = await driver.findElement(By.css('[data-testid="btn_save_deadline"]'));
            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", btnSalvar);
            await driver.sleep(3000);
            await btnSalvar.click();

            await driver.executeScript("window.scrollTo(0, 0);");
            await driver.sleep(2000);

            const mensagensNaTela = await Promise.all(
                (await driver.findElements(By.css('p'))).map(el => el.getText())
            );
            
            const validacoesEsperadas = [
                'É obrigatório informar um título',
                'É obrigatório informar uma data',
                'É obrigatório informar um horário'
            ];
            
            const encontrouErro = validacoesEsperadas.some(val => mensagensNaTela.some(t => t.includes(val)));

            await driver.sleep(3000);
            const inputsAindaExistem = await Promise.all([
                driver.findElements(By.css('[data-testid="input_title_deadline"]')),
                driver.findElements(By.css('[data-testid="input_date_deadline"]')),
                driver.findElements(By.css('[data-testid="input_hour_deadline"]')),
            ]);
            const modalFechou = inputsAindaExistem.some(arr => arr.length === 0);

            if (modalFechou && !encontrouErro) {
                await tirarPrint(driver, "Erro_modal_fechou_sem_validacao");
                throw new Error("Modal foi fechado sem mostrar mensagens de erro. O prazo foi salvo incorretamente (Bug).");
            }

            if (encontrouErro) {
                console.log('Mensagem de erro (Data) identificada com sucesso.');
                await tirarPrint(driver, "Validacao_erro_data_sucesso");
                await ctx.parameter("Status", "Sucesso");
            } else {
                await tirarPrint(driver, "Erro_validacao_data_ausente");
                throw new Error("Nenhuma mensagem de erro foi encontrada e o modal permanece aberto.");
            }

        } catch (error) {
            console.error("Erro durante execução do cenário:", error);
            await ctx.parameter("Status", "Erro");
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
             await driver.executeScript("arguments[0].click();", btnFechar);
        } catch (e) {
             await driver.actions().sendKeys(Key.ESCAPE).perform();
        }

        console.log("Modal fechado com sucesso!");
        await ctx.parameter("Status", "Sucesso");
        await driver.sleep(2000);
    } catch (error) {
        console.error("Erro ao fechar o modal:", error);
        await ctx.parameter("Status", "Erro");
        await tirarPrint(driver, "Erro_ao_fechar_modal");
    }
  }); 

  console.log("Tentando salvar um prazo com data vazio finalizado.");
}

export { falhaInserirPrazoDataVazia };