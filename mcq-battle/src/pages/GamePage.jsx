// src/pages/GamePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetGame, StartGame, GetMCQs } from '../services/api/mcq/mcq.service';
import { toast } from 'react-toastify';
import Pusher from 'pusher-js';
import { Button, Card, Radio, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const GamePage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState({});

  useEffect(() => {
    fetchGame();
    fetchMCQs();

    const pusher = new Pusher('d29bf340b0ce1bfc0bc9', {
      cluster: 'ap2',
    });

    const channel = pusher.subscribe('game-channel');
    channel.bind('game-updated', (data) => {
      // Handle real-time updates
      fetchGame();
    });

    return () => {
      pusher.unsubscribe('game-channel');
    };
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const data = await GetGame(gameId);
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Failed to fetch game details.');
    }
  };

  const fetchMCQs = async () => {
    try {
      const data = await GetMCQs();
      setMcqs(data);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
      toast.error('Failed to fetch MCQs.');
    }
  };

  const handleStartGame = async () => {
    try {
      const result = await StartGame(gameId);
      if (result) {
        fetchGame();
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start the game.');
    }
  };

  const handleOptionChange = (mcqId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [mcqId]: option,
    });
  };

  const handleSubmit = () => {
    console.log('Submit button clicked'); // Debugging
    const newResults = {};
    mcqs.forEach((mcq) => {
      const correctOption = mcq.options.find(option => option.is_correct);
      if (selectedAnswers[mcq.id] === correctOption.body) {
        newResults[mcq.id] = { is_correct: true };
      } else {
        newResults[mcq.id] = { is_correct: false };
      }
    });
    setResults(newResults);
    console.log('Results:', newResults); // Debugging
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Game {game.game_id}</Title>
      <Text>Status: {game.status}</Text>
      {game.status === 'waiting' && (
        <Button type="primary" onClick={handleStartGame} style={{ margin: '20px 0' }}>
          Start Game
        </Button>
      )}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {mcqs.map((mcq) => (
          <Card key={mcq.id} title={mcq.body} bordered={false}>
            <Text type="secondary">{mcq.explanation}</Text>
            <Radio.Group
              onChange={(e) => handleOptionChange(mcq.id, e.target.value)}
              value={selectedAnswers[mcq.id]}
              style={{ display: 'block', marginTop: '10px' }}
            >
              {mcq.options.map((option, index) => (
                <Radio key={index} value={option.body} style={{ display: 'block', margin: '5px 0' }}>
                  {option.body}
                </Radio>
              ))}
            </Radio.Group>
            {results[mcq.id] && (
              <Text type={results[mcq.id].is_correct ? 'success' : 'danger'}>
                {results[mcq.id].is_correct ? 'Correct' : 'Incorrect'}
              </Text>
            )}
          </Card>
        ))}
      </Space>
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Submit Answers
      </Button>
    </div>
  );
};

export default GamePage;
