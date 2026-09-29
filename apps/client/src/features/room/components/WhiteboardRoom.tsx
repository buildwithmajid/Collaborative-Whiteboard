import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CanvasStage from '../../canvas/components/CanvasStage';
import Toolbar from '../../canvas/components/Toolbar';
import RemoteCursor from '../../collaboration/components/RemoteCursor';
import PresenceAvatars from '../../collaboration/components/PresenceAvatars';
import type { ToolMode } from '../../canvas/types';
import { useYDoc } from '../../collaboration/hooks/useYDoc';
import { useCanvasObjects } from '../../canvas/hooks/useCanvasObjects';
import { useAwareness } from '../../collaboration/hooks/useAwareness';
import { generateRandomUser, generateUserId } from '../../collaboration/utils/userGenerator';

function WhiteboardRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/rooms/${roomId}`)
      .then((res) => {
        if (!res.ok) setError('Room tidak ditemukan');
      })
      .catch(() => setError('Room tidak ditemukan'));
  }, [roomId]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  
  const userId = useMemo(() => generateUserId(), []);
  const localUser = useMemo(() => generateRandomUser(), []);
  
  const { ydoc, provider, synced } = useYDoc(roomId || '');
  const { objects, addObject, updateObject } = useCanvasObjects(ydoc);
  const { remoteCursors, onlineUsers, setLocalCursor, clearLocalCursor } = useAwareness(provider, localUser);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 10 }}>
        <h2>{error}</h2>
        <button onClick={() => navigate('/')}>Kembali ke Lobby</button>
      </div>
    );
  }

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link room disalin ke clipboard!');
  };

  return (
    <>
      <Toolbar activeTool={toolMode} onToolChange={setToolMode} />
      <button 
        onClick={shareLink}
        style={{ position: 'fixed', top: 20, left: 240, zIndex: 100, padding: '8px 16px', background: 'white', border: '2px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
      >
        Share
      </button>
      {!synced && (
        <div style={{ position: 'fixed', top: 20, right: 20, padding: 10, background: '#fef3c7', borderRadius: 4, zIndex: 100 }}>
          Connecting...
        </div>
      )}
      <PresenceAvatars users={onlineUsers} localUser={localUser} />
      <CanvasStage
        objects={objects}
        onAddObject={addObject}
        onUpdateObject={updateObject}
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
        toolMode={toolMode}
        userId={userId}
        onMouseMove={setLocalCursor}
        onMouseLeave={clearLocalCursor}
      />
      {remoteCursors.map((cursor) => (
        <RemoteCursor key={cursor.clientId} cursor={cursor} />
      ))}
    </>
  );
}

export default WhiteboardRoom;
