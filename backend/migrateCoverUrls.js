// ============================================
// migrateCoverUrls.js – Corrige links de capas
// Projeto: Biblioteca Digital Infantil (PI 2 Univesp)
// Autor: Thiago Martins
// ============================================

// 1️⃣ Importa dependências
import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "./models/book.js";

// 2️⃣ Carrega variáveis do .env
dotenv.config();

// 3️⃣ Função auxiliar: converte link antigo para o novo formato
function corrigirLinkDrive(url) {
  if (!url) return null;

  // Exemplo de link antigo: https://drive.google.com/file/d/1AbCdEfGhIj/view
  const regex = /\/d\/(.*?)\//;
  const match = url.match(regex);

  if (match && match[1]) {
    const id = match[1];
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }

  // Se já estiver no formato correto, mantém como está
  if (url.includes("uc?export=view&id=")) {
    return url;
  }

  return url; // outros casos
}

// 4️⃣ Função principal
async function corrigirCapas() {
  try {
    // Conecta ao MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    // Busca todos os livros
    const livros = await Book.find();
    console.log(`📚 ${livros.length} livros encontrados.`);

    let alterados = 0;

    // Percorre todos os livros
    for (const livro of livros) {
      const novoLink = corrigirLinkDrive(livro.coverUrl);

      // Se o link mudou, atualiza
      if (novoLink && novoLink !== livro.coverUrl) {
        await Book.updateOne(
          { _id: livro._id },
          { $set: { coverUrl: novoLink } }
        );
        alterados++;
        console.log(`🔄 Corrigido: ${livro.title}`);
      }
    }

    console.log(`\n✅ Migração concluída. ${alterados} capas atualizadas.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro na migração:", err);
    process.exit(1);
  }
}

// 5️⃣ Executa a função
corrigirCapas();
