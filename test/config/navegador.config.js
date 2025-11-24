import fs from "fs";
import path from "path"; 
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";
import { obterNavegadorAtual } from "./global.config.js";
import "chromedriver";
import "geckodriver";

const { ServiceBuilder: FirefoxServiceBuilder } = firefox;

export async function configurarDriver() {
    const navegador = obterNavegadorAtual();
    let driver;

    switch (navegador) {
        case "chrome":
            const opcoesChrome = new chrome.Options();
            opcoesChrome.addArguments("--start-maximized");       
            opcoesChrome.addArguments("--disable-gpu");           
            opcoesChrome.addArguments("--no-sandbox");            
            opcoesChrome.addArguments("--disable-dev-shm-usage"); 

            driver = await new Builder()
                .forBrowser("chrome")
                .setChromeOptions(opcoesChrome)
                .build();
            break;

        case "firefox":
        default:
            const opcoesFirefox = new firefox.Options();
            opcoesFirefox.setAcceptInsecureCerts(true);                  
            opcoesFirefox.setPreference("network.cookie.cookieBehavior", 0); 

            const caminhoGeckoDriver = path.join(process.cwd(), "drivers", "geckodriver.exe");
            let servicoGecko;

            if (fs.existsSync(caminhoGeckoDriver)) {
                servicoGecko = new FirefoxServiceBuilder(caminhoGeckoDriver);
            } else {
                console.warn(`AVISO: GeckoDriver não encontrado em ${caminhoGeckoDriver}. Usando ServiceBuilder padrão.`);
                servicoGecko = new FirefoxServiceBuilder();
            }

            let builderFirefox = new Builder()
                .forBrowser("firefox")
                .setFirefoxOptions(opcoesFirefox);

            if (servicoGecko) {
                builderFirefox = builderFirefox.setFirefoxService(servicoGecko);
            }

            driver = await builderFirefox.build();
            break;
    }

    return driver;
}
