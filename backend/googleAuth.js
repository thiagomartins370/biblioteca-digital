// ============================================
// googleAuth.js – Geração manual do token Google Drive
// Projeto: Biblioteca Digital Infantil (PI 2 Univesp)
// Autor: Thiago Martins
// Revisão: 2025-11-11 (ajuste de caminho)
// ============================================

import fs from "fs";
import path from "path";
import { google } from "googleapis";
import readline from "readline";

const __dirname = path.resolve();

// === Caminhos corrigidos ===
// Agora ele procura diretamente dentro da pasta onde o script está
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

// === Escopo necessário para o Drive ===
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// === Lê as credenciais ===
function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("❌ Arquivo credentials.json não encontrado em:", CREDENTIALS_PATH);
    process.exit(1);
  }

  const content = fs.readFileSync(CREDENTIALS_PATH);
  return JSON.parse(content);
}

// === Cria cliente OAuth2 fixando o redirect local ===
function createOAuthClient() {
  const credentials = loadCredentials();
  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const redirectUri = redirect_uris?.[0] || "http://localhost:3000";

  return new google.auth.OAuth2(client_id, client_secret, redirectUri);
}

// === Gera o link de autorização ===
async function authorize() {
  const oAuth2Client = createOAuthClient();

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("\n🌐 Acesse este link no seu navegador e autorize o acesso:");
  console.log(authUrl);
  console.log("\nDepois de autorizar, cole aqui o código exibido no navegador:\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("➡️  Cole o código: ", async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code.trim());
      oAuth2Client.setCredentials(tokens);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log(`\n✅ Token salvo com sucesso em ${TOKEN_PATH}`);
      console.log("Agora você pode rodar: npm run dev");
    } catch (err) {
      console.error("❌ Erro ao obter token:", err.response?.data || err.message);
    } finally {
      rl.close();
    }
  });
}

// === Inicia o processo ===
authorize();
