// backend/models/book.js
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    author: { type: String },
    coverUrl: { type: String }, // imagem da capa (Drive uc?id=)
    fileUrl: { type: String },  // PDF (Drive /file/d/ID/preview)
  },
  { timestamps: true } // createdAt e updatedAt automáticos
);

export default mongoose.model('Book', BookSchema);
