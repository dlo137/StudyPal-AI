import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { ChatInterface } from './pages/Chat';
import { UserProfile } from './pages/UserProfile';
import { PremiumFeatures } from './pages/PremiumFeatures';

export function App() {
  return <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ChatInterface />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/premium" element={<PremiumFeatures />} />
      </Routes>
    </Router>;
}

export default App;