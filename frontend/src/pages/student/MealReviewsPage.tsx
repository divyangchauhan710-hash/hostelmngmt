import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Calendar,
  Trash2,
  AlertCircle,
  ThumbsUp,
  User,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { MealReview, MealType } from '../../types';

export const MealReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [reviews, setReviews] = useState<MealReview[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ reviews: MealReview[]; stats: any }>('/mess/reviews');
      setReviews(res.reviews || []);
      setStats(res.stats || null);
    } catch (err) {
      console.error('Failed to load meal reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/mess/reviews', {
        mealType: selectedMeal,
        date: selectedDate,
        rating,
        comment: comment.trim(),
      });
      success(res.message || 'Meal review recorded successfully.');
      setComment('');
      fetchReviews();
    } catch (err: any) {
      error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/mess/reviews/${reviewId}`);
      success('Review deleted.');
      fetchReviews();
    } catch (err: any) {
      error(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
          Meal Ratings & Reviews
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Provide anonymous or named feedback to the kitchen staff to ensure taste, variety, and hygiene.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Review Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader
              title="Submit Meal Feedback"
              subtitle="Rate any meal you had today or yesterday"
            />
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Meal Type Selection */}
                <div>
                  <label htmlFor="mealType" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                    Select Meal *
                  </label>
                  <select
                    id="mealType"
                    value={selectedMeal}
                    onChange={(e) => setSelectedMeal(e.target.value as MealType)}
                    className="block w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label htmlFor="reviewDate" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                    Meal Date *
                  </label>
                  <input
                    id="reviewDate"
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>

                {/* 1-5 Star Rating Picker */}
                <div>
                  <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                    Your Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                        aria-label={`Rate ${starVal} out of 5 stars`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            starVal <= rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-surface-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-surface-800">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                {/* Text Review */}
                <div>
                  <label htmlFor="reviewComment" className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                    Optional Comments & Suggestions
                  </label>
                  <textarea
                    id="reviewComment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Sambar was hot and authentic, rice cooked perfectly. More green chutney would be great."
                    className="block w-full px-3 py-2 text-xs rounded-lg border border-surface-300 bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs"
                  isLoading={isSubmitting}
                >
                  Submit Meal Review
                </Button>
                <p className="text-[10px] text-surface-400 text-center">
                  Submitting again for the same date and meal will update your existing rating.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Actual Stored Statistics Card */}
          {stats && (
            <Card className="p-4">
              <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Overall Kitchen Rating
              </div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-extrabold text-surface-900 tracking-tight">
                  {stats.averageRating}
                </span>
                <div className="text-xs text-surface-500">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(stats.averageRating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-surface-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="mt-0.5 block">{stats.totalCount} student ratings</span>
                </div>
              </div>

              {/* Distribution bars */}
              <div className="space-y-1.5 text-xs text-surface-600">
                {[5, 4, 3, 2, 1].map((starNum) => {
                  const count = stats.distribution?.[starNum] || 0;
                  const pct = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;
                  return (
                    <div key={starNum} className="flex items-center gap-2">
                      <span className="w-4 font-mono font-medium text-right text-[11px]">
                        {starNum}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-[10px] text-surface-400 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Reviews Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Recent Student Reviews"
              subtitle="Latest verified meal reviews from dining hall residents"
            />
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-surface-200 rounded-xl space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="divide-y divide-surface-100">
                  {reviews.map((rev) => {
                    const isOwner = rev.studentId === user?.id || (user?._id && rev.studentId === user._id);
                    const isAdmin = user?.role === 'admin';

                    return (
                      <div key={rev._id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-surface-900">
                                {rev.studentName}
                              </span>
                              <span className="text-[11px] font-medium text-brand-800 bg-brand-50 border border-brand-200 px-1.5 py-0.2 rounded uppercase">
                                {rev.mealType}
                              </span>
                              <span className="text-[11px] text-surface-400">
                                {rev.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-amber-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-surface-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-surface-700 ml-1">
                                {rev.rating} / 5
                              </span>
                            </div>
                          </div>

                          {(isOwner || isAdmin) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev._id)}
                              className="text-surface-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Delete this review"
                              aria-label="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {rev.comment && (
                          <p className="text-xs text-surface-700 mt-2 bg-surface-50 p-2.5 rounded-lg border border-surface-100 leading-relaxed">
                            {rev.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Star}
                  title="No Meal Reviews Yet"
                  description="Be the first student to review today's lunch or dinner using the form on the left."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
