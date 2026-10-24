import React, { useState, useEffect } from 'react';
import { User, Search, Shield, UserCheck, Mail, Building } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { User as UserType, UserRole } from '../../types';

export const AdminUsers: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get<{ users: UserType[] }>(`/admin/users?${params.toString()}`);
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      success(`User role adjusted to ${newRole.replace('_', ' ')}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId || u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      error(err.message || 'Failed to update user role.');
    }
  };

  const roles: UserRole[] = [
    'student',
    'rector',
    'housekeeping',
    'mess_staff',
    'canteen_staff',
    'admin',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          User & Role Administration
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          View all registered hostel residents and staff members. Assign role-based access privileges.
        </p>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, room..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700 self-start sm:self-auto"
            aria-label="Filter role"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="rector">Rector / Warden</option>
            <option value="housekeeping">Housekeeping Staff</option>
            <option value="mess_staff">Mess Staff</option>
            <option value="canteen_staff">Canteen Staff</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </Card>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Block & Room</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4 text-right">Adjust Access Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((u) => {
                const uid = u.id || u._id || '';
                return (
                  <tr key={uid} className="hover:bg-surface-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-surface-900 whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 text-surface-600">{u.email}</td>
                    <td className="py-3.5 px-4 text-surface-600 whitespace-nowrap">
                      {u.hostelBlock || '—'} {u.roomNumber ? `• ${u.roomNumber}` : ''}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-surface-600 whitespace-nowrap">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded capitalize">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(uid, e.target.value as UserRole)}
                        className="text-xs py-1 px-2 rounded-lg border border-surface-300 bg-white font-medium text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
                        aria-label="Change role"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
