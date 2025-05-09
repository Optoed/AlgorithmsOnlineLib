import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Algorithm } from '../types/Algorithm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Heart, ClipboardCopy } from 'lucide-react';

const FavoriteAlgorithmsPage: React.FC = () => {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchFavoriteAlgorithms = async () => {
        try {
            const response = await api.get('/api/algorithms/favorite', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlgorithms(response.data || []);
        } catch (error) {
            console.error('Error fetching favorite algorithms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchFavoriteAlgorithms();
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleCopy = (code: string, id: number) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleSwitchFavorite = async (algorithmId: number) => {
        try {
            await api.patch(`/api/algorithms/favorite/${algorithmId}`, {},
                {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlgorithms(algorithms.filter(alg => alg.id !== algorithmId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    if (!token) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger">
                    You must be logged in to view this page.
                    <button
                        className="btn btn-primary mt-2"
                        onClick={() => navigate('/login')}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="container py-5 text-center">Loading...</div>;
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Favorite Algorithms</h2>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>

            {algorithms.length === 0 ? (
                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                        <Heart size={48} className="mb-3 text-muted" />
                        <h4>No favorite algorithms yet</h4>
                        <p className="text-muted">
                            Add algorithms to favorites to see them here
                        </p>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/home')}
                        >
                            Browse Algorithms
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 g-4">
                    {algorithms.map(algorithm => (
                        <div key={algorithm.id} className="col">
                            <div className="card h-100 shadow-sm">
                                <div className="card-header bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">{algorithm.title}</h5>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleSwitchFavorite(algorithm.id)}
                                        >
                                            <Heart size={16} fill="red" color="red" />
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-2">
                                        <small>Topic: {algorithm.topic}</small>
                                    </p>
                                    <p className="text-muted mb-3">
                                        <small>Language: {algorithm.programming_language}</small>
                                    </p>

                                    {algorithm.description && (
                                        <div className="mb-3 p-2 bg-light rounded">
                                            <p>{algorithm.description}</p>
                                        </div>
                                    )}

                                    <div className="position-relative">
                                        <SyntaxHighlighter
                                            language={algorithm.programming_language.toLowerCase()}
                                            style={oneDark}
                                            customStyle={{
                                                borderRadius: '8px',
                                                padding: '12px',
                                                fontSize: '0.8rem',
                                                maxHeight: '200px'
                                            }}
                                        >
                                            {algorithm.code}
                                        </SyntaxHighlighter>
                                        <button
                                            className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2"
                                            onClick={() => handleCopy(algorithm.code, algorithm.id)}
                                            title="Copy code"
                                        >
                                            <ClipboardCopy size={16} />
                                            {copiedId === algorithm.id && (
                                                <span className="ms-1">Copied!</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="card-footer bg-white">
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => navigate(`/algorithms/${algorithm.id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoriteAlgorithmsPage;