import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // предполагаем, что axios настроен в api
import { Algorithm } from '../types/Algorithm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardCopy, Edit, Trash2, EyeOff, Eye } from 'lucide-react';

const AlgorithmPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
    const [copied, setCopied] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editTopic, setEditTopic] = useState('');
    const [editProgrammingLanguage, setEditProgrammingLanguage] = useState('');
    const [deleteMessage, setDeleteMessage] = useState<string | null>(null); // Состояние для сообщения после удаления
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlgorithm = async () => {
            try {
                const response = await api.get(`/api/algorithms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAlgorithm(response.data);
                setIsPrivate(response.data.isPrivate);
                setEditTitle(response.data.title); // Установим начальное значение для формы редактирования
                setEditCode(response.data.code); // Установим начальное значение для формы редактирования
                setEditTopic(response.data.topic); // Установим начальное значение для topic
                setEditProgrammingLanguage(response.data.programming_language); // Установим начальное значение для programming_language
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

    const handleDelete = async () => {
        if (algorithm) {
            try {
                // Закрываем модальное окно сразу после клика
                setShowConfirmDelete(false);

                // Выполняем удаление алгоритма
                await api.delete(`/api/algorithms/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Показать сообщение об успешном удалении
                setDeleteMessage('Successfully deleted!');

                // Редиректим на список алгоритмов через 1.5 секунды
                setTimeout(() => navigate('/my-algorithms'), 1500);
            } catch (error) {
                setDeleteMessage('Error deleting algorithm.');
                console.error('Error deleting algorithm:', error);
            }
        }
    };

    const handleTogglePrivacy = async () => {
        if (algorithm) {
            try {
                const response = await api.patch(
                    `/api/algorithms/${id}`,
                    { isPrivate: !isPrivate },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setAlgorithm(response.data);
                setIsPrivate(!isPrivate);
            } catch (error) {
                console.error('Error updating privacy:', error);
            }
        }
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const handleUpdateAlgorithm = async () => {
        if (!editTitle || !editCode || !editTopic || !editProgrammingLanguage) {
            alert('All fields (Title, Code, Topic, Programming Language) are required');
            return;
        }

        try {
            const updatedAlgorithm = {
                title: editTitle,
                code: editCode,
                topic: editTopic,
                programming_language: editProgrammingLanguage,
            };

            const response = await api.put(`/api/algorithms/${id}`, updatedAlgorithm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAlgorithm(response.data); // Обновляем алгоритм на фронте
            setShowEditModal(false); // Закрываем модальное окно
        } catch (error) {
            console.error('Error updating algorithm:', error);
        }
    };

    if (!algorithm) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className={`container d-flex justify-content-center mt-5 ${deleteMessage ? 'opacity-20' : ''}`}>
            <div className="card shadow rounded-4 p-4" style={{ maxWidth: '800px', width: '100%' }}>
                <h2 className="mb-3 text-primary fw-bold">{algorithm.title}</h2>
                <p className="mb-1">
                    <strong>Topic:</strong> {algorithm.topic}
                </p>
                <p className="mb-3">
                    <strong>Author:</strong> {algorithm.user_id}
                </p>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center me-2"
                            onClick={handleEdit}
                        >
                            <Edit size={16} className="me-1" />
                            Edit
                        </button>

                        <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center me-2"
                            onClick={() => setShowConfirmDelete(true)}
                        >
                            <Trash2 size={16} className="me-1" />
                            Delete
                        </button>

                        <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center"
                            onClick={handleTogglePrivacy}
                        >
                            {isPrivate ? (
                                <>
                                    <EyeOff size={16} className="me-1" />
                                    Make Public
                                </>
                            ) : (
                                <>
                                    <Eye size={16} className="me-1" />
                                    Make Private
                                </>
                            )}
                        </button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                            onClick={handleCopy}
                        >
                            <ClipboardCopy size={16} className="me-1" />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                <h5 className="m-0">Code</h5>
                <div className="position-relative mb-3">
                    <SyntaxHighlighter
                        language="cpp"
                        style={oneDark}
                        customStyle={{
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '0.9rem',
                        }}
                    >
                        {algorithm.code}
                    </SyntaxHighlighter>
                </div>
            </div>

            {/* Delete Confirmation */}
            {showConfirmDelete && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowConfirmDelete(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this algorithm?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowConfirmDelete(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success/Error Message */}
            {deleteMessage && (
                <div
                    className="alert alert-success mt-3"
                    role="alert"
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1050,
                        maxWidth: '600px',
                        width: '100%',
                        padding: '30px',
                        textAlign: 'center',
                        backgroundColor: '#d4edda',
                        borderColor: '#c3e6cb',
                        color: '#155724',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        opacity: 1,
                        transition: 'opacity 0.5s ease',
                    }}
                >
                    {deleteMessage}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Algorithm</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="form-control mb-3"
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    value={editTopic}
                                    onChange={(e) => setEditTopic(e.target.value)}
                                    className="form-control mb-3"
                                    placeholder="Topic"
                                />
                                <input
                                    type="text"
                                    value={editProgrammingLanguage}
                                    onChange={(e) => setEditProgrammingLanguage(e.target.value)}
                                    className="form-control mb-3"
                                    placeholder="Programming Language"
                                />
                                <textarea
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                    className="form-control"
                                    rows={10}
                                    placeholder="Code"
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUpdateAlgorithm}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmPage;
