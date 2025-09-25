// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import booksRouter from './routes/books.js';
import authRouter from './routes/auth.js'; // 👈 IMPORTA NO TOPO JUNTO

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));

// Conexão MongoDB Atlas
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err.message));

// Rotas API
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/books', booksRouter);
app.use('/api', authRouter); // 👈 AQUI JUNTO DAS ROTAS

// =============================
// Servir arquivos da pasta uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Servir frontend (estático)
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));
// =============================

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
}

export default app; // para testes
