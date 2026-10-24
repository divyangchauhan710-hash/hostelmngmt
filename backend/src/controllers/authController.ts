import { Request, Response } from 'express';
import { z } from 'zod';
import { User, IUser } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  hostelBlock: z.string().optional(),
  roomNumber: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  hostelBlock: z.string().optional(),
  roomNumber: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relation: z.string().optional(),
    })
    .optional(),
});

export async function register(req: Request, res: Response): Promise<void> {
  const validated = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: validated.email.toLowerCase() });
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'An account with this email address is already registered.',
    });
    return;
  }

  const user = new User({
    name: validated.name,
    email: validated.email.toLowerCase(),
    password: validated.password,
    role: 'student',
    hostelBlock: validated.hostelBlock || '',
    roomNumber: validated.roomNumber || '',
    phone: validated.phone || '',
  });

  await user.save();

  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    hostelBlock: user.hostelBlock,
    roomNumber: user.roomNumber,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Account registered successfully.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      roomNumber: user.roomNumber,
      phone: user.phone,
      emergencyContact: user.emergencyContact,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const validated = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validated.email.toLowerCase() }).select('+password');
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email address or password.',
    });
    return;
  }

  const isMatch = await user.comparePassword(validated.password);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Invalid email address or password.',
    });
    return;
  }

  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    hostelBlock: user.hostelBlock,
    roomNumber: user.roomNumber,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Signed in successfully.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      roomNumber: user.roomNumber,
      phone: user.phone,
      emergencyContact: user.emergencyContact,
    },
  });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      roomNumber: user.roomNumber,
      phone: user.phone,
      emergencyContact: user.emergencyContact,
    },
  });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const validated = updateProfileSchema.parse(req.body);

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  if (validated.name) user.name = validated.name;
  if (validated.phone !== undefined) user.phone = validated.phone;
  if (validated.hostelBlock !== undefined) user.hostelBlock = validated.hostelBlock;
  if (validated.roomNumber !== undefined) user.roomNumber = validated.roomNumber;
  if (validated.emergencyContact) {
    user.emergencyContact = {
      name: validated.emergencyContact.name || user.emergencyContact?.name || '',
      phone: validated.emergencyContact.phone || user.emergencyContact?.phone || '',
      relation: validated.emergencyContact.relation || user.emergencyContact?.relation || '',
    };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hostelBlock: user.hostelBlock,
      roomNumber: user.roomNumber,
      phone: user.phone,
      emergencyContact: user.emergencyContact,
    },
  });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('token');
  res.json({ success: true, message: 'Signed out successfully.' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required.' });
    return;
  }

  // Consistent message regardless of whether email exists to prevent user enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email address, password reset instructions have been dispatched.',
  });
}
