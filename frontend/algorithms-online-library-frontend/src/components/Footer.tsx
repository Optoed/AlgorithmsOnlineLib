import React from 'react';
import './Footer.css'; // Подключите стили

const Footer: React.FC = () => {
    return (
        <footer className="footer bg-light text-center py-3">
            <div className="container">
                <p>&copy; 2024 Algorithms Online Library</p>
            </div>
        </footer>
    );
};

export default Footer;
