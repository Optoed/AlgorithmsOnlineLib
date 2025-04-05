import React from 'react';

const Footer: React.FC = () => {
    const handleOpenTelegram = () => {
        window.open('https://t.me/Optoed', '_blank');
    };

    return (
        <footer
            className="mt-auto py-3"
            style={{
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
            }}
        >
            <div className="container">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <p className="mb-2 mb-md-0">&copy; 2024-2025 Algorithms Online Library</p>
                    <div className="d-flex align-items-center">
                        <p className="text-muted mb-0 me-2">Developed by</p>
                        <button
                            onClick={handleOpenTelegram}
                            style={{
                                color: '#0d6efd',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <span className="fw-bold">Optoed</span>
                            <span className="ms-1" role="img" aria-label="Cool emoji">😎</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;