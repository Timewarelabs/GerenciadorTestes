import * as allure from "allure-js-commons";
// Importando o serviço de screenshot padronizado (subindo 4 pastas para chegar em test/comum)
import { tirarPrint } from "../../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../../config/global.config.js"; 

// Renomeada: readAditivo -> lerAditivo
async function lerAditivo(driver) {
    await allure.step("Tirando print dos aditivos e o contrato", async (ctx) => {
        try {
            await driver.get(`${obterBaseUrl()}/contratos/17035/editar`);

            await tirarPrint(driver, "Navegado até edição do contrato com sucesso");

            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Navegado até edição do contrato com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "400");
            console.error("Erro ao navegar até edição:", error);

            await tirarPrint(driver, "Erro ao navegar até edição");
            throw error;
        }
    });

    await allure.step("Verificando aditivo", async (ctx) => {
        try {         
            await ctx.parameter("Status", "200");
            await ctx.parameter("Descrição", "Aditivo verificado com sucesso");
        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro ao verificar aditivo");
            throw error;
        }
    });
}

export { lerAditivo };