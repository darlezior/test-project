let joystick = null;
let knob = null;
let centerX = 0;
let centerY = 0;
let maxDistance = 40; // raggio massimo spostamento knob (metà dimensione joystick - knob)
let dx = 0;
let dy = 0;

export function getJoystickDirection() {
  return { dx, dy };
}

function normalize(value, max) {
  return Math.max(-1, Math.min(1, value / max));
}

function setupJoystick() {
  joystick = document.getElementById('joystick');
  knob = document.getElementById('knob');
  if (!joystick || !knob) return;

  joystick.addEventListener('touchstart', handleTouch, false);
  joystick.addEventListener('touchmove', handleTouch, false);
  joystick.addEventListener('touchend', handleEnd, false);
  joystick.addEventListener('touchcancel', handleEnd, false);
}

function handleTouch(e) {
  e.preventDefault();

  const touch = e.touches[0];
  const rect = joystick.getBoundingClientRect();

  centerX = rect.left + rect.width / 2;
  centerY = rect.top + rect.height / 2;

  let offsetX = touch.clientX - centerX;
  let offsetY = touch.clientY - centerY;

  // Limita lo spostamento al maxDistance
  const distance = Math.min(Math.hypot(offsetX, offsetY), maxDistance);

  // Calcola angolo per mantenere la direzione ma limitare la distanza
  const angle = Math.atan2(offsetY, offsetX);

  // Posizione del knob limitata
  const knobX = Math.cos(angle) * distance;
  const knobY = Math.sin(angle) * distance;

  // Aggiorna la posizione del knob (centrato nel joystick)
  knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

  // Normalizza dx e dy tra -1 e 1
  dx = normalize(knobX, maxDistance);
  dy = normalize(knobY, maxDistance);
}

function handleEnd() {
  // Resetta knob al centro
  knob.style.transform = 'translate(0, 0)';
  dx = 0;
  dy = 0;
}

// Inizializza quando DOM pronto
document.addEventListener('DOMContentLoaded', setupJoystick);
