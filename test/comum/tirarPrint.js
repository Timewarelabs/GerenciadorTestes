import * as allure from "allure-js-commons";
import { Buffer } from "buffer";

async function tirarPrint(driver, stepName) {
    try {
        const screenshot = await driver.takeScreenshot();
        allure.attachment(`${stepName}.png`, Buffer.from(screenshot, 'base64'), 'image/png');
        console.log(`Screenshot capturada para o passo: ${stepName}`);
    } catch (screenshotError) {
        console.error('Erro ao capturar screenshot:', screenshotError.message);
    }
}

export { tirarPrint };