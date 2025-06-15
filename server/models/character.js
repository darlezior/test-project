// server/models/character.js
import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  map: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
}, { _id: false });

const characterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  hp: { type: Number, default: 100 },
  sp: { type: Number, default: 50 },
  mp: { type: Number, default: 30 },
  pos: { type: positionSchema, required: true },
});

export const Character = mongoose.model('Character', characterSchema);
