import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { CitizenRoute, AdvocateRoute, AdminRoute } from './components/RouteGuards.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const AILegalGuidance = lazy(() => import('./pages/AILegalGuidance.jsx'));
const CaseOutcome = lazy(() => import('./pages/CaseOutcome.jsx'));
const CaseTracker = lazy(() => import('./pages/CaseTracker.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Directory = lazy(() => import('./pages/Directory.jsx'));
const DocumentGenerator = lazy(() => import('./pages/DocumentGenerator.jsx'));
const GuidedIntake = lazy(() => import('./pages/GuidedIntake.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const LegalAid = lazy(() => import('./pages/LegalAid.jsx'));
const PortalSelection = lazy(() => import('./pages/PortalSelection.jsx'));
const CitizenLogin = lazy(() => import('./pages/CitizenLogin.jsx'));
const CitizenRegister = lazy(() => import('./pages/CitizenRegister.jsx'));
const AdvocateLogin = lazy(() => import('./pages/AdvocateLogin.jsx'));
const AdvocateRegister = lazy(() => import('./pages/AdvocateRegister.jsx'));
const AdvocateDashboard = lazy(() => import('./pages/AdvocateDashboard.jsx'));
const AdvocateOnboarding = lazy(() => import('./pages/AdvocateOnboarding.jsx'));
const AdvocateAvailability = lazy(() => import('./pages/AdvocateAvailability.jsx'));
const AdvocateProfilePage = lazy(() => import('./pages/AdvocateProfilePage.jsx'));
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
const Advocates = lazy(() => import('./pages/Advocates.jsx'));
const AdvocateProfile = lazy(() => import('./pages/AdvocateProfile.jsx'));
const Consultations = lazy(() => import('./pages/Consultations.jsx'));
const ConsultationBroadcasts = lazy(() => import('./pages/ConsultationBroadcasts.jsx'));
const ConsultAdvocate = lazy(() => import('./pages/ConsultAdvocate.jsx'));
const ConsultationDetails = lazy(() => import('./pages/ConsultationDetails.jsx'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="advocates" element={<Advocates />} />
          <Route path="advocates/:id" element={<AdvocateProfile />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="consultations/:appointmentId" element={<ConsultationDetails />} />
          <Route path="consult-advocate" element={<ConsultAdvocate />} />
          <Route path="consultation-broadcasts" element={<ConsultationBroadcasts />} />
          <Route path="ai-legal-guidance" element={<AILegalGuidance />} />
          <Route path="case-outcome" element={<CaseOutcome />} />
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

          {/* ── Phase Q: Portal & Auth Routes ── */}
          <Route path="login" element={<PortalSelection />} />
          <Route path="citizen/login" element={<CitizenLogin />} />
          <Route path="citizen/register" element={<CitizenRegister />} />
          <Route path="advocate/login" element={<AdvocateLogin />} />
          <Route path="advocate/register" element={<AdvocateRegister />} />

          {/* ── Protected Portals ── */}
          <Route
            path="dashboard"
            element={
              <CitizenRoute>
                <UserDashboard />
              </CitizenRoute>
            }
          />
          <Route
            path="advocate/dashboard"
            element={
              <AdvocateRoute>
                <AdvocateDashboard />
              </AdvocateRoute>
            }
          />
          <Route
            path="advocate/onboarding"
            element={
              <AdvocateRoute>
                <AdvocateOnboarding />
              </AdvocateRoute>
            }
          />
          <Route
            path="advocate/availability"
            element={
              <AdvocateRoute>
                <AdvocateAvailability />
              </AdvocateRoute>
            }
          />
          <Route
            path="advocate/profile"
            element={
              <AdvocateRoute>
                <AdvocateProfilePage />
              </AdvocateRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
