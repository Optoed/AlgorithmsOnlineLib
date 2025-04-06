import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberedUsername, setRememberedUsername] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { username, password });
            const { token, userID } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userID', userID);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleForgotPassword = async () => {
        try {
            await api.post('/forgot-password', { username: rememberedUsername });
            navigate('/reset-password');
        } catch (error) {
            console.error('Forgot password error:', error);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="row w-100 g-4" style={{ maxWidth: '900px' }}>
                {/* Login Card */}
                <div className="col-md-6 d-flex">
                    <div className="card shadow-lg rounded-4 border-0 w-100 d-flex flex-column">
                        <div className="card-body p-5 flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                                <h2 className="text-center text-primary fw-bold mb-4">Welcome Back</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            className="form-control"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your username"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Your password"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-2">Login</button>
                                </form>
                            </div>
                            <div className="text-center mt-4">
                                <small className="text-muted">Don't have an account?</small>
                                <br />
                                <a href="/register" className="text-decoration-none">Register here</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forgot Password Card */}
                <div className="col-md-6 d-flex">
                    <div className="card shadow-lg rounded-4 border-0 w-100 d-flex flex-column">
                        <div className="card-body p-5 flex-grow-1 d-flex flex-column justify-content-center">
                            <div>
                                <h3 className="text-center text-secondary fw-semibold mb-4">Forgot Password?</h3>
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="rememberedUsername" className="form-label">Enter your username</label>
                                        <input
                                            type="text"
                                            id="rememberedUsername"
                                            className="form-control"
                                            value={rememberedUsername}
                                            onChange={(e) => setRememberedUsername(e.target.value)}
                                            placeholder="Your username"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary w-100 py-2"
                                        onClick={handleForgotPassword}
                                    >
                                        Send Recovery Email
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
