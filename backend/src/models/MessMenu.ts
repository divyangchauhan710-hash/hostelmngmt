import mongoose, { Document, Schema } from 'mongoose';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface IMealItem {
  name: string;
  isVeg: boolean;
  description?: string;
}

export interface IMealSection {
  timing: string;
  items: IMealItem[];
}

export interface IMessMenu extends Document {
  dayOfWeek: DayOfWeek;
  meals: {
    breakfast: IMealSection;
    lunch: IMealSection;
    snacks: IMealSection;
    dinner: IMealSection;
  };
  notes?: string;
  lastUpdatedBy?: string;
  updatedAt: Date;
}

const MealItemSchema = new Schema<IMealItem>(
  {
    name: { type: String, required: true },
    isVeg: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const MealSectionSchema = new Schema<IMealSection>(
  {
    timing: { type: String, required: true },
    items: [MealItemSchema],
  },
  { _id: false }
);

const MessMenuSchema = new Schema<IMessMenu>(
  {
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
      unique: true,
    },
    meals: {
      breakfast: { type: MealSectionSchema, required: true },
      lunch: { type: MealSectionSchema, required: true },
      snacks: { type: MealSectionSchema, required: true },
      dinner: { type: MealSectionSchema, required: true },
    },
    notes: { type: String, default: '' },
    lastUpdatedBy: { type: String, default: 'Mess Warden' },
  },
  { timestamps: true }
);

export const MessMenu = mongoose.model<IMessMenu>('MessMenu', MessMenuSchema);
