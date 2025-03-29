import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddAlgorithmPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [availableProgrammingLanguages, setAvailableProgrammingLanguages] = useState<string[]>([]);
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAvailableProgrammingLanguages = async () => {
            try {
                const response = await api.get('/api/available-programming-languages', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAvailableProgrammingLanguages(response.data);
            } catch (error) {
                setMessage('Error fetching available programming languages');
            }
        };

        fetchAvailableProgrammingLanguages();
    }, [token]);

    const handleSubmit = async () => {
        if (!title || !topic || !programmingLanguage || !code) {
            setMessage('All fields are required');
            return;
        }

        try {
            const response = await api.post('/api/algorithms', {
                title: title,
                topic: topic,
                programming_language: programmingLanguage,
                code: code
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.id) {
                alert('Algorithm created successfully!');
                navigate('/algorithms');
            } else {
                setMessage('Error creating algorithm');
            }
        } catch (error) {
            setMessage('Error creating algorithm');
        }
    };

    if (!token) {
        return <div>You must be logged in to view this page.</div>;
    }

    return (
        <div className="container">
            <h1 className="my-4">Add New Algorithm</h1>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>
            <div className="form-group">
                <select
                    className="form-control"
                    value={programmingLanguage}
                    onChange={(e) => setProgrammingLanguage(e.target.value)}
                >
                    <option value="">Select a programming language</option>
                    {availableProgrammingLanguages.map((language) => (
                        <option key={language} value={language}>
                            {language}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <textarea
                    className="form-control"
                    placeholder="Algorithm Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
            {message && <div className="alert alert-danger mt-3">{message}</div>}
        </div>
    );
};

export default AddAlgorithmPage;
