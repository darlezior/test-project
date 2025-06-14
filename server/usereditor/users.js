// users.js - Router per la gestione utenti (lista, cancellazione, ecc.)
import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// GET /users - Restituisce lista utenti con username e data creazione
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username createdAt');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore interno server' });
  }
});

// DELETE /users/:id - Elimina utente per ID
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utente eliminato' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore interno server' });
  }
});

// TODO: Aggiungere eventuale aggiornamento utenti (update)

export default router;
