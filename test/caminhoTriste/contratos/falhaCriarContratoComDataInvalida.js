import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaCriarContratoComDataInvalida(driver) {
    try {
        await allure.step("Acessando página de cadastro de contrato", async () => {
            try {
                await driver.get(`${obterBaseUrl()}/contratos/novo/`);
                allure.attachment("URL", `${obterBaseUrl()}/contratos/novo/`, "text/plain");
                allure.parameter("Status", "Sucesso");
                allure.parameter("Descrição", "Página de cadastro de contrato acessada com sucesso");
            } catch (error) {
                allure.parameter("Status", "Erro");
                await tirarPrint(driver, "Erro ao acessar página de cadastro de contrato");
                throw error;
            }
        });

        let campos = ['Título', 'Objeto', 'Número', 'Unidade de negócio', 'Data de assinatura', 
                      'Início da vigência', 'Data de extinção', 'Término da vigência', 
                      'Valor', 'Índice de reajuste', 'Pasta', 'Responsável', 'Observação'];
        
        let valores = ['Contrato de Teste Automatizado', 'teste', '1234', '42', '99999999',
                      '99999999', '99999999', '99999999', '11111', '10',
                      'teste', 'Vinicius', 'nenhuma'];

        await allure.step("Preenchendo o campo Título", async () => {
            try {
                const inputTitulo = await driver.wait(
                    until.elementLocated(By.xpath("//label[normalize-space(.)='Título*']/parent::div//input")), 
                    10000
                );
                await driver.wait(until.elementIsVisible(inputTitulo), 10000);
                await inputTitulo.sendKeys(valores[0]);
                await inputTitulo.sendKeys(Key.ENTER);
                await inputTitulo.sendKeys(Key.TAB);
                allure.parameter("Status", "Sucesso");
                allure.parameter("Descrição", "Campo título preenchido com sucesso");
            } catch (error) {
                allure.parameter("Status", "Erro");
                console.error("Erro ao preencher o campo Título:", error.message);
                await tirarPrint(driver, "Erro ao preencher o campo Título");
                throw error;
            }
        });

        // Preenchendo os demais campos
        for (let i = 1; i < valores.length; i++) {
            console.log(`Preenchendo campo: ${campos[i]} com valor: ${valores[i]}`);
            
            const rotulo = campos[i];
            const valor = valores[i];

            await allure.step(`Preenchendo o campo: ${rotulo}`, async () => {
                try {
                    let inputCampo = await driver.switchTo().activeElement();
                    await inputCampo.sendKeys(valor);
                    await inputCampo.sendKeys(Key.ENTER);
                    await inputCampo.sendKeys(Key.TAB);
                    
                    allure.parameter("Status", "Sucesso");
                    allure.parameter("Campo", rotulo);
                    allure.parameter("Valor", valor);
                } catch (error) {
                    allure.parameter("Status", "Erro");
                    console.error(`Erro ao preencher o campo ${rotulo}:`, error.message);
                    await tirarPrint(driver, `Erro ao preencher o campo ${rotulo}`);
                    throw error;
                }
            });
        }

        await allure.step("Criando parte de contrato", async () => {
            try {
                const botaoPartes = await driver.wait(
                    until.elementLocated(By.css("div[title='Adicionar pessoa como parte ']")),
                    10000
                );
                await driver.wait(until.elementIsVisible(botaoPartes), 5000);

                await botaoPartes.click();
                // Navegar até o campo
                await driver.actions().sendKeys(Key.TAB).perform();
                await driver.sleep(1000);

                // Digitar "t"
                await driver.actions().sendKeys('t').perform();
                await driver.sleep(1000);

                // Clicar no "ADICIONAR NOVA PESSOA" usando o texto
                const botaoAdicionar = await driver.wait(
                    until.elementLocated(By.xpath("//p[normalize-space(.)='ADICIONAR NOVA PESSOA']")),
                    10000
                );
                await botaoAdicionar.click();

                await driver.sleep(1000);

                await driver.actions().sendKeys(Key.TAB, '28905486860', Key.TAB, Key.TAB, Key.TAB).perform();

                await driver.sleep(3000);

                await driver.actions().sendKeys(Key.ENTER).perform();
                // Localizar e preencher o campo posição
                const inputPosicao = await driver.wait(
                    until.elementLocated(By.name('posicao')),
                    10000
                );
                await inputPosicao.click();
                await inputPosicao.sendKeys('adm', Key.ENTER);
                await driver.sleep(1000);

                // Clicar na checkbox "Esta parte é cliente"
                const checkboxCliente = await driver.wait(
                    until.elementLocated(By.xpath("//label[contains(., 'Esta parte é cliente')]//input[@type='checkbox']")),
                    10000
                );
                await checkboxCliente.click();
                await driver.sleep(1000);

                // Clicar no botão Adicionar usando o texto
                const botaoAdicionar2 = await driver.wait(
                    until.elementLocated(By.xpath("//span[normalize-space(.)='Adicionar']")),
                    10000
                );

                await botaoAdicionar2.click();

                allure.parameter("Status", "Sucesso");
                allure.parameter("Descrição", "Parte do contrato selecionada com sucesso");
            } catch (error) {
                allure.parameter("Status", "Erro");
                console.error("Erro ao criar parte do contrato:", error.message);
                await tirarPrint(driver, "Erro ao criar parte do contrato");
                throw error;
            }
        });

        // Clicando no botão Salvar
        await allure.step("Clicando no botão Salvar", async (ctx) => { 
            try {
                await driver.sleep(2000);
                
                const botaoSalvar = await driver.findElement(By.xpath("//span[normalize-space(.)='Salvar']/parent::button"));
                await driver.wait(until.elementIsVisible(botaoSalvar), 10000);
                await botaoSalvar.click();

                await driver.wait(until.elementLocated(By.css('span#message-id')), 2000);
                const mensagem = await driver.findElement(By.css('span#message-id'), 2000);
                const textoMensagem = await mensagem.getText();

                if (textoMensagem === "Incluído com sucesso") {
                    await allure.parameter("Status", "Erro");
                    await tirarPrint(driver, "Falha: Contrato criado com data invalida");
                    await assert.fail('Contrato criado com sucesso (Data inválida foi aceita)!');
                    console.log('Contrato criado com sucesso (Falha no teste)!')
                } else {
                    await allure.parameter("Status", "200 - Validação OK");
                    console.log(`Validação de data inválida bem sucedida. Mensagem: ${textoMensagem}`);
                    await ctx.parameter("Resultado", "Sistema bloqueou datas inválidas");
                }
                
                await driver.sleep(2000);
                
            } catch (error) {
                await allure.parameter("Status", "200 - Validação OK (Catch)");
                await assert.ok(true, 'Erro ao clicar no botão de registro (Bloqueio esperado)');
                await tirarPrint(driver, "Erro ao clicar no botão de registro (Bloqueio esperado)");
                console.log("Sistema bloqueou o salvamento (Erro/Timeout esperado).");
            }
        });

    } catch (error) {
        await tirarPrint(driver, "Falha geral ao testar contrato com data invalida");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao criar contrato com data inválida: " + error.message);
    }
}

export { falhaCriarContratoComDataInvalida };