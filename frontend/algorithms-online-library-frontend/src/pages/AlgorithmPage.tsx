import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Algorithm } from '../types/Algorithm';

const AlgorithmPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAlgorithm = async () => {
            try {
                const response = await api.get(`/api/algorithms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAlgorithm(response.data);
            } catch (error) {
                console.error('Error fetching algorithm:', error);
            }
        };

        fetchAlgorithm();
    }, [id, token]);

    if (!algorithm) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <h1 className="my-4">{algorithm.title}</h1>
            <h2>Algorithm Details</h2>
            <h3>ID: {algorithm.id}</h3>
            <h4>Topic: {algorithm.topic}</h4>
            <p>Created by: {algorithm.user_id}</p>
            <h4>Algorithm Code:</h4>
            <pre>{algorithm.code}</pre>
        </div>
    );
};

export default AlgorithmPage;
