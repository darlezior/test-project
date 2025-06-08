// server/models/mapCell.js
import mongoose from 'mongoose';

// Schema che rappresenta una singola cella della mappa
const mapCellSchema = new mongoose.Schema({
  // Nome della mappa a cui appartiene la cella (es: 'start', 'forest-1')
  mapName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  // Coordinate X e Y della cella nella mappa
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  // Tipo di terreno o elemento base della cella (es: 'grass', 'wall', 'water', 'tree')
  type: { 
    type: String, 
    default: 'empty',
    trim: true
  },
  // Dati extra e opzionali associati alla cella, es. NPC, loot, passaggi speciali
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
}, { 
  timestamps: true // aggiunge campi createdAt e updatedAt automaticamente
});

// Indice unico per identificare rapidamente una cella tramite mapName + coordinate
mapCellSchema.index({ mapName: 1, x: 1, y: 1 }, { unique: true });

// Modello mongoose per interagire con la collezione "MapCells"
export const MapCell = mongoose.model('MapCell', mapCellSchema);
