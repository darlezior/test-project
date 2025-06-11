// ?? Funzioni API per CRUD mappa
export async function saveMap(map) {
  const res = await fetch('/api/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(map),
  });
  return await res.json();
}

export async function getMaps() {
  const res = await fetch('/api/maps');
  return await res.json();
}

export async function loadMap(name) {
  const res = await fetch(`/api/maps/${name}`);
  return await res.json();
}
