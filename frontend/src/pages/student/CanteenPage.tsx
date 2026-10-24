import React, { useState, useEffect } from 'react';
import {
  Search,
  Coffee,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { CanteenItem, CanteenCategory } from '../../types';

export const CanteenPage: React.FC = () => {
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  const fetchCanteenItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get<{ items: CanteenItem[] }>(`/canteen/items?${params.toString()}`);
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load canteen items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanteenItems();
  }, [categoryFilter, availabilityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCanteenItems();
  };

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Items' },
    { key: 'beverages', label: 'Beverages & Chai' },
    { key: 'snacks', label: 'Snacks' },
    { key: 'quick_bites', label: 'Quick Bites & Sandwiches' },
    { key: 'meals', label: 'Meals & Combos' },
    { key: 'desserts', label: 'Desserts' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          Canteen Menu & Availability
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Student Activity Complex cafeteria • Check live item availability and pricing in INR.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 sm:p-4 space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat.key
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search and Availability selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-surface-100">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chai, samosa, sandwich..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-700 bg-white"
            />
          </form>

          <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <span className="text-xs font-medium text-surface-500 whitespace-nowrap">Filter:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700 flex-1 sm:flex-none"
              aria-label="Filter availability"
            >
              <option value="all">All Items</option>
              <option value="available">Available Now Only</option>
              <option value="unavailable">Sold Out / Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Canteen Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item._id}
              className={`p-4 flex flex-col justify-between transition-all ${
                !item.isAvailable ? 'opacity-70 bg-surface-50/60' : 'hover:border-surface-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Veg / Non-veg indicator */}
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
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
                    <h3 className="font-semibold text-sm text-surface-900 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Availability Badge with explicit text */}
                  {item.isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      <span>Available</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      <XCircle className="w-3 h-3 text-rose-500" />
                      <span>Sold Out</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-surface-600 line-clamp-2 mb-3 leading-relaxed">
                  {item.description || 'Prepared fresh upon order at the canteen grill.'}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-surface-500">
                  <Clock className="w-3.5 h-3.5 text-surface-400" />
                  <span>{item.preparationTime || '5-10 mins'}</span>
                </div>
                <div className="text-base font-bold text-surface-900">
                  ₹{item.price}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Coffee}
          title="No Canteen Items Found"
          description="Try selecting a different category or clearing your search term."
          actionText="Show All Items"
          onAction={() => {
            setCategoryFilter('all');
            setAvailabilityFilter('all');
            setSearch('');
          }}
        />
      )}
    </div>
  );
};
