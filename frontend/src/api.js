import axios from 'axios';

// In production, configure VITE_API_URL in .env (e.g., http://your-ec2-domain:5001/api)
// In local dev, Vite proxy forwards /api to http://localhost:5001/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTodosByDate = async (date) => {
  const response = await apiClient.get(`/todos?date=${date}`);
  return response.data;
};

export const createTodo = async (todoData) => {
  const response = await apiClient.post('/todos', todoData);
  return response.data;
};

export const updateTodo = async (id, updateData) => {
  const response = await apiClient.put(`/todos/${id}`, updateData);
  return response.data;
};

export const deleteTodo = async (id) => {
  const response = await apiClient.delete(`/todos/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await apiClient.get('/analytics');
  return response.data;
};

export const checkHealth = async () => {
  const baseURLWithoutApi = API_URL.replace(/\/api$/, '');
  const target = baseURLWithoutApi ? `${baseURLWithoutApi}/health` : '/health';
  const response = await axios.get(target);
  return response.data;
};
