import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { 
    tileset: { type: String, required: true }, // nome tileset o url
    x: { type: Number, required: true }, // coordinate tile nel tileset
    y: { type: Number, required: true },
  },
  hp: { type: Number, default: 0 },        // punti vita
  minableWith: [{ type: String }],         // array di equipaggiamenti abilitati al mining
  customProperties: { type: mongoose.Schema.Types.Mixed, default: {} }, // parametri aggiuntivi
}, {
  timestamps: true
});

export const Item = mongoose.model('Item', itemSchema);
