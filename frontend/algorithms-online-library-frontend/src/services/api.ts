import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081', // Замените на URL вашего бекенда
    headers: {
        'Content-Type': 'application/json',
    },
});

export const register = (username: string, password: string, email: string, role: string) => {
    return api.post('/register', { username, password, email, role });
};

export const login = (username: string, password: string) => {
    return api.post('/login', { username, password });
};

export default api;
