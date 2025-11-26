import { By, Key, until } from 'selenium-webdriver';
import * as allure from 'allure-js-commons';
import assert from 'assert';
import { tirarPrint } from "../../comum/tirarPrint.js"; 
import { obterBaseUrl } from "../../config/global.config.js";

function geradorCpf() {
    const aleatorio = () => Math.floor(Math.random() * 9);
    const modulo = (n) => n % 11 < 2 ? 0 : 11 - n % 11;

    const numeros = Array.from({ length: 9 }, aleatorio);
    const d1 = modulo(numeros.reduce((s, n, i) => s + n * (10 - i), 0));
    const d2 = modulo([...numeros, d1].reduce((s, n, i) => s + n * (11 - i), 0));

    return [...numeros, d1, d2].join('');
}

async function criarPessoa(driver) { 
    try {
        const novoCpf = geradorCpf();

        await allure.step("Acessando Página de Registro", async (ctx) => {
            try {
                await driver.get(`${obterBaseUrl()}/pessoas-empresas/pessoas/novo/`);
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                console.error("Erro ao acessar a página:", error.message);
                await tirarPrint(driver, "Erro ao acessar a pagina");
                throw new Error('Erro ao acessar página de gerenciamento');
            }
        });

        const fields = ['CPF', 'RG', 'orgão emissor', 'PIS/PASEP', 'nome', 'data de nascimento', 'nacionalidade', 'Sexo', 'estado civil', 'profissao', 'Nome da mãe', 'Nome do pai', 'pasta', 'Observações'];
        const valores = [novoCpf, '12.345.678-9', 'SSP-SP', '12345678901', 'Vinícius Nascimento Borges', '01/08/1961', 'Brasileira', 'Masculino', 'Casado(a)', 'Advogado', 'Maria de Souza Borges', 'João Carlos Borges', 'Documentos Gerais', 'Nenhuma observação extra.'];

        await allure.step("Aguardando o campo de CPF carregar", async (ctx) => {
            try {
                await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[1]/div[2]/div/div/input")), 10000);
                await ctx.parameter("Status", "200");
                await driver.sleep(2000);
            } catch (error) {
                await ctx.parameter("Status", "400");
                console.error("Erro ao esperar o campo CPF:", error.message);
                await tirarPrint(driver, "Erro ao esperar o campo CPF");
                throw new Error('Erro ao esperar o campo CPF');
            }
        });

        await allure.step("Preenchendo o campo CPF", async (ctx) => {
            try {
                const inputCampo = await driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[4]/div/main/div/div[1]/div/div[2]/div[1]/div[1]/div[2]/div/div/input"));
                await inputCampo.click();
                await inputCampo.sendKeys(valores[0]);
                await inputCampo.sendKeys(Key.TAB);
                await driver.sleep(1000);
                await ctx.parameter("Status", "200");
            } catch (error) {
                await ctx.parameter("Status", "400");
                console.error("Erro ao preencher o campo CPF:", error.message);
                await tirarPrint(driver, "Erro ao preencher o campo CPF");
                throw new Error('Erro ao preencher o campo CPF');
            }
        });

        for (let i = 1; i < valores.length; i++) {
            const fieldLabel = fields[i];
            const fieldValue = valores[i];
            await driver.sleep(500);
            console.log(`Preenchendo campo: ${fieldLabel} com valor: ${fieldValue}`);

            await allure.step(`Preenchendo o campo: ${fieldLabel}`, async (ctx) => {
                try {
                    if (fieldLabel === 'Sexo') {
                        const sexoDropdown = await driver.findElement(By.xpath("//*[contains(text(), 'Sexo')]/following-sibling::div"));
                        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", sexoDropdown);
                        await sexoDropdown.click();

                        if (fieldValue === 'Masculino') {
                            await driver.actions().sendKeys(Key.ENTER).sendKeys(Key.TAB).perform();
                        } else if (fieldValue === 'Feminino') {
                            await driver.actions().sendKeys(Key.ARROW_DOWN).sendKeys(Key.ENTER).sendKeys(Key.TAB).perform();
                        }
                    } else if (['nacionalidade', 'estado civil', 'profissao', 'pasta'].includes(fieldLabel)) {
                        const fieldNome = fieldLabel === 'estado civil' ? 'estadoCivil' : fieldLabel;
                        const dropdown = await driver.findElement(By.css(`input[name="${fieldNome}"]`));
                        await dropdown.click();
                        await dropdown.sendKeys(fieldValue, Key.ENTER, Key.TAB);
                    } else {
                        const inputField = await driver.switchTo().activeElement();
                        await inputField.sendKeys(fieldValue, Key.TAB);
                    }

                    await ctx.parameter("Status", "200");
                } catch (error) {
                    await ctx.parameter("Status", "400");
                    console.error(`Erro ao preencher o campo ${fieldLabel}:`, error.message);
                    await tirarPrint(driver, `Erro ao preencher o campo ${fieldLabel}`);
                    throw new Error(`Erro ao preencher o campo ${fieldLabel}`);
                }
            });
        }

        await preencherRegistroProfissional(driver);
        await preencherTelefone(driver);
        await preencherEmail(driver);
        await preencherEndereco(driver);
        await finalizarRegistro(driver);

        console.log('Registro efetuado com sucesso');

    } catch (error) {
        console.error('Erro durante o registro:', error.message);
        await tirarPrint(driver, "Erro durante o registro");
        throw error;
    }
}

async function preencherRegistroProfissional(driver) { 
    await allure.step("Preenchendo registro profissional", async (ctx) => {
        try {
            await driver.actions().sendKeys(Key.ENTER).perform();
            await driver.actions().sendKeys(Key.TAB, "Adm", Key.ENTER, Key.TAB).perform();
            await driver.actions().sendKeys("1234", Key.ENTER, Key.TAB).perform();
            await driver.actions().sendKeys(Key.ENTER, Key.ENTER).perform();
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
            await driver.sleep(1000);
            const elementoMensagem = await driver.findElement(By.css('span#message-id'));
            const textoMensagem = await elementoMensagem.getText();
            assert.strictEqual(textoMensagem, "Registro Profissional criado com sucesso!");
            await ctx.parameter("Status", "200");
        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro ao criar registro profissional");
            throw new Error(`Erro ao criar registro profissional: ${error.message}`);
        }
    });
}

async function preencherTelefone(driver) {
    await allure.step("Preenchendo telefone", async (ctx) => {
        try {
            await driver.actions().sendKeys(Key.TAB, Key.TAB).perform();
            await driver.actions().sendKeys(Key.ENTER).perform();

            await driver.actions().sendKeys(Key.TAB, "11912345678", Key.ENTER, Key.TAB).perform();
            await driver.actions().sendKeys(Key.ENTER, Key.ARROW_DOWN, Key.ENTER).perform();
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();

            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Telefone criado com sucesso')]")), 10000);
            const textoMensagem = await driver.findElement(By.xpath("//*[contains(text(), 'Telefone criado com sucesso')]")).getText();

            assert.strictEqual(textoMensagem, "Telefone criado com sucesso!");
            await ctx.parameter("Status", "200");

        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro ao inserir telefone");
            throw new Error(`Erro ao inserir telefone: ${error.message}`);
        }
    });
}

async function preencherEmail(driver) {
    await allure.step("Preenchendo e-mail", async (ctx) => {
        try {
            await driver.actions().sendKeys(Key.TAB, Key.TAB).perform();
            await driver.actions().sendKeys(Key.ENTER).perform();

            await driver.actions().sendKeys(Key.TAB, "vinicius@email.com", Key.ENTER, Key.TAB).perform();
            await driver.actions().sendKeys(Key.ENTER, Key.ARROW_DOWN, Key.ENTER).perform();
            await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();

            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'E-mail criado com sucesso')]")), 10000);
            const textoMensagem = await driver.findElement(By.xpath("//*[contains(text(), 'E-mail criado com sucesso')]")).getText();

            assert.strictEqual(textoMensagem, "E-mail criado com sucesso!");
            await ctx.parameter("Status", "200");

        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro ao inserir e-mail");
            throw new Error(`Erro ao inserir e-mail: ${error.message}`);
        }
    });
}

async function preencherEndereco(driver) { 
    await allure.step("Preenchendo Endereço", async (ctx) => {
        try {
            await driver.actions().sendKeys(Key.TAB, Key.TAB).perform(); 
            await driver.actions().sendKeys(Key.ENTER).perform();
            await driver.actions().sendKeys(Key.TAB, "01012-905", Key.ENTER).perform();
            await driver.sleep(500);
            
            await driver.actions().sendKeys(Key.TAB.repeat(2)).perform();
            await driver.actions().sendKeys("Rua Teste Automatizado", Key.TAB).perform();
            await driver.sleep(500);
            
            await driver.actions().sendKeys(Key.TAB.repeat(3)).perform();
            await driver.actions().sendKeys("11912345678", Key.ENTER, Key.TAB).perform();
            await driver.sleep(500);
            await driver.actions().sendKeys("151", Key.ENTER, Key.TAB).perform();
            await driver.actions().sendKeys("Centro Historico", Key.ENTER, Key.TAB).perform();

            await driver.actions().sendKeys(Key.ENTER).perform();
            await driver.sleep(3000);
            await driver.actions().sendKeys(Key.TAB.repeat(3), Key.ENTER).perform();

        } catch (error) {
            await ctx.parameter("Status", "400");
            await tirarPrint(driver, "Erro ao preencher os dados");
            throw new Error(`Erro ao preencher endereço: ${error.message}`);
        }
    });
}

async function finalizarRegistro(driver) {
    await allure.step("Finalizando registro", async (ctx) => {
        try {
            const localizadorMensagem = By.xpath("//*[contains(text(), 'Pessoa incluída com sucesso')]");
            await driver.wait(until.elementLocated(localizadorMensagem), 10000);

            const mensagem = await driver.findElement(localizadorMensagem).getText();
            assert.strictEqual(mensagem, 'Pessoa incluída com sucesso!');

            await ctx.parameter("Status", "200");
        } catch (error) {
            await ctx.parameter("Status", "failed");
            await tirarPrint(driver, "Erro ao clicar no botao de registro");
            throw new Error(`Erro ao finalizar registro: ${error.message}`);
        }
    });
}

export { criarPessoa };