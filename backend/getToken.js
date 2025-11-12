import fs from "fs";
import path from "path";
import { google } from "googleapis";
import readline from "readline";

// ✅ Caminhos corrigidos — agora ele vai achar o credentials.json certo
const __dirname = path.resolve();
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json"); // agora sem "backend" duplicado
const TOKEN_PATH = path.join(__dirname, "token.json"); // salva dentro do backend

async function main() {
  // Lê o arquivo credentials.json
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret, redirect_uris } =
    credentials.installed || credentials.web;

  // Cria cliente OAuth2
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Escopo de acesso (Drive apenas para arquivos criados pelo app)
  const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

  // Gera o link de autenticação
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n👉 Abra este link no navegador e autorize o acesso:");
  console.log(authUrl);

  // Interface para o usuário colar o código de autorização
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nCole aqui o código de autorização: ", async (code) => {
    rl.close();

    try {
      // Gera o token e salva
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log(`\n✅ Novo token salvo com sucesso em: ${TOKEN_PATH}\n`);
    } catch (err) {
      console.error("\n❌ Erro ao gerar o token:", err);
    }
  });
}

main().catch((err) => console.error("❌ Erro principal:", err));
