import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AuthModal } from '@/components/auth-modal';
import { useAuth } from '@/lib/auth-utils';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface Review {
    id: number;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
    can_edit: boolean;
    can_delete: boolean;
}

interface UserReview {
    id: number;
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
}

interface ProductReviewsProps {
    productSlug: string;
    isPurchased: boolean;
    initialReviews: Review[];
    averageRating: number;
    reviewsCount: number;
    userReview: UserReview | null;
}

export function ProductReviews({
    productSlug,
    isPurchased,
    initialReviews,
    averageRating,
    reviewsCount: initialReviewsCount,
    userReview: initialUserReview,
}: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [reviewsCount, setReviewsCount] = useState(initialReviewsCount);
    const [rating, setRating] = useState(averageRating);
    const [userReview, setUserReview] = useState<UserReview | null>(initialUserReview);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formRating, setFormRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleWriteReview = () => {
        if (!user) {
            setAuthModalOpen(true);
            return;
        }

        if (!isPurchased) {
            setError('Вы должны приобрести этот продукт, чтобы оставить отзыв.');
            return;
        }

        setIsFormOpen(true);
        setIsEditing(false);
        setFormRating(0);
        setReviewText('');
        setError(undefined);
    };

    const handleEditReview = () => {
        if (!userReview) return;

        setIsFormOpen(true);
        setIsEditing(true);
        setFormRating(userReview.rating);
        setReviewText(userReview.review_text);
        setError(undefined);
    };

    const handleSubmitReview = async () => {
        if (formRating === 0) {
            setError('Пожалуйста, выберите оценку.');
            return;
        }

        if (reviewText.trim().length < 10) {
            setError('Отзыв должен содержать хотя бы 10 символов.');
            return;
        }

        if (reviewText.trim().length > 2000) {
            setError('Отзыв не должен превышать 2000 символов.');
            return;
        }

        setIsSubmitting(true);
        setError(undefined);

        try {
            if (isEditing && userReview) {
                // Update existing review
                const response = await axios.put(`/reviews/${userReview.id}`, {
                    rating: formRating,
                    review_text: reviewText,
                });

                if (response.data.success) {
                    // Update user review
                    setUserReview({
                        ...userReview,
                        rating: formRating,
                        review_text: reviewText,
                        updated_at: response.data.review.updated_at,
                    });

                    // Update in reviews list
                    setReviews(reviews.map(r =>
                        r.id === userReview.id
                            ? { ...r, rating: formRating, review_text: reviewText, updated_at: response.data.review.updated_at }
                            : r
                    ));

                    // Recalculate average rating
                    const newAvg = reviews.reduce((sum, r) =>
                        sum + (r.id === userReview.id ? formRating : r.rating), 0
                    ) / reviews.length;
                    setRating(newAvg);

                    setIsFormOpen(false);
                }
            } else {
                // Create new review
                const response = await axios.post(`/products/${productSlug}/reviews`, {
                    rating: formRating,
                    review_text: reviewText,
                });

                if (response.data.success) {
                    const newReview: Review = {
                        id: response.data.review.id,
                        user: {
                            id: response.data.review.user.id,
                            name: response.data.review.user.name,
                            avatar: response.data.review.user.avatar_url,
                        },
                        rating: response.data.review.rating,
                        review_text: response.data.review.review_text,
                        created_at: response.data.review.created_at,
                        updated_at: response.data.review.created_at,
                        can_edit: true,
                        can_delete: true,
                    };

                    // Add to reviews list
                    setReviews([newReview, ...reviews]);
                    setReviewsCount(reviewsCount + 1);

                    // Set user review
                    setUserReview({
                        id: response.data.review.id,
                        rating: formRating,
                        review_text: reviewText,
                        created_at: response.data.review.created_at,
                        updated_at: response.data.review.created_at,
                    });

                    // Recalculate average rating
                    const newAvg = (rating * reviewsCount + formRating) / (reviewsCount + 1);
                    setRating(newAvg);

                    setIsFormOpen(false);
                }
            }
        } catch (error: any) {
            console.error('Ошибка при отправке отзыва:', error);
            setError(
                error.response?.data?.message ||
                    'Ошибка при отправке отзыва. Попробуйте еще раз.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            return;
        }

        try {
            const response = await axios.delete(`/reviews/${reviewId}`);

            if (response.data.success) {
                // Remove from reviews list
                const deletedReview = reviews.find(r => r.id === reviewId);
                const newReviews = reviews.filter(r => r.id !== reviewId);
                setReviews(newReviews);
                setReviewsCount(reviewsCount - 1);

                // Clear user review if it was their own
                if (userReview && userReview.id === reviewId) {
                    setUserReview(null);
                }

                // Recalculate average rating
                if (newReviews.length > 0 && deletedReview) {
                    const newAvg = (rating * reviewsCount - deletedReview.rating) / (reviewsCount - 1);
                    setRating(newAvg);
                } else {
                    setRating(0);
                }
            }
        } catch (error: any) {
            console.error('Ошибка при удалении отзыва:', error);
            alert('Ошибка при удалении отзыва. Попробуйте еще раз.');
        }
    };

    return (
        <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-foreground/10 backdrop-blur-sm">
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Отзывы</h2>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                        star <= Math.round(rating)
                                            ? 'fill-yellow-500 text-yellow-500'
                                            : 'text-muted-foreground/30'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {rating.toFixed(1)} из 5 ({reviewsCount} отзывов)
                        </span>
                    </div>
                </div>
                {!isFormOpen && (
                    <>
                        {userReview ? (
                            <Button
                                variant="outline"
                                onClick={handleEditReview}
                                className="cursor-pointer border-primary/40 bg-transparent transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Изменить свой отзыв
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleWriteReview}
                                disabled={!user || !isPurchased}
                                title={
                                    !user
                                        ? 'Войдите, чтобы оставить отзыв'
                                        : !isPurchased
                                        ? 'Вы должны приобрести этот продукт, чтобы оставить отзыв'
                                        : 'Оставить отзыв'
                                }
                                className="cursor-pointer border-primary/40 bg-transparent transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {!user ? 'Авторизуйтесь' : !isPurchased ? 'Вы должны приобрести этот продукт, чтобы оставить отзыв' : 'Оставить отзыв'}
                            </Button>
                        )}
                    </>
                )}
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {isFormOpen && (
                <div className="mb-6 rounded-lg bg-muted/30 p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                        {isEditing ? 'Изменить свой отзыв' : 'Оставить отзыв'}
                    </h3>

                    {/* Rating selector */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">
                            Оценка *
                        </label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${
                                        star <= (hoverRating || formRating)
                                            ? 'fill-yellow-500 text-yellow-500'
                                            : 'text-muted-foreground/30 hover:text-yellow-500/50'
                                    }`}
                                    onClick={() => setFormRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Review text */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium">
                            Ваш отзыв * (10-2000 символов)
                        </label>
                        <Textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Поделитесь своим опытом об этом продукте..."
                            className="min-h-[120px] resize-none"
                            maxLength={2000}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            {reviewText.length}/2000 символов
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isSubmitting
                                ? 'Отправка...'
                                : isEditing
                                ? 'Обновить отзыв'
                                : 'Оставить отзыв'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsFormOpen(false);
                                setError(undefined);
                            }}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                        Нет отзывов. Будьте первым, кто оставит отзыв о этом продукте!
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-lg bg-muted/30 p-4"
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/20 text-primary">
                                            {review.user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">
                                            {review.user.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-3 w-3 ${
                                                            star <= review.rating
                                                                ? 'fill-yellow-500 text-yellow-500'
                                                                : 'text-muted-foreground/30'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    review.created_at,
                                                ).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {review.can_delete && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {review.review_text}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
