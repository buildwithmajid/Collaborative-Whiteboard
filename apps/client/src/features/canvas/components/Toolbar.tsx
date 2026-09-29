import React from 'react';
import type { ToolMode } from '../types';
import './Toolbar.css';

interface ToolbarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="toolbar">
      <button
        className={`tool-button ${activeTool === 'select' ? 'active' : ''}`}
        onClick={() => onToolChange('select')}
        title="Select tool"
      >
        ✓ Select
      </button>
      <button
        className={`tool-button ${activeTool === 'rectangle' ? 'active' : ''}`}
        onClick={() => onToolChange('rectangle')}
        title="Draw rectangle"
      >
        ▭ Rectangle
      </button>
      <button
        className={`tool-button ${activeTool === 'circle' ? 'active' : ''}`}
        onClick={() => onToolChange('circle')}
        title="Draw circle"
      >
        ◯ Circle
      </button>
    </div>
  );
};

export default Toolbar;
