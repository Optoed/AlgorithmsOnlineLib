import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
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
                            <li className="nav-item mx-2">
                                <Link className="nav-link px-3 py-2 rounded" to="/my-algorithms">
                                    <i className="bi bi-collection me-2"></i>
                                    My Algorithms
                                </Link>
                            </li>
                            <li className="nav-item mx-2">
                                <Link className="nav-link px-3 py-2 rounded" to="/my-algorithms">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Add Algorithm
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;