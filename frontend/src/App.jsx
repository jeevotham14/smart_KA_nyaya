import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const AILegalGuidance = lazy(() => import('./pages/AILegalGuidance.jsx'));
const CaseTracker = lazy(() => import('./pages/CaseTracker.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Directory = lazy(() => import('./pages/Directory.jsx'));
const DocumentGenerator = lazy(() => import('./pages/DocumentGenerator.jsx'));
const GuidedIntake = lazy(() => import('./pages/GuidedIntake.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const LegalAid = lazy(() => import('./pages/LegalAid.jsx'));
const LoginRegister = lazy(() => import('./pages/LoginRegister.jsx'));
const Resources = lazy(() => import('./pages/Resources.jsx'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));
const WomenProtection = lazy(() => import('./pages/WomenProtection.jsx'));
const CaseWorkspace = lazy(() => import('./pages/CaseWorkspace.jsx'));
const EvidenceOrganizer = lazy(() => import('./pages/EvidenceOrganizer.jsx'));
const VakalatnmaGenerator = lazy(() => import('./pages/VakalatnmaGenerator.jsx'));
const CourtFeeCalculator = lazy(() => import('./pages/CourtFeeCalculator.jsx'));
const LimitationChecker = lazy(() => import('./pages/LimitationChecker.jsx'));
const RightsExplainer = lazy(() => import('./pages/RightsExplainer.jsx'));
const EmergencyAssistance = lazy(() => import('./pages/EmergencyAssistance.jsx'));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch.jsx'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
          <Route path="emergency" element={<EmergencyAssistance />} />
          <Route path="search" element={<GlobalSearch />} />
          <Route path="resources" element={<Navigate to="/document-generator" replace />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<LoginRegister />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}