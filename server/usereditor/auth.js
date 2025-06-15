import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// ✅ REGISTRAZIONE
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('[REGISTER] Richiesta con:', { username, password });

  if (!username || !password) {
    console.warn('[REGISTER] Campi mancanti');
    return res.status(400).json({ success: false, message: 'Username e password richiesti' });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      console.warn('[REGISTER] Username già esistente:', username);
      return res.status(400).json({ success: false, message: 'Username già esistente' });
    }

    const newUser = new User({ username, password }); // password virtuale
    await newUser.save();

    console.log('[REGISTER] Utente creato:', newUser.username);
    res.json({ success: true, message: 'Utente creato con successo' });
  } catch (err) {
    console.error('[REGISTER] Errore interno:', err);
    res.status(500).json({ success: false, message: 'Errore interno server' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('[LOGIN] Tentativo con:', { username, password });

  if (!username || !password) {
    console.warn('[LOGIN] Campi mancanti');
    return res.status(400).json({ success: false, message: 'Username e password richiesti' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.warn('[LOGIN] Utente non trovato:', username);
      return res.status(401).json({ success: false, message: 'Credenziali errate' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('[LOGIN] Password errata per:', username);
      return res.status(401).json({ success: false, message: 'Credenziali errate' });
    }

    console.log('[LOGIN] Login riuscito per:', username);
    res.json({ success: true, message: 'Login riuscito', userId: user._id, username: user.username });
  } catch (err) {
    console.error('[LOGIN] Errore interno:', err);
    res.status(500).json({ success: false, message: 'Errore interno server' });
  }
});

export default router;
