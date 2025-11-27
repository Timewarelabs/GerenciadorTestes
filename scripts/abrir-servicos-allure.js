import open from "open";

const arg = process.argv[2]; 

let url;

switch (arg) {
    case "imediato":
        url = "http://localhost:5050/allure-docker-service/projects/testes-imediato/reports/latest/index.html";
        break;
    case "historico":
        url = "http://localhost:5050/allure-docker-service/projects/testes-historico/reports/latest/index.html";
        break;
    case "dash":
    case undefined: 
        url = "http://localhost:5252";
        break;
    case "api":
        url = "http://localhost:5050";
        break;
    default:
        console.error("Parâmetro inválido! Use: dash | imediato | historico | api");
        process.exit(1);
}

console.log(`Abrindo o Allure em: ${url}`);
await open(url);
