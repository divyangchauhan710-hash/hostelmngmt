import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import { seedDatabase } from '../seeds/seed.js';

let studentToken = '';
let studentId = '';
let staffToken = '';
let adminToken = '';
let testComplaintId = '';

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostelhub';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
  await seedDatabase();

  // Login as student
  const studentRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@hostelhub.local', password: 'Student@123' });
  studentToken = studentRes.body.token;
  studentId = studentRes.body.user.id;

  // Login as housekeeping staff
  const staffRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'housekeeping@hostelhub.local', password: 'Staff@123' });
  staffToken = staffRes.body.token;

  // Login as admin
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@hostelhub.local', password: 'Admin@123' });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('1. Health and Authentication API', () => {
  it('GET /api/health should return status ok and connected database', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@hostelhub.local', password: 'WrongPassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('student@hostelhub.local');
    expect(res.body.user.role).toBe('student');
  });

  it('GET /api/complaints should fail without authentication token', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('2. Cleanliness Complaints Management Workflow', () => {
  it('POST /api/complaints should allow student to submit a complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Geyser not heating in 3rd floor washroom',
        category: 'washroom',
        hostelBlock: 'Block A (Mandakini)',
        location: '3rd Floor East Wing',
        description: 'The instant water heater switch is not turning on. Cold water only.',
        priority: 'urgent',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.referenceNumber).toMatch(/^CLN-\d{4}-\d{4}$/);
    expect(res.body.complaint.status).toBe('submitted');
    expect(res.body.complaint.statusHistory).toHaveLength(1);
    testComplaintId = res.body.complaint._id;
  });

  it('GET /api/complaints/:id should return complaint details', async () => {
    const res = await request(app)
      .get(`/api/complaints/${testComplaintId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.complaint.title).toBe('Geyser not heating in 3rd floor washroom');
  });

  it('Students cannot update administrative status directly', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${testComplaintId}/status`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'resolved', note: 'Attempt by student' });
    expect(res.status).toBe(403);
  });

  it('Authorized staff can update complaint status to in_progress', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${testComplaintId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'in_progress',
        note: 'Electrician dispatched with replacement heating element.',
      });

    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('in_progress');
    expect(res.body.complaint.statusHistory.length).toBeGreaterThanOrEqual(2);
  });
});

describe('3. Mess Menu & Meal Reviews Workflow', () => {
  it('GET /api/mess/menu should return 7 days of menus', async () => {
    const res = await request(app).get('/api/mess/menu');
    expect(res.status).toBe(200);
    expect(res.body.menus.length).toBe(7);
  });

  it('POST /api/mess/reviews should allow student to review a meal', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/mess/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        mealType: 'dinner',
        date: today,
        rating: 5,
        comment: 'Excellent dinner today, well cooked and warm.',
      });

    expect(res.status).toBe(200);
    expect(res.body.review.rating).toBe(5);
  });

  it('Submitting review again for same student, meal, date updates existing review', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/mess/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        mealType: 'dinner',
        date: today,
        rating: 4,
        comment: 'Updated review: Good, but sweet dish was cold.',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('updated');
    expect(res.body.review.rating).toBe(4);
  });

  it('GET /api/mess/reviews should calculate average ratings and distribution', async () => {
    const res = await request(app).get('/api/mess/reviews');
    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.averageRating).toBeGreaterThan(0);
    expect(res.body.stats.totalCount).toBeGreaterThan(0);
  });
});

describe('4. Canteen Items & Availability', () => {
  it('GET /api/canteen/items should return available items', async () => {
    const res = await request(app).get('/api/canteen/items');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('GET /api/canteen/items?availability=available filters out unavailable items', async () => {
    const res = await request(app).get('/api/canteen/items?availability=available');
    expect(res.status).toBe(200);
    expect(res.body.items.every((item: any) => item.isAvailable)).toBe(true);
  });
});

describe('5. Official Contacts and Hostel Notices', () => {
  it('GET /api/contacts should return official verified contacts', async () => {
    const res = await request(app).get('/api/contacts');
    expect(res.status).toBe(200);
    expect(res.body.contacts.length).toBeGreaterThan(0);
    const rector = res.body.contacts.find((c: any) => c.roleName.includes('Rector'));
    expect(rector).toBeDefined();
    expect(rector.verificationStatus).toBe('verified');
  });

  it('GET /api/notices should return published notices with pinned first', async () => {
    const res = await request(app).get('/api/notices');
    expect(res.status).toBe(200);
    expect(res.body.notices.length).toBeGreaterThan(0);
    expect(res.body.notices[0].isPinned).toBe(true);
  });
});

describe('6. Notifications Center', () => {
  it('GET /api/notifications should return student notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.notifications).toBeDefined();
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/notifications/read-all should mark all notifications as read', async () => {
    const res = await request(app)
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(checkRes.body.unreadCount).toBe(0);
  });
});

describe('7. Administrative Overview', () => {
  it('GET /api/admin/overview should provide comprehensive system metrics for admin', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.overview.complaints.total).toBeGreaterThan(0);
    expect(res.body.overview.users.total).toBeGreaterThan(0);
  });

  it('Students should be denied access to /api/admin/overview', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });
});
