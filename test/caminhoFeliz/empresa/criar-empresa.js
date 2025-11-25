import { By, Key, until } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import { CapturaTela } from '../../comum/captura.js';
import assert from 'assert';
import { obterBaseUrl } from "../../config/global.config.js";
import { PesquisarEmpresa } from './pesquisar-empresa.js';
import { ExcluirEmpresa } from './excluir-empresa.js';

async function CriarEmpresa(driver) {
    const cnpjAlvo = "46.295.498/0001-68";

    try {
        console.log("Iniciando fluxo de criação de empresa...");

        // --- LIMPEZA PRÉVIA ---
        await allure.step(`Verificação Prévia: Limpando base para ${cnpjAlvo}`, async (ctx) => {
            try {
                await PesquisarEmpresa(driver, cnpjAlvo);
                await driver.sleep(1000); 
                const linhas = await driver.findElements(By.css("table tbody tr"));
                let temRegistro = false;
                if (linhas.length > 0) {
                    const texto = await linhas[0].getText();
                    if (!texto.includes("Nenhum registro") && texto.trim() !== "") temRegistro = true;
                }
                if (temRegistro) {
                    console.log(`Registro encontrado. Deletando...`);
                    try { await ExcluirEmpresa(driver); await driver.sleep(2000); } catch (e) {}
                }
            } catch (erro) { console.warn("Aviso na limpeza:", erro.message); }
        });

        // --- ACESSO E ACEITE ---
        await allure.step("Acessando cadastro", async (ctx) => {
            await driver.get(`${obterBaseUrl()}/pessoas-empresas/empresas/novo/`);
            const check = await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), 10000);
            await check.click();
            await driver.actions().sendKeys(Key.TAB, Key.TAB, Key.ENTER).perform();
            await ctx.parameter("Status", "200");
        });

        // --- PREENCHIMENTO DO CNPJ E VALIDAÇÃO ---
        await allure.step("Preenchendo CNPJ e Validando", async (ctx) => {
            try {
                // Preenche CNPJ
                await driver.actions().sendKeys(Key.TAB, cnpjAlvo).perform();
                await driver.sleep(500);
                await driver.actions().sendKeys(Key.TAB).perform();
                
                // Clica fora (blur)
                const body = await driver.findElement(By.css('body'));
                await body.click();
                console.log("Aguardando carga automática...");
                await driver.sleep(4000);

                // Validação da Razão Social
                console.log("Verificando Razão Social...");
                try {
                    const inputRazao = await driver.findElement(By.xpath("//label[contains(., 'Razão')]/following::input[1]"));
                    let valor = await inputRazao.getAttribute("value");

                    if (!valor || valor.trim() === "") {
                        console.log("⚠️ Razão vazia! Refazendo gatilho no CNPJ...");
                        const inputCNPJ = await driver.findElement(By.xpath("//label[contains(., 'CNPJ')]/following::input[1]"));
                        
                        await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", inputCNPJ);
                        await inputCNPJ.click();
                        await driver.sleep(500);
                        await inputCNPJ.sendKeys(Key.TAB);
                        await body.click();
                        
                        console.log("Aguardando segunda tentativa...");
                        await driver.sleep(4000);
                    } else {
                        console.log("✅ Dados carregados de primeira.");
                    }
                } catch (e) {
                    console.warn("Não foi possível validar a Razão, seguindo...");
                }

                await ctx.parameter("Status", "200");
            } catch (erro) {
                await CapturaTela(driver, "Erro_Dados_Empresa");
                throw erro;
            }
        });

        // --- PREENCHER NÚMERO ---
        await allure.step("Preenchendo Número", async (ctx) => {
            try {
                const inputNumero = await driver.wait(until.elementLocated(By.xpath("//label[contains(., 'Número')]/following::input[1]")), 3000);
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", inputNumero);
                await inputNumero.click();
                await inputNumero.sendKeys("123");
                await inputNumero.sendKeys(Key.TAB);
            } catch (e) {}
        });

        // --- CONTATOS (ABRIR MODAL -> PREENCHER COM TABS -> INSERIR) ---
        await allure.step("Adicionando Contato", async (ctx) => {
            try {
                console.log("Descendo para Contatos...");
                await driver.executeScript("window.scrollBy(0, 400)");
                await driver.sleep(1000);

                // 1. Abrir Modal
                console.log("Clicando em Novo Contato...");
                let btnNovo;
                try {
                    btnNovo = await driver.findElement(By.xpath("//button[contains(., 'Novo') or contains(., 'Adicionar') or contains(., '+')]"));
                } catch (e) {
                    btnNovo = await driver.findElement(By.xpath("//h6[contains(., 'Contatos')]/following::button[1]"));
                }
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", btnNovo);
                await driver.sleep(500);
                await btnNovo.click();
                await driver.sleep(1000); // Espera o modal abrir

                // 2. Preencher Campos com TABs (Seu método preferido)
                console.log("Preenchendo contato com TABs...");
                
                // Garante que o foco está no primeiro campo (Nome) clicando nele
                const inputNome = await driver.wait(until.elementLocated(By.xpath("//label[normalize-space()='Nome']/following::input[1]")), 5000);
                await inputNome.click();
                
                // Sequência de preenchimento via Actions
                await driver.actions()
                    .sendKeys(Key.CONTROL, "a", Key.DELETE) // Limpa Nome
                    .sendKeys("Contato Teste", Key.TAB) // Nome + Tab p/ Telefone
                    .perform();
                
                await driver.sleep(200);
                await driver.actions().sendKeys("11999999999", Key.TAB).perform(); // Telefone + Tab p/ Email
                
                await driver.sleep(200);
                await driver.actions().sendKeys("teste@email.com", Key.TAB).perform(); // Email + Tab p/ Obs
                
                await driver.sleep(200);
                // Obs + Tab + Enter (para tentar inserir direto se o foco for pro botão)
                // Se o Enter não funcionar, clicamos no botão explicitamente depois
                await driver.actions().sendKeys("Obs Teste", Key.TAB).perform(); 

                // 3. Inserir (Clica no botão pra garantir)
                console.log("Inserindo na lista...");
                const btnInserir = await driver.findElement(By.xpath("//button[contains(., 'Inserir') or contains(., 'INSERIR')]"));
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", btnInserir);
                await driver.sleep(500);
                await btnInserir.click();
                await driver.sleep(1500);

                await ctx.parameter("Status", "200");
            } catch (erro) {
                await CapturaTela(driver, "Erro_Contatos");
                throw erro;
            }
        });

        // --- SALVAR FINAL ---
        await allure.step("Salvando Empresa", async (ctx) => {
            try {
                console.log("Salvando...");
                const btnSalvar = await driver.findElement(By.xpath("//button[(contains(., 'Registrar') or contains(., 'Salvar') or contains(., 'Incluir')) and not(contains(., 'Limpar'))]"));
                
                await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", btnSalvar);
                await driver.sleep(500);
                await driver.executeScript("arguments[0].click();", btnSalvar);

                // Validação
                let msg = "";
                await driver.wait(async () => {
                    try {
                        const el = await driver.findElement(By.id('message-id'));
                        const txt = await el.getText();
                        if (txt.length > 2) msg = txt;
                        if (txt.toLowerCase().includes("sucesso")) return true;
                        return false;
                    } catch { return false; }
                }, 15000, "Timeout esperando sucesso");

                if (msg.toLowerCase().includes("sucesso")) {
                    await ctx.parameter("Resultado", "Sucesso");
                } else {
                    throw new Error(`Falha ao salvar. Mensagem: ${msg}`);
                }
            } catch (erro) {
                await CapturaTela(driver, "Erro_Salvar_Final");
                throw erro;
            }
        });

    } catch (erro) {
        console.error("Falha crítica:", erro);
        throw erro;
    }
}

export { CriarEmpresa };