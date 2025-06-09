import mongoose from 'mongoose';

const mapSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  width: { type: Number, required: true, min: 1 },
  height: { type: Number, required: true, min: 1 },
  createdAt: { type: Date, default: Date.now }
});

const MapModel = mongoose.model('Map', mapSchema);

export default MapModel;
