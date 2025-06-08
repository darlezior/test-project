// server/inventory.js
import { Player } from './models/player.js';

// Aggiungi un oggetto all'inventario di un giocatore
export async function addItemToInventory(socketId, item) {
  const player = await Player.findOne({ socketId });
  if (player) {
    player.inventory.push(item);
    await player.save();
    return player.inventory;
  }
  return null;
}

// Rimuovi un oggetto dall'inventario
export async function removeItemFromInventory(socketId, item) {
  const player = await Player.findOne({ socketId });
  if (player) {
    player.inventory = player.inventory.filter(i => i !== item);
    await player.save();
    return player.inventory;
  }
  return null;
}

// Ottieni l'inventario attuale
export async function getInventory(socketId) {
  const player = await Player.findOne({ socketId });
  return player ? player.inventory : null;
}
