// frontend/src/services/api.js

import axios from 'axios';

const backendUrl = `/api/`;

const apiClient = axios.create({
    baseURL: backendUrl,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// АВТЕНТИФІКАЦІЯ
export const loginUser = async (username, password) => {
    try {
        const response = await apiClient.post('/token/', { username, password });
        if (response.status === 200) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            return { success: true, data: response.data };
        }
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.detail || 'Помилка входу' };
    }
};

// -- Користувачі --
export const getUsers = () => apiClient.get('/users/');
export const createUser = (userData) => apiClient.post('/users/', userData);
export const updateUser = (id, userData) => apiClient.put(`/users/${id}/`, userData);
export const deleteUser = (id) => apiClient.delete(`/users/${id}/`);

// -- Шафи --
export const getCabinets = () => apiClient.get('/cabinets/');
export const createCabinet = (name, description) => apiClient.post('/cabinets/', { name, description });
export const updateCabinet = (id, name, description) => apiClient.put(`/cabinets/${id}/`, { name, description });
export const deleteCabinet = (id) => apiClient.delete(`/cabinets/${id}/`);

// -- Ємності --
export const getContainerById = (id) => apiClient.get(`/containers/${id}/`);
export const createContainer = (data) => apiClient.post('/containers/', data);
export const updateContainer = (id, data) => apiClient.put(`/containers/${id}/`, data);
export const deleteContainer = (id) => apiClient.delete(`/containers/${id}/`);
export const replenishContainer = (id, quantity) => apiClient.post(`/containers/${id}/replenish/`, { quantity });
export const writeOffFromContainer = (id, quantity) => apiClient.post(`/containers/${id}/write_off/`, { quantity });

// -- Історія --
export const getTransactions = () => apiClient.get('/transactions/');

// -- Звіти --
export const getSummaryReport = (cabinetId = null) => {
    const params = cabinetId ? { cabinet_id: cabinetId } : {};
    return apiClient.get('/reports/summary/', { params });
};

// -- QR-Коди --
export const getQrCodeImage = async (containerId) => {
    try {
        const response = await apiClient.get(`/qr/${containerId}/`, {
            responseType: 'blob', // Важливо: очікуємо бінарні дані (зображення)
        });
        // Створюємо тимчасову URL-адресу з отриманих даних
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error("Не вдалося завантажити QR-код", error);
        return null;
    }
};