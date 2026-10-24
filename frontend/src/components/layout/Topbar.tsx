import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  Menu,
  ChevronDown,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { user, switchDemoAccount } = useAuth();
  const { info } = useToast();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUnread() {
      if (!user) return;
      try {
        const res = await api.get<{ unreadCount: number }>('/notifications');
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        // Silent catch for background notification poll
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const getPageTitle = (path: string): string => {
    if (path.startsWith('/cleanliness/new')) return 'Report Issue';
    if (path.startsWith('/cleanliness/')) return 'Complaint Details';
    if (path.startsWith('/cleanliness')) return 'Cleanliness Complaints';
    if (path.startsWith('/mess')) return 'Mess Menu';
    if (path.startsWith('/reviews')) return 'Meal Ratings & Reviews';
    if (path.startsWith('/canteen')) return 'Canteen Menu & Availability';
    if (path.startsWith('/hostel-info')) return 'Hostel Information & Rules';
    if (path.startsWith('/rector')) return 'Rector & Warden Contacts';
    if (path.startsWith('/notifications')) return 'Notification Center';
    if (path.startsWith('/profile')) return 'Student Profile';
    if (path.startsWith('/admin/complaints')) return 'Manage Complaints';
    if (path.startsWith('/admin/menus')) return 'Manage Menus & Canteen';
    if (path.startsWith('/admin/reviews')) return 'Review Moderation';
    if (path.startsWith('/admin/contacts')) return 'Manage Official Contacts';
    if (path.startsWith('/admin/notices')) return 'Manage Hostel Notices';
    if (path.startsWith('/admin/users')) return 'User & Role Directory';
    if (path.startsWith('/admin')) return 'Administrative Overview';
    return 'Dashboard';
  };

  const handleRoleSwitch = async (role: UserRole) => {
    setShowRoleMenu(false);
    try {
      await switchDemoAccount(role);
      info(`Switched role to ${role.replace('_', ' ')} for demonstration.`);
    } catch (err) {
      // Handled in auth
    }
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'student', label: 'Student', desc: 'Aarav Patel (Room A-304)' },
    { role: 'rector', label: 'Rector / Warden', desc: 'Dr. Suresh V. Kulkarni' },
    { role: 'housekeeping', label: 'Housekeeping Staff', desc: 'Rameshwar Yadav' },
    { role: 'mess_staff', label: 'Mess Staff', desc: 'Chef Manmohan Singh' },
    { role: 'canteen_staff', label: 'Canteen Staff', desc: 'Kailash Joshi' },
    { role: 'admin', label: 'Administrator', desc: 'Hostel System Admin' },
  ];

  return (
    <header className="h-16 bg-white border-b border-surface-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-surface-900 tracking-tight leading-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="text-[11px] text-surface-400 font-medium hidden sm:block">
            HostelHub Services Portal
          </div>
        </div>
      </div>

      {/* Right: Quick Demo Role Switcher, Notification Bell & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/80 hover:bg-amber-100/70 text-amber-900 text-xs font-medium transition-colors"
            title="Switch Demo Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden md:inline">Role:</span>
            <span className="font-semibold capitalize">{user?.role?.replace('_', ' ')}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-surface-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-2 border-b border-surface-100 text-[11px] font-semibold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Role Switcher</span>
              </div>
              <div className="py-1">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleSwitch(item.role)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-surface-50 transition-colors ${
                      user?.role === item.role ? 'bg-brand-50 text-brand-900 font-semibold' : 'text-surface-700'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[11px] text-surface-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <NavLink
          to="/notifications"
          className="relative p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        {/* User initials / quick profile */}
        <NavLink
          to="/profile"
          className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-semibold hover:bg-brand-800 transition-colors shadow-xs"
          title="Account Profile"
        >
          {user?.name?.slice(0, 1).toUpperCase() || 'U'}
        </NavLink>
      </div>
    </header>
  );
};
