import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";


async function criarContratoObrigatorio(driver) {
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

        // Preenchendo apenas o campo Título (obrigatório)
        await allure.step("Preenchendo o campo Título", async () => {
            try {
                const inputTitulo = await driver.wait( 
                    until.elementLocated(By.xpath("//label[normalize-space(.)='Título*']/parent::div//input")), 
                    10000
                );
                await driver.wait(until.elementIsVisible(inputTitulo), 10000);
                await inputTitulo.sendKeys('Contrato de Teste Automatizado - Campos Obrigatórios');
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

        // Navegando pelos campos restantes (sem preencher)
        await allure.step("Navegando pelos campos", async () => {
            try {
                for (let i = 0; i < 12; i++) {
                    await driver.actions().sendKeys(Key.TAB).perform();
                    await driver.sleep(500);
                }
                allure.parameter("Status", "Sucesso");
                allure.parameter("Descrição", "Navegação pelos campos realizada com sucesso");
            } catch (error) {
                allure.parameter("Status", "Erro");
                console.error("Erro ao navegar pelos campos:", error.message);
                await tirarPrint(driver, "Erro ao navegar pelos campos");
                throw error;
            }
        });

        await allure.step("Criando parte de contrato", async () => {
            try {
                // Navegar até o campo
                await driver.actions().sendKeys(Key.TAB, Key.ENTER, Key.TAB).perform();
                await driver.sleep(1000);

                // Digitar "t"
                await driver.actions().sendKeys('t').perform();
                await driver.sleep(300);

                // Clicar no "ADICIONAR NOVA PESSOA" usando o texto
                const botaoAdicionar = await driver.wait( 
                    until.elementLocated(By.xpath("//p[normalize-space(.)='ADICIONAR NOVA PESSOA']")),
                    10000
                );
                await botaoAdicionar.click();

                await driver.sleep(1000);

                await driver.actions().sendKeys(Key.TAB, '62395813800', Key.TAB, Key.TAB, Key.TAB).perform();

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
                    await allure.parameter("Status", "Sucesso");
                    await allure.parameter("Mensagem", textoMensagem);
                    console.log('Contrato criado com sucesso!');
                } else {
                    await allure.parameter("Status", "Erro");
                    await allure.parameter("Mensagem recebida", textoMensagem);
                    await tirarPrint(driver, "Mensagem inesperada no toast");
                    throw new Error(`Texto do alerta não encontrado. Esperado conter "sucesso", mas encontrado: "${textoMensagem}"`);
                }
        
                await driver.sleep(3000); 
        
                await allure.parameter("Descrição", "Botão Salvar clicado com sucesso");
        
            } catch (error) {
                await allure.parameter("Status", "Erro");
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



export { criarContratoObrigatorio };