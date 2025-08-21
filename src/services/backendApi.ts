import axios from 'axios';

const baseUrl = 'https://scifly-api-demo-uye4dggmrq-uc.a.run.app'
//const baseUrl = 'http://localhost:8080'

console.log("base",baseUrl)
const backendApi = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backendApi;