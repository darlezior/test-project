import mongoose from 'mongoose';

const CellSchema = new mongoose.Schema({
  type: { type: String, default: 'empty' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const MapSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  cells: { type: [[CellSchema]], required: true }, // matrice 2D di celle
}, { timestamps: true });  // spostato qui

const MapModel = mongoose.model('Map', MapSchema);

export default MapModel;
