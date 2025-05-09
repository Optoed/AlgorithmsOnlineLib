import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlgorithms, toggleFavorite } from '../services/algorithmService';
import SearchForm from './SearchForm';
import { Algorithm } from '../types/Algorithm';
import { Spinner } from 'react-bootstrap';


const HomePage: React.FC = () => {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingFavorites, setUpdatingFavorites] = useState<Record<number, boolean>>({});
    const token = localStorage.getItem('token');

    const HeartIcon = ({ filled }: { filled: boolean }) => (
        <span style={{ color: filled ? 'red' : 'gray' }}>
            {filled ? '❤️' : '🤍'}
        </span>
    );

    useEffect(() => {
        const loadAlgorithms = async () => {
            try {
                setLoading(true);
                setError(null);

                if (token) {
                    const data = await fetchAlgorithms(token);
                    console.log("data = ", data)
                    if (Array.isArray(data)) {
                        setAlgorithms(data);
                    } else {
                        setError('Unexpected data format received');
                        console.error('Unexpected data format:', data);
                    }
                } else {
                    setError('Authentication required. Please login.');
                }
            } catch (error) {
                setError('Failed to load algorithms. Please try again later.');
                console.error('Error fetching algorithms:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAlgorithms();
    }, [token]);

    const handleToggleFavorite = async (algorithmId: number) => {
        if (!token) return;

        try {
            setUpdatingFavorites(prev => ({ ...prev, [algorithmId]: true }));

            const updatedAlgorithm = await toggleFavorite(algorithmId, token);

            setAlgorithms(prev =>
                prev.map(algo =>
                    algo.id === algorithmId
                        ? { ...algo, is_favorite: updatedAlgorithm.is_favorite }
                        : algo
                )
            );
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setUpdatingFavorites(prev => ({ ...prev, [algorithmId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading algorithms...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error}
                    {error === 'Authentication required. Please login.' && (
                        <div className="mt-3">
                            <Link to="/login" className="btn btn-primary">
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="mb-4">
                <SearchForm setAlgorithms={setAlgorithms} />
            </div>

            {(algorithms || []).length === 0 ? (
                <div className="text-center py-5 bg-light rounded">
                    <h4 className="text-muted">No algorithms found</h4>
                    <p className="text-muted">Try changing your search criteria</p>
                    {token && (
                        <Link to="/add-algorithm" className="btn btn-outline-primary mt-3">
                            Add New Algorithm
                        </Link>
                    )}
                </div>
            ) : (
                <div className="list-group">
                    {algorithms.map((algorithm) => (
                        <div key={algorithm.id} className="list-group-item list-group-item-action py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <Link to={`/algorithms/${algorithm.id}`} className="flex-grow-1 text-decoration-none">
                                    <h5 className="mb-1 text-dark">{algorithm.title}</h5>
                                </Link>
                                <div className="d-flex align-items-center">
                                    <span className="badge bg-primary me-2">
                                        {algorithm.programming_language}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleToggleFavorite(algorithm.id);
                                        }}
                                        disabled={updatingFavorites[algorithm.id]}
                                        className="btn btn-link p-0 border-0"
                                    >
                                        <HeartIcon filled={algorithm.is_favorite}/>
                                        {updatingFavorites[algorithm.id] && (
                                            <span className="visually-hidden">Updating...</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div><small className="text-muted">Topic: {algorithm.topic}</small></div>
                            <small className="text-muted">Author ID: {algorithm.user_id}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;