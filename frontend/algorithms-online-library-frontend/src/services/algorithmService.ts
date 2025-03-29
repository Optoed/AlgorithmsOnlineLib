import api from './api';

export const fetchAlgorithms = async (token: any) => {
    try {
        //console.log("token when fetching algorithms:", token);
        const response = await api.get('/api/algorithms', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        //console.log("response when fetching algorithms:", response);
        //console.log("response.data when fetching algorithms:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching algorithms:', error);
        throw error;
    }
};

export const fetchAlgorithmsByUserID = async (token: any, userID: any) => {
    try {
        const response = await api.get(`/api/algorithms-by-user/${userID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error
    }
}

export const addAlgorithm = async (algorithm: any) => {
    try {
        const response = await api.post('/api/algorithms', algorithm);
        return response.data;
    } catch (error) {
        console.error('Error adding algorithm:', error);
        throw error;
    }
};

export const updateAlgorithm = async (id: string, algorithm: any) => {
    try {
        const response = await api.put(`/api/algorithms/${id}`, algorithm);
        return response.data;
    } catch (error) {
        console.error('Error updating algorithm:', error);
        throw error;
    }
};

export const deleteAlgorithm = async (id: string) => {
    try {
        const response = await api.delete(`/api/algorithms/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting algorithm:', error);
        throw error;
    }
};
