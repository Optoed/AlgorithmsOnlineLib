import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({
            username: '',
            email: '',
            password: ''
        });

        try {
            const response = await api.post('/register', { username, password, email });
            navigate('/login');
        } catch (error: any) {
            if (error.response) {
                // Обрабатываем текстовый ответ от сервера
                const errorMessage = error.response.data.trim(); // Убираем лишние переносы

                // Определяем, к какому полю относится ошибка
                if (errorMessage.includes('Email')) {
                    setFieldErrors(prev => ({ ...prev, email: errorMessage }));
                } else if (errorMessage.includes('Username')) {
                    setFieldErrors(prev => ({ ...prev, username: errorMessage }));
                } else if (errorMessage.includes('Password')) {
                    setFieldErrors(prev => ({ ...prev, password: errorMessage }));
                } else {
                    // Общая ошибка
                    setError(errorMessage);
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="col-md-6">
                <div className="card shadow-lg rounded-4 border-0">
                    <div className="card-body p-5">
                        <h2 className="text-center mb-4 fw-bold text-primary">Create Account</h2>

                        {/* Общая ошибка */}
                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    type="text"
                                    className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                />
                                {fieldErrors.username && (
                                    <div className="invalid-feedback">
                                        {fieldErrors.username}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                />
                                {fieldErrors.email && (
                                    <div className="invalid-feedback">
                                        {fieldErrors.email}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Create a strong password"
                                />
                                {fieldErrors.password && (
                                    <div className="invalid-feedback">
                                        {fieldErrors.password}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-2">
                                Register
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            <small className="text-muted">Already have an account?</small>
                            <br />
                            <a href="/login" className="text-decoration-none">Login here</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;