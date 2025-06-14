// server/models/Item.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  interactable: { type: Boolean, default: false },
  onClickAction: { type: String, default: "" },
  durability: { type: Number, default: 0 },
  usable: { type: Boolean, default: false },
  container: { type: Boolean, default: false },
  solid: { type: Boolean, default: false },
  collidable: { type: Boolean, default: false },
  triggerZone: { type: Boolean, default: false },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const Item = mongoose.model('Item', itemSchema);
export default Item;
