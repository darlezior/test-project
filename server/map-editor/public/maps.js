// maps.js - gestione fetch API per mappe

export let currentMap = null;

export async function fetchMaps() {
  const res = await fetch('/api/maps');
  if (!res.ok) throw new Error('Errore caricamento mappe');
  return await res.json();
}

export async function fetchMap(name) {
  const res = await fetch(`/api/maps/${name}`);
  if (!res.ok) throw new Error('Mappa non trovata');
  return await res.json();
}

export async function createMap(name, width, height) {
  const res = await fetch('/api/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, width, height }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Errore creazione mappa');
  }
  return await res.json();
}

export async function updateMap(name, data) {
  const res = await fetch(`/api/maps/${name}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Errore aggiornamento mappa');
  }
  return await res.json();
}

export async function deleteMap(name) {
  const res = await fetch(`/api/maps/${name}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Errore cancellazione mappa');
  }
  return true;
}
