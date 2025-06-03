import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AbsencePage from "./pages/enseignant/AbsencePage"; // Assuming you have an AbsencePage component
import ProfilFonctionnaire from './pages/fonctionnaire administré/ProfilPage';
import DemandesFonctionnaire from './pages/fonctionnaire administré/DemandesPage';
import OrdreMissionFonctionnaire from './pages/fonctionnaire administré/OrdreMissionPage';
import CadminDashboard from './pages/cadmin/Dashboard';
import CadminEnseignants from './pages/cadmin/Enseignants';
import CadminFonctionnaires from './pages/cadmin/Fonctionnaires';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
		  <Route path="/users" element={<UsersPage />} />
		  <Route path="/dashboard" element={<Dashboard />} />
		  <Route path="/demandes" element={<Demandes />} />
		  <Route path="/profil" element={<ProfilPage />} />
		  <Route path="/attestation" element={<AttestationPage />} />
		  <Route path="/conge" element={<CongePage />} />
		  <Route path="/ordremission" element={<OrdreMissionPage />} />
		  <Route path="/demandes-enseignant" element={<PageDemandesEnseignant />} />
		  {/* button */}
		  <Route path="/enseignant/profil" element={<ProfilPage />} />
          <Route path="/enseignant/demandes" element={<PageDemandesEnseignant />} />
		  <Route path="/enseignant/attestation" element={<AttestationPage />} />
		  <Route path="/fonctionnaire/conge" element={<CongePage />} />
		  <Route path="/enseignant/ordre-mission" element={<OrdreMissionPage />} />
		  <Route path="/enseignant/heures-sup" element={<Heures_sup />} />
		  <Route path="/secretaire/dashboard" element={<Dashboard />} />
		  <Route path="/secretaire/users" element={<UsersPage />} />
		  <Route path="/secretaire/demandes" element={<Demandes />} />
		  <Route path="/enseignant/absence" element={<AbsencePage />} />
		  <Route path="/fonctionnaire/profil" element={<ProfilFonctionnaire />} />
          <Route path="/fonctionnaire/demandes" element={<DemandesFonctionnaire />} />
		  <Route path="/fonctionnaire/ordre-mission" element={<OrdreMissionFonctionnaire />} />
		  <Route path="/cadmin/dashboard" element={<CadminDashboard />} />
          <Route path="/cadmin/enseignants" element={<CadminEnseignants />} />
          <Route path="/cadmin/fonctionnaires" element={<CadminFonctionnaires />} />
		  {/* Catch-all route for 404 Not Found */}
		  {/* ADD ALL CUSTOM ROUTES BELOW THE CATCH-ALL  */}
          {/* <Route path="/Welcom" element={<Welcom />} /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL  */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
