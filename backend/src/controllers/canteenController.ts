import { Request, Response } from 'express';
import { z } from 'zod';
import { CanteenItem, CanteenCategory } from '../models/CanteenItem.js';
import { AuthRequest } from '../middleware/auth.js';

const itemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  category: z.enum(['beverages', 'snacks', 'quick_bites', 'meals', 'desserts']),
  price: z.number().min(0, 'Price must be a positive number'),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isVeg: z.boolean().default(true),
  preparationTime: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function getCanteenItems(req: Request, res: Response): Promise<void> {
  const { category, availability, search } = req.query;

  const filter: any = {};
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (availability === 'available') {
    filter.isAvailable = true;
  } else if (availability === 'unavailable') {
    filter.isAvailable = false;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const items = await CanteenItem.find(filter).sort({ category: 1, name: 1 });

  res.json({
    success: true,
    items,
  });
}

export async function getCanteenItemById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const item = await CanteenItem.findById(id);

  if (!item) {
    res.status(404).json({ success: false, message: 'Canteen item not found.' });
    return;
  }

  res.json({
    success: true,
    item,
  });
}

export async function createCanteenItem(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'canteen_staff' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only canteen staff and administrators can create items.',
    });
    return;
  }

  const validated = itemSchema.parse(req.body);

  const item = new CanteenItem({
    ...validated,
    lastUpdatedBy: req.user.name,
  });

  await item.save();

  res.status(201).json({
    success: true,
    message: 'Canteen item created successfully.',
    item,
  });
}

export async function updateCanteenItem(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'canteen_staff' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only canteen staff and administrators can modify items.',
    });
    return;
  }

  const { id } = req.params;
  const validated = itemSchema.partial().parse(req.body);

  const item = await CanteenItem.findById(id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Canteen item not found.' });
    return;
  }

  Object.assign(item, validated, { lastUpdatedBy: req.user.name });
  await item.save();

  res.json({
    success: true,
    message: 'Canteen item updated successfully.',
    item,
  });
}

export async function toggleCanteenAvailability(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'canteen_staff' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only canteen staff and administrators can toggle availability.',
    });
    return;
  }

  const { id } = req.params;
  const item = await CanteenItem.findById(id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Canteen item not found.' });
    return;
  }

  item.isAvailable = !item.isAvailable;
  item.lastUpdatedBy = req.user.name;
  await item.save();

  res.json({
    success: true,
    message: `Item marked as ${item.isAvailable ? 'available' : 'unavailable'}.`,
    item,
  });
}

export async function deleteCanteenItem(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'canteen_staff' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only canteen staff and administrators can delete items.',
    });
    return;
  }

  const { id } = req.params;
  const item = await CanteenItem.findByIdAndDelete(id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Canteen item not found.' });
    return;
  }

  res.json({
    success: true,
    message: 'Canteen item deleted successfully.',
  });
}
