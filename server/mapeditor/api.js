// 🌍 Funzioni API per CRUD mappa
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

// 🎯 Funzioni API per CRUD oggetti mappa
export async function getItems() {
  const res = await fetch('/api/items');
  return await res.json();
}

export async function createItem(item) {
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return await res.json();
}

export async function updateItem(id, item) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return await res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
  });
  return await res.json();
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/items/images', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload fallito');
  return res.json();
}

export async function getImages() {
  const res = await fetch('/api/items/images');
  return res.json();
}

export async function deleteImage(filename) {
  const res = await fetch(`/api/items/images/${filename}`, {
    method: 'DELETE',
  });
  return res.json();
}
