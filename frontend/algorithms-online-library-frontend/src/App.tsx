// src/App.tsx
import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AlgorithmPage from './pages/AlgorithmPage';
import Header from './components/Header';
import Footer from './components/Footer';
import MyAlgorithmsPage from './pages/MyAlgorithmsPage';
import AddAlgorithmPage from "./pages/AddAlgorithmPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const App: React.FC = () => {
    // Проверяем, есть ли токен (например, в localStorage)
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Проверяем аутентификацию при загрузке
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const hasToken = (): boolean => {
        const token = localStorage.getItem('token');
        return !!token
    }

    return (
        <Router>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh'
            }}>
                <Header/>
                <main style={{
                    flex: '1 0 auto',
                    padding: '20px 0'
                }}>
                    <Routes>
                        {/* Автоматический редирект в зависимости от авторизации */}
                        <Route
                            path="/"
                            element={ hasToken() ? (
                                <Navigate to="/home" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        {/*<Route path="/favorite-algorithms/" element={<FavoriteAlgorithmsPage />} />*/}


                        {/* Защищенные маршруты */}
                        <Route
                            path="/home"
                            element={hasToken() ? (
                                <HomePage />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/algorithms"
                            element={hasToken() ? (
                                <AlgorithmPage />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/algorithms/:id"
                            element={hasToken() ? (
                                <AlgorithmPage />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/my-algorithms"
                            element={hasToken() ? (
                                <MyAlgorithmsPage />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                        <Route
                            path="/add-algorithm"
                            element={hasToken() ? (
                                <AddAlgorithmPage />
                            ) : (
                                <Navigate to="/login" replace />
                            )}
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;