import mongoose from 'mongoose';

const mapItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // es. 'risorsa', 'consumabile', 'decorazione'
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  mapId: { type: String, required: true }, // identificatore mappa
  interactable: { type: Boolean, default: false }, // se può essere raccolto o usato
  description: { type: String },
  image: { type: String },
  properties: { type: mongoose.Schema.Types.Mixed }, // altri attributi dinamici
}, { timestamps: true });

// Evita OverwriteModelError
const MapItem = mongoose.models.MapItem || mongoose.model('MapItem', mapItemSchema);

export default MapItem;
