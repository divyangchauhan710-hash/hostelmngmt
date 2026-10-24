import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Star,
  Info,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { MessMenuDay, DayOfWeek, MealSection } from '../../types';

export const MessMenuPage: React.FC = () => {
  const [weeklyMenus, setWeeklyMenus] = useState<MessMenuDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [loading, setLoading] = useState(true);

  const daysOrder: { key: DayOfWeek; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  // Set today's day on initial render
  useEffect(() => {
    const dayIndex = new Date().getDay();
    const mapDays: DayOfWeek[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    setSelectedDay(mapDays[dayIndex]);
  }, []);

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const res = await api.get<{ menus: MessMenuDay[] }>('/mess/menu');
        setWeeklyMenus(res.menus || []);
      } catch (err) {
        console.error('Failed to load mess menus', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const activeMenu = weeklyMenus.find((m) => m.dayOfWeek === selectedDay);

  const renderMealSection = (title: string, section: MealSection | undefined) => {
    if (!section) return null;
    return (
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs hover:border-surface-300 transition-colors">
        <div className="p-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-surface-900 tracking-tight">{title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-surface-400" />
              <span>{section.timing}</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
            {section.items.length} items
          </span>
        </div>
        <div className="p-4">
          <ul className="space-y-3">
            {section.items.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      item.isVeg
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-amber-700 bg-amber-50 text-amber-800'
                    }`}
                    title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-amber-700'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-surface-900">{item.name}</div>
                    {item.description && (
                      <div className="text-[11px] text-surface-500 mt-0.5">{item.description}</div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Rate action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Weekly Mess Menu
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Nutritious four-meal dining schedule prepared at Central Dining Hall.
          </p>
        </div>
        <Link to="/reviews">
          <Button variant="primary" leftIcon={<Star className="w-4 h-4" />}>
            Rate Today's Meal & Reviews
          </Button>
        </Link>
      </div>

      {/* Day Selector Tabs */}
      <Card className="p-2 sm:p-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
          {daysOrder.map((day) => {
            const isSelected = selectedDay === day.key;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDay(day.key)}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                <span>{day.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Meals Grid for Selected Day */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : activeMenu ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {renderMealSection('Breakfast', activeMenu.meals.breakfast)}
            {renderMealSection('Lunch', activeMenu.meals.lunch)}
            {renderMealSection('Evening Snacks', activeMenu.meals.snacks)}
            {renderMealSection('Dinner', activeMenu.meals.dinner)}
          </div>

          {/* Kitchen Notes & Hygiene Notice */}
          <div className="p-4 rounded-xl border border-surface-200 bg-surface-50 flex items-start gap-3 text-xs text-surface-600">
            <Info className="w-4 h-4 text-brand-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-surface-800">Mess Operating Guidelines: </span>
              {activeMenu.notes ||
                'Sanitized stainless steel cutlery is provided at dining hall entrance. Please avoid food wastage.'}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title={`No Menu Published for ${selectedDay.toUpperCase()}`}
          description="The mess warden has not published the dining schedule for this day yet."
        />
      )}
    </div>
  );
};
