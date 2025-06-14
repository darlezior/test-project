// server/usereditor/usereditorRoutes.js

import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js'; // Assicurati che il path sia corretto

const router = express.Router();

// ✅ GET /api/users - lista utenti (solo username)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username').lean();
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Errore server durante caricamento utenti' });
  }
});

// ✅ POST /api/users - crea nuovo utente con hashing diretto
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password sono obbligatori' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username già esistente' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ username, passwordHash });

    await newUser.save();
    res.status(201).json({ message: 'Utente creato' });
  } catch (err) {
    console.error('POST /api/users error:', err);
    res.status(500).json({ error: 'Errore server durante creazione utente' });
  }
});

// ✅ PUT /api/users/:username - modifica username e/o password
router.put('/:username', async (req, res) => {
  try {
    const oldUsername = req.params.username;
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username è obbligatorio' });
    }

    const user = await User.findOne({ username: oldUsername });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (username !== oldUsername) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ error: 'Username già esistente' });
      }
      user.username = username;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Utente aggiornato' });
  } catch (err) {
    console.error('PUT /api/users/:username error:', err);
    res.status(500).json({ error: 'Errore server durante aggiornamento utente' });
  }
});

// ✅ DELETE /api/users/:username - elimina utente
router.delete('/:username', async (req, res) => {
  try {
    const username = req.params.username;

    const result = await User.deleteOne({ username });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ message: 'Utente eliminato' });
  } catch (err) {
    console.error('DELETE /api/users/:username error:', err);
    res.status(500).json({ error: 'Errore server durante eliminazione utente' });
  }
});

export default router;
