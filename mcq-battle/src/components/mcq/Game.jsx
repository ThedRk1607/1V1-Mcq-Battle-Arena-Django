// src/components/game/Game.jsx
import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { GetGame, StartGame } from '../../services/api/mcq/mcq.service';
import { toast } from 'react-toastify';

const Game = ({ gameId }) => {
  const [game, setGame] = useState(null);

  useEffect(() => {
    fetchGame();

    const pusher = new Pusher('d29bf340b0ce1bfc0bc9', {
      cluster: 'ap2',
    });

    const channel = pusher.subscribe('game-channel');
    channel.bind('game-start', (data) => {
      if (data.game_id === gameId) {
        fetchGame();
      }
    });

    return () => {
      pusher.unsubscribe('game-channel');
    };
  }, [gameId]);

  const fetchGame = async () => {
    const data = await GetGame(gameId);
    setGame(data);
  };

  const handleStartGame = async () => {
    const result = await StartGame(gameId);
    if (result) {
      fetchGame();
    }
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h2>Game {game.game_id}</h2>
      <p>Status: {game.status}</p>
      {game.status === 'waiting' && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );
};

export default Game;
