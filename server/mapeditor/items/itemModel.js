// Percorso: server/mapeditor/items/itemModel.js
// Modello Mongoose per la gestione degli oggetti posizionabili nella mappa

import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Nome leggibile dell'oggetto (es. "Albero", "Roccia")
  },
  symbol: {
    type: String,
    required: true, // Simbolo da visualizzare sulla griglia (es. "T", "#", "🌳")
  },
  properties: {
    type: mongoose.Schema.Types.Mixed, // Oggetto JSON con proprietà extra (es. walkable: false)
    default: {},
  },
});

export default mongoose.model('Item', itemSchema);
