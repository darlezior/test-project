// server/map-editor/routes.js
import express from 'express';
import { listMapItems, addMapItem, deleteMapItem } from './controller.js';

const router = express.Router();

router.get('/:map', listMapItems);
router.post('/', addMapItem);
router.delete('/:id', deleteMapItem);

export default router;
