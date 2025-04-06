// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    return (
        <Router>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh' // Занимаем всю высоту viewport
            }}>
                <Header />
                <main style={{
                    flex: '1 0 auto', // Растягиваем основной контент
                    padding: '20px 0' // Добавляем отступы
                }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/algorithms" element={<AlgorithmPage />} />
                        <Route path="/algorithms/:id" element={<AlgorithmPage />} />
                        <Route path="/my-algorithms" element={<MyAlgorithmsPage />} />
                        <Route path="/add-algorithm" element={<AddAlgorithmPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;