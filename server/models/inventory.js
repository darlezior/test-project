// Gestione inventario per player

import { Player } from '../models/player.js';

/**
 * Aggiunge un oggetto all'inventario del player.
 */
export async function addItemToInventory(username, item) {
  const player = await Player.findOne({ username });
  if (!player) throw new Error('Player non trovato');

  player.inventory.push(item);
  await player.save();
  return player.inventory;
}

/**
 * Rimuove un oggetto dall'inventario del player.
 */
export async function removeItemFromInventory(username, item) {
  const player = await Player.findOne({ username });
  if (!player) throw new Error('Player non trovato');

  player.inventory = player.inventory.filter(i => i !== item);
  await player.save();
  return player.inventory;
}

/**
 * Restituisce l'inventario attuale di un player.
 */
export async function getInventory(username) {
  const player = await Player.findOne({ username });
  if (!player) throw new Error('Player non trovato');

  return player.inventory;
}
