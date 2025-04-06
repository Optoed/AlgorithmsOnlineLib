import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Algorithm } from '../types/Algorithm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardCopy } from 'lucide-react';

const AlgorithmPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
    const [copied, setCopied] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAlgorithm = async () => {
            try {
                const response = await api.get(`/api/algorithms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAlgorithm(response.data);
            } catch (error) {
                console.error('Error fetching algorithm:', error);
            }
        };

        fetchAlgorithm();
    }, [id, token]);

    const handleCopy = () => {
        if (algorithm?.code) {
            navigator.clipboard.writeText(algorithm.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    if (!algorithm) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="card shadow rounded-4 p-4" style={{ maxWidth: '800px', width: '100%' }}>
                <h2 className="mb-3 text-primary fw-bold">{algorithm.title}</h2>
                <p className="mb-1"><strong>Topic:</strong> {algorithm.topic}</p>
                <p className="mb-3"><strong>Author:</strong> {algorithm.user_id}</p>

                <div className="position-relative mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="m-0">Code</h5>
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            onClick={handleCopy}
                        >
                            <ClipboardCopy size={16} className="me-1" />
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <SyntaxHighlighter language="cpp" style={oneDark} customStyle={{
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '0.9rem',
                    }}>
                        {algorithm.code}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
};

export default AlgorithmPage;
