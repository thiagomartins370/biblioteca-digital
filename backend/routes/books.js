// ============================================
// backend/routes/books.js
// Projeto: Biblioteca Digital Infantil (PI 2 Univesp)
// Autor: Thiago Martins
// ============================================

import express from "express";
import multer from "multer";
import { uploadFileToDrive } from "../googleDrive.js";
import Book from "../models/book.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 📚 Lista todos os livros
router.get("/", async (_req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("❌ Erro ao listar livros:", error);
    res.status(500).json({ error: "Erro ao listar livros" });
  }
});

// ➕ Upload + criação do livro
router.post(
  "/upload",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, category } = req.body;
      const coverFile = req.files?.cover?.[0];
      const pdfFile = req.files?.pdf?.[0];

      if (!title || !category || !coverFile || !pdfFile) {
        return res
          .status(400)
          .json({ error: "Título, categoria, capa e PDF são obrigatórios." });
      }

      // 📌 CORREÇÃO: Forçar tipos corretos para Google Drive
      // Isso impede o Drive de baixar PDF ao invés de abrir.
      
      // ⬆️ Envia CAPA (garante tipo de imagem)
      const coverUp = await uploadFileToDrive({
        buffer: coverFile.buffer,
        fileName: coverFile.originalname,
        mimeType: coverFile.mimetype || "image/jpeg",
      });

      // ⬆️ Envia PDF (força application/pdf SEMPRE!)
      const pdfUp = await uploadFileToDrive({
        buffer: pdfFile.buffer,
        fileName: pdfFile.originalname,
        mimeType: "application/pdf",
      });

      // 📝 Salva no MongoDB com o formato correto
      const book = await Book.create({
        title,
        category,
        coverUrl: coverUp.url, // URL direta da capa
        fileUrl: pdfUp.url,    // URL direta do PDF
      });

      console.log("📚 Livro cadastrado:", title);
      res.json(book);
    } catch (error) {
      console.error("❌ Erro ao cadastrar livro:", error);
      res.status(500).json({ error: "Erro ao cadastrar livro" });
    }
  }
);

// 🗑️ Excluir livro
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.json({ message: "Livro excluído com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir livro:", error);
    res.status(500).json({ error: "Erro ao excluir livro" });
  }
});

export default router;
