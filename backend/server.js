// ============================================
// backend/server.js
// Projeto: Biblioteca Digital Infantil (PI 2 Univesp)
// Autor: Thiago Martins
// ============================================

import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import booksRouter from './routes/books.js';
import loginRouter from './routes/auth.js';

// --- Configura caminhos absolutos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Configuração de CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`❌ Origem não permitida pelo CORS: ${origin}`);
      return callback(new Error('CORS bloqueado: origem não autorizada.'));
    },
  })
);

// --- Middlewares globais
app.use(express.json());

// --- Conexão MongoDB Atlas
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca';

mongoose.set('strictQuery', true);
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });

// --- Rotas da API
app.use('/api/books', booksRouter);
app.use('/api', loginRouter);

// --- Servir frontend estático (AGORA NA PASTA CORRETA: /public)
const frontendDir = path.join(__dirname, 'public');
app.use(express.static(frontendDir));

// --- Página inicial
app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// --- Sobe o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Origens permitidas: ${allowedOrigins.join(', ')}`);
});

export default app;
