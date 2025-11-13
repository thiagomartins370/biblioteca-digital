// ============================================
// backend/googleDrive.js
// Projeto: Biblioteca Digital Infantil (PI 2 Univesp)
// ============================================

import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { Readable } from "stream";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = "/etc/secrets/token.json";

// Criar cliente OAuth
function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));

  const { client_id, client_secret, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

// Criar/pegar pasta no Drive
async function getOrCreateFolder(auth, folderName = "BibliotecaDigital") {
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: "files(id, name)",
    pageSize: 1,
    supportsAllDrives: true,
  });

  if (res.data.files?.length) return res.data.files[0].id;

  const createRes = await drive.files.create({
    requestBody: { name: folderName, mimeType: "application/vnd.google-apps.folder" },
    fields: "id",
    supportsAllDrives: true,
  });

  return createRes.data.id;
}

// Tornar arquivo público
async function makeFilePublic(auth, fileId) {
  const drive = google.drive({ version: "v3", auth });

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
    supportsAllDrives: true,
  });
}

// ============================================
// 🚀 UPLOAD FINAL – PREVIEW 100% FUNCIONANDO
// ============================================

export async function uploadFileToDrive({
  buffer,
  fileName,
  mimeType,
  folderName = "BibliotecaDigital",
}) {
  try {
    const auth = getOAuth2Client();
    const drive = google.drive({ version: "v3", auth });
    const folderId = await getOrCreateFolder(auth, folderName);

    const stream = Readable.from(buffer);

    const createRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: "id",
      supportsAllDrives: true,
    });

    const fileId = createRes.data.id;

    await makeFilePublic(auth, fileId);

    // 👉 CORRIGIDO: ?embedded=true (não &embedded=true)
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview?embedded=true`;

    return { fileId, url: previewUrl };
  } catch (err) {
    console.error("❌ Erro no upload para o Google Drive:", err);
    throw err;
  }
}
