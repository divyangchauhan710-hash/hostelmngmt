import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { MessMenu, DayOfWeek } from '../models/MessMenu.js';
import { MealReview, MealType } from '../models/MealReview.js';
import { AuthRequest } from '../middleware/auth.js';

const mealItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  isVeg: z.boolean().default(true),
  description: z.string().optional(),
});

const mealSectionSchema = z.object({
  timing: z.string().min(1, 'Timing is required'),
  items: z.array(mealItemSchema),
});

const updateMenuSchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  meals: z.object({
    breakfast: mealSectionSchema,
    lunch: mealSectionSchema,
    snacks: mealSectionSchema,
    dinner: mealSectionSchema,
  }),
  notes: z.string().optional(),
});

const submitReviewSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'snacks', 'dinner']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

export async function getWeeklyMenu(_req: Request, res: Response): Promise<void> {
  const daysOrder: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const menus = await MessMenu.find({});
  
  // Sort by week order
  menus.sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));

  res.json({
    success: true,
    menus,
  });
}

export async function getDayMenu(req: Request, res: Response): Promise<void> {
  const day = req.params.day as string;
  const menu = await MessMenu.findOne({ dayOfWeek: day.toLowerCase() });

  if (!menu) {
    res.status(404).json({
      success: false,
      message: `No menu found for ${day}.`,
    });
    return;
  }

  res.json({
    success: true,
    menu,
  });
}

export async function updateDayMenu(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  // Allowed: mess_staff or admin
  if (req.user.role !== 'mess_staff' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only mess staff and administrators can modify mess menus.',
    });
    return;
  }

  const validated = updateMenuSchema.parse(req.body);

  const updated = await MessMenu.findOneAndUpdate(
    { dayOfWeek: validated.dayOfWeek },
    {
      meals: validated.meals,
      notes: validated.notes || '',
      lastUpdatedBy: req.user.name,
    },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: `Menu for ${validated.dayOfWeek} updated successfully.`,
    menu: updated,
  });
}

export async function getMealReviews(req: AuthRequest, res: Response): Promise<void> {
  const { mealType, date, studentId, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (mealType && mealType !== 'all') filter.mealType = mealType;
  if (date) filter.date = date;
  if (studentId) filter.studentId = new mongoose.Types.ObjectId(studentId as string);

  const total = await MealReview.countDocuments(filter);
  const reviews = await MealReview.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Calculate actual statistics from stored reviews
  const statsAggregate = await MealReview.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalCount: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  const stats = statsAggregate[0] || {
    averageRating: 0,
    totalCount: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
  };

  res.json({
    success: true,
    reviews,
    stats: {
      averageRating: Number(stats.averageRating ? stats.averageRating.toFixed(1) : 0),
      totalCount: stats.totalCount,
      distribution: {
        5: stats.rating5,
        4: stats.rating4,
        3: stats.rating3,
        2: stats.rating2,
        1: stats.rating1,
      },
    },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function submitMealReview(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const validated = submitReviewSchema.parse(req.body);

  // Prevent duplicate review for the same student, meal, and date:
  // Upsert or update existing review
  const existing = await MealReview.findOne({
    studentId: new mongoose.Types.ObjectId(req.user.id),
    mealType: validated.mealType,
    date: validated.date,
  });

  let review;
  if (existing) {
    existing.rating = validated.rating;
    existing.comment = validated.comment || '';
    existing.updatedAt = new Date();
    review = await existing.save();
  } else {
    review = new MealReview({
      studentId: new mongoose.Types.ObjectId(req.user.id),
      studentName: req.user.name,
      mealType: validated.mealType,
      date: validated.date,
      rating: validated.rating,
      comment: validated.comment || '',
    });
    await review.save();
  }

  res.status(200).json({
    success: true,
    message: existing ? 'Meal review updated successfully.' : 'Meal review submitted successfully.',
    review,
  });
}

export async function deleteMealReview(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const { id } = req.params;
  const review = await MealReview.findById(id);

  if (!review) {
    res.status(404).json({ success: false, message: 'Review not found.' });
    return;
  }

  // Authorization: student who created review, or admin
  const isOwner = review.studentId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete your own reviews.',
    });
    return;
  }

  await review.deleteOne();

  res.json({
    success: true,
    message: 'Review deleted successfully.',
  });
}
