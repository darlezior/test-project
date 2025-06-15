// server/usereditor/charRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import { Character } from '../models/character.js';

const router = express.Router();

// ✅ Elenco personaggi per userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(`[GET /user/${userId}] → Richiesta elenco personaggi`);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn(`[GET /user/${userId}] ⚠️ userId non valido`);
    return res.status(400).json({ success: false, error: 'userId non valido' });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const characters = await Character.find({ userId: userObjectId });
    console.log(`[GET /user/${userId}] ✅ ${characters.length} personaggi trovati`);
    res.json({ success: true, characters });
  } catch (err) {
    console.error(`[GET /user/${userId}] ❌ Errore:`, err);
    res.status(500).json({ success: false, error: 'Errore nel recupero dei personaggi' });
  }
});

// ✅ Crea un nuovo personaggio
router.post('/', async (req, res) => {
  const { userId, character } = req.body;

  console.log(`[POST /] → Creazione personaggio per utente ${userId} con dati`, character);

  if (!userId || !character || !character.name) {
    console.warn(`[POST /] ⚠️ Dati mancanti`);
    return res.status(400).json({ success: false, error: 'Dati mancanti' });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn(`[POST /] ⚠️ userId non valido`);
    return res.status(400).json({ success: false, error: 'userId non valido' });
  }

  try {
    const char = await Character.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: character.name,
      level: character.level ?? 1,
      exp: character.exp ?? 0,
      hp: character.hp ?? 100,
      sp: character.sp ?? 50,
      mp: character.mp ?? 30,
      pos: character.pos ?? { map: 'start', x: 5, y: 5 },
    });

    console.log(`[POST /] ✅ Personaggio creato con ID ${char._id}`);
    res.json({ success: true, character: char });
  } catch (err) {
    console.error(`[POST /] ❌ Errore nella creazione:`, err);
    res.status(500).json({ success: false, error: 'Errore nella creazione del personaggio' });
  }
});

// ✅ Aggiorna un personaggio per ID
router.put('/:id', async (req, res) => {
  const charId = req.params.id;
  console.log(`[PUT /${charId}] → Aggiornamento dati:`, req.body);

  if (!mongoose.Types.ObjectId.isValid(charId)) {
    console.warn(`[PUT /${charId}] ⚠️ ID personaggio non valido`);
    return res.status(400).json({ success: false, error: 'ID personaggio non valido' });
  }

  try {
    const updatedChar = await Character.findByIdAndUpdate(charId, req.body, { new: true });
    if (!updatedChar) {
      console.warn(`[PUT /${charId}] ⚠️ Personaggio non trovato`);
      return res.status(404).json({ success: false, error: 'Personaggio non trovato' });
    }

    console.log(`[PUT /${charId}] ✅ Aggiornato con successo`);
    res.json({ success: true, character: updatedChar });
  } catch (err) {
    console.error(`[PUT /${charId}] ❌ Errore:`, err);
    res.status(500).json({ success: false, error: 'Errore nell\'aggiornamento del personaggio' });
  }
});

// ✅ Elimina un personaggio per ID
router.delete('/:id', async (req, res) => {
  const charId = req.params.id;
  console.log(`[DELETE /${charId}] → Eliminazione personaggio`);

  if (!mongoose.Types.ObjectId.isValid(charId)) {
    console.warn(`[DELETE /${charId}] ⚠️ ID personaggio non valido`);
    return res.status(400).json({ success: false, error: 'ID personaggio non valido' });
  }

  try {
    const result = await Character.findByIdAndDelete(charId);
    if (!result) {
      console.warn(`[DELETE /${charId}] ⚠️ Personaggio non trovato`);
      return res.status(404).json({ success: false, error: 'Personaggio non trovato' });
    }

    console.log(`[DELETE /${charId}] ✅ Eliminato con successo`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[DELETE /${charId}] ❌ Errore:`, err);
    res.status(500).json({ success: false, error: 'Errore nella cancellazione del personaggio' });
  }
});

export default router;
