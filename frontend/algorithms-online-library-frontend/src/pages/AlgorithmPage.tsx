import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // предполагаем, что axios настроен в api
import { Algorithm } from '../types/Algorithm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardCopy, Edit, Trash2, EyeOff, Eye, Star } from 'lucide-react';
import { Heart } from 'lucide-react';
import {Review} from "../types/Review";

const AlgorithmPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
    const [copied, setCopied] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editTopic, setEditTopic] = useState('');
    const [editProgrammingLanguage, setEditProgrammingLanguage] = useState('');
    const [editDescription, setEditDescription] = useState(''); // Добавляем состояние для описания
    const [deleteMessage, setDeleteMessage] = useState<string | null>(null); // Состояние для сообщения после удаления
    const [isFavorite, setIsFavorite] = useState(false);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [reviews, setReviews] = useState<Review[]>([]); // Состояние для отзывов
    const [userReview, setUserReview] = useState<Review | null>(null); // Отзыв текущего пользователя
    const [newReviewText, setNewReviewText] = useState(''); // Текст нового отзыва
    const [newReviewRating, setNewReviewRating] = useState<number | null>(null); // Рейтинг нового отзыва

    useEffect(() => {
        const fetchAlgorithm = async () => {
            try {
                const response = await api.get(`/api/algorithms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("data = ", response.data)

                setAlgorithm(response.data);
                setIsPrivate(response.data.is_private);
                setEditTitle(response.data.title); // Установим начальное значение для формы редактирования
                setEditCode(response.data.code); // Установим начальное значение для формы редактирования
                setEditTopic(response.data.topic); // Установим начальное значение для topic
                setEditProgrammingLanguage(response.data.programming_language); // Установим начальное значение для programming_language
                setEditDescription(response.data.description || ''); // Устанавливаем описание
            } catch (error) {
                console.error('Error fetching algorithm:', error);
            }
        };

        fetchAlgorithm();
    }, [id, token]);

    const handleCopy = () => {
        if (algorithm?.code) {
            navigator.clipboard.writeText(algorithm.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const handleDelete = async () => {
        if (algorithm) {
            try {
                // Закрываем модальное окно сразу после клика
                setShowConfirmDelete(false);

                // Выполняем удаление алгоритма
                await api.delete(`/api/algorithms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Показать сообщение об успешном удалении
                setDeleteMessage('Successfully deleted!');

                // Редиректим на список алгоритмов через 1.5 секунды
                setTimeout(() => navigate('/my-algorithms'), 1500);
            } catch (error) {
                setDeleteMessage('Error deleting algorithm.');
                console.error('Error deleting algorithm:', error);
            }
        }
    };

    const handleTogglePrivacy = async () => {
        if (algorithm) {
            try {
                // Логируем текущее значение приватности
                console.log(`Current privacy status: ${isPrivate}`);

                const response = await api.patch(
                    `/api/algorithms/${id}`,
                    { is_private: !isPrivate },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Логируем ответ от сервера
                console.log('Response from server:', response);

                // Обновляем состояние
                setIsPrivate(!isPrivate);
            } catch (error) {
                // Логируем подробности ошибки
                console.error('Error updating privacy:', error);
                alert('Error updating privacy');
            }
        }
    };


    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleUpdateAlgorithm = async () => {
        if (!editTitle || !editCode || !editTopic || !editProgrammingLanguage) {
            alert('All fields (Title, Code, Topic, Programming Language) are required');
            return;
        }

        try {
            const updatedAlgorithm = {
                title: editTitle,
                code: editCode,
                topic: editTopic,
                programming_language: editProgrammingLanguage,
                description: editDescription, // Добавляем описание
            };

            const response = await api.put(`/api/algorithms/${id}`, updatedAlgorithm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAlgorithm(response.data); // Обновляем алгоритм на фронте
            setShowEditModal(false); // Закрываем модальное окно
        } catch (error) {
            console.error('Error updating algorithm:', error);
        }
    };

    // Загрузка отзывов при монтировании компонента
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await api.get(`/api/algorithms/review/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReviews(response.data);

                // Проверяем, есть ли отзыв от текущего пользователя
                const userID = localStorage.getItem('userID');
                if (userID) {
                    const userRev = response.data.find((r: Review) => r.user_id === parseInt(userID));
                    if (userRev) setUserReview(userRev);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, [id, token]);

    // Обработчик отправки отзыва
    const handleSubmitReview = async () => {
        if (!newReviewText && !newReviewRating) {
            alert('Please add text or rating');
            return;
        }

        try {
            const response = await api.post(
                `/api/algorithms/review/${id}`,
                {
                    review_text: newReviewText,
                    rating: newReviewRating,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Обновляем список отзывов
            setReviews([...reviews, response.data]);
            setUserReview(response.data);
            setNewReviewText('');
            setNewReviewRating(null);
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // Обработчик удаления отзыва
    const handleDeleteReview = async (reviewId: number) => {
        try {
            await api.delete(`/api/algorithms/review/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Обновляем список отзывов
            setReviews(reviews.filter(r => r.id !== reviewId));
            if (userReview?.id === reviewId) setUserReview(null);
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    // Обработчик обновления отзыва
    const handleUpdateReview = async () => {
        if (!userReview) return;

        try {
            const updatedReview = {
                review_text: newReviewText || userReview.review_text,
                rating: newReviewRating || userReview.rating,
            };

            const response = await api.put(
                `/api/algorithms/review/${userReview.id}`,
                updatedReview,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Обновляем список отзывов
            setReviews(reviews.map(r =>
                r.id === userReview.id ? response.data : r
            ));
            setUserReview(response.data);
            setNewReviewText('');
            setNewReviewRating(null);
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    if (!algorithm) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className={`container d-flex justify-content-center mt-5 ${deleteMessage ? 'opacity-20' : ''}`}>
            <div className="card shadow rounded-4 p-4" style={{ maxWidth: '800px', width: '100%' }}>
                <h2 className="mb-3 text-primary fw-bold">{algorithm.title}</h2>
                <p className="mb-1">
                    <strong>Topic:</strong> {algorithm.topic}
                </p>
                <p className="mb-3">
                    <strong>Author ID:</strong> {algorithm.user_id}
                </p>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center me-2"
                            onClick={handleEdit}
                        >
                            <Edit size={16} className="me-1" />
                            Edit
                        </button>

                        <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center me-2"
                            onClick={() => setShowConfirmDelete(true)}
                        >
                            <Trash2 size={16} className="me-1" />
                            Delete
                        </button>

                        <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center"
                            onClick={handleTogglePrivacy}
                        >
                            {isPrivate ? (
                                <>
                                    <EyeOff size={16} className="me-1" />
                                    Make Public
                                </>
                            ) : (
                                <>
                                    <Eye size={16} className="me-1" />
                                    Make Private
                                </>
                            )}
                        </button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            onClick={handleCopy}
                        >
                            <ClipboardCopy size={16} className="me-1" />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Добавляем отображение описания */}
                {algorithm.description && (
                    <div className="mb-3">
                        <h5 className="mb-2">Description</h5>
                        <div className="p-3 bg-light rounded-3">
                            {algorithm.description}
                        </div>
                    </div>
                )}

                <h5 className="m-0">Code</h5>
                <div className="position-relative mb-3">
                    <SyntaxHighlighter
                        language="cpp"
                        style={oneDark}
                        customStyle={{
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '0.9rem',
                        }}
                    >
                        {algorithm.code}
                    </SyntaxHighlighter>
                </div>


            </div>

            {/* Секция отзывов */}
            <div className="card shadow rounded-4 p-4 mt-4" style={{ maxWidth: '800px', width: '100%' }}>
                <h4 className="mb-4">Reviews</h4>

                {/* Форма для отзыва */}
                <div className="mb-4">
                    <h5>{userReview ? 'Edit your review' : 'Add a review'}</h5>
                    <div className="mb-3">
                        <label className="form-label">Rating (1-10)</label>
                        <div className="d-flex">
                            {[1, 2, 3, 4, 5].map(num => (
                                <Star
                                    key={num}
                                    size={24}
                                    className="me-1 cursor-pointer"
                                    fill={newReviewRating ? (num <= newReviewRating ? 'gold' : 'none') :
                                        (userReview?.rating ? (num <= userReview.rating ? 'gold' : 'none') : 'none')}
                                    onClick={() => setNewReviewRating(num)}
                                />
                            ))}
                        </div>
                    </div>
                    <textarea
                        className="form-control mb-3"
                        rows={3}
                        placeholder="Your review..."
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={userReview ? handleUpdateReview : handleSubmitReview}
                    >
                        {userReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    {userReview && (
                        <button
                            className="btn btn-danger ms-2"
                            onClick={() => handleDeleteReview(userReview.id)}
                        >
                            Delete Review
                        </button>
                    )}
                </div>

                {/* Список отзывов */}
                {reviews.length > 0 ? (
                    <div className="mt-4">
                        {reviews.map(review => (
                            <div key={review.id} className="card mb-3 p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <strong className="me-2">User #{review.user_id}</strong>
                                        {review.rating && (
                                            <div className="d-flex align-items-center">
                                                <Star size={16} fill="gold" className="me-1" />
                                                <span>{review.rating}/5</span>
                                            </div>
                                        )}
                                    </div>
                                    <small className="text-muted">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                                <p className="mb-0">{review.review_text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">No reviews yet. Be the first to review!</p>
                )}
            </div>

            {/* ... модальные окна и остальной код ... */}

            {/* Delete Confirmation */}
            {showConfirmDelete && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowConfirmDelete(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this algorithm?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowConfirmDelete(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success/Error Message */}
            {deleteMessage && (
                <div
                    className="alert alert-success mt-3"
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1050,
                        maxWidth: '600px',
                        width: '100%',
                        padding: '30px',
                        textAlign: 'center',
                        backgroundColor: '#d4edda',
                        borderColor: '#c3e6cb',
                        color: '#155724',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        opacity: 1,
                        transition: 'opacity 0.5s ease',
                    }}
                >
                    {deleteMessage}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Algorithm</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="form-control mb-3"
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    value={editTopic}
                                    onChange={(e) => setEditTopic(e.target.value)}
                                    className="form-control mb-3"
                                    placeholder="Topic"
                                />
                                <input
                                    type="text"
                                    value={editProgrammingLanguage}
                                    onChange={(e) => setEditProgrammingLanguage(e.target.value)}
                                    className="form-control mb-3"
                                    placeholder="Programming Language"
                                />
                                <textarea
                                    id="description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="form-control mb-3"
                                    rows={3}
                                    placeholder="Algorithm description"
                                />
                                <textarea
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                    className="form-control"
                                    rows={10}
                                    placeholder="Code"
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUpdateAlgorithm}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmPage;
