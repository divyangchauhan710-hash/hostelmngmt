import React, { useState, useEffect } from 'react';
import { Star, Trash2, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { MealReview } from '../../types';

export const AdminReviews: React.FC = () => {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<MealReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealFilter, setMealFilter] = useState('all');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = mealFilter === 'all' ? '/mess/reviews' : `/mess/reviews?mealType=${mealFilter}`;
      const res = await api.get<{ reviews: MealReview[] }>(url);
      setReviews(res.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [mealFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to moderate and remove this review?')) return;
    try {
      await api.delete(`/mess/reviews/${id}`);
      success('Review removed by moderator.');
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
            Meal Review Moderation
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Monitor student dining feedback and remove abusive or inappropriate submissions.
          </p>
        </div>

        <select
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-lg border border-surface-300 bg-white"
          aria-label="Filter reviews by meal"
        >
          <option value="all">All Meals</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="snacks">Evening Snacks</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      <Card>
        <CardHeader
          title="Submitted Reviews"
          subtitle={`${reviews.length} student ratings recorded`}
        />
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="divide-y divide-surface-100">
              {reviews.map((r) => (
                <div key={r._id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-surface-900">{r.studentName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded">
                        {r.mealType}
                      </span>
                      <span className="text-[11px] text-surface-400">{r.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-surface-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-surface-700 ml-1">{r.rating}/5</span>
                    </div>

                    {r.comment && (
                      <p className="text-xs text-surface-700 mt-1 leading-relaxed bg-surface-50 p-2.5 rounded-lg border border-surface-100">
                        {r.comment}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(r._id)}
                    className="text-surface-400 hover:text-rose-600 p-1.5 rounded transition-colors flex-shrink-0"
                    title="Moderate and delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="No Reviews Found"
              description="No meal reviews exist under the selected meal category."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
