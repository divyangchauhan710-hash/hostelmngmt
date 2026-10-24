import { Request, Response } from 'express';
import { z } from 'zod';
import { OfficialContact } from '../models/OfficialContact.js';
import { AuthRequest } from '../middleware/auth.js';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  roleName: z.string().min(2, 'Role name is required'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string().optional(),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  officeLocation: z.string().min(2, 'Office location is required'),
  officeHours: z.string().optional(),
  isEmergencyContact: z.boolean().default(false),
  verificationStatus: z.enum(['verified', 'pending']).default('verified'),
  order: z.number().default(0),
});

export async function getOfficialContacts(req: Request, res: Response): Promise<void> {
  const { emergencyOnly } = req.query;

  const filter: any = {};
  if (emergencyOnly === 'true') {
    filter.isEmergencyContact = true;
  }

  const contacts = await OfficialContact.find(filter).sort({ order: 1, name: 1 });

  res.json({
    success: true,
    contacts,
  });
}

export async function getOfficialContactById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const contact = await OfficialContact.findById(id);

  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found.' });
    return;
  }

  res.json({
    success: true,
    contact,
  });
}

export async function createOfficialContact(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'rector') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only rector and administrators can manage official contacts.',
    });
    return;
  }

  const validated = contactSchema.parse(req.body);

  const contact = new OfficialContact({
    ...validated,
    lastVerifiedAt: new Date(),
  });

  await contact.save();

  res.status(201).json({
    success: true,
    message: 'Official contact created successfully.',
    contact,
  });
}

export async function updateOfficialContact(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'rector') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only rector and administrators can modify official contacts.',
    });
    return;
  }

  const { id } = req.params;
  const validated = contactSchema.partial().parse(req.body);

  const contact = await OfficialContact.findById(id);
  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found.' });
    return;
  }

  Object.assign(contact, validated, { lastVerifiedAt: new Date() });
  await contact.save();

  res.json({
    success: true,
    message: 'Official contact updated successfully.',
    contact,
  });
}

export async function deleteOfficialContact(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'rector') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only rector and administrators can delete official contacts.',
    });
    return;
  }

  const { id } = req.params;
  const contact = await OfficialContact.findByIdAndDelete(id);
  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found.' });
    return;
  }

  res.json({
    success: true,
    message: 'Contact deleted successfully.',
  });
}
