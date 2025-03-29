import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlgorithms } from '../services/algorithmService';
import SearchForm from './SearchForm';
import { Algorithm } from '../types/Algorithm';

const HomePage: React.FC = () => {
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadAlgorithms = async () => {
            try {
                if (token) {
                    const data = await fetchAlgorithms(token);
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
        <div className="container">
            <h2 className="my-4">Algorithms</h2>
            <SearchForm setAlgorithms={setAlgorithms} />
            <ul className="list-group">
                {algorithms.map((algorithm) => (
                    <li key={algorithm.id} className="list-group-item">
                        <Link to={`/algorithms/${algorithm.id}`}>
                            {algorithm.title} - {algorithm.user_id} - {algorithm.programming_language}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HomePage;
