import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import About from './pages/About.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AILegalGuidance from './pages/AILegalGuidance.jsx';
import CaseTracker from './pages/CaseTracker.jsx';
import Contact from './pages/Contact.jsx';
import Directory from './pages/Directory.jsx';
import DocumentGenerator from './pages/DocumentGenerator.jsx';
import GuidedIntake from './pages/GuidedIntake.jsx';
import Home from './pages/Home.jsx';
import LegalAid from './pages/LegalAid.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import Resources from './pages/Resources.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import WomenProtection from './pages/WomenProtection.jsx';
import CaseWorkspace from './pages/CaseWorkspace.jsx';
import EvidenceOrganizer from './pages/EvidenceOrganizer.jsx';
import VakalatnmaGenerator from './pages/VakalatnmaGenerator.jsx';
import CourtFeeCalculator from './pages/CourtFeeCalculator.jsx';
import LimitationChecker from './pages/LimitationChecker.jsx';
import RightsExplainer from './pages/RightsExplainer.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="ai-legal-guidance" element={<AILegalGuidance />} />
        <Route path="women-protection" element={<WomenProtection />} />
        <Route path="legal-aid" element={<LegalAid />} />
        <Route path="document-generator" element={<DocumentGenerator />} />
        <Route path="vakalatnama" element={<VakalatnmaGenerator />} />
        <Route path="directory" element={<Directory />} />
        <Route path="case-tracker" element={<CaseTracker />} />
        <Route path="guided-intake" element={<GuidedIntake />} />
        <Route path="workspace/:caseId" element={<CaseWorkspace />} />
        <Route path="evidence/:caseId" element={<EvidenceOrganizer />} />
        <Route path="court-fee-calculator" element={<CourtFeeCalculator />} />
        <Route path="limitation-checker" element={<LimitationChecker />} />
        <Route path="rights-explainer" element={<RightsExplainer />} />
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