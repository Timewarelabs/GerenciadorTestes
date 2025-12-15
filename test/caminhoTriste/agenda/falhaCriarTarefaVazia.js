import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';

async function falhaCriarTarefaVazia(driver) {
    console.log("Iniciando testes de falha (Caminho Triste) para criação de tarefa...");

    const agora = new Date();
    const titulo = "Título teste sad path";
    const amanha = new Date(agora);
    amanha.setDate(amanha.getDate() + 1);
    const dataString = amanha.toLocaleDateString('pt-BR');
    const horaString = "1300";

    async function digitarLentamente(elementoInput, texto) {
        await elementoInput.click(); // Garante foco
        await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
        for (const char of texto) {
            await elementoInput.sendKeys(char);
            await driver.sleep(50);
        }
    }

    const cenarios = [
        { desc: "Título vazio", titulo: "", data: dataString, hora: horaString },
        { desc: "Data vazia", titulo: titulo, data: "", hora: horaString },
        { desc: "Hora vazia", titulo: titulo, data: dataString, hora: "" },
        { desc: "Apenas título", titulo: titulo, data: "", hora: "" },
        { desc: "Apenas data", titulo: "", data: dataString, hora: "" },
        { desc: "Apenas hora", titulo: "", data: "", hora: horaString },
        { desc: "Todos vazios", titulo: "", data: "", hora: "" }
    ];

    for (const cenario of cenarios) {
        await allure.step(`Executando cenário: ${cenario.desc}`, async (ctx) => {
              
            const botaoMenu = await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
            await botaoMenu.click();
    
            const linksMenu = await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
            await linksMenu[5].click();
            
            const botaoCriar = await driver.wait(until.elementLocated(By.id('newEventButton')), 10000);
            await botaoCriar.click();

            const botaoTarefa = await driver.wait(until.elementLocated(By.css('[data-testid="menu_item_task"]')), 10000);
            await botaoTarefa.click();

            const inputTitulo = await driver.wait(until.elementLocated(By.css('[data-testid="input_title"]')), 10000);
            const inputData = await driver.wait(until.elementLocated(By.css('[data-testid="input_date"]')), 10000);
            const inputHora = await driver.wait(until.elementLocated(By.css('[data-testid="input_hour"]')), 10000);

            await inputTitulo.clear();
            await inputData.clear();
            await inputHora.clear();

            if (cenario.titulo) {
                await inputTitulo.sendKeys(cenario.titulo);
                await driver.actions().sendKeys(Key.TAB).perform();
            }

            if (cenario.data) {
                await digitarLentamente(inputData, cenario.data);
                await driver.actions().sendKeys(Key.TAB).perform(); // Fecha calendário
            }

            if (cenario.hora) {
                await digitarLentamente(inputHora, cenario.hora);
                await driver.actions().sendKeys(Key.TAB).perform();
            }

            await driver.executeScript(`
                const modal = document.querySelector('[role="dialog"]');
                if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });
            `);
            await driver.sleep(1000);

            const botaoSalvar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_submit_form"]')), 10000);
            await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", botaoSalvar);
            await driver.sleep(500);

            const atributoDisabled = await botaoSalvar.getAttribute('disabled');
            const estaDesabilitado = atributoDisabled !== null && atributoDisabled !== 'false';
            
            assert.ok(estaDesabilitado, `Botão Salvar deveria estar desabilitado no cenário: ${cenario.desc}`);
            await ctx.parameter("Botão desabilitado", estaDesabilitado.toString());

            const botaoCancelar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_cancel_form"]')), 10000);
            await driver.wait(until.elementIsEnabled(botaoCancelar), 5000);
            await botaoCancelar.click();
            await driver.sleep(1000);
        });
    }

    console.log("Testes sad path de Tarefa finalizados com sucesso.");
}

export { falhaCriarTarefaVazia };