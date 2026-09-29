import { useEffect, useState } from 'react';
import type { WebsocketProvider } from 'y-websocket';

export interface CursorState {
  x: number;
  y: number;
}

export interface UserState {
  name: string;
  color: string;
}

export interface AwarenessState {
  user: UserState;
  cursor: CursorState | null;
}

export interface RemoteCursor {
  clientId: number;
  x: number;
  y: number;
  name: string;
  color: string;
}

export function useAwareness(provider: WebsocketProvider | null, localUser: UserState) {
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ clientId: number; user: UserState }>>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;

    awareness.setLocalStateField('user', localUser);

    const updateRemoteStates = () => {
      const cursors: RemoteCursor[] = [];
      const users: Array<{ clientId: number; user: UserState }> = [];

      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) return;

        const awarenessState = state as AwarenessState;
        
        if (awarenessState.user) {
          users.push({ clientId, user: awarenessState.user });
        }

        if (awarenessState.cursor && awarenessState.user) {
          cursors.push({
            clientId,
            x: awarenessState.cursor.x,
            y: awarenessState.cursor.y,
            name: awarenessState.user.name,
            color: awarenessState.user.color,
          });
        }
      });

      setRemoteCursors(cursors);
      setOnlineUsers(users);
    };

    awareness.on('change', updateRemoteStates);
    updateRemoteStates();

    return () => {
      awareness.off('change', updateRemoteStates);
    };
  }, [provider, localUser]);

  const setLocalCursor = (x: number, y: number) => {
    if (!provider) return;
    provider.awareness.setLocalStateField('cursor', { x, y });
  };

  const clearLocalCursor = () => {
    if (!provider) return;
    provider.awareness.setLocalStateField('cursor', null);
  };

  return {
    remoteCursors,
    onlineUsers,
    setLocalCursor,
    clearLocalCursor,
  };
}
