import axios from "axios";
import Cookies from 'js-cookie';

const instancia = axios.create({
    baseURL: "http://localhost:8081",
});

instancia.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

export default instancia;
