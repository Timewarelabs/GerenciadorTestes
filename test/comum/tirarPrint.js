import * as allure from "allure-js-commons"; 
import { Buffer } from "buffer";


async function tirarPrint (driver, EtapaNome) {
    try {
        const screenshot = await driver.takeScreenshot();
        
        allure.attachment(`${EtapaNome}.png`, Buffer.from(screenshot, 'base64'), 'image/png');
        console.log(`Tela capturada: ${EtapaNome}`);
    } catch (screenshotError) {
        console.error('Erro ao capturar tela:', screenshotError.message);
    }
}

export {tirarPrint};