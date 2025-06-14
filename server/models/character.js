import mongoose from 'mongoose';

const CharacterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // riferimento all'utente
  name: { type: String, required: true, trim: true, unique: true },
  class: { type: String, required: true }, // es. guerriero, mago...
  level: { type: Number, default: 1 },
  x: { type: Number, default: 0 }, // posizione iniziale sulla mappa
  y: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  // stats base, inventario, ecc. da aggiungere poi
});

const Character = mongoose.model('Character', CharacterSchema);
export default Character;
