import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";


async function criarContrato(driver) {
    try {
        await allure.step("Acessando página de cadastro de contrato", async () => {
            try {
                await driver.get(`${obterBaseUrl()}/contratos/novo/`);
                allure.attachment("URL", `${obterBaseUrl()}/contratos/novo/`, "text/plain");
                allure.parameter("Status", "200");
                allure.parameter("Descrição", "Página de cadastro de contrato acessada com sucesso");
            } catch (error) {
                allure.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao acessar página de cadastro de contrato");
                throw error;
            }
        });


        let campos = ['Título', 'Objeto', 'Número', 'Unidade de negócio', 'Data de assinatura', 
                        'Início da vigência', 'Data de extinção', 'Término da vigência', 
                        'Valor', 'Índice de reajuste', 'Pasta', 'Responsável'];
        
        let valores = ['Contrato de Teste Automatizado', 'teste', '1234', '42', '01012025',
                        '02022025', '03032025', '09092025', '11111', '',
                        '', 'carol'];


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
                await driver.sleep(500);
                allure.parameter("Status", "200");
                allure.parameter("Descrição", "Campo título preenchido com sucesso");
            } catch (error) {
                allure.parameter("Status", "400");
                console.error("Erro ao preencher o campo Título:", error.message);
                await tirarPrint(driver, "Erro ao preencher o campo Título");
                throw error;
            }
        });


        for (let i = 1; i < valores.length; i++) {
            console.log(`Preenchendo campo: ${campos[i]} com valor: ${valores[i]}`);
            const campo = campos[i];
            const valor = valores[i]; 

            await allure.step(`Preenchendo o campo: ${campo}`, async () => {
                try {
                    let inputField = await driver.switchTo().activeElement();
                    await driver.sleep(500);
                    await inputField.sendKeys(valor);
                    await driver.sleep(500);
                    await inputField.sendKeys(Key.TAB);
                    
                    allure.parameter("Status", "200");
                    allure.parameter("Campo", campo);
                    allure.parameter("Valor", valor);
                } catch (error) {
                    allure.parameter("Status", "400");
                    console.error(`Erro ao preencher o campo ${campo}:`, error.message);
                    await tirarPrint(driver, `Erro ao preencher o campo ${campo}`);
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
                
                await driver.actions().sendKeys(Key.TAB).perform();
                await driver.sleep(1000);

                // Digitar "teste"
                await driver.actions().sendKeys('t').perform();
                await driver.sleep(1000);


                // Clicar no "ADICIONAR NOVA EMPRESA" usando o texto
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

                
                allure.parameter("Status", "200");
                allure.parameter("Descrição", "Parte do contrato selecionada com sucesso");
            } catch (error) {
                allure.parameter("Status", "400");
                console.error("Erro ao criar parte do contrato:", error.message);
                await tirarPrint(driver, "Erro ao criar parte do contrato");
                throw error;
            }
        });

        // Clicando no botão Salvar
        await allure.step("Clicando no botão Salvar", async () => {
            try {
                await driver.sleep(2000);
        
                const botaoSalvar = await driver.findElement(
                    By.xpath("//span[normalize-space(.)='Salvar']/parent::button")
                );
                await driver.wait(until.elementIsVisible(botaoSalvar), 10000);
                await botaoSalvar.click();
        
                // Espera a div do toast aparecer
                const divToast = await driver.wait(
                    until.elementLocated(By.css('div[role="alertdialog"]')),
                    10000,
                    "Toast de sucesso não apareceu"
                );
                await driver.wait(until.elementIsVisible(divToast), 5000);
        
                // Espera a mensagem estar visível
                const mensagem = await divToast.findElement(By.css('span#message-id'));
                const textoMensagem = await mensagem.getText();
        
                if (textoMensagem.includes("sucesso")) {
                    await allure.parameter("Status", "200");
                    await allure.parameter("Mensagem", textoMensagem);
                    console.log('Contrato criado com sucesso!');
                } else {
                    await allure.parameter("Status", "400");
                    await allure.parameter("Mensagem recebida", textoMensagem);
                    await tirarPrint(driver, "Mensagem inesperada no toast");
                    throw new Error(`Texto do alerta não encontrado. Esperado conter "sucesso", mas encontrado: "${textoMensagem}"`);
                }
        
                await driver.sleep(3000); 
        
                await allure.parameter("Descrição", "Botão Salvar clicado com sucesso");
        
            } catch (error) {
                await allure.parameter("Status", "400");
                await tirarPrint(driver, "Erro ao clicar no botão Salvar");
                console.error("Erro ao clicar no botão Salvar:", error.message);
                throw new Error(`Erro ao clicar no botão Salvar: ${error.message}`);
            }
        });
        
        
    } catch (error) {
        allure.attachment("Error Screenshot", await driver.takeScreenshot(), "image/png");
        allure.attachment("Error", error.message, "text/plain");
        throw new Error("Falha ao criar contrato: " + error.message);
    }
}

export { criarContrato };