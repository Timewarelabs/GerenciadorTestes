import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

const ALLURE_MODE = process.env.ALLURE_MODE || "server";
const RESULTS_DIR = path.join(process.cwd(), "allure-results");
const ALLURE_SERVER_URL = process.env.ALLURE_SERVER_URL || "https://api-testes.grayfield-126a3c87.brazilsouth.azurecontainerapps.io";

const PROJECT_IMEDIATO = "testes-imediato";
const PROJECT_HISTORICO = "testes-historico";

export function setupAllure() {
  if (ALLURE_MODE === "server") {
    console.log("Modo Allure: Servidor remoto (Docker Service)");
  } else {
    console.log("Modo Allure: Local (repositório)");
    if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR);
  }
}

async function enviarArquivosAllure(projectId, limparAntes = false) {
  const files = fs.readdirSync(RESULTS_DIR);
  if (files.length === 0) {
    console.warn(`Nenhum arquivo encontrado em ${RESULTS_DIR}`);
    return;
  }

  if (limparAntes) {
    console.log(`Limpando resultados anteriores do projeto '${projectId}'...`);
    try {
      await axios.get(`${ALLURE_SERVER_URL}/allure-docker-service/clean-results?project_id=${projectId}`);
      await axios.get(`${ALLURE_SERVER_URL}/allure-docker-service/clean-history?project_id=${projectId}`);
    } catch {
      console.warn(`Falha ao limpar resultados do projeto '${projectId}'.`);
    }
  }

  const formData = new FormData();
  for (const file of files) {
    const filePath = path.join(RESULTS_DIR, file);
    formData.append("files[]", fs.createReadStream(filePath), file);
  }

  try {
    const response = await axios.post(
      `${ALLURE_SERVER_URL}/allure-docker-service/send-results?project_id=${projectId}`,
      formData,
      { headers: formData.getHeaders() }
    );

    console.log(`Envio concluído (${projectId}):`, response.data?.meta_data?.message || "OK");
  } catch (error) {
    console.error(`Erro ao enviar resultados para ${projectId}:`, error.response?.data || error.message);
  }
}

export async function enviarResultadosParaServidor() {
  if (ALLURE_MODE !== "server") {
    console.log("Modo local detectado — resultados não serão enviados.");
    return;
  }

  try {
    await enviarArquivosAllure(PROJECT_IMEDIATO, true);
    await enviarArquivosAllure(PROJECT_HISTORICO, false);

    console.log("Resultados enviados com sucesso!");
  } catch (err) {
    console.error("Falha ao enviar resultados:", err.message);
  }
}

export function limparAllureResults() {
  try {
    if (fs.existsSync(RESULTS_DIR)) {
      console.log("Limpando pasta local allure-results...");

      fs.rmSync(RESULTS_DIR, { recursive: true, force: true });

      fs.mkdirSync(RESULTS_DIR);
    } else {
      console.log("Pasta allure-results não existe, nenhuma limpeza necessária.");
    }
  } catch (error) {
    console.error("Erro ao limpar pasta allure-results:", error.message);
  }
}
