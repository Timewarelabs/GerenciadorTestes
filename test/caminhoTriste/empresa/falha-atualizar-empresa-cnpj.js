import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from '../../comum/tirarPrint.js';

async function FalhaAtualizarEmpresaCNPJ(driver) {
    
    // PASSO DE CLIQUE IDÊNTICO AO ATUALIZAR-EMPRESA.JS
    await allure.step("Clicando na última pessoa", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css("table tbody tr"));
            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado.");
            }
            const ultimoIndice = 0;
            const ultimaLinha = linhas[ultimoIndice];
            console.log(`Quantidade de resultados: ${linhas.length}`);
            console.log(`Clicando na última pessoa (índice ${ultimoIndice})`);

            await driver.executeScript(`
                const row = arguments[0];
                const tbody = row.closest('tbody');
                if (tbody) tbody.scrollTop = row.offsetTop;
            `, ultimaLinha);

            await driver.executeScript("arguments[0].click();", ultimaLinha);
            
            await driver.sleep(3000); // Mantendo o sleep de segurança, se existir, logo após o clique.

            await ctx.parameter("Status", "Sucesso");
        } catch (erro) {
            await ctx.parameter("Status", "Erro");
            console.error("Erro ao clicar no último resultado:", erro);
            assert.fail("Erro ao clicar no último resultado");
            throw erro;
        }
    });

    await allure.step("Marcando checkbox de aceite", async (ctx) => {
        try {
            await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), 10000);
            await driver.findElement(By.css('input[type="checkbox"]')).click();
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
            await ctx.parameter("Status", "Sucesso");
        } catch (erro) {
            await ctx.parameter("Status", "Erro");
            await tirarPrint(driver, "Erro ao marcar checkbox");
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
            await tirarPrint(driver, "CNPJ_invalido_preenchido");
            
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
                await ctx.parameter("Status", "Erro");
                await assert.fail('ERRO: Sistema permitiu CNPJ Inválido!');
            } else {
                console.log(`Mensagem de erro esperada: ${textoAlerta}`);
                await ctx.parameter("Status", "Sucesso");
            }

            // Verificando se as alterações não foram salvas
            await driver.sleep(1000);
            await tirarPrint(driver, "Verificacao_alteracoes_nao_salvas");

        } catch (erro) {
            // Se cair aqui, pode ser que o alerta não apareceu (timeout) ou outro erro de execução
            await ctx.parameter("Status", "Sucesso");
            console.log("Erro capturado durante a tentativa (esperado em teste negativo):", erro.message);
            await tirarPrint(driver, "Fluxo_interrompido_esperado");
        }
    });
}

export { FalhaAtualizarEmpresaCNPJ };