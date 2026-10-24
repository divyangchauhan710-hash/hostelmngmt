import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintCategory =
  | 'washroom'
  | 'corridor'
  | 'room'
  | 'drinking_water'
  | 'garbage'
  | 'common_area'
  | 'other';

export type ComplaintPriority = 'normal' | 'urgent';

export type ComplaintStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'reopened';

export interface IStatusHistoryEntry {
  status: ComplaintStatus;
  changedBy: mongoose.Types.ObjectId;
  changedByName: string;
  note?: string;
  isInternal: boolean;
  timestamp: Date;
}

export interface IComplaint extends Document {
  referenceNumber: string;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentRoom?: string;
  title: string;
  category: ComplaintCategory;
  hostelBlock: string;
  location: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo?: mongoose.Types.ObjectId;
  assignedStaffName?: string;
  imageUrl?: string;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened'],
      required: true,
    },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String, required: true },
    note: { type: String, default: '' },
    isInternal: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true },
    studentRoom: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['washroom', 'corridor', 'room', 'drinking_water', 'garbage', 'common_area', 'other'],
      required: true,
      index: true,
    },
    hostelBlock: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['normal', 'urgent'], default: 'normal', index: true },
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened'],
      default: 'submitted',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedStaffName: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    statusHistory: [StatusHistorySchema],
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
