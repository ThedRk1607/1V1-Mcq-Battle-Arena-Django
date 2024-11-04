import axios from "axios";

// Create an instance of axios with default configuration
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/", // Replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to include the token
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token"); // Adjust as needed
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const GetMCQ = async (id) => {
  return await axiosInstance.get(`/mcqs/${id}`);
};

export const GetMCQs = async () => {
  return await axiosInstance.get('/mcqs');
};

export const CreateMcq = async (data) => {
  return await axiosInstance.post('/mcqs/', data);
};

export const UpdateMcq = async (id, data) => {
  return await axiosInstance.put(`/mcqs/${id}/`, data);  
};

export const DeleteMcq = async (id) => {
  return await axiosInstance.delete(`/mcqs/${id}`);
};
