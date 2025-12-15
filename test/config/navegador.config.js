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
            const optionsChrome = new chrome.Options();
            optionsChrome.addArguments("--no-sandbox");            
            optionsChrome.addArguments("--disable-dev-shm-usage"); 
            optionsChrome.addArguments("--disable-gpu");           
            optionsChrome.addArguments("--start-maximized");
            optionsChrome.addArguments('--window-size=1920,1080');   
            optionsChrome.addArguments('--force-device-scale-factor=1');    
            optionsChrome.addArguments("--incognito");
            // optionsChrome.addArguments("--headless=new");

            driver = await new Builder()
                .forBrowser("chrome")
                .setChromeOptions(optionsChrome)
                .build();
                await driver.manage().window().setRect({ width: 1920, height: 1080 });
            break;

        case "firefox":
        default:
            const optionsFirefox = new firefox.Options();
            optionsFirefox.setAcceptInsecureCerts(true);                  
            optionsFirefox.setPreference("network.cookie.cookieBehavior", 0); 

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
                .setFirefoxOptions(optionsFirefox);

                
            if (servicoGecko) {
                builderFirefox = builderFirefox.setFirefoxService(servicoGecko);
            }

            driver = await builderFirefox.build();
            break;
    }

    return driver;
}
