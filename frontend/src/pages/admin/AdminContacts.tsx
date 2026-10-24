import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Mail,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { OfficialContact } from '../../types';

export const AdminContacts: React.FC = () => {
  const { success, error } = useToast();
  const [contacts, setContacts] = useState<OfficialContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<OfficialContact | null>(null);
  const [name, setName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ contacts: OfficialContact[] }>('/contacts');
      setContacts(res.contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRoleName('Warden');
    setDesignation('Assistant Professor & Hostel Warden');
    setDepartment('Hostel Administration');
    setPhone('+91 20 2550 7000');
    setEmail('warden@institution.ac.in');
    setOfficeLocation('Block A, Warden Office');
    setOfficeHours('05:00 PM – 07:00 PM (Daily)');
    setIsEmergency(false);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: OfficialContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRoleName(contact.roleName);
    setDesignation(contact.designation);
    setDepartment(contact.department || 'Hostel Administration');
    setPhone(contact.phone);
    setEmail(contact.email);
    setOfficeLocation(contact.officeLocation);
    setOfficeHours(contact.officeHours);
    setIsEmergency(contact.isEmergencyContact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name,
        roleName,
        designation,
        department,
        phone,
        email,
        officeLocation,
        officeHours,
        isEmergencyContact: isEmergency,
        verificationStatus: 'verified',
      };

      if (editingContact) {
        await api.put(`/contacts/${editingContact._id}`, payload);
        success('Contact details updated.');
      } else {
        await api.post('/contacts', payload);
        success('New official contact added.');
      }

      setIsModalOpen(false);
      fetchContacts();
    } catch (err: any) {
      error(err.message || 'Failed to save contact.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this official contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      success('Contact deleted.');
      fetchContacts();
    } catch (err: any) {
      error(err.message || 'Failed to delete contact.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Manage Official Contacts
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Maintain verified rector, warden, medical, and security contact details.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Official Contact
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Role & Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Location & Hours</th>
                <th className="py-3 px-4">Emergency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {contacts.map((c) => (
                <tr key={c._id} className="hover:bg-surface-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-surface-900">
                    <span className="text-[10px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded uppercase block w-fit mb-0.5">
                      {c.roleName}
                    </span>
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-surface-600 max-w-xs">{c.designation}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-surface-800 whitespace-nowrap">
                    {c.phone}
                  </td>
                  <td className="py-3.5 px-4 text-surface-600">{c.email}</td>
                  <td className="py-3.5 px-4 text-surface-600">
                    <div>{c.officeLocation}</div>
                    <div className="text-[11px] text-surface-400">{c.officeHours}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {c.isEmergencyContact ? (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
                        24x7 Emergency
                      </span>
                    ) : (
                      <span className="text-[10px] text-surface-500">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1 rounded text-surface-500 hover:text-surface-900 hover:bg-surface-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(c._id)}
                      className="p-1 rounded text-surface-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingContact ? 'Edit Official Contact' : 'Add Official Contact'}
          description="Institutional verified contacts published in student portal directory."
        >
          <form onSubmit={handleSaveContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contactRoleName" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Role Title *
                </label>
                <input
                  id="contactRoleName"
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Rector or Warden (Block A)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactName" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Suresh V. Kulkarni"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactDesignation" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Designation *
              </label>
              <input
                id="contactDesignation"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Chief Warden & Professor of Engineering"
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contactPhone" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Official Phone *
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 20 2550 7001"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Official Email *
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rector@institution.ac.in"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contactLocation" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Office Location *
                </label>
                <input
                  id="contactLocation"
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  placeholder="e.g. Admin Block, Room 101"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactHours" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Office Hours *
                </label>
                <input
                  id="contactHours"
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="e.g. 10:00 AM – 12:30 PM (Mon–Fri)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="isEmergencyCheck"
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="h-4 w-4 rounded border-surface-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="isEmergencyCheck" className="text-xs text-surface-700 select-none">
                Mark as 24x7 Emergency Contact
              </label>
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Contact
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
