// backend/auth.js
import fs from "fs";
import path from "path";
import { google } from "googleapis";

const __dirname = path.resolve();
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret, redirect_uris } =
    credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });

  console.log("\n👉 Abra este link no navegador e autorize o acesso:\n");
  console.log(authUrl);
  console.log("\nDepois cole aqui o código gerado e pressione Enter.\n");

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async (code) => {
    code = code.trim();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log("✅ Novo token salvo em token.json com sucesso!");
    process.exit(0);
  });
}

authenticate();
