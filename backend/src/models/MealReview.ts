import mongoose, { Document, Schema } from 'mongoose';

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface IMealReview extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  mealType: MealType;
  date: string; // Format: YYYY-MM-DD
  rating: number; // 1 to 5
  comment?: string;
  isFlagged?: boolean;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealReviewSchema = new Schema<IMealReview>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    isFlagged: { type: Boolean, default: false },
    moderationReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review for the same student, meal type, and date
MealReviewSchema.index({ studentId: 1, mealType: 1, date: 1 }, { unique: true });

export const MealReview = mongoose.model<IMealReview>('MealReview', MealReviewSchema);
