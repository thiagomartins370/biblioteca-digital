import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

describe('API /api/books', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/biblioteca_test';
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('POST cria livro e GET lista', async () => {
    const novo = {
      title: 'Saci Pererê',
      author: 'Monteiro Lobato',
      category: 'Folclore',
      pdfUrl: 'https://exemplo.com/saci.pdf'
    };
    const createRes = await request(app).post('/api/books').send(novo);
    expect(createRes.statusCode).toBe(201);

    const listRes = await request(app).get('/api/books');
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body[0].title).toBe('Saci Pererê');
  });
});
