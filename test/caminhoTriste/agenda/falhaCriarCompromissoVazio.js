import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';

async function falhaCriarCompromissoVazio(driver) {
    console.log("Iniciando teste: Compromisso - Campos Vazios");

    await allure.step("Executando cenário: Campos Vazios", async (ctx) => {
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

        await driver.executeScript(`const modal = document.querySelector('[role="dialog"]'); if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });`);
        await driver.sleep(1000);

        const botaoSalvar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_submit_form"]')), 10000);
        const atributoDisabled = await botaoSalvar.getAttribute('disabled');
        const estaDesabilitado = atributoDisabled !== null && atributoDisabled !== 'false';
        
        assert.ok(estaDesabilitado, `Botão Salvar deveria estar desabilitado (Campos Vazios)`);

        const botaoCancelar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_cancel_form"]')), 10000);
        await botaoCancelar.click();
        await driver.sleep(1000);
    });
}

export { falhaCriarCompromissoVazio };