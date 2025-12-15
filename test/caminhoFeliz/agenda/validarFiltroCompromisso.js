import { By, until } from 'selenium-webdriver';
import * as allure from 'allure-js-commons';
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { tirarPrint } from "../../comum/tirarPrint.js";

async function validarFiltroCompromisso(driver) {
    try {
        console.log("Iniciando fluxo de filtro da agenda para compromissos...");

        await allure.step("Clicando no botão para exibir o menu", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
                const botaoMenu = await driver.findElement(By.css('[data-testid="btn_side_menu"]'));
                await botaoMenu.click();
                await ctx.parameter("Status", "Sucesso");
                console.log("Menu clicado com sucesso!");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "erro_ao_clicar_menu");
                assert.fail("Erro ao clicar no botão para exibir menu");
            }
        });

        await allure.step("Clicando no botão de navegação da agenda", async (ctx) => {
            try {
                await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
                const linksMenu = await driver.findElements(By.className('menuLinks'));

                if (linksMenu.length >= 6) {
                    await linksMenu[5].click();
                    console.log("Clique em Agenda realizado com sucesso!");
                    await ctx.parameter("Status", "Sucesso");
                } else {
                    console.log("Não há elementos suficientes com a classe 'menuLinks' para achar Agenda.");
                    await ctx.parameter("Status", "Erro");
                }
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "erro_ao_achar_agenda");
                assert.fail("Erro ao acessar Agenda em menuLinks");
            }
        });

        await allure.step("Clicando no botão para fechar o menu", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
                const botaoMenu = await driver.findElement(By.css('[data-testid="btn_side_menu"]'));
                await botaoMenu.click();
                await ctx.parameter("Status", "Sucesso");
                console.log("Menu clicado com sucesso!");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "erro_ao_clicar_menu_novamente");
                assert.fail("Erro ao clicar no botão para exibir menu novamente");
            }
        });

        await allure.step("Clicando no botão de filtro da agenda", async (ctx) => {
            try {
                const botaoFiltro = await driver.wait(until.elementLocated(By.css('[data-testid="btn_filter"]')), 10000);
                await botaoFiltro.click();
                await driver.sleep(2000);
                await ctx.parameter("Status", "Sucesso");
                console.log("Botão de filtro clicado com sucesso!");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "erro_ao_clicar_filtro");
                assert.fail("Erro ao clicar no botão de filtro");
            }
        });

        const testIdsCheckboxes = [
            'checkbox-intimacoes',
            'checkbox-prazos-de-intimacoes',
            'checkbox-compromissos',
            'checkbox-tarefas',
            'checkbox-vencimento-de-contratos'
        ];

        await allure.step("Desmarcando todos os checkboxes", async (ctx) => {
            try {
                for (const testId of testIdsCheckboxes) {
                    const input = await driver.wait(until.elementLocated(By.css(`input[data-testid="${testId}"]`)), 5000);
                    await driver.executeScript("arguments[0].scrollIntoView(true);", input);
                    const estaSelecionado = await input.isSelected();
                    if (estaSelecionado) await input.click();
                    await driver.sleep(2000);
                }
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "erro_ao_desmarcar_checkboxes");
                assert.fail("Erro ao desmarcar os checkboxes");
            }
        });

        await allure.step("Marcando o checkbox de Compromissos", async (ctx) => {
            try {
                const checkboxCompromissos = await driver.wait(until.elementLocated(By.css('[data-testid="checkbox-compromissos"]')), 5000);
                const estaChecado = await checkboxCompromissos.getAttribute("aria-checked");
                if (estaChecado !== "true") await checkboxCompromissos.click();
                await driver.sleep(2000);
                await ctx.parameter("Status", "Sucesso");
            } catch (erro) {
                await ctx.parameter("Status", "Erro");
                await tirarPrint(driver, "erro_ao_marcar_checkbox_compromissos");
                assert.fail("Erro ao marcar o checkbox de Compromissos");
            }
        });

        await allure.step("Validando exibição de compromissos na agenda", async (ctx) => {
            const eventosCompromisso = await driver.findElements(By.css('[data-testid*="compromisso"]'));
            assert.ok(eventosCompromisso.length > 0, "Nenhum compromisso encontrado após aplicar o filtro");
            await ctx.parameter("Status", "Sucesso");
        });

        await allure.step("Validando que apenas compromissos estão visíveis na agenda", async (ctx) => {
            const tiposInvalidos = ["tarefa", "intimacao", "prazo", "vencimento"];
            const eventosVisiveis = [];

            for (const tipo of tiposInvalidos) {
                const eventos = await driver.findElements(By.css(`[data-testid*="${tipo}"]`));
                for (const evento of eventos) {
                    const estaVisivel = await evento.isDisplayed();
                    if (estaVisivel) {
                        eventosVisiveis.push({ type: tipo, text: await evento.getText() });
                    }
                }
            }

            assert.strictEqual(
                eventosVisiveis.length,
                0,
                `Esperado nenhum evento visível dos tipos inválidos, mas foram encontrados:\n${eventosVisiveis.map(e => `${e.type}: ${e.text}`).join('\n')}`
            );

            const elementosCompromisso = await driver.findElements(By.css('[data-testid*="compromisso"]'));
            let temCompromissoVisivel = false;

            for (const tarefa of elementosCompromisso) {
                if (await tarefa.isDisplayed()) {
                    temCompromissoVisivel = true;
                    break;
                }
            }

            assert.ok(temCompromissoVisivel, "Nenhum compromisso visível encontrado após aplicar o filtro");
            await ctx.parameter("Status", "Sucesso");
        });

        console.log("Fluxo de filtro da agenda para compromissos finalizado com sucesso.");

    } catch (erro) {
        console.error("Erro geral no fluxo de filtro de agenda:", erro);
        await tirarPrint(driver, "erro_geral_filtro_agenda");
        throw erro;
    }

    await driver.get(`${obterBaseUrl()}/home`);
}

export { validarFiltroCompromisso };