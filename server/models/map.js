import mongoose from 'mongoose';

const layerItemSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  value: String
}, { _id: false });

const mapSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  width: Number,
  height: Number,
  layers: {
    background: { type: [layerItemSchema], default: [] },
    objects: { type: [layerItemSchema], default: [] }
  }
});

export const GameMap = mongoose.model('GameMap', mapSchema);
