import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Algorithm } from '../types/Algorithm';

interface SearchFormProps {
    setAlgorithms: React.Dispatch<React.SetStateAction<Algorithm[]>>;
}

const AVAILABLE_PROGRAMMING_LANGUAGES = [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Ruby',
    'Go',
    'Swift',
    'TypeScript',
    'PHP'
];

const SearchForm: React.FC<SearchFormProps> = ({ setAlgorithms }) => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [algorithmID, setAlgorithmID] = useState('');
    const [userID, setUserID] = useState('');
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');

    const handleSearch = async () => {
        try {
            const response = await api.get('/api/algorithms/search', {
                params: {
                    title,
                    topic,
                    programming_language: programmingLanguage,
                    user_id: userID,
                    id: algorithmID,
                    sort_by: sortBy,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAlgorithms(response.data);
        } catch (error) {
            setMessage('Error fetching algorithms');
            console.error('Error fetching algorithms', error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Search Algorithms</h2>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="UserID"
                        value={userID}
                        onChange={(e) => setUserID(e.target.value)}
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="AlgorithmID"
                        value={algorithmID}
                        onChange={(e) => setAlgorithmID(e.target.value)}
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <select
                        className="form-select"
                        value={programmingLanguage}
                        onChange={(e) => setProgrammingLanguage(e.target.value)}
                    >
                        <option value="">Programming Language</option>
                        {AVAILABLE_PROGRAMMING_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort By</option>
                        <option value="newest">Newest</option>
                        <option value="most_popular">Most Popular</option>
                    </select>
                </div>
                <div className="col-12">
                    <button className="btn btn-primary" onClick={handleSearch}>
                        Search
                    </button>
                </div>
            </div>
            {message && <div className="alert alert-danger mt-3">{message}</div>}
        </div>
    );
};

export default SearchForm;
