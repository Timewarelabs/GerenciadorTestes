# AASP Allure Tests Template

![Node](https://img.shields.io/badge/node-%3E%3D22.x-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Allure](https://img.shields.io/badge/report-Allure%20Framework-orange.svg)

Template base para **testes automatizados com Selenium, Mocha e Allure**.  
Com este projeto, você pode gerar relatórios interativos, armazenar histórico de execuções e até deployar seu dashboard Allure em um serviço de nuvem.

---

## Sumário

1. [O que é o projeto](#-o-que-é-o-projeto)  
2. [Estrutura do Projeto](#-estrutura-do-projeto)  
3. [O que é o Allure](#-o-que-é-o-allure)  
4. [Fluxo dos Testes](#️-fluxo-dos-testes)  
5. [Scripts do package.json](#-scripts-do-packagejson)  
6. [Como Rodar o Projeto](#-como-rodar-o-projeto)  
   - [Execução local e geração de relatório](#1️⃣-execução-local-e-geraçãode-relatório)  
   - [Rodando via Docker Compose (Allure Server)](#2️⃣-rodando-via-docker-compose-allure-server)  
   - [Deploy na Cloud](#3️⃣-deploy-na-cloud)  
7. [Execução Modular de Testes](#-execução-modular-de-testes)  
8. [Versão Deployada (Exemplo)](#-versão-deployada-exemplo)  
9. [Licença](#-licença)

---

## O que é o projeto

O **Allure Tests Template** é uma base completa para automação de testes de interface com:
- **Selenium WebDriver** (Chrome e Firefox)
- **Mocha** como test runner
- **Allure Framework** para geração de relatórios visuais
- Integração com **Allure Docker Service** para histórico e versionamento de execuções
- Suporte a execução **local, via Docker ou em nuvem (Render, Railway, etc)**

> Ideal para equipes que desejam uma base padronizada e reutilizável para testes de regressão e validação automatizada.

---

## Estrutura do Projeto

```
 alluretests-template
├── 📁 test/
│   ├── 📁 suites/               # Suítes de teste completas
│   ├── 📁 caminhoFeliz/            # Cenários base (fluxos positivos)
│   ├── 📁 config/               # Configurações de ambiente, navegador e executor
│   ├── main.test.js             # Ponto de entrada para execução completa
│
├── 📁 scripts/
│   ├── abrir-servicos-allure.js # Abre URLs locais/remotas do Allure
│   └── servicos-allure.js       # Envia resultados para o Allure Server
│
├── docker-compose.yml           # Infraestrutura do Allure Docker Service
├── package.json                 # Scripts e dependências
└── .mocharc.js                  # Configuração do Mocha + Allure Reporter
```

---

## O que é o Allure

O **Allure Framework** transforma resultados de testes em relatórios **visuais, interativos e históricos**.  
Ele mostra:

- Passos de execução e evidências (attachments, logs)
- Estatísticas e gráficos
- Histórico de execuções
- Organização por suítes e cenários

O template já vem configurado com o **Allure Docker Service**, que disponibiliza um painel interativo com histórico e API REST para envio de resultados.

---

## Fluxo dos Testes

### 🔸 1. Cenário (`test/happyPath/cenario-base.js`)
Contém o **passo a passo funcional** — exemplo: abrir o Google, validar título, capturar dados.

### 🔸 2. Suíte (`test/suites/suitetemplate.test.js`)
Controla toda a execução:
- Configura ambiente e navegador  
- Executa o cenário  
- Gera arquivos `allure-results`  
- Envia resultados para o Allure Server (caso ativo)

### 🔸 3. Execução (`test/main.test.js`)
Permite rodar **todas as suítes** em sequência.  
Ideal para execuções completas, como pipelines CI/CD.

---

## Scripts do `package.json`

### **Execução dos testes**
| Comando | Descrição |
|----------|------------|
| `npm test` | Executa todos os testes (`main.test.js`) |
| `npm run test:template` | Executa apenas a suíte `suite.template.test.js` |

### **Configurações**
| Comando | Descrição |
|----------|------------|
| `npm run set:chrome` | Define o Chrome como navegador padrão |
| `npm run set:firefox` | Define o Firefox como navegador padrão |
| `npm run set:local` | Define o ambiente como local |
| `npm run set:prod` | Define o ambiente como produção |

### **Relatórios locais**
| Comando | Descrição |
|----------|------------|
| `npm run allure:report` | Gera o relatório Allure localmente em `allure-report/` |
| `npm run allure:open` | Abre o relatório local no navegador |

### **Serviços Allure**
| Comando | Descrição |
|----------|------------|
| `npm run allure:api` | Abre a API do Allure Server (`http://localhost:5050`) |
| `npm run allure:dash` | Abre o Dashboard principal (`http://localhost:5252`) |
| `npm run allure:dash:imediato` | Abre o dashboard de execuções imediatas |
| `npm run allure:dash:historico` | Abre o dashboard com histórico salvo |

### **Docker (Simulando Allure Server)**
| Comando | Descrição |
|----------|------------|
| `npm run allure:server:start` | Inicia containers `allure` e `allure-ui` |
| `npm run allure:server:stop` | Para os containers |
| `npm run allure:server:logs` | Exibe logs do serviço Allure |

---

## Como Rodar o Projeto
Para **executar** esse projeto o ideal é você tenha: 
- **Node 22.14.0**
- **Ajuste** a dependência do seus navegadores "**chromedriver": "^140"** e **"geckodriver": "^5.0.0"** no **package.json** para uma versão **compatível com sua máquina.**

### 1️⃣ **Execução local e geração de relatório**

```bash
# Instale dependências
npm install

# Execute os testes
npm test

# Gere o relatório Allure
npm run allure:report

# Abra o relatório local
npm run allure:open
```

Isso criará:
```
📁 allure-results/  → Resultados crus
📁 allure-report/   → Relatório interativo
```

---

### 2️⃣ **Rodando via Docker Compose (Allure Server)**

```bash
# Suba o servidor Allure
docker-compose up -d

# Execute os testes
npm run test

# O envio é automático no after() da suíte
# Mas você também pode abrir manualmente:
npm run allure:dash
```

**Acesse:**
- API → [http://localhost:5050](http://localhost:5050)  
- Dashboard → [http://localhost:5252](http://localhost:5252)

---

### 3️⃣ **Deploy na Cloud**

Você pode hospedar os serviços do Allure em plataformas **gratuitas**, como:
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Koyeb](https://www.koyeb.com)

Ou se estiver buscando algo mais robusto e performático para utilizar em ambientes de produção pode ir nas clássicas:
- [Azure](https://azure.microsoft.com/pt-br/get-started/azure-portal)
- [AWS](https://railway.app)
- [GCP](https://www.koyeb.com)

**Passos:**
1. Faça o deploy das **duas imagens** (`allure` e `allure-ui`) do `docker-compose.yml`.
2. Atualize as URLs em:
   - `scripts/abrir-servicos-allure.js`
   - `scripts/servicos-allure.js`
   ```js
   const ALLURE_SERVER_URL = "https://seu-dominio.onrender.com";
   ```
3. Pronto! Seu dashboard estará disponível publicamente. 🎉

---

## Execução Modular de Testes

Além da execução completa, você pode rodar **apenas módulos específicos**.  
Por exemplo:

```bash
npm run test:template
```

Executa **somente a suíte `suite.template.test.js`**.

💡 Para criar novas suítes:
1. Crie um novo arquivo em `test/suites/`.
2. Adicione os cenários desejados do `caminhoFeliz/` ou `caminhoTriste/`.
3. Registre um novo comando no `package.json`, por exemplo:
   ```json
   "test:login": "mocha test/suites/suite.login.test.js --reporter allure-mocha"
   ```
Assim, você pode executar apenas partes específicas dos testes sem precisar rodar todos.

---

## 🌐 Versão Deployada (Exemplo)

Você pode visualizar um exemplo de projeto **com o Allure já deployado** na branch:
```
release/deployed
```

> ⚠️ Como o deploy gratuito está hospedado no **Render**, a disponibilidade pode variar — mas a branch serve como **referência prática de configuração**.

---