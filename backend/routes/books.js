import express from 'express';
import multer from 'multer';
import { uploadFileToDrive } from '../googleDrive.js';
import Book from '../models/book.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 👉 Lista livros
router.get('/', async (_req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
});

// 👉 Upload + criação do livro
router.post('/upload', upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, category } = req.body;
    const coverFile = req.files.cover?.[0];
    const pdfFile = req.files.pdf?.[0];

    if (!coverFile || !pdfFile) {
      return res.status(400).json({ error: "Envie CAPA e PDF" });
    }

    // 🚀 Uploads no Google Drive
    const coverId = await uploadFileToDrive(coverFile, 'cover');
    const pdfId = await uploadFileToDrive(pdfFile, 'pdf');

    // ✅ Salva no Mongo com nomes corretos
const newBook = await Book.create({
  title,
  category,
  fileUrl: `https://drive.google.com/uc?export=download&id=${pdfId}`, // <--- aqui trocamos pdfUrl por fileUrl
  coverUrl: `https://drive.google.com/uc?export=view&id=${coverId}`,
});

    res.json({ message: "Livro cadastrado com sucesso!", book: newBook });

  } catch (err) {
    console.error("Erro ao cadastrar livro:", err);
    res.status(500).json({ error: "Erro ao cadastrar o livro" });
  }
});

export default router;
