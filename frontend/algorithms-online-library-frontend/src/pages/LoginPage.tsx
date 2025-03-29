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
            localStorage.setItem('token', token);  // Сохраняем токен в локальном хранилище
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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center">Login Page</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="username">Username:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password:</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center mt-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title text-center">Forgot password?</h3>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="rememberedUsername">I remember my username:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="rememberedUsername"
                                        value={rememberedUsername}
                                        onChange={(e) => setRememberedUsername(e.target.value)}
                                    />
                                </div>
                                <button type="button" className="btn btn-secondary btn-block" onClick={handleForgotPassword}>Send password recovery email</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
