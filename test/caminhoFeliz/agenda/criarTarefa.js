import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";

async function criarTarefa(driver) {
    try {
        console.log("Iniciando fluxo de criação de tarefa na agenda...");

        const agora = new Date();
        const titulo = `Teste de cadastro de tarefa na Agenda - ${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;

        const amanha = new Date(agora);
        amanha.setDate(amanha.getDate() + 1);
        const dataString = amanha.toLocaleDateString('pt-BR');

        await allure.step("Abrindo menu lateral", async (ctx) => {
            const botaoMenu = await driver.wait(until.elementLocated(By.css('[data-testid="btn_side_menu"]')), 10000);
            await botaoMenu.click();
            await ctx.parameter("Status", "200");
        });

        await allure.step("Acessando a Agenda", async (ctx) => {
            const linksMenu = await driver.wait(until.elementsLocated(By.className('menuLinks')), 10000);
            if (linksMenu.length >= 6) {
                await linksMenu[5].click();
                await ctx.parameter("Status", "200");
            } else {
                await ctx.parameter("Status", "400");
                assert.fail("Não foi possível acessar a Agenda pelo menu");
            }
        });

        await allure.step("Clicando no botão +Criar", async (ctx) => {
            const botaoCriar = await driver.wait(until.elementLocated(By.id('newEventButton')), 10000);
            await botaoCriar.click();
            await ctx.parameter("Status", "200");
        });

        await allure.step("Selecionando Tarefa", async (ctx) => {
            const botaoTarefa = await driver.wait(until.elementLocated(By.css('[data-testid="menu_item_task"]')), 10000);
            await botaoTarefa.click();
            await ctx.parameter("Status", "200");
        });

        async function digitarLentamente(elementoInput, texto) {
            await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
            for (const char of texto) {
                await elementoInput.sendKeys(char);
                await driver.sleep(100);
            }
        }

        await allure.step("Preenchendo campo Título", async (ctx) => {
            const inputTitulo = await driver.wait(until.elementLocated(By.css('[data-testid="input_title"]')), 10000);
            await inputTitulo.clear();
            await inputTitulo.sendKeys(titulo);
            await driver.sleep(500);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Preenchendo campo Data", async (ctx) => {
            const inputData = await driver.wait(until.elementLocated(By.css('[data-testid="input_date"]')), 10000);
            await digitarLentamente(inputData, dataString);
            await driver.sleep(500);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Preenchendo campo Horário", async (ctx) => {
            const inputHora = await driver.wait(until.elementLocated(By.css('[data-testid="input_hour"]')), 10000);
            const horaString = "1300";
            await digitarLentamente(inputHora, horaString);
            await driver.sleep(500);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Scrollando até o final do modal", async (ctx) => {
            await driver.executeScript(`
                const modal = document.querySelector('[role="dialog"]');
                if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });
            `);
            await driver.sleep(1000);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Clicando no botão Salvar", async (ctx) => {
            const botaoSalvar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_submit_form"]')), 10000);

            await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", botaoSalvar);
            await driver.sleep(500);

            await driver.wait(async () => {
                const desabilitado = await botaoSalvar.getAttribute('disabled');
                return desabilitado === null || desabilitado === 'false';
            }, 5000, 'Botão salvar está desabilitado');

            await botaoSalvar.click();
            await driver.sleep(3000);
            await ctx.parameter("Status", "200");
        });

        await allure.step("Verificando mensagem de sucesso", async (ctx) => {
            const alertaSucesso = await driver.wait(
                until.elementLocated(
                    By.xpath("//div[contains(@class, 'MuiSnackbarContent-root')]//span[contains(text(), 'Tarefa incluída com sucesso.')]")
                ),
                10000,
                "Mensagem de sucesso não apareceu após salvar a tarefa"
            );

            const texto = await alertaSucesso.getText();
            assert.strictEqual(texto.trim(), "Tarefa incluída com sucesso.");
            await ctx.parameter("Mensagem", texto);
        });

        console.log("Tarefa criada com sucesso!");
        await driver.get(`${obterBaseUrl()}/home`);

    } catch (erro) {
        console.error("Erro ao criar tarefa na agenda:", erro);
        throw erro;
    }
}

export { criarTarefa };