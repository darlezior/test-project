// client/js/input.js

let keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Stato bottoni virtuali A e B
let buttonA = false;
let buttonB = false;

// Funzione per setup bottoni virtuali (da chiamare una volta all'avvio)
export function setupVirtualButtons() {
  const btnA = document.getElementById('btnA');
  const btnB = document.getElementById('btnB');
  if (!btnA || !btnB) {
    console.warn('Pulsanti A o B non trovati nel DOM');
    return;
  }

  btnA.addEventListener('mousedown', () => { buttonA = true; });
  btnA.addEventListener('touchstart', () => { buttonA = true; });
  btnA.addEventListener('mouseup', () => { buttonA = false; });
  btnA.addEventListener('touchend', () => { buttonA = false; });

  btnB.addEventListener('mousedown', () => { buttonB = true; });
  btnB.addEventListener('touchstart', () => { buttonB = true; });
  btnB.addEventListener('mouseup', () => { buttonB = false; });
  btnB.addEventListener('touchend', () => { buttonB = false; });
}

// Restituisce direzione movimento tastiera
export function getMovementDirection() {
  let dx = 0;
  let dy = 0;
  if (keys['arrowleft'] || keys['a']) dx = -1;
  else if (keys['arrowright'] || keys['d']) dx = 1;
  if (keys['arrowup'] || keys['w']) dy = -1;
  else if (keys['arrowdown'] || keys['s']) dy = 1;
  return { dx, dy };
}

// Lettura stato pulsante A (da tastiera o virtuale)
export function isButtonAPressed() {
  // Puoi anche mappare tastiera su azione A, ad esempio: invio o spazio
  return buttonA || keys['enter'] || keys[' '];
}

// Lettura stato pulsante B (da tastiera o virtuale)
export function isButtonBPressed() {
  // Ad esempio ESC come indietro
  return buttonB || keys['escape'];
}
