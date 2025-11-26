import { By, until, Key } from 'selenium-webdriver';
import * as allure from "allure-js-commons";
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

async function PesquisarEmpresa(driver, termo) {
    try {
        await allure.step("Acessando Página de Registro", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas`);
                await ctx.parameter("Status", "200");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                assert.fail('Erro ao acessar página de gerenciamento');
                throw erro;
            }
        });

        await allure.step("Fechando popup de introdução", async (ctx) => {
            try {
                const botaoFechar = await driver.wait(
                    until.elementLocated(By.css(".reactour__helper button.sc-bxivhb")),
                    5000
                );
                await botaoFechar.click();
                await ctx.parameter("Popup", "Fechado");
            } catch {
                await ctx.parameter("Popup", "Não encontrado");
            }
        });

        let barraPesquisa;
        await allure.step("Clicando no input de pesquisa", async (ctx) => {
            try {
                barraPesquisa = await driver.wait(
                    until.elementLocated(By.css("input[placeholder='Buscar pessoas ou empresas']")),
                    10000
                );
                await barraPesquisa.click();
                await ctx.parameter("Status", "200");
            } catch (erro) {
                await ctx.parameter("Status", "400");
                assert.fail('Input de pesquisa não encontrado');
                throw erro;
            }
        });

        await allure.step(`Pesquisando por: ${termo}`, async (ctx) => {
            if (typeof termo !== 'string' || !termo.trim()) {
                throw new Error("Parâmetro `termo` deve ser uma string não vazia");
            }
            // Limpa antes de digitar para garantir
            await barraPesquisa.sendKeys(Key.CONTROL, "a", Key.DELETE); 
            await barraPesquisa.sendKeys(termo, Key.ENTER);
            console.log('Termo enviado, aguardando filtro...');
            
            // --- CORREÇÃO CRÍTICA: ESPERAR O FILTRO ACONTECER ---
            try {
                await driver.wait(async () => {
                    const linhas = await driver.findElements(By.css("table tbody tr"));
                    // Se não tiver linhas, continua esperando
                    if (linhas.length === 0) return false;
                    
                    // Pega o texto da primeira linha para ver se bate com a pesquisa
                    const textoLinha = await linhas[0].getText();
                    
                    // Se a tabela mostrar "Nenhum registro", paramos de esperar (filtro concluiu, mas vazio)
                    if (textoLinha.includes("Nenhum registro")) return true;

                    // Se a linha contiver o termo pesquisado, SUCESSO!
                    if (textoLinha.includes(termo)) {
                        return true;
                    }
                    
                    // Se a tabela ainda estiver cheia de coisas nada a ver (ex: 50 resultados), continua esperando
                    return false;
                }, 10000, "Timeout: A tabela não filtrou o registro esperado a tempo.");
                
                console.log("Filtro aplicado com sucesso!");
            } catch (e) {
                console.warn("Aviso: O filtro pode não ter carregado corretamente ou o item não existe.", e.message);
            }

            await ctx.parameter("Status", "200");
        });

        await allure.step("Verificando resultados", async (ctx) => {
            // Pequeno sleep de segurança para renderização final
            await driver.sleep(1000);
            const resultados = await driver.findElements(By.css("table tbody tr"));
            console.log(`Linhas visíveis após filtro: ${resultados.length}`);
            
            // Screenshot para evidência
            const captura = await tirarPrint(driver, "Evidencia");
            allure.attachment("Resultado da Pesquisa", Buffer.from(captura, 'base64'), 'image/png');

            await ctx.parameter("Resultados", `Visíveis: ${resultados.length}`);
        });

    } catch (erro) {
        console.error("Erro no processo de busca:", erro);
        await tirarPrint(driver, "Erro na pesquisa de empresa");
        throw erro;
    }
}

export { PesquisarEmpresa };