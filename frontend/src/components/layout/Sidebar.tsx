import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Brush,
  UtensilsCrossed,
  Star,
  Coffee,
  Info,
  PhoneCall,
  Bell,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const isStaffOrAdmin =
    user && ['admin', 'rector', 'housekeeping', 'mess_staff', 'canteen_staff'].includes(user.role);

  const studentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Cleanliness', path: '/cleanliness', icon: Brush },
    { label: 'Mess Menu', path: '/mess', icon: UtensilsCrossed },
    { label: 'Meal Reviews', path: '/reviews', icon: Star },
    { label: 'Canteen', path: '/canteen', icon: Coffee },
    { label: 'Hostel Info', path: '/hostel-info', icon: Info },
    { label: 'Rector & Wardens', path: '/rector', icon: PhoneCall },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const adminNavItems = [
    { label: 'Overview', path: '/admin', icon: Shield },
    { label: 'Complaints Hub', path: '/admin/complaints', icon: Brush },
    { label: 'Menu & Canteen', path: '/admin/menus', icon: UtensilsCrossed },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Official Contacts', path: '/admin/contacts', icon: PhoneCall },
    { label: 'Notices & Alerts', path: '/admin/notices', icon: FileText },
    { label: 'User Directory', path: '/admin/users', icon: UserIcon },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-200/90 h-screen sticky top-0 flex-shrink-0 z-30 select-none">
      {/* Brand Wordmark */}
      <div className="h-16 flex items-center px-6 border-b border-surface-100">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-brand-800 transition-colors">
            H
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-surface-900 block leading-tight">
              HostelHub
            </span>
            <span className="text-[10px] text-surface-400 font-medium tracking-wide uppercase">
              Hostel Portal
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-surface-400 uppercase">
            Services
          </div>
          <nav className="space-y-1">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-900 font-semibold'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isStaffOrAdmin && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-amber-700 uppercase flex items-center justify-between">
              <span>Administration</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                Staff
              </span>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-50 text-amber-950 font-semibold'
                          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 stroke-[1.8]" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User info & Logout */}
      <div className="p-3 border-t border-surface-100 bg-surface-50/50">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-surface-200"
        >
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 border border-brand-200 flex items-center justify-center font-semibold text-xs flex-shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-surface-900 truncate">{user?.name}</div>
            <div className="text-[11px] text-surface-500 capitalize truncate">
              {user?.role?.replace('_', ' ')} {user?.roomNumber ? `• ${user.roomNumber}` : ''}
            </div>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-surface-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
