import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoomLobby from './features/room/components/RoomLobby';
import WhiteboardRoom from './features/room/components/WhiteboardRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoomLobby />} />
        <Route path="/room/:roomId" element={<WhiteboardRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
