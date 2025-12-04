import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { tirarPrint } from "../../comum/tirarPrint.js";

async function criarCompromisso(driver) {
    try {
        console.log("Iniciando fluxo de criação de compromisso na agenda...");

        const agora = new Date();
        const titulo = `Teste Auto - Compromisso ${agora.toLocaleTimeString('pt-BR')}`;

        // Lógica para pegar o dia de amanhã
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

        await allure.step("Selecionando Compromisso", async (ctx) => {
            const botaoCompromisso = await driver.wait(until.elementLocated(By.css('[data-testid="menu_item_appointment"]')), 10000);
            await botaoCompromisso.click();
            await ctx.parameter("Status", "200");
        });

        // Função auxiliar para digitar devagar e evitar falhas de input
        async function digitarLentamente(elementoInput, texto) {
            await elementoInput.click();
            // Limpa o campo (CTRL+A + BACKSPACE)
            await elementoInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
            for (const char of texto) {
                await elementoInput.sendKeys(char);
                await driver.sleep(50); // Pequeno delay entre teclas
            }
        }

        await allure.step("Preenchendo campo Título", async (ctx) => {
            const inputTitulo = await driver.wait(until.elementLocated(By.css('[data-testid="input_title"]')), 10000);
            await inputTitulo.clear();
            await inputTitulo.sendKeys(titulo);
            await driver.actions().sendKeys(Key.TAB).perform(); // Garante saída do campo
            await ctx.parameter("Status", "200");
        });

        await allure.step("Preenchendo campo Data", async (ctx) => {
            const inputData = await driver.wait(until.elementLocated(By.css('[data-testid="input_date"]')), 10000);
            await digitarLentamente(inputData, dataString);
            
            // CORREÇÃO PRINCIPAL: TAB para fechar o calendário/validar a data
            await driver.actions().sendKeys(Key.TAB).perform(); 
            await driver.sleep(1000); // Espera a UI reagir
            
            await ctx.parameter("Status", "200");
        });

        await allure.step("Preenchendo campo Horário", async (ctx) => {
            // Tenta localizar o campo de hora. Se não achar, pode ser que "Dia Inteiro" esteja marcado
            try {
                const inputHora = await driver.wait(until.elementLocated(By.css('[data-testid="input_hour"]')), 5000);
                const horaString = "1400";
                await digitarLentamente(inputHora, horaString);
                await driver.actions().sendKeys(Key.TAB).perform();
            } catch (e) {
                console.warn("Aviso: Campo de hora não encontrado. Verifique se a opção 'Dia Inteiro' está marcada por padrão.");
                // Se quiser garantir que o teste falhe se não achar a hora, remova o try/catch ou lance o erro novamente:
                throw new Error("Campo de horário não apareceu. O Datepicker pode estar cobrindo ou 'Dia Inteiro' está ativo.");
            }
            await ctx.parameter("Status", "200");
        });

        await allure.step("Scrollando até o botão Salvar", async (ctx) => {
            // Usa JS para scrollar o modal
            await driver.executeScript(`
                const modal = document.querySelector('[role="dialog"]');
                if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });
            `);
            await driver.sleep(1000);
        });

        await allure.step("Clicando no botão Salvar", async (ctx) => {
            const botaoSalvar = await driver.wait(until.elementLocated(By.css('[data-testid="btn_submit_form"]')), 10000);

            // Aguarda botão ficar habilitado
            await driver.wait(async () => {
                const desabilitado = await botaoSalvar.getAttribute('disabled');
                return desabilitado === null || desabilitado === 'false';
            }, 5000, 'Botão salvar permaneceu desabilitado');

            await botaoSalvar.click();
            await ctx.parameter("Status", "200");
        });

        await allure.step("Verificando mensagem de sucesso", async (ctx) => {
            try {
                const alertaSucesso = await driver.wait(
                    until.elementLocated(
                        By.xpath("//span[contains(text(), 'Compromisso incluído com sucesso')]")
                    ),
                    10000
                );
                const texto = await alertaSucesso.getText();
                assert.ok(texto.includes("sucesso"), "Texto de sucesso não corresponde");
            } catch (e) {
                await tirarPrint(driver, "erro_ao_salvar_compromisso");
                throw e;
            }
        });

        console.log("Compromisso criado com sucesso!");
        await driver.get(`${obterBaseUrl()}/home`);

    } catch (erro) {
        console.error("Erro ao criar compromisso na agenda:", erro);
        await tirarPrint(driver, "erro_geral_criar_compromisso");
        throw erro;
    }
}

export { criarCompromisso };