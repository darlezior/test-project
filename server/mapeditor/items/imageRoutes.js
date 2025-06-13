// Percorso: server/mapeditor/items/imageRoutes.js
// API per upload, list e delete immagini oggetto nel Map Editor

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Soluzione per __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ Directory dove salvare le immagini
const uploadDir = path.join(__dirname, 'images');

// Crea la directory se non esiste
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configurazione Multer per salvataggio con nome originale
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

// ✅ Upload immagine
router.post('/', upload.single('image'), (req, res) => {
  res.json({ message: 'Immagine caricata con successo.', filename: req.file.originalname });
});

// ✅ Lista immagini disponibili
router.get('/', (req, res) => {
  console.log('GET /api/images chiamato');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Errore nella lettura della cartella immagini' });
    }
    res.json(files);
  });
});

// ✅ Elimina immagine
router.delete('/:filename', (req, res) => {
  const file = path.join(uploadDir, req.params.filename);
  fs.unlink(file, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File non trovato o già eliminato' });
    }
    res.json({ message: 'Immagine eliminata con successo.' });
  });
});

export default router;
