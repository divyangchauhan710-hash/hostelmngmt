import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { OfficialContact } from '../../types';

export const RectorPage: React.FC = () => {
  const [contacts, setContacts] = useState<OfficialContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        const res = await api.get<{ contacts: OfficialContact[] }>('/contacts');
        setContacts(res.contacts || []);
      } catch (err) {
        console.error('Failed to load contacts', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const emergencyContacts = contacts.filter((c) => c.isEmergencyContact);
  const generalContacts = contacts.filter((c) => !c.isEmergencyContact);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          Rector & Warden Directory
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Verified institutional contact details, office hours, and emergency response guidance.
        </p>
      </div>

      {/* Emergency Guidance Strip */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950">
        <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Official Guidance: </span>
          Use direct telephone links for urgent safety or medical matters. For non-urgent administrative queries, please observe designated walk-in office hours or send an email.
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Official Rector & Wardens Section */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span>Administrative Wardens & Rector</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalContacts.map((contact) => (
                <Card key={contact._id} className="p-5 flex flex-col justify-between hover:border-surface-300 transition-colors">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                          {contact.roleName}
                        </span>
                        <h3 className="text-base font-bold text-surface-900 mt-1.5 leading-snug">
                          {contact.name}
                        </h3>
                        <p className="text-xs text-surface-500">{contact.designation}</p>
                      </div>

                      {contact.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mt-4 pt-3 border-t border-surface-100 text-xs text-surface-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
                        <span>{contact.officeLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
                        <span>{contact.officeHours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clickable tel and mailto links */}
                  <div className="mt-4 pt-3 border-t border-surface-100 grid grid-cols-2 gap-2 text-xs">
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-surface-200 font-semibold text-surface-800 hover:bg-surface-50 hover:text-brand-800 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-brand-700" />
                      <span>Call Office</span>
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-surface-200 font-semibold text-surface-800 hover:bg-surface-50 hover:text-brand-800 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-700" />
                      <span>Send Email</span>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Emergency Contacts Section */}
          {emergencyContacts.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>24x7 Emergency & Health Services</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyContacts.map((contact) => (
                  <Card
                    key={contact._id}
                    className="p-5 border-l-4 border-l-amber-600 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {contact.roleName}
                          </span>
                          <h3 className="text-base font-bold text-surface-900 mt-1.5 leading-snug">
                            {contact.name}
                          </h3>
                          <p className="text-xs text-surface-500">{contact.designation}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-200">
                          24x7 Emergency
                        </span>
                      </div>

                      <div className="space-y-2 mt-4 pt-3 border-t border-surface-100 text-xs text-surface-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
                          <span>{contact.officeLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
                          <span>{contact.officeHours}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-2 text-xs">
                      <a
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-700 text-white font-bold hover:bg-amber-800 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial Emergency Line</span>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
