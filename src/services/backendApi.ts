import axios from 'axios';

const backendApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('REACT_APP_BACKEND_URL', process.env.REACT_APP_BACKEND_URL);
export default backendApi;