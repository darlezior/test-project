import express from 'express';
import { getItems, createItem, updateItem, deleteItem } from './controller.js';

const router = express.Router();

router.get('/:map', getItems);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
