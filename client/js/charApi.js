export async function fetchCharacters(userId) {
  try {
    const res = await fetch(`/api/chars/user/${userId}`);
    if (!res.ok) {
      console.error(`fetchCharacters: risposta non OK, status: ${res.status}`);
      throw new Error('Errore caricamento personaggi dal server');
    }
    const data = await res.json();
    console.log('fetchCharacters: dati ricevuti', data);

    if (!data.success) {
      throw new Error('Server ha risposto con successo=false');
    }

    if (!Array.isArray(data.characters)) {
      throw new Error('Risposta server non contiene array characters');
    }

    return data.characters;
  } catch (err) {
    console.error('fetchCharacters: errore', err);
    throw err;
  }
}
