import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { MessMenuDay, DayOfWeek, CanteenItem, CanteenCategory } from '../../types';

export const AdminMenus: React.FC = () => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'mess' | 'canteen'>('mess');

  // Mess Menu state
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [menuData, setMenuData] = useState<MessMenuDay | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Form strings for simple editing (one item per line)
  const [breakfastTiming, setBreakfastTiming] = useState('');
  const [breakfastItemsText, setBreakfastItemsText] = useState('');
  const [lunchTiming, setLunchTiming] = useState('');
  const [lunchItemsText, setLunchItemsText] = useState('');
  const [snacksTiming, setSnacksTiming] = useState('');
  const [snacksItemsText, setSnacksItemsText] = useState('');
  const [dinnerTiming, setDinnerTiming] = useState('');
  const [dinnerItemsText, setDinnerItemsText] = useState('');
  const [menuNotes, setMenuNotes] = useState('');

  // Canteen state
  const [canteenItems, setCanteenItems] = useState<CanteenItem[]>([]);
  const [canteenLoading, setCanteenLoading] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CanteenItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<CanteenCategory>('beverages');
  const [itemPrice, setItemPrice] = useState<number>(20);
  const [itemDesc, setItemDesc] = useState('');
  const [itemVeg, setItemVeg] = useState(true);
  const [itemPrep, setItemPrep] = useState('5-10 mins');
  const [savingItem, setSavingItem] = useState(false);

  // Fetch Mess Menu for selected day
  const fetchMenuDay = async (day: DayOfWeek) => {
    try {
      setMenuLoading(true);
      const res = await api.get<{ menu: MessMenuDay }>(`/mess/menu/${day}`);
      if (res.menu) {
        setMenuData(res.menu);
        setBreakfastTiming(res.menu.meals.breakfast.timing);
        setBreakfastItemsText(res.menu.meals.breakfast.items.map((i) => i.name).join('\n'));
        setLunchTiming(res.menu.meals.lunch.timing);
        setLunchItemsText(res.menu.meals.lunch.items.map((i) => i.name).join('\n'));
        setSnacksTiming(res.menu.meals.snacks.timing);
        setSnacksItemsText(res.menu.meals.snacks.items.map((i) => i.name).join('\n'));
        setDinnerTiming(res.menu.meals.dinner.timing);
        setDinnerItemsText(res.menu.meals.dinner.items.map((i) => i.name).join('\n'));
        setMenuNotes(res.menu.notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMenuLoading(false);
    }
  };

  // Fetch Canteen Items
  const fetchCanteenItems = async () => {
    try {
      setCanteenLoading(true);
      const res = await api.get<{ items: CanteenItem[] }>('/canteen/items');
      setCanteenItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCanteenLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mess') {
      fetchMenuDay(selectedDay);
    } else {
      fetchCanteenItems();
    }
  }, [activeTab, selectedDay]);

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMenu(true);
    try {
      const payload = {
        dayOfWeek: selectedDay,
        meals: {
          breakfast: {
            timing: breakfastTiming,
            items: breakfastItemsText
              .split('\n')
              .filter((s) => s.trim())
              .map((name) => ({ name: name.trim(), isVeg: true })),
          },
          lunch: {
            timing: lunchTiming,
            items: lunchItemsText
              .split('\n')
              .filter((s) => s.trim())
              .map((name) => ({ name: name.trim(), isVeg: true })),
          },
          snacks: {
            timing: snacksTiming,
            items: snacksItemsText
              .split('\n')
              .filter((s) => s.trim())
              .map((name) => ({ name: name.trim(), isVeg: true })),
          },
          dinner: {
            timing: dinnerTiming,
            items: dinnerItemsText
              .split('\n')
              .filter((s) => s.trim())
              .map((name) => ({ name: name.trim(), isVeg: true })),
          },
        },
        notes: menuNotes,
      };

      await api.put('/mess/menu', payload);
      success(`Mess menu for ${selectedDay} saved successfully.`);
      fetchMenuDay(selectedDay);
    } catch (err: any) {
      error(err.message || 'Failed to update mess menu.');
    } finally {
      setSavingMenu(false);
    }
  };

  const handleToggleAvailability = async (item: CanteenItem) => {
    try {
      await api.patch(`/canteen/items/${item._id}/availability`);
      setCanteenItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
      success(`${item.name} availability toggled.`);
    } catch (err: any) {
      error(err.message || 'Failed to update availability.');
    }
  };

  const handleDeleteCanteenItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this canteen item?')) return;
    try {
      await api.delete(`/canteen/items/${id}`);
      setCanteenItems((prev) => prev.filter((i) => i._id !== id));
      success('Item removed.');
    } catch (err: any) {
      error(err.message || 'Failed to delete item.');
    }
  };

  const handleSaveCanteenItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    try {
      const payload = {
        name: itemName,
        category: itemCategory,
        price: Number(itemPrice),
        description: itemDesc,
        isVeg: itemVeg,
        preparationTime: itemPrep,
      };

      if (editingItem) {
        await api.put(`/canteen/items/${editingItem._id}`, payload);
        success('Canteen item updated.');
      } else {
        await api.post('/canteen/items', payload);
        success('New canteen item created.');
      }

      setIsItemModalOpen(false);
      resetItemForm();
      fetchCanteenItems();
    } catch (err: any) {
      error(err.message || 'Failed to save canteen item.');
    } finally {
      setSavingItem(false);
    }
  };

  const openAddItemModal = () => {
    resetItemForm();
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: CanteenItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.price);
    setItemDesc(item.description);
    setItemVeg(item.isVeg);
    setItemPrep(item.preparationTime || '5-10 mins');
    setIsItemModalOpen(true);
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('beverages');
    setItemPrice(20);
    setItemDesc('');
    setItemVeg(true);
    setItemPrep('5-10 mins');
  };

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      {/* Header and Sub-tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Mess & Canteen Menu Administration
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Maintain daily breakfast, lunch, dinner offerings and live canteen availability.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-surface-200">
          <button
            type="button"
            onClick={() => setActiveTab('mess')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mess'
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-brand-700" />
            <span>Weekly Mess Menu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('canteen')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'canteen'
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>Canteen Items</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Mess Menu Editor */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          {/* Day selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader
              title={`Edit ${selectedDay.toUpperCase()} Menu`}
              subtitle="Enter one meal item per line. Items will be updated immediately in the student portal."
            />
            <CardContent>
              {menuLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <form onSubmit={handleSaveMenu} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Breakfast */}
                    <div className="p-4 rounded-xl border border-surface-200 bg-surface-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-surface-800">
                          Breakfast
                        </span>
                        <input
                          type="text"
                          value={breakfastTiming}
                          onChange={(e) => setBreakfastTiming(e.target.value)}
                          placeholder="Timing (e.g. 07:30 AM – 09:30 AM)"
                          className="px-2 py-1 text-xs rounded border border-surface-300 bg-white w-48"
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={breakfastItemsText}
                        onChange={(e) => setBreakfastItemsText(e.target.value)}
                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                        className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-white"
                      />
                    </div>

                    {/* Lunch */}
                    <div className="p-4 rounded-xl border border-surface-200 bg-surface-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-surface-800">
                          Lunch
                        </span>
                        <input
                          type="text"
                          value={lunchTiming}
                          onChange={(e) => setLunchTiming(e.target.value)}
                          placeholder="Timing (e.g. 12:30 PM – 02:30 PM)"
                          className="px-2 py-1 text-xs rounded border border-surface-300 bg-white w-48"
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={lunchItemsText}
                        onChange={(e) => setLunchItemsText(e.target.value)}
                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                        className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-white"
                      />
                    </div>

                    {/* Evening Snacks */}
                    <div className="p-4 rounded-xl border border-surface-200 bg-surface-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-surface-800">
                          Evening Snacks
                        </span>
                        <input
                          type="text"
                          value={snacksTiming}
                          onChange={(e) => setSnacksTiming(e.target.value)}
                          placeholder="Timing (e.g. 05:00 PM – 06:15 PM)"
                          className="px-2 py-1 text-xs rounded border border-surface-300 bg-white w-48"
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={snacksItemsText}
                        onChange={(e) => setSnacksItemsText(e.target.value)}
                        placeholder="Item 1&#10;Item 2"
                        className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-white"
                      />
                    </div>

                    {/* Dinner */}
                    <div className="p-4 rounded-xl border border-surface-200 bg-surface-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-surface-800">
                          Dinner
                        </span>
                        <input
                          type="text"
                          value={dinnerTiming}
                          onChange={(e) => setDinnerTiming(e.target.value)}
                          placeholder="Timing (e.g. 07:45 PM – 09:45 PM)"
                          className="px-2 py-1 text-xs rounded border border-surface-300 bg-white w-48"
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={dinnerItemsText}
                        onChange={(e) => setDinnerItemsText(e.target.value)}
                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                        className="w-full p-2 text-xs rounded-lg border border-surface-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                      Kitchen Notes / Special Service Notices
                    </label>
                    <input
                      id="notes"
                      type="text"
                      value={menuNotes}
                      onChange={(e) => setMenuNotes(e.target.value)}
                      placeholder="e.g. Special feast dinner served from 08:00 PM."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                    />
                  </div>

                  <div className="pt-2 border-t border-surface-100 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={savingMenu}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save {selectedDay.toUpperCase()} Menu
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Canteen Items Manager */}
      {activeTab === 'canteen' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              {canteenItems.length} Registered Canteen Items
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={openAddItemModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Canteen Item
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (INR)</th>
                    <th className="py-3 px-4">Preparation Time</th>
                    <th className="py-3 px-4">Live Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {canteenItems.map((item) => (
                    <tr key={item._id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-surface-900">
                        {item.name}
                        {item.description && (
                          <div className="text-[11px] text-surface-400 font-normal truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize text-surface-700 whitespace-nowrap">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-bold text-surface-900 whitespace-nowrap">
                        ₹{item.price}
                      </td>
                      <td className="py-3 px-4 text-surface-600 whitespace-nowrap">
                        {item.preparationTime || '5 mins'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                            item.isAvailable
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              <span>Available (Click to toggle)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-500" />
                              <span>Sold Out (Click to toggle)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditItemModal(item)}
                          className="p-1 rounded text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCanteenItem(item._id)}
                          className="p-1 rounded text-surface-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Item"
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
        </div>
      )}

      {/* Add / Edit Canteen Item Modal */}
      {isItemModalOpen && (
        <Modal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          title={editingItem ? 'Edit Canteen Item' : 'Add New Canteen Item'}
          description="Manage item name, category, price in Indian Rupees, and preparation time."
        >
          <form onSubmit={handleSaveCanteenItem} className="space-y-4">
            <div>
              <label htmlFor="canteenItemName" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Item Name *
              </label>
              <input
                id="canteenItemName"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Cold Coffee with Ice Cream"
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="canteenCategory" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  id="canteenCategory"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as CanteenCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
                >
                  <option value="beverages">Beverages</option>
                  <option value="snacks">Snacks</option>
                  <option value="quick_bites">Quick Bites</option>
                  <option value="meals">Meals</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div>
                <label htmlFor="canteenPrice" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Price in INR (₹) *
                </label>
                <input
                  id="canteenPrice"
                  type="number"
                  min="0"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="canteenPrep" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Preparation Time
              </label>
              <input
                id="canteenPrep"
                type="text"
                value={itemPrep}
                onChange={(e) => setItemPrep(e.target.value)}
                placeholder="e.g. 5-7 mins or Instant"
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
              />
            </div>

            <div>
              <label htmlFor="canteenDesc" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                id="canteenDesc"
                rows={2}
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Brief ingredients or culinary style..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white"
              />
            </div>

            <div className="pt-3 border-t border-surface-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsItemModalOpen(false)}
                disabled={savingItem}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={savingItem}>
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
