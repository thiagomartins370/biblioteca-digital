// backend/routes/auth.js
import express from 'express';

const router = express.Router();

// POST /api/login → valida usuário e senha do .env
router.post('/login', (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ ok: false, message: 'Usuário e senha são obrigatórios' });
  }

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return res.status(200).json({ ok: true, message: 'Login bem-sucedido' });
  }

  return res.status(403).json({ ok: false, message: 'Credenciais inválidas' });
});

export default router;
