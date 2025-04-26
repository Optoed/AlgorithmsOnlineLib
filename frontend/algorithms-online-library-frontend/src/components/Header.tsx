import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
    isLoggedIn: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Очищаем JWT при выходе
        onLogout();
        navigate('/login');
    };

    // Проверяем наличие JWT в localStorage
    const hasJwt = localStorage.getItem('token') !== null;

    // Если не залогинены и нет JWT - не показываем хедер
    if (!isLoggedIn && !hasJwt) {
        return null;
    }

    // Если есть JWT, но isLoggedIn=false - считаем что пользователь авторизован
    const isAuthenticated = isLoggedIn || hasJwt;

    return (
        <header className="mb-4">
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/">
                        Algorithms Online Library
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            {isAuthenticated ? (
                                <>
                                    <li className="nav-item mx-2">
                                        <Link className="nav-link px-3 py-2 rounded" to="/">
                                            <i className="bi bi-house-door me-2"></i>
                                            Home
                                        </Link>
                                    </li>
                                    <li className="nav-item mx-2">
                                        <Link className="nav-link px-3 py-2 rounded" to="/my-algorithms">
                                            <i className="bi bi-collection me-2"></i>
                                            My Algorithms
                                        </Link>
                                    </li>
                                    <li className="nav-item mx-2">
                                        <Link className="nav-link px-3 py-2 rounded" to="/add-algorithm">
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Add Algorithm
                                        </Link>
                                    </li>
                                    <li className="nav-item mx-2 dropdown">
                                        <a
                                            className="nav-link px-3 py-2 rounded dropdown-toggle"
                                            href="#"
                                            id="navbarDropdown"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <i className="bi bi-person-circle me-2"></i>
                                            Profile
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                            <li>
                                                <button className="dropdown-item" onClick={handleLogout}>
                                                    <i className="bi bi-box-arrow-right me-2"></i>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item mx-2">
                                        <Link className="nav-link px-3 py-2 rounded" to="/">
                                            <i className="bi bi-house-door me-2"></i>
                                            Home
                                        </Link>
                                    </li>
                                    <li className="nav-item mx-2">
                                        <Link className="nav-link px-3 py-2 rounded" to="/login">
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Login
                                        </Link>
                                    </li>
                                    <li className="nav-item mx-2">
                                        <Link className="nav-link px-3 py-2 rounded" to="/register">
                                            <i className="bi bi-person-plus me-2"></i>
                                            Register
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;