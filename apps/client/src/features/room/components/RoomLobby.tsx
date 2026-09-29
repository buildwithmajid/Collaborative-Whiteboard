import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoomLobby: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    const res = await fetch('http://localhost:3001/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'Untitled' }),
    });
    const { roomId } = await res.json();
    navigate(`/room/${roomId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 20 }}>
      <h1>Whiteboard Lobby</h1>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Room name..."
        style={{ padding: 10, width: 200 }}
      />
      <button onClick={createRoom} style={{ padding: 10, width: 200 }}>Buat Room Baru</button>
    </div>
  );
};

export default RoomLobby;
