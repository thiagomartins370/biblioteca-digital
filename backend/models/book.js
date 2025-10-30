// backend/models/book.js
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  coverUrl: { type: String, required: true },
  fileUrl: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
