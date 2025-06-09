// items.js - Carica, disegna e gestisce gli elementi sulla mappa

function drawItems(items) {
  items.forEach(i => {
    ctx.fillStyle = 'green';
    ctx.fillRect(i.x * tileSize, i.y * tileSize, tileSize, tileSize);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(i.type, i.x * tileSize + 4, i.y * tileSize + tileSize / 2);
  });
}

async function loadItems() {
  const map = document.getElementById('mapName').value.trim();
  if (!map) return alert('Inserisci il nome della mappa!');
  try {
    const res = await fetch('/map-editor/api/mapcells/' + encodeURIComponent(map));
    if (!res.ok) throw new Error(`Errore nel caricamento: ${res.status} ${res.statusText}`);
    const items = await res.json();
    const listDiv = document.getElementById('itemsList');
    listDiv.innerHTML = '';
    if (items.length === 0) {
      listDiv.textContent = 'Nessun elemento presente sulla mappa.';
    } else {
      items.forEach(i => {
        const div = document.createElement('div');
        div.textContent = `ID: ${i._id} | x: ${i.x}, y: ${i.y}, type: ${i.type}`;
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = async () => {
          if (confirm('Sicuro di cancellare?')) {
            const res = await fetch('/map-editor/api/mapcells/' + i._id, { method: 'DELETE' });
            if (!res.ok) return alert(`Errore: ${res.status}`);
            await loadItems();
          }
        };
        div.appendChild(delBtn);
        listDiv.appendChild(div);
      });
    }
    drawGrid();
    drawItems(items);
  } catch (err) {
    alert(err.message);
  }
}

async function addItem(e) {
  e.preventDefault();
  const form = e.target;
  const map = document.getElementById('mapName').value.trim();
  if (!map) return alert('Inserisci il nome della mappa.');
  const x = Number(form.x.value);
  const y = Number(form.y.value);
  const type = form.type.value.trim();
  if (isNaN(x) || isNaN(y) || !type) return alert('Dati non validi.');
  try {
    const res = await fetch('/map-editor/api/mapcells', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapName: map, x, y, type, data: {} })
    });
    if (!res.ok) throw new Error(`Errore: ${res.status}`);
    form.reset();
    await loadItems();
  } catch (err) {
    alert(err.message);
  }
}
