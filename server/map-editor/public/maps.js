// maps.js - Gestisce la creazione di nuove mappe

async function createMap(e) {
  e.preventDefault();
  const name = document.getElementById('newMapName').value.trim();
  const width = parseInt(document.getElementById('newMapWidth').value, 10);
  const height = parseInt(document.getElementById('newMapHeight').value, 10);
  if (!name || isNaN(width) || isNaN(height) || width < 1 || height < 1) {
    return alert('Valori non validi.');
  }
  try {
    const res = await fetch('/map-editor/api/maps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, width, height })
    });
    if (!res.ok) throw new Error(`Errore creazione: ${res.status}`);
    alert('Mappa creata!');
    document.getElementById('mapName').value = name;
    document.getElementById('createMapForm').reset();
    await loadItems();
  } catch (err) {
    alert(err.message);
  }
}
