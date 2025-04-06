import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPassword !== repeatNewPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const response = await api.post('/reset-password', {
                username,
                email,
                token,
                'new-password': newPassword
            });
            console.log('Reset password response:', response);
            navigate('/login');
        } catch (error) {
            console.error('Reset password error:', error);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-lg rounded-4 p-5 border-0" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="text-center text-primary fw-bold mb-4">Reset Your Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email associated with your account"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Reset Token</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter the token from your email"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Choose a new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Repeat New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Repeat the new password"
                                value={repeatNewPassword}
                                onChange={(e) => setRepeatNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2">
                            Reset Password
                        </button>
                        <div className="text-center mt-3">
                            <a href="/login" className="text-decoration-none text-muted">
                                Back to login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
