import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const refresh = localStorage.getItem("refresh");
                const { data } = await axios.post("http://localhost:8000/auth/token/refresh/", {
                    refresh,
                });

                localStorage.setItem("token", data.access);
                original.headers.Authorization = `Bearer ${data.access}`;

                return api(original);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;