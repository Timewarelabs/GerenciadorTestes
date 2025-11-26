import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js"; 

async function falhaCriarContratoComCampoNumero(driver) {
    let bugDetectado = false;
    let mensagemBug = ""; 

    try {
        await allure.step("Acessando página de cadastro de contrato", async () => {
            await driver.get(`${obterBaseUrl()}/contratos/novo/`);
            allure.attachment("URL", `${obterBaseUrl()}/contratos/novo/`, "text/plain");
            allure.parameter("Status", "200");
            allure.parameter("Descrição", "Página de cadastro de contrato acessada com sucesso");
        });

        let campos = ['Título', 'Objeto', 'Número', 'Unidade de negócio', 'Data de assinatura',
            'Início da vigência', 'Data de extinção', 'Término da vigência',
            'Valor', 'Índice de reajuste', 'Pasta', 'Responsável', 'Observação'];

        let valores = ['Contrato de Teste Automatizado - teste', 'teste', 'numero com letra', '42', '01012025',
            '02022025', '03032025', '09092025', '11111', '10',
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
                allure.parameter("Status", "200");
                allure.parameter("Descrição", "Campo título preenchido com sucesso");
            } catch (error) {
                allure.parameter("Status", "400");
                console.error("Erro ao preencher o campo Título:", error.message);
                await tirarPrint(driver, "Erro ao preencher o campo Título");
                throw error;
            }
        });

        // Preenchendo os demais campos
        for (let i = 1; i < valores.length; i++) {
            const rotulo = campos[i]; 
            const valor = valores[i];

            await allure.step(`Preenchendo o campo: ${rotulo}`, async () => {
                try {
                    let campoInput = await driver.switchTo().activeElement(); 
                    await campoInput.sendKeys(valor);
                    await campoInput.sendKeys(Key.ENTER);
                    await campoInput.sendKeys(Key.TAB);
                    await driver.sleep(500);


                    if (rotulo === "Número") {
                        // Volta o foco ao campo número (SHIFT + TAB)
                        await driver.actions().keyDown(Key.SHIFT).sendKeys(Key.TAB).keyUp(Key.SHIFT).perform();
                        await driver.sleep(600); // dá tempo do foco se ajustar corretamente

                        const campoNumero = await driver.switchTo().activeElement(); 
                        const valorFinal = await campoNumero.getAttribute("value");

                        console.log(`Valor final no campo Número: ${valorFinal}`);

                        if (valorFinal !== valor) {
                            console.log("Campo 'Número' não aceitou letras — validação funcionando corretamente.");
                            allure.parameter("Validação Campo Número", "Campo rejeitou letras corretamente.");
                        } else {
                            console.log("Campo 'Número' aceitou letras — validação ausente.");
                            allure.label("bug", "Campo 'Número' aceita letras");
                            allure.issue("BUG-NUMERO-CAMPO", "Campo 'Número' aceita letras inválidas");
                            allure.parameter("Validação Campo Número", "Aceitou letras (comportamento incorreto)");
                            bugDetectado = true;
                            mensagemBug = "BUG: contrato com número inválido foi salvo — falha de validação no campo Número.";
                        }

  
                        await driver.actions().sendKeys(Key.TAB).perform();
                        await driver.sleep(300);
                    }

                    allure.parameter("Status", "200");
                    allure.parameter("Campo", rotulo);
                    allure.parameter("Valor", valor);
                } catch (error) {
                    allure.parameter("Status", "400");
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

                allure.parameter("Status", "200");
                allure.parameter("Descrição", "Parte do contrato selecionada com sucesso");
            } catch (error) {
                allure.parameter("Status", "400");
                console.error("Erro ao criar parte do contrato:", error.message);
                await tirarPrint(driver, "Erro ao criar parte do contrato");
                throw error;
            }
        }); 

        await allure.step("Clicando no botão Salvar", async () => {
            try {
                await driver.sleep(2000);
        
                const botaoSalvar = await driver.findElement(
                    By.xpath("//span[normalize-space(.)='Salvar']/parent::button")
                );
                await driver.wait(until.elementIsVisible(botaoSalvar), 10000);
                await botaoSalvar.click();
        
                await driver.sleep(3000); 
        
            } catch (error) {
                await allure.parameter("Status", "400");
                await tirarPrint(driver, "Erro inesperado ao validar contrato inválido");
                throw new Error(`Erro ao clicar no botão Salvar: ${error.message}`);
            }
        });       
            
        if (bugDetectado) {
            await tirarPrint(driver, "Validacao falhou - numero com letra permitido");
            await assert.fail(mensagemBug);
        }

    } catch (error) {
        await allure.parameter("Status", "400");
        await tirarPrint(driver, "Erro inesperado no fluxo completo do teste");
        if (!error.message.includes(mensagemBug)) { 
             throw new Error(`Erro inesperado no fluxo completo: ${error.message}`);
        } else {
             throw error; 
        }
    }
}

export { falhaCriarContratoComCampoNumero };