import mongoose, { Document, Schema } from 'mongoose';

export type NoticeCategory = 'general' | 'maintenance' | 'emergency' | 'mess' | 'event';
export type NoticePriority = 'normal' | 'important' | 'urgent';

export interface IHostelNotice extends Document {
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  isPinned: boolean;
  authorName: string;
  authorRole: string;
  publishedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HostelNoticeSchema = new Schema<IHostelNotice>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'maintenance', 'emergency', 'mess', 'event'],
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
      index: true,
    },
    isPinned: { type: Boolean, default: false, index: true },
    authorName: { type: String, default: 'Hostel Office' },
    authorRole: { type: String, default: 'Administration' },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const HostelNotice = mongoose.model<IHostelNotice>('HostelNotice', HostelNoticeSchema);
