import open from "open";

const arg = process.argv[2]; 

let url;

switch (arg) {
    case "imediato":
        url = "https://api-testes.grayfield-126a3c87.brazilsouth.azurecontainerapps.io/allure-docker-service/projects/testes-imediato/reports/latest/index.html";
        break;
    case "historico":
        url = "https://api-testes.grayfield-126a3c87.brazilsouth.azurecontainerapps.io/allure-docker-service/projects/testes-historico/reports/latest/index.html";
        break;
    case "dash":
    case undefined: 
        url = "https://dashboard-testes.grayfield-126a3c87.brazilsouth.azurecontainerapps.io";
        break;
    case "api":
        url = "https://api-testes.grayfield-126a3c87.brazilsouth.azurecontainerapps.io";
        break;
    default:
        console.error("Parâmetro inválido! Use: dash | imediato | historico | api");
        process.exit(1);
}

console.log(`Abrindo o Allure em: ${url}`);
await open(url);
