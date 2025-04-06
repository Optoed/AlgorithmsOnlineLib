import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlgorithms } from '../services/algorithmService';
import SearchForm from './SearchForm';
import { Algorithm } from '../types/Algorithm';
import { Spinner } from 'react-bootstrap';

const HomePage: React.FC = () => {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadAlgorithms = async () => {
            try {
                setLoading(true);
                setError(null);

                if (token) {
                    const data = await fetchAlgorithms(token);
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

            {algorithms.length === 0 ? (
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
                        <Link
                            key={algorithm.id}
                            to={`/algorithms/${algorithm.id}`}
                            className="list-group-item list-group-item-action py-3"
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-1">{algorithm.title}</h5>
                                <span className="badge bg-primary">
                                    {algorithm.programming_language}
                                </span>
                            </div>
                            <small className="text-muted">Author ID: {algorithm.user_id}</small>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;