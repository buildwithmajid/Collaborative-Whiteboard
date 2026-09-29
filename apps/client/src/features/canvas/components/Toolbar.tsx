import React from 'react';
import type { ToolMode } from '../types';
import './Toolbar.css';

interface ToolbarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
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

      <div className="toolbar-separator" />

      <button
        className="tool-button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        className="tool-button"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        ↪ Redo
      </button>
    </div>
  );
};

export default Toolbar;
