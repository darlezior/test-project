import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  username: { type: String, required: true },
  x: { type: Number, default: 160 },
  y: { type: Number, default: 120 },
  inventory: { type: [String], default: [] }, // Lista semplice di oggetti
}, { timestamps: true });

export const Player = mongoose.model('Player', playerSchema);
