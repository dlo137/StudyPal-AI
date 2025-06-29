import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ChatInterface } from './pages/Chat';
import { UserProfile } from './pages/UserProfile';
import { PremiumFeatures } from './pages/PremiumFeatures';
import TestSupabase from './pages/TestSupabase';

export function App() {
  return <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<ChatInterface />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/premium" element={<PremiumFeatures />} />
        <Route path="/test-supabase" element={<TestSupabase />} />
      </Routes>
    </Router>;
}

export default App;