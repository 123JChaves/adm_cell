import axios, { AxiosInstance } from "axios";

const instancia: AxiosInstance = axios.create({
    baseURL: "http://localhost:8081",
    headers: {
        "Content-Type": "aplication/json"
    }
});

export default instancia;