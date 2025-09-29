// backend/routes/books.js
import express from 'express';
import Book from '../models/book.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// =======================
// Rota pública (qualquer um pode ver)
// =======================
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const regex = new RegExp(q, 'i'); // busca sem case-sensitive
      filter = {
        $or: [{ title: regex }, { author: regex }, { tags: regex }]
      };
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// Rotas protegidas (precisam login admin)
// =======================

// Criar livro
router.post('/', auth, async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Atualizar livro
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deletar livro
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
