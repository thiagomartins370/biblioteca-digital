// backend/middleware/auth.js
export default function auth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Autenticação necessária (Basic).' });
  }

  try {
    const base64 = header.replace('Basic ', '');
    const [user, pass] = Buffer.from(base64, 'base64').toString('utf8').split(':');

    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
      return next();
    }
    return res.status(403).json({ error: 'Credenciais inválidas.' });
  } catch (err) {
    return res.status(400).json({ error: 'Cabeçalho de autenticação inválido.' });
  }
}
