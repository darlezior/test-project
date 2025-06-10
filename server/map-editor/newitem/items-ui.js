// items-ui.js – Gestione interfaccia oggetti

let selectedItemId = null;
let elements = [];

// Carica tutti gli elementi dal server
async function loadElements() {
  const res = await fetch('/api/editor/elements');
  elements = await res.json();
  updateElementsDropdown();
  updateElementsList();
}

// Popola dropdown con gli oggetti disponibili
function updateElementsDropdown() {
  const dropdown = document.getElementById('elementsDropdown');
  dropdown.innerHTML = '<option value="">-- Seleziona oggetto --</option>';
  elements.forEach(el => {
    const opt = document.createElement('option');
    opt.value = el._id;
    opt.textContent = el.name;
    dropdown.appendChild(opt);
  });
}

// Mostra oggetti nella lista per modifica/cancellazione
function updateElementsList() {
  const list = document.getElementById('elementsList');
  list.innerHTML = '';
  elements.forEach(el => {
    const item = document.createElement('div');
    item.innerHTML = `
      <strong>${el.name}</strong> (${el.type}) 
      <button onclick="editElement('${el._id}')">✏️</button> 
      <button onclick="deleteElement('${el._id}')">??️</button>
    `;
    list.appendChild(item);
  });
}

// Crea nuovo elemento
async function createElement(e) {
  e.preventDefault();
  const name = document.getElementById('elementName').value;
  const type = document.getElementById('elementType').value;
  const spriteX = document.getElementById('spriteX').value;
  const spriteY = document.getElementById('spriteY').value;
  const data = {
    hp: document.getElementById('elementHP').value,
    requiredTool: document.getElementById('elementTool').value
  };

  const payload = {
    name, type, sprite: { x: spriteX, y: spriteY }, data
  };

  const method = selectedItemId ? 'PATCH' : 'POST';
  const url = selectedItemId 
    ? `/api/editor/elements/${selectedItemId}`
    : `/api/editor/elements`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    selectedItemId = null;
    document.getElementById('elementForm').reset();
    await loadElements();
  }
}

// Carica elemento in form per modifica
function editElement(id) {
  const el = elements.find(e => e._id === id);
  if (!el) return;
  selectedItemId = id;
  document.getElementById('elementName').value = el.name;
  document.getElementById('elementType').value = el.type;
  document.getElementById('spriteX').value = el.sprite?.x || 0;
  document.getElementById('spriteY').value = el.sprite?.y || 0;
  document.getElementById('elementHP').value = el.data?.hp || '';
  document.getElementById('elementTool').value = el.data?.requiredTool || '';
}

// Cancella elemento
async function deleteElement(id) {
  if (!confirm('Sei sicuro di voler eliminare questo oggetto?')) return;
  await fetch(`/api/editor/elements/${id}`, { method: 'DELETE' });
  await loadElements();
}

// --- Init ---
document.getElementById('elementForm').addEventListener('submit', createElement);
loadElements();
