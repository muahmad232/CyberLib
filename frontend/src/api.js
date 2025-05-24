import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const registerUser = (data) => API.post('/auth/signup', data);
export const loginUser = (data) => API.post('/auth/signin', data);
export const updateGenres = (userId, genres) => API.post(`/user/${userId}/genres`, { genres });
