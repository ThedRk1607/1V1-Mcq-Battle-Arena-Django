// src/services/api/mcq/mcq.service.js
import axiosInstance from '../axios-instance';
import { toast } from 'react-toastify';

export const GetGames = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axiosInstance.get('/api/list-games/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching games:', err);
    if (err.response && err.response.status === 401) {
      toast.error('Unauthorized access. Please log in again.');
      // Optionally, redirect to login page or clear token
    } else {
      toast.error('Failed to fetch games.');
    }
    return []; // Return an empty array or handle error as needed
  }
};

export const GetGame = async (gameId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axiosInstance.get(`/games/${gameId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching game:', err);
    toast.error('Failed to fetch game details.');
    return null; // Return null or handle error as needed
  }
};

export const StartGame = async (gameId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axiosInstance.put(`/games/${gameId}/`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error starting game:', err);
    toast.error('Failed to start the game.');
    return null; // Return null or handle error as needed
  }
};


// src/services/api/mcq/mcq.service.js
export const GetMCQs = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axiosInstance.get('/mcqs/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching MCQs:', err);
    toast.error('Failed to fetch MCQs.');
    return []; // Return an empty array or handle error as needed
  }
};

