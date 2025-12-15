import axios from "axios";

const AZURE_FUNCTION_URL = process.env.AZURE_FUNC_URL

export async function enviarEmail() {
    console.log(`Solicitando envio de e-mail padronizado no AF`);

    try {
        const response = await axios.post(AZURE_FUNCTION_URL, {}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 || response.status === 204) {
            console.log("E-mail enviado com sucesso!");
        } else {
            console.warn(`Status inesperado ao enviar e-mail: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro ao chamar serviço de e-mail:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Detalhe: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
    }
}