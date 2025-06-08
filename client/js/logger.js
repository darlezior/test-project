// client/js/logger.js
export function log(msg) {
  const logBox = document.getElementById('log');
  if (logBox) {
    const time = new Date().toLocaleTimeString();
    logBox.innerHTML += `[${time}] ${msg}<br>`;
    logBox.scrollTop = logBox.scrollHeight;
  } else {
    console.log(msg);
  }
}
