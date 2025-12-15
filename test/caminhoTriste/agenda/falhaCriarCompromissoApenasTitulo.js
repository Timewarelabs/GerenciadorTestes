import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';

async function digitarLentamente(elementoInput, texto, driver) {
    await elementoInput.click();
    await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    for (const char of texto) {
        await elementoInput.sendKeys(char);
        await driver.sleep(50);
    }
}

async function falhaCriarCompromissoApenasTitulo(driver) {
    console.log("Iniciando teste: Compromisso - Apenas Título");

    await allure.step("Executando cenário: Apenas Título", async (ctx) => {
        const titulo = "Teste Sad Path - Apenas Título";

        // Navegação
        const botaoMenu = await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
        await botaoMenu.click();
        const linksMenu = await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
        await linksMenu[5].click();
        const botaoCriar = await driver.wait(until.elementLocated(By.id('newEventButton')), 10000);
        await botaoCriar.click();
        const botaoCompromisso = await driver.wait(until.elementLocated(By.css('[data-testid="menu_item_appointment"]')), 10000);
        await botaoCompromisso.click();

        const inputTitulo = await driver.wait(until.elementLocated(By.css('[data-testid="input_title"]')), 10000);
        const inputData = await driver.wait(until.elementLocated(By.css('[data-testid="input_date"]')), 10000);
        const inputHora = await driver.wait(until.elementLocated(By.css('[data-testid="input_hour"]')), 10000);

        await inputTitulo.clear();
        await inputData.clear();
        await inputHora.clear();

        await digitarLentamente(inputTitulo, titulo, driver);
        // Data e Hora vazios

        const botaoSalvar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_submit_form"]')), 10000);
        const atributoDisabled = await botaoSalvar.getAttribute('disabled');
        const estaDesabilitado = atributoDisabled !== null && atributoDisabled !== 'false';
        
        assert.ok(estaDesabilitado, `Botão Salvar deveria estar desabilitado (Apenas Título)`);

        const botaoCancelar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_cancel_form"]')), 10000);
        await botaoCancelar.click();
        await driver.sleep(1000);
    });
}

export { falhaCriarCompromissoApenasTitulo };