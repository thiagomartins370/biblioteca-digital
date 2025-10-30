import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';

// ===== Caminhos dos arquivos =====
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// ===== Lê credenciais e token =====
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
// Formatos aceitos:
// { client_id, client_secret, redirect_uris: [...] }   <-- conforme sugerido acima
const { client_id, client_secret, redirect_uris = ['http://localhost:3000'] } = credentials;

const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

// ===== Cria OAuth2Client com client + secret e aplica o token do usuário =====
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(token);

// ===== Instância do Drive autenticada =====
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// ===== Upload ao Drive usando stream =====
export async function uploadFileToDrive(file, type) {
  try {
    const fileMetadata = {
      name: `${Date.now()}-${file.originalname}`,
      parents: ['root']
    };

    // Converte Buffer do multer em stream legível
    const stream = Readable.from(file.buffer);

    const media = {
      mimeType: file.mimetype,
      body: stream
    };

    const resp = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id'
    });

    const fileId = resp.data.id;

    // Torna público (qualquer pessoa com o link)
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    console.log(`✅ ${type} enviada ao Drive! ID: ${fileId}`);
    return fileId;

  } catch (err) {
    console.error('❌ Erro ao enviar arquivo ao Drive:', err.message);
    throw err;
  }
}
