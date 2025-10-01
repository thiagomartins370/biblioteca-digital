import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, default: 'Desconhecido' },
  category: { 
    type: String, 
    enum: ['Folclore', 'Aventuras', 'Dormir', 'Outros'], 
    default: 'Outros' 
  },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  pdfUrl: { type: String, required: true },   // URL do PDF (nuvem)
  coverUrl: { type: String, default: '' },    // URL capa (opcional)
  pages: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Book', BookSchema);
