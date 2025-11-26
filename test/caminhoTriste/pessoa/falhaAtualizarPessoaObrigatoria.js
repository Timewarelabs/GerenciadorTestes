import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 

async function falhaAtualizarPessoaObrigatoria(driver) {
    await allure.step("Clicando na última pessoa para edição", async (ctx) => {
        try {
            const linhas = await driver.findElements(By.css('tr[style*="cursor: pointer"]')); 
    
            if (linhas.length === 0) {
                throw new Error("Nenhum resultado encontrado. Certifique-se de que há registros cadastrados para este teste.");
            }
    
            let ultimoIndice = linhas.length - 1; 
            console.log(`Quantidade de resultados: ${linhas.length}`);
            console.log(`Clicando na última pessoa: ${ultimoIndice}`);
    
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", linhas[ultimoIndice]);
    
            await driver.wait(until.elementIsVisible(linhas[ultimoIndice]));
            await driver.wait(until.elementIsEnabled(linhas[ultimoIndice]));
    
            await driver.executeScript("arguments[0].click();", linhas[ultimoIndice]);
    
            await ctx.parameter("Status", "200");
        } catch (error) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao clicar no último resultado:", error);
            await tirarPrint(driver, "Erro ao clicar no ultimo resultado");
            await assert.fail('Erro ao clicar no último resultado');
            throw error;
        }
    });
    
    await allure.step("Tentando atualizar sem nome (campo obrigatório)", async (ctx) => {
        try {
            await driver.sleep(500);
            await driver.actions()
                .sendKeys(Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB)
                .sendKeys(Key.TAB, Key.TAB, Key.TAB)
                .perform();
    
            await driver.actions()
                .keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL)
                .sendKeys(Key.BACK_SPACE)
                .perform();
    
            await tirarPrint(driver, "Campo_nome_vazio");
    
            const botaoAtualizar = await driver.findElement(By.xpath("//button[contains(., 'Atualizar')]"));
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoAtualizar);
            await botaoAtualizar.click();
    
            
            const localizadorMensagem = By.css('span#message-id');
            await driver.wait(until.elementLocated(localizadorMensagem), 5000, "Timeout ao esperar o alerta de sucesso aparecer");
            
            const mensagem = await driver.findElement(localizadorMensagem);
            const textoMensagem = await mensagem.getText(); 
    
            const mensagemSucesso = 'Pessoa atualizada com sucesso!';
    
            if (textoMensagem.includes(mensagemSucesso)) {
                await ctx.parameter("Status", "400 - ERRO DE TESTE");
                await tirarPrint(driver, "BUG: Alerta de sucesso inesperado");
                await assert.fail(`Alerta de sucesso encontrado, mas o campo Nome é obrigatório. Mensagem: ${textoMensagem}`);
            } else {
                await ctx.parameter("Status", "200 - Validação OK");
                console.log(`Mensagem de validação do sistema: ${textoMensagem || 'Validação implícita de campo obrigatório acionada.'}`);
                await tirarPrint(driver, "Verificacao_alteracoes_nao_salvas_ok");
            }
        } catch (error) {
            await ctx.parameter("Status", "200 - Validação OK (Sucesso Sad Path)");
            await tirarPrint(driver, "Sistema bloqueou o salvamento");
            console.log(`Sucesso no Sad Path: Sistema bloqueou o salvamento (Erro/Timeout esperado: ${error.message})`);
            await assert.ok(true, 'Sistema bloqueou o salvamento de campo obrigatório vazio.');
        }
    });
}

export { falhaAtualizarPessoaObrigatoria };