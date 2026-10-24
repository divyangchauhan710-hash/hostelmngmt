import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Brush,
  UtensilsCrossed,
  Coffee,
  Menu,
  X,
  Star,
  Info,
  PhoneCall,
  Bell,
  Shield,
  FileText,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isDrawerOpen,
  onCloseDrawer,
  onOpenDrawer,
}) => {
  const { user, logout } = useAuth();

  const isStaffOrAdmin =
    user && ['admin', 'rector', 'housekeeping', 'mess_staff', 'canteen_staff'].includes(user.role);

  const bottomNavItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Complaints', path: '/cleanliness', icon: Brush },
    { label: 'Mess', path: '/mess', icon: UtensilsCrossed },
    { label: 'Canteen', path: '/canteen', icon: Coffee },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Visible only on < lg screens) */}
      <nav
        aria-label="Mobile primary navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-surface-200/90 z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-brand-700 font-semibold' : 'text-surface-500 hover:text-surface-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5 stroke-[1.8]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium text-surface-500 hover:text-surface-800 transition-colors"
        >
          <Menu className="w-5 h-5 mb-0.5 stroke-[1.8]" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-out Mobile Drawer */}
      {isDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onCloseDrawer} />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-surface-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
                    H
                  </div>
                  <span className="font-semibold text-sm text-surface-900">HostelHub Menu</span>
                </div>
                <button
                  type="button"
                  onClick={onCloseDrawer}
                  className="p-1.5 text-surface-400 hover:text-surface-800 rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
                <div>
                  <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-surface-400 uppercase">
                    Hostel Services
                  </div>
                  <div className="space-y-1">
                    <NavLink
                      to="/dashboard"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-surface-500" />
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/cleanliness"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <Brush className="w-4 h-4 text-surface-500" />
                      <span>Cleanliness Complaints</span>
                    </NavLink>
                    <NavLink
                      to="/mess"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <UtensilsCrossed className="w-4 h-4 text-surface-500" />
                      <span>Mess Menu</span>
                    </NavLink>
                    <NavLink
                      to="/reviews"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <Star className="w-4 h-4 text-surface-500" />
                      <span>Meal Ratings & Reviews</span>
                    </NavLink>
                    <NavLink
                      to="/canteen"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <Coffee className="w-4 h-4 text-surface-500" />
                      <span>Canteen Menu</span>
                    </NavLink>
                    <NavLink
                      to="/hostel-info"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <Info className="w-4 h-4 text-surface-500" />
                      <span>Hostel Info & Rules</span>
                    </NavLink>
                    <NavLink
                      to="/rector"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <PhoneCall className="w-4 h-4 text-surface-500" />
                      <span>Rector & Wardens</span>
                    </NavLink>
                    <NavLink
                      to="/notifications"
                      onClick={onCloseDrawer}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <Bell className="w-4 h-4 text-surface-500" />
                      <span>Notifications</span>
                    </NavLink>
                  </div>
                </div>

                {isStaffOrAdmin && (
                  <div>
                    <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase">
                      Staff Administration
                    </div>
                    <div className="space-y-1">
                      <NavLink
                        to="/admin"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <Shield className="w-4 h-4 text-amber-700" />
                        <span>Admin Overview</span>
                      </NavLink>
                      <NavLink
                        to="/admin/complaints"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <Brush className="w-4 h-4 text-amber-700" />
                        <span>Manage Complaints</span>
                      </NavLink>
                      <NavLink
                        to="/admin/menus"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                        <span>Manage Menus</span>
                      </NavLink>
                      <NavLink
                        to="/admin/reviews"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <Star className="w-4 h-4 text-amber-700" />
                        <span>Review Moderation</span>
                      </NavLink>
                      <NavLink
                        to="/admin/contacts"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <PhoneCall className="w-4 h-4 text-amber-700" />
                        <span>Manage Contacts</span>
                      </NavLink>
                      <NavLink
                        to="/admin/notices"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <FileText className="w-4 h-4 text-amber-700" />
                        <span>Hostel Notices</span>
                      </NavLink>
                      <NavLink
                        to="/admin/users"
                        onClick={onCloseDrawer}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-950 hover:bg-amber-50"
                      >
                        <UserIcon className="w-4 h-4 text-amber-700" />
                        <span>Users & Roles</span>
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Drawer Profile & Sign Out */}
            <div className="p-4 border-t border-surface-100 bg-surface-50">
              <NavLink
                to="/profile"
                onClick={onCloseDrawer}
                className="flex items-center gap-2.5 mb-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                <div className="text-xs min-w-0">
                  <div className="font-semibold text-surface-900 truncate">{user?.name}</div>
                  <div className="text-surface-500 truncate">{user?.email}</div>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  onCloseDrawer();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
