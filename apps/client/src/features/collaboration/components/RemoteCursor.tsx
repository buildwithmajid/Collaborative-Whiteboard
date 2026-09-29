import React from 'react';
import type { RemoteCursor as RemoteCursorType } from '../hooks/useAwareness';

interface RemoteCursorProps {
  cursor: RemoteCursorType;
}

const RemoteCursor: React.FC<RemoteCursorProps> = ({ cursor }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: cursor.x,
        top: cursor.y,
        pointerEvents: 'none',
        zIndex: 1000,
        transform: 'translate(-2px, -2px)',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <path
          d="M5.65376 12.3673L12.4766 5.54472L15.9399 17.7068L12.4766 15.7316L9.01337 17.7068L5.65376 12.3673Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        style={{
          marginLeft: 20,
          marginTop: -8,
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: 4,
          backgroundColor: cursor.color,
          color: 'white',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {cursor.name}
      </div>
    </div>
  );
};

export default RemoteCursor;
