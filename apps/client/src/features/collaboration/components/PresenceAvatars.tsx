import React from 'react';
import type { UserState } from '../hooks/useAwareness';

interface PresenceAvatarsProps {
  users: Array<{ clientId: number; user: UserState }>;
  localUser: UserState;
}

const PresenceAvatars: React.FC<PresenceAvatarsProps> = ({ users, localUser }) => {
  const allUsers = [{ clientId: -1, user: localUser }, ...users];

  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 100,
      }}
    >
      {allUsers.map(({ clientId, user }) => {
        const initials = user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase();

        return (
          <div
            key={clientId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'white',
              padding: '6px 12px',
              borderRadius: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: user.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {initials}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {user.name}
              {clientId === -1 && ' (You)'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PresenceAvatars;
