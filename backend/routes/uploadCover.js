import express from 'express';
import multer from 'multer';
import { uploadToDrive } from '../googleDrive.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-cover', upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Imagem não enviada" });

    const coverId = await uploadToDrive(req.file, req.file.mimetype);

    return res.json({ coverId });
  } catch (err) {
    console.error("Erro no upload da capa:", err);
    res.status(500).json({ error: "Erro no upload da capa" });
  }
});

export default router;
