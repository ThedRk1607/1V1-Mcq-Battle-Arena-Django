// src/components/mcq/Lobby.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, List, Card } from 'antd';
import { toast } from 'react-toastify';
import Pusher from 'pusher-js';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debugging
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get('/api/list-games/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response:', response); // Debugging
      setGames(response.data);
    } catch (err) {
      console.error('Error fetching games:', err);
      toast.error('Failed to fetch games.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    const pusher = new Pusher('d29bf340b0ce1bfc0bc9', {
      cluster: 'ap2',
    });

    const channel = pusher.subscribe('game-channel');
    channel.bind('game-updated', (data) => {
      // Fetch games again when there's an update
      fetchGames();
    });

    return () => {
      pusher.unsubscribe('game-channel');
    };
  }, []);

  const createGame = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from local storage
      await axios.post('/api/create-game/', {}, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the headers
        }
      });
      toast.success('Game created successfully!');
      // Refresh the games list
      fetchGames();
    } catch (err) {
      console.error('Error creating game:', err);
      toast.error('Failed to create game.');
    }
  };

  const joinGame = async (gameId) => {
    try {
      const token = localStorage.getItem('token'); // Get the token from local storage
      const response = await axios.post(`/api/join-game/${gameId}/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}` // Include the token in the headers
        }
      });
      toast.success('Successfully joined the game!');
      navigate(`/game/${gameId}`); // Navigate to the contest page
    } catch (err) {
      console.error('Error joining game:', err);
      toast.error('Failed to join the game.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Available Games</h2>
      <Button type="primary" onClick={createGame}>Create Game</Button>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={games}
        renderItem={(game) => (
          <List.Item>
            <Card title={`Game ID: ${game.game_id || 'undefined'}`} className="shadow-lg">
              <p>Owner: {game.owner || 'undefined'}</p>
              <Button type="primary" onClick={() => joinGame(game.game_id)}>
                Join
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Lobby;
