import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Shared/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Architecture from './pages/Architecture';
import PaperDetails from './pages/PaperDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="paper/:id" element={<PaperDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
