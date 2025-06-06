// /root/mmo/client/js/input.js

let keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

export function getMovementDirection() {
  let dx = 0;
  let dy = 0;

  if (keys['arrowleft'] || keys['a']) dx = -1;
  else if (keys['arrowright'] || keys['d']) dx = 1;

  if (keys['arrowup'] || keys['w']) dy = -1;
  else if (keys['arrowdown'] || keys['s']) dy = 1;

  return { dx, dy };
}
