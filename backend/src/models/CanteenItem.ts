import mongoose, { Document, Schema } from 'mongoose';

export type CanteenCategory = 'beverages' | 'snacks' | 'quick_bites' | 'meals' | 'desserts';

export interface ICanteenItem extends Document {
  name: string;
  category: CanteenCategory;
  price: number; // in INR
  description: string;
  isAvailable: boolean;
  isVeg: boolean;
  preparationTime?: string;
  imageUrl?: string;
  lastUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CanteenItemSchema = new Schema<ICanteenItem>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['beverages', 'snacks', 'quick_bites', 'meals', 'desserts'],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true, index: true },
    isVeg: { type: Boolean, default: true },
    preparationTime: { type: String, default: '5-10 mins' },
    imageUrl: { type: String, default: '' },
    lastUpdatedBy: { type: String, default: 'Canteen Staff' },
  },
  { timestamps: true }
);

export const CanteenItem = mongoose.model<ICanteenItem>('CanteenItem', CanteenItemSchema);
