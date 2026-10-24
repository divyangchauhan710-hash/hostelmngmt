export type UserRole = 'student' | 'rector' | 'housekeeping' | 'mess_staff' | 'canteen_staff' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  hostelBlock?: string;
  roomNumber?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

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

export interface StatusHistoryItem {
  status: ComplaintStatus;
  changedByName: string;
  note?: string;
  isInternal: boolean;
  timestamp: string;
}

export interface Complaint {
  _id: string;
  referenceNumber: string;
  studentId: string;
  studentName: string;
  studentRoom?: string;
  title: string;
  category: ComplaintCategory;
  hostelBlock: string;
  location: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo?: string;
  assignedStaffName?: string;
  imageUrl?: string;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface MealItem {
  name: string;
  isVeg: boolean;
  description?: string;
}

export interface MealSection {
  timing: string;
  items: MealItem[];
}

export interface MessMenuDay {
  _id?: string;
  dayOfWeek: DayOfWeek;
  meals: {
    breakfast: MealSection;
    lunch: MealSection;
    snacks: MealSection;
    dinner: MealSection;
  };
  notes?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
}

export interface MealReview {
  _id: string;
  studentId: string;
  studentName: string;
  mealType: MealType;
  date: string;
  rating: number;
  comment?: string;
  isFlagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CanteenCategory = 'beverages' | 'snacks' | 'quick_bites' | 'meals' | 'desserts';

export interface CanteenItem {
  _id: string;
  name: string;
  category: CanteenCategory;
  price: number;
  description: string;
  isAvailable: boolean;
  isVeg: boolean;
  preparationTime?: string;
  imageUrl?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
}

export type NoticeCategory = 'general' | 'maintenance' | 'emergency' | 'mess' | 'event';
export type NoticePriority = 'normal' | 'important' | 'urgent';

export interface HostelNotice {
  _id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  isPinned: boolean;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  expiresAt?: string;
}

export interface OfficialContact {
  _id: string;
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
  lastVerifiedAt: string;
  order: number;
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: 'complaint_status' | 'complaint_assigned' | 'notice' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
