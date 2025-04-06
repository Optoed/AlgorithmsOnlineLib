import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Editor from '@monaco-editor/react';

const AddAlgorithmPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
    const [code, setCode] = useState('// Write your code here\n');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await api.get('/api/available-programming-languages', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvailableLanguages(response.data);
            } catch (error) {
                setMessage('Error loading available languages');
            }
        };

        if (token) fetchLanguages();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !topic || !programmingLanguage || !code) {
            setMessage('All fields are required');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.post('/api/algorithms', {
                title,
                topic,
                programming_language: programmingLanguage,
                code
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.id) {
                setMessage('Algorithm created successfully!');
                setTimeout(() => navigate(`/algorithms/${response.data.id}`), 1000);
            }
        } catch (error) {
            setMessage('Error creating algorithm');
        } finally {
            setIsSubmitting(false);
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

    return (
        <div className="container py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-light">
                    <h2 className="mb-0">Add New Algorithm</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Algorithm title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Topic *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Graphs, Dynamic Programming, Sorting..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Language *</label>
                            <select
                                className="form-select"
                                value={programmingLanguage}
                                onChange={(e) => setProgrammingLanguage(e.target.value)}
                                required
                            >
                                <option value="">Select language</option>
                                {availableLanguages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Code *</label>
                            <div style={{ border: '1px solid #ddd', borderRadius: '4px', height: '400px' }}>
                                <Editor
                                    height="100%"
                                    language={programmingLanguage.toLowerCase() === 'c++' ? 'cpp' : programmingLanguage.toLowerCase()  || 'cpp'}
                                    value={code}
                                    onChange={(value: any) => setCode(value || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        automaticLayout: true
                                    }}
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Algorithm'}
                            </button>
                        </div>
                    </form>

                    {message && (
                        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} mt-3`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAlgorithmPage;