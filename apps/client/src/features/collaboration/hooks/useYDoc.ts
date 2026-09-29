import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYDoc(roomId: string) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const wsProvider = new WebsocketProvider(
      'ws://localhost:3001/room',
      roomId,
      ydoc
    );

    const handleStatus = (event: { status: string }) => {
      setSynced(event.status === 'connected');
    };

    wsProvider.on('status', handleStatus);

    const timer = setTimeout(() => {
      setProvider(wsProvider);
    }, 0);

    return () => {
      clearTimeout(timer);
      wsProvider.off('status', handleStatus);
      wsProvider.destroy();
    };
  }, [roomId, ydoc]);

  return { ydoc, provider, synced };
}
