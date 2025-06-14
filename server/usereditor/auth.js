import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username e password richiesti' });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username già esistente' });

    // IMPORTANTISSIMO: passa la password come campo virtuale "password"
    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: 'Utente creato con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore interno server' });
  }
});

// login rimane identico
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username e password richiesti' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenziali errate' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Credenziali errate' });

    res.json({ userId: user._id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore interno server' });
  }
});

export default router;
