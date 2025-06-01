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
import CongePage from "./pages/enseignant/CongePage";
import OrdreMissionPage from "./pages/enseignant/OrdreMissionPage";
import PageDemandesEnseignant from "./pages/enseignant/PageDemandesEnseignant";

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
		  <Route path="/enseignant/conge" element={<CongePage />} />
		  <Route path="/enseignant/ordre-mission" element={<OrdreMissionPage />} />
		  <Route path="/enseignant/absence" element={<CongePage />} />
		  <Route path="/enseignant/heures-sup" element={<CongePage />} />
	
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
