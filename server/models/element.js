import mongoose from 'mongoose';

// Schema per definire un "Elemento" della mappa,
// ad esempio un albero, una roccia, un edificio, ecc.
const ElementSchema = new mongoose.Schema({
  // Nome identificativo dell'elemento (es. "roccia", "albero")
  name: { 
    type: String, 
    required: true,
    trim: true // elimina spazi bianchi inutili
  },
  // URL o percorso relativo all'immagine/tile che rappresenta l'elemento
  image: { 
    type: String, 
    required: true,
    trim: true
  },
  // Proprietà personalizzate dell'elemento (es. resistenza, tipo, azioni disponibili)
  properties: { 
    type: Object, 
    default: {} 
  },
});

// Modello mongoose per interagire con la collezione "elements"
export const Element = mongoose.model('Element', ElementSchema);
