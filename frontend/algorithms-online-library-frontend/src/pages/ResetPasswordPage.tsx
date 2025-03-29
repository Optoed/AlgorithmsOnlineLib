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
            // Handle the response as needed
            navigate('/login');
        } catch (error) {
            console.error('Reset password error:', error);
            // Handle error, show message, etc.
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Token</label>
                    <input
                        type="text"
                        className="form-control"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Repeat New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={repeatNewPassword}
                        onChange={(e) => setRepeatNewPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
