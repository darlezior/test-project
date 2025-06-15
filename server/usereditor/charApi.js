// server/usereditor/charApi.js

window.charApi = {
  // Ottiene la lista dei personaggi associati a uno userId
  async fetchCharacters(userId) {
    try {
      const res = await fetch(`/api/chars/user/${userId}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error('Errore in fetchCharacters:', err);
      throw new Error('Errore nel recupero dei personaggi');
    }
  },

  // Crea un nuovo personaggio per un dato utente
  async createCharacter(userId, data) {
    try {
      const res = await fetch('/api/chars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, character: data }),
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error('Errore in createCharacter:', err);
      throw new Error('Errore nella creazione del personaggio');
    }
  },

  // Aggiorna un personaggio esistente (tutti i parametri)
  // params è un oggetto con tutti i campi aggiornati del personaggio
  async updateCharacter(id, params) {
    try {
      const res = await fetch(`/api/chars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error('Errore in updateCharacter:', err);
      throw new Error('Errore nell\'aggiornamento del personaggio');
    }
  },

  // Elimina un personaggio tramite ID
  async deleteCharacter(id) {
    try {
      const res = await fetch(`/api/chars/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error('Errore in deleteCharacter:', err);
      throw new Error('Errore nell\'eliminazione del personaggio');
    }
  }
};
