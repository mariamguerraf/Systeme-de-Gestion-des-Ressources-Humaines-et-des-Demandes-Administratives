import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import UsersPage from './pages/secrétaire/Users';
import Dashboard from "./pages/secrétaire/Dashboard";
import NotFound from "./pages/NotFound";
import Demandes from "./pages/secrétaire/Demandes";
import ProfilPage from "./pages/enseignant/ProfilPage";
import AttestationPage from "./pages/enseignant/AttestationPage";
import CongePage from "./pages/fonctionnaire administré/CongePage";
import OrdreMissionPage from "./pages/enseignant/OrdreMissionPage";
import PageDemandesEnseignant from "./pages/enseignant/PageDemandesEnseignant";
import Heures_sup from "./pages/enseignant/heures_sup";
import AbsencePage from "./pages/enseignant/AbsencePage";
import ProfilFonctionnaire from './pages/fonctionnaire administré/ProfilPage';
import DemandesFonctionnaire from './pages/fonctionnaire administré/DemandesPage';
import OrdreMissionFonctionnaire from './pages/fonctionnaire administré/OrdreMissionPage';
import CadminDashboard from './pages/cadmin/Dashboard';
import CadminEnseignants from './pages/cadmin/Enseignants';
import CadminFonctionnaires from './pages/cadmin/Fonctionnaires';
import DashboardRedirectTest from './components/DashboardRedirectTest';
import DashboardRouter from './components/DashboardRouter';
import TestLoginSuccess from './components/TestLoginSuccess';
import TestLoginPage from './components/TestLoginPage';

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App - Composant principal chargé');
  console.log('🌐 Location:', window.location.href);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />

            {/* Route de test pour la connexion API */}
            <Route path="/test-login" element={<TestLoginPage />} />

            {/* Route pour la redirection automatique basée sur le rôle */}
            <Route path="/dashboard-router" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />

            {/* Route de test pour la connexion réussie */}
            <Route path="/test-login-success" element={
              <ProtectedRoute>
                <TestLoginSuccess />
              </ProtectedRoute>
            } />

            {/* Route de test pour vérifier les redirections */}
            <Route path="/test-dashboard" element={
              <ProtectedRoute>
                <DashboardRedirectTest />
              </ProtectedRoute>
            } />

            {/* Routes Secrétaire */}
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['secretaire', 'admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['secretaire']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/demandes" element={
              <ProtectedRoute allowedRoles={['secretaire', 'admin']}>
                <Demandes />
              </ProtectedRoute>
            } />

            {/* Routes Secrétaire avec préfixe */}
            <Route path="/secretaire/dashboard" element={
              <ProtectedRoute allowedRoles={['secretaire']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/secretaire/users" element={
              <ProtectedRoute allowedRoles={['secretaire', 'admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/secretaire/demandes" element={
              <ProtectedRoute allowedRoles={['secretaire', 'admin']}>
                <Demandes />
              </ProtectedRoute>
            } />

            {/* Routes Admin */}
            <Route path="/cadmin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CadminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/cadmin/enseignants" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CadminEnseignants />
              </ProtectedRoute>
            } />
            <Route path="/cadmin/fonctionnaires" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CadminFonctionnaires />
              </ProtectedRoute>
            } />

            {/* Routes Enseignant */}
            <Route path="/enseignant/profil" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <ProfilPage />
              </ProtectedRoute>
            } />
            <Route path="/enseignant/demandes" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <PageDemandesEnseignant />
              </ProtectedRoute>
            } />
            <Route path="/enseignant/attestation" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <AttestationPage />
              </ProtectedRoute>
            } />
            <Route path="/enseignant/ordre-mission" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <OrdreMissionPage />
              </ProtectedRoute>
            } />
            <Route path="/enseignant/heures-sup" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <Heures_sup />
              </ProtectedRoute>
            } />
            <Route path="/enseignant/absence" element={
              <ProtectedRoute allowedRoles={['enseignant']}>
                <AbsencePage />
              </ProtectedRoute>
            } />

            {/* Routes Fonctionnaire */}
            <Route path="/fonctionnaire/profil" element={
              <ProtectedRoute allowedRoles={['fonctionnaire']}>
                <ProfilFonctionnaire />
              </ProtectedRoute>
            } />
            <Route path="/fonctionnaire/demandes" element={
              <ProtectedRoute allowedRoles={['fonctionnaire']}>
                <DemandesFonctionnaire />
              </ProtectedRoute>
            } />
            <Route path="/fonctionnaire/conge" element={
              <ProtectedRoute allowedRoles={['fonctionnaire']}>
                <CongePage />
              </ProtectedRoute>
            } />
            <Route path="/fonctionnaire/ordre-mission" element={
              <ProtectedRoute allowedRoles={['fonctionnaire']}>
                <OrdreMissionFonctionnaire />
              </ProtectedRoute>
            } />

            {/* Routes legacy pour compatibilité */}
            <Route path="/profil" element={
              <ProtectedRoute>
                <ProfilPage />
              </ProtectedRoute>
            } />
            <Route path="/attestation" element={
              <ProtectedRoute>
                <AttestationPage />
              </ProtectedRoute>
            } />
            <Route path="/conge" element={
              <ProtectedRoute>
                <CongePage />
              </ProtectedRoute>
            } />
            <Route path="/ordremission" element={
              <ProtectedRoute>
                <OrdreMissionPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
