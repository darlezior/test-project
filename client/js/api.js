// js/api.js
export async function loadMap(name) {
  const res = await fetch(`/api/maps/${name}`);
  const map = await res.json();

  if (!map.layers) {
    map.layers = {
      background: [],
      objects: map.grid || [],
    };
  }

  return map;
}
