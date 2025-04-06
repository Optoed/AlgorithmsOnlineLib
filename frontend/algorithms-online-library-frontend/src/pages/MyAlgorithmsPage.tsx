import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlgorithmsByUserID } from '../services/algorithmService';
import { Algorithm } from '../types/Algorithm';

const MyAlgorithmsPage: React.FC = () => {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userID');

    useEffect(() => {
        const loadAlgorithms = async () => {
            try {
                if (token && userID) {
                    const data = await fetchAlgorithmsByUserID(token, userID);
                    if (Array.isArray(data)) {
                        setAlgorithms(data);
                    } else {
                        console.error('Unexpected data format:', data);
                    }
                } else {
                    console.error('No token or userID found');
                }
            } catch (error) {
                console.error('Error fetching algorithms:', error);
            }
        };

        loadAlgorithms();
    }, [token, userID]);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">My Algorithms</h2>

            {/* Если список пустой, показываем сообщение с предложением создать алгоритм */}
            {(algorithms || []).length === 0 ? (
                <div className="alert alert-info text-center">
                    <p>You don't have any algorithms yet. <Link to="/add-algorithm">Create one now!</Link></p>
                </div>
            ) : (
                <div className="row">
                    {algorithms.map((algorithm) => (
                        <div className="col-md-4 mb-4" key={algorithm.id}>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{algorithm.title}</h5>
                                    <p className="card-text">Language: {algorithm.programming_language}</p>
                                    <p className="card-text">Topic: {algorithm.topic}</p>
                                    <p className="card-text">
                                        Status: {algorithm.is_private ? 'Private' : 'Public'}
                                    </p>
                                    <p className="card-text">
                                        Rating: {algorithm.rating ? algorithm.rating.toFixed(1) : 'Not rated yet'}
                                    </p>
                                    <Link to={`/algorithms/${algorithm.id}`} className="btn btn-primary">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAlgorithmsPage;
