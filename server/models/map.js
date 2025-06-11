// ===============================
// ??️ models/map.js — Modello per le mappe del Map Editor
// ===============================
import mongoose from 'mongoose';

const cellSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  value: String,
});

const mapSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  width: Number,
  height: Number,
  grid: [cellSchema],
});

export const GameMap = mongoose.model('GameMap', mapSchema);
