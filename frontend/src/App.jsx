import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import About from './pages/About.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AILegalAssistant from './pages/AILegalAssistant.jsx';
import CaseTracker from './pages/CaseTracker.jsx';
import Contact from './pages/Contact.jsx';
import Directory from './pages/Directory.jsx';
import DocumentGenerator from './pages/DocumentGenerator.jsx';
import Home from './pages/Home.jsx';
import LegalAid from './pages/LegalAid.jsx';
import LegalGuidance from './pages/LegalGuidance.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import Resources from './pages/Resources.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import WomenProtection from './pages/WomenProtection.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="ai-legal-assistant" element={<AILegalAssistant />} />
        <Route path="legal-guidance" element={<LegalGuidance />} />
        <Route path="women-protection" element={<WomenProtection />} />
        <Route path="legal-aid" element={<LegalAid />} />
        <Route path="document-generator" element={<DocumentGenerator />} />
        <Route path="directory" element={<Directory />} />
        <Route path="case-tracker" element={<CaseTracker />} />
        <Route path="resources" element={<Resources />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<LoginRegister />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}