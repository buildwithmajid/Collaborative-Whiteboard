import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../api/roomApi';

const RoomLobby: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setCreating(true);
    setError(null);
    try {
      const roomId = await createRoom(name || 'Untitled');
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Gagal membuat room. Pastikan server berjalan.');
      setCreating(false);
    }
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
      <button onClick={handleCreateRoom} disabled={creating} style={{ padding: 10, width: 200 }}>
        {creating ? 'Membuat...' : 'Buat Room Baru'}
      </button>
      {error && <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>}
    </div>
  );
};

export default RoomLobby;
