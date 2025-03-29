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
                if (token) {
                    const data = await fetchAlgorithmsByUserID(token, userID);
                    if (Array.isArray(data)) {
                        setAlgorithms(data);
                    } else {
                        console.error('Unexpected data format:', data);
                    }
                } else {
                    console.error('No token found');
                }
            } catch (error) {
                console.error('Error fetching algorithms:', error);
            }
        };

        loadAlgorithms();
    }, [token]);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">My Algorithms</h2>
            <div className="row">
                {algorithms.map((algorithm) => (
                    <div className="col-md-4" key={algorithm.id}>
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">{algorithm.title}</h5>
                                <h6 className="card-subtitle mb-2 text-muted">User ID: {algorithm.user_id}</h6>
                                <p className="card-text">Language: {algorithm.programming_language}</p>
                                <Link to={`/algorithms/${algorithm.id}`} className="btn btn-primary">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAlgorithmsPage;
