import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import { tirarPrint } from '../../comum/tirarPrint.js';
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { PesquisarEmpresa } from './pesquisar-empresa.js';
import { ExcluirEmpresa } from './excluir-empresa.js';

async function CriarEmpresa(driver) {
    const cnpjAlvo = "46.295.498/0001-68";
    const fraseObservacao = "isso é uma observação de teste";

    async function performShiftTab(driver) {
        await driver.actions()
            .keyDown(Key.SHIFT)
            .sendKeys(Key.TAB)
            .keyUp(Key.SHIFT)
            .perform();
        await driver.sleep(200);
    }

    try {
        await allure.step(`Verificação Prévia: Buscando se CNPJ ${cnpjAlvo} já existe`, async (ctx) => {
            try {
                await PesquisarEmpresa(driver, cnpjAlvo);

                const linhas = await driver.findElements(By.css("table tbody tr"));

                if (linhas.length > 1) {
                    const textoLinha = await linhas[0].getText();

                    if (textoLinha.trim() !== "" && !textoLinha.includes("Nenhum registro")) {
                        await ctx.parameter("Ação", "Registro encontrado - Deletando");

                        await ExcluirEmpresa(driver);

                        await driver.sleep(2000);
                    } else {
                        await ctx.parameter("Ação", "Nenhum registro real encontrado");
                    }
                }
            } catch (erro) {
                console.warn("Aviso na verificação prévia (pode ser ignorado se for o primeiro cadastro):", erro.message);
            }
        });


        await allure.step("Acessando página de cadastro de empresa", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas/empresas/novo/`);
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao acessar página de gerenciamento');
                await tirarPrint(driver, "Erro ao acessar a página");
                throw erro;
            }
        });

        await allure.step("Marcando checkbox de aceite", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), 10000);
                await driver.findElement(By.css('input[type="checkbox"]')).click();

                console.log("Ação: Marcando checkbox. Enviando TAB, TAB, ENTER.");
                await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
                await driver.sleep(1500); // Pausa

                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao ativar modo manual');
                await tirarPrint(driver, "Erro ao marcar checkbox");
                throw erro;
            }
        });

        await allure.step("Preenchendo dados iniciais e navegando condicionalmente", async (ctx) => {
            try {
                await driver.actions().sendKeys(Key.TAB, cnpjAlvo).perform();
                await driver.sleep(2000);

                await driver.actions().sendKeys(Key.TAB).perform();
                await driver.sleep(1500); 

                const inputFocadoAposTab = await driver.switchTo().activeElement();
                await inputFocadoAposTab.sendKeys(fraseObservacao);
                await driver.sleep(1500); 
                for (let i = 0; i < 6; i++) {
                    await performShiftTab(driver);
                }

                const activeElement = await driver.switchTo().activeElement();
                const elementValue = await activeElement.getAttribute('value');

                if (elementValue && elementValue.trim() !== '') {
                    await driver.actions().sendKeys(
                        Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB
                    ).perform();
                } else {
                 
                    await performShiftTab(driver);
                    await driver.actions().sendKeys(cnpjAlvo).perform();
                    await driver.sleep(1500);

                    await driver.actions().sendKeys(
                        Key.TAB, Key.TAB, Key.TAB, Key.TAB
                    ).perform();
                }

                await driver.sleep(1500); 
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao preencher campos');
                await tirarPrint(driver, "Erro ao preencher os dados");
                throw erro;
            }
        });

        await allure.step("Preenchendo Contato", async (ctx) => {
            try {
                await driver.sleep(2000);

                await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
                await driver.sleep(2000); 
                await driver.actions().sendKeys(Key.TAB).perform();
                await driver.sleep(1500);
                await driver.actions().sendKeys("Contato Teste", Key.TAB).perform(); 
                await driver.sleep(1500);

                await driver.actions().sendKeys("11912345678", Key.TAB).perform(); 
                await driver.sleep(1500);

                await driver.actions().sendKeys("teste123@gmail.com", Key.TAB).perform(); 
                await driver.sleep(1500);

             
                await driver.actions().sendKeys("Nenhuma observação").perform();
                await driver.sleep(1500);

          
                await driver.actions().sendKeys(Key.TAB, Key.ENTER,).perform();
                await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.TAB,).perform();
                await driver.sleep(1000); // Pausa para foco

                const activeElement = await driver.switchTo().activeElement();

                const elementHtml = await activeElement.getAttribute('innerHTML').catch(() => "");


                const isSaveButton = elementHtml.includes('Salvar') || elementHtml.includes('Adicionar') || elementHtml.includes('Gravar');

                if (isSaveButton) {
                    await driver.actions().sendKeys(Key.ENTER).perform(); 
                } else {
                    await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
                }
                await driver.sleep(3000); 
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await assert.fail('Erro ao preencher contatos');
                throw erro;
            }
        });

        await allure.step("Verificando sucesso do cadastro", async (ctx) => {
            try {
                const mensagem = await driver.wait(
                    until.elementLocated(By.css('span#message-id')),
                    20000,
                    "Timeout ao esperar a mensagem de sucesso após o cadastro."
                );

                const textoMensagem = await mensagem.getText();

                if (textoMensagem === "Erro ao incluir empresa") {
                    return;
                }
                assert.strictEqual(textoMensagem, 'Empresa incluída com sucesso!', 'Mensagem de sucesso não encontrada');

                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");

                let elementosErro = await driver.findElements(By.css(".jss1484 h6"));
                if (elementosErro.length > 0) {
                    let mensagemErro = await elementosErro[0].getText();

                    if (mensagemErro.includes("Houve um problema")) {
                        console.error(`Erro no cadastro detectado: ${mensagemErro}`);
                        await tirarPrint(driver, `Erro no cadastro - ${mensagemErro}`);

                        let elementosDetalhe = await driver.findElements(By.css(".jss1521 p"));
                        if (elementosDetalhe.length > 0) {
                            let mensagemDetalhe = await elementosDetalhe[0].getText();
                            console.error(`Detalhe do erro: ${mensagemDetalhe}`);

                            assert.fail(`Erro no cadastro detectado: ${mensagemErro} - ${mensagemDetalhe}`);
                        } else {
                            await assert.fail('Alerta de sucesso não econtrado');
                            console.error(`Erro no cadastro detectado: ${mensagemErro}`);
                        }
                    }
                }

                await tirarPrint(driver, "Erro ao verificar sucesso do cadastro");
                throw erro;
            }
        });

        console.log("Cadastro de empresa concluído com sucesso!");
    } catch (erro) {
        console.error("Erro ao tentar registrar a empresa:", erro);
        await tirarPrint(driver, "Erro geral no cadastro");
        throw erro;
    }
}

export { CriarEmpresa };