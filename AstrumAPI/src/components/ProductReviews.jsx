import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductReviews.css';

function ProductReviews() {
    const { productId } = useParams();
    const { user, isAuthenticated } = useContext(CartContext);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [showOptions, setShowOptions] = useState(null); // <--- Важно
    const reviewsPerPage = 5;

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) {
                setError('ID продукта не указан');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:5000/api/review/${productId}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || `Ошибка сервера: ${res.status}`);
                }
                const data = await res.json();
                setReviews(data);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить отзывы');
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            setError('Пожалуйста, войдите в аккаунт, чтобы оставить отзыв');
            toast.error('Войдите в аккаунт');
            return;
        }

        if (newReview.rating < 1) {
            setError('Пожалуйста, выберите рейтинг');
            toast.error('Выберите рейтинг');
            return;
        }

        if (!newReview.comment.trim()) {
            setError('Комментарий не может быть пустым');
            toast.error('Комментарий не может быть пустым');
            return;
        }

        if (newReview.comment.length > 500) {
            setError('Комментарий не может превышать 500 символов');
            toast.error('Комментарий слишком длинный');
            return;
        }

        const reviewData = {
            userId: user.userId,
            productId: parseInt(productId),
            rating: newReview.rating,
            comment: newReview.comment,
        };

        try {
            setError(null);
            const res = await fetch('http://localhost:5000/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
                },
                body: JSON.stringify(reviewData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Не удалось добавить отзыв');
            }

            const savedReview = await res.json();
            setReviews([savedReview, ...reviews]);
            setNewReview({ rating: 0, comment: '' });
            setHoveredRating(0);
            toast.success('Отзыв добавлен');
        } catch (err) {
            setError(err.message || 'Не удалось добавить отзыв');
            console.error('Ошибка:', err);
            toast.error(err.message || 'Ошибка при добавлении отзыва');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!isAuthenticated()) {
            toast.error('Войдите в аккаунт, чтобы удалить отзыв');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/review/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'UserId': user.userId.toString(),
                    ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Не удалось удалить отзыв');
            }

            setReviews(reviews.filter((review) => review.reviewId !== reviewId));
            toast.success('Отзыв удалён');
        } catch (err) {
            console.error('Ошибка:', err);
            toast.error(err.message || 'Ошибка при удалении отзыва');
        }
    };

    const renderStars = (value, onClick = null, hoverState = false) => {
        const displayedRating = hoverState && hoveredRating !== 0 ? hoveredRating : value;

        return (
            <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`star-icon ${displayedRating >= star ? 'selected' : ''}`}
                        onMouseEnter={() => hoverState && setHoveredRating(star)}
                        onMouseLeave={() => hoverState && setHoveredRating(0)}
                        onClick={() => onClick && setNewReview({ ...newReview, rating: star })}
                        viewBox="0 0 100 100"
                        width="36"
                        height="36"
                    >
                        <polygon
                            className="star-shape"
                            points="50,5 58,42 95,50 58,58 50,95 42,58 5,50 42,42"
                        />
                    </svg>
                ))}
            </div>
        );
    };

    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    const paginatedReviews = reviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);

    return (
        <div className="product-reviews">
            <h2 className="reviews-title">Отзывы покупателей</h2>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label className="form-label">Ваша оценка:</label>
                    {renderStars(newReview.rating, true, true)}
                </div>

                <div className="form-group">
                    <label className="form-label">Комментарий (макс. 500 символов):</label>
                    <textarea
                        className="form-textarea"
                        rows={4}
                        placeholder="Напишите ваш отзыв..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        maxLength={500}
                        required
                    />
                    <p className="char-count">{newReview.comment.length}/500</p>
                </div>

                <button type="submit" className="submit-button-reviwes" disabled={!isAuthenticated()}>
                    Отправить отзыв
                </button>
            </form>

            {loading ? (
                <p className="loading-message">Загрузка отзывов...</p>
            ) : reviews.length === 0 && !error ? (
                <p className="no-reviews">Отзывов пока нет. Будьте первым!</p>
            ) : (
                <div className="reviews-list">
                    {paginatedReviews.map((review) => {
                        const isOwner = user && user.userId === review.userId;

                        return (
                            <div key={review.reviewId} className="review-item">
                                <div className="review-header">
                                    <span className="review-user">{review.userName || 'Пользователь'}</span>
                                    {renderStars(review.rating)}
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <div className="review-footer">
                                    <span className="review-date">
                                        {new Date(review.reviewDate).toLocaleDateString()}
                                    </span>

                                    {isOwner && (
                                        <div className="review-actions">
                                            <button
                                                className="more-button"
                                                onClick={() =>
                                                    setShowOptions(prev =>
                                                        prev === review.reviewId ? null : review.reviewId
                                                    )
                                                }
                                            >
                                                ⋯
                                            </button>

                                            {showOptions === review.reviewId && (
                                                <div className="review-dropdown">
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDelete(review.reviewId)}
                                                    >
                                                        Удалить отзыв
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="pagination-button"
                    >
                        Предыдущая
                    </button>
                    <span className="pagination-info">
                        Страница {page} из {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="pagination-button"
                    >
                        Следующая
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductReviews;
