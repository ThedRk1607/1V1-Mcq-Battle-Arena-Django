import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateGameButton = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createGame = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.post('/api/create-game/', {}, {
        headers: {
          'Authorization': `Bearer ${token}` // Ensure your token key matches
        }
      });
      toast.success('Game created successfully!');
      console.log('Game created:', response.data);
      navigate(`/game/${response.data.game_id}`); // Adjust based on your response structure
    } catch (error) {
      toast.error('Failed to create game. Please try again.');
      console.error('Error creating game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={createGame} disabled={isLoading}>
      {isLoading ? 'Creating Game...' : 'Create Game'}
    </button>
  );
};

export default CreateGameButton;
