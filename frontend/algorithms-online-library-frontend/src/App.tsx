import React, { useState, useEffect } from 'react';
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Проверяем аутентификацию при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                position: 'relative'
            }}>
                <Header isLoggedIn={isAuthenticated} onLogout={handleLogout}/>
                <main style={{
                    flex: '1 0 auto',
                    padding: '20px 0'
                }}>
                    <Routes>
                        {/* Автоматический редирект в зависимости от авторизации */}
                        <Route
                            path="/"
                            element={isAuthenticated ? (
                                <Navigate to="/home" replace/>
                            ) : (
                                <Navigate to="/login" replace/>
                            )}
                        />
                        <Route
                            path="/home"
                            element={
                                isAuthenticated ? (
                                    <HomePage/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <LoginPage />
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <RegisterPage/>
                            }
                        />
                        <Route
                            path="/algorithms"
                            element={
                                isAuthenticated ? (
                                    <AlgorithmPage/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/algorithms/:id"
                            element={
                                isAuthenticated ? (
                                    <AlgorithmPage/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/my-algorithms"
                            element={
                                isAuthenticated ? (
                                    <MyAlgorithmsPage/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/add-algorithm"
                            element={
                                isAuthenticated ? (
                                    <AddAlgorithmPage/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/reset-password"
                            element={
                                !isAuthenticated ? (
                                    <ResetPasswordPage/>
                                ) : (
                                    <Navigate to="/home" replace/>
                                )
                            }
                        />
                    </Routes>
                </main>
                <div style={{position: 'absolute', bottom: 0, width: '100%'}}>
                    <Footer/>
                </div>
            </div>
        </Router>
    );
};

export default App;