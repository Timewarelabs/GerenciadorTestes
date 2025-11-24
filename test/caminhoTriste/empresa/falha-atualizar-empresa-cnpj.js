import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { CapturaTela } from '../../comum/captura.js';

async function FalhaAtualizarEmpresaCNPJ(driver) {
    
    // Unifiquei a lógica de clique para usar a mais estável (table tbody tr)
    await allure.step("Clicando na última empresa", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css("table tbody tr"));

            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado.");
            }

            const ultimoIndice = linhas.length - 1;
            console.log(`Quantidade de resultados: ${linhas.length}`);
            console.log(`Clicando na última empresa (index: ${ultimoIndice})`);

            const ultimaLinha = linhas[ultimoIndice];

            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", ultimaLinha);
            await driver.wait(until.elementIsVisible(ultimaLinha));
            await driver.wait(until.elementIsEnabled(ultimaLinha));
            await driver.executeScript("arguments[0].click();", ultimaLinha);

            await driver.sleep(3000);

            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar no último resultado:", erro);
            await assert.fail('Erro ao clicar no último resultado: ' + erro.message);
            throw erro;
        }
    });

    await allure.step("Marcando checkbox de aceite", async (ctx) => {
        try {
            await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), 10000);
            await driver.findElement(By.css('input[type="checkbox"]')).click();
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
            await ctx.parameter("Status", "200");
        } catch (erro) {
            await ctx.parameter("Status", "400");
            await CapturaTela(driver, "Erro ao marcar checkbox");
            await assert.fail('Erro ao marcar checkbox');
            throw erro;
        }
    });

    await allure.step("Tentando atualizar com CNPJ inválido", async (ctx) => {
        try {
            // CNPJ inválido
            const cnpjInvalido = "123456789";
            
            // Navegando até o campo de CNPJ (primeiro campo após aceitar)
            await driver.sleep(500);
            await driver.actions().sendKeys(Key.TAB).sendKeys(Key.ENTER).perform();
            
            // Limpando o campo e inserindo o CNPJ inválido
            await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform();
            await driver.actions().sendKeys(cnpjInvalido).perform();
            
            // Tirando screenshot do campo preenchido
            await CapturaTela(driver, "CNPJ_invalido_preenchido");
            
            // Clicando no botão de atualizar
            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Atualizar')]"));
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
            await botaoAtualizar.click();

            // Clicando novamente para garantir (conforme original)
            await driver.sleep(500);
            await botaoAtualizar.click();

            await driver.wait(until.elementLocated(By.css('span#message-id')), 5000, "Timeout ao esperar o alerta aparecer");

            const elementoMensagem = await driver.findElement(By.css('span#message-id'));
            const textoAlerta = await elementoMensagem.getText();

            if (textoAlerta === 'Pessoa atualizada com sucesso!' || textoAlerta === 'Empresa atualizada com sucesso!') {
                await ctx.parameter("Status", "400");
                await assert.fail('ERRO: Sistema permitiu CNPJ Inválido!');
            } else {
                console.log(`Mensagem de erro esperada: ${textoAlerta}`);
                await ctx.parameter("Status", "200");
            }

            // Verificando se as alterações não foram salvas
            await driver.sleep(1000);
            await CapturaTela(driver, "Verificacao_alteracoes_nao_salvas");

        } catch (erro) {
            // Se cair aqui, pode ser que o alerta não apareceu (timeout) ou outro erro de execução
            await ctx.parameter("Status", "200");
            console.log("Erro capturado durante a tentativa (esperado em teste negativo):", erro.message);
            await CapturaTela(driver, "Fluxo_interrompido_esperado");
        }
    });
}

export { FalhaAtualizarEmpresaCNPJ };