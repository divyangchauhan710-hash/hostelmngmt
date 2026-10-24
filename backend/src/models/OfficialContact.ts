import mongoose, { Document, Schema } from 'mongoose';

export interface IOfficialContact extends Document {
  name: string;
  roleName: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  officeLocation: string;
  officeHours: string;
  isEmergencyContact: boolean;
  verificationStatus: 'verified' | 'pending';
  lastVerifiedAt: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfficialContactSchema = new Schema<IOfficialContact>(
  {
    name: { type: String, required: true, trim: true },
    roleName: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    department: { type: String, default: 'Hostel Administration' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    officeLocation: { type: String, required: true },
    officeHours: { type: String, default: '09:00 AM – 05:00 PM (Mon–Fri)' },
    isEmergencyContact: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending'],
      default: 'verified',
    },
    lastVerifiedAt: { type: Date, default: Date.now },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const OfficialContact = mongoose.model<IOfficialContact>('OfficialContact', OfficialContactSchema);
