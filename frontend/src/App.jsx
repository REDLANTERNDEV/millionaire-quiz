import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Contact from './Contact';
import MainPage from './MainPage';

const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
};

export default App;
