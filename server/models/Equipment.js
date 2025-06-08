import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // es. 'arma', 'armatura', 'accessorio'
  stats: {
    damage: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    resistance: { type: Number, default: 0 },
    // aggiungi altre stats se vuoi
  },
  rarity: { type: String, default: 'comune' }, // comune, raro, epico, leggendario
  description: { type: String },
  image: { type: String }, // url o path icona
  otherProperties: { type: mongoose.Schema.Types.Mixed }, // per campi dinamici/futuri
}, { timestamps: true });

export const Equipment = mongoose.model('Equipment', equipmentSchema);
