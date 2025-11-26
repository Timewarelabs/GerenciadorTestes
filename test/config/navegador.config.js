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
            opcoesChrome.addArguments("--incognito");
            opcoesChrome.addArguments("--headless=new");

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

            let servicoGecko;

            const isWindows = process.platform === "win32";

            if (isWindows) {
                const caminhoWindows = path.join(process.cwd(), "drivers", "geckodriver.exe");

                if (fs.existsSync(caminhoWindows)) {
                    console.log("Usando GeckoDriver local (Windows):", caminhoWindows);
                    servicoGecko = new FirefoxServiceBuilder(caminhoWindows);
                } else {
                    console.warn(`GeckoDriver não encontrado em ${caminhoWindows}. Usando ServiceBuilder padrão.`);
                    servicoGecko = new FirefoxServiceBuilder();
                }
            } else {
                console.log("Usando GeckoDriver padrão do sistema (Linux/Docker).");
                servicoGecko = new FirefoxServiceBuilder("/usr/local/bin/geckodriver");
            }
            let builderFirefox = new Builder()
                .forBrowser("firefox")
                .setFirefoxOptions(opcoesFirefox);

            driver = await builderFirefox.build();
            break;
    }

    return driver;
}
