// backend/middleware/auth.js
import 'dotenv/config';

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const base64 = authHeader.split(' ')[1]; // "Basic base64string"
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return next(); // autorizado
  }

  return res.status(403).json({ message: 'Invalid credentials' });
}
