import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { SubjectSelection } from './pages/SubjectSelection';
import { ChatInterface } from './pages/ChatInterface';
import { UserProfile } from './pages/UserProfile';
import { PremiumFeatures } from './pages/PremiumFeatures';
import { ScanHomework } from './pages/ScanHomework';
import { Layout } from './components/Layout';
export function App() {
  return <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<SubjectSelection />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/scan" element={<ScanHomework />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/premium" element={<PremiumFeatures />} />
        </Route>
      </Routes>
    </Router>;
}

export default App;