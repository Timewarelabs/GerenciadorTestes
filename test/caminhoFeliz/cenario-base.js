import * as allure from "allure-js-commons";

async function abrirSiteCenario(driver) {
  await allure.step("Acessar o site inicial do Google", async () => {
    await driver.get("https://www.google.com");

    const titulo = await driver.getTitle();
    allure.parameter("Título da página", titulo);
    allure.attachment("URL acessada", await driver.getCurrentUrl(), "text/plain");

    if (!titulo.includes("Google")) {
      throw new Error("O título da página não corresponde ao esperado.");
    }

    console.log("Página acessada e validada com sucesso!");
  });
}

export { abrirSiteCenario };