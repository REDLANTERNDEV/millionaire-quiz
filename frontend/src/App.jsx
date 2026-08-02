import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Contact from './Contact';
import MainPage from './MainPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
};

export default App;
