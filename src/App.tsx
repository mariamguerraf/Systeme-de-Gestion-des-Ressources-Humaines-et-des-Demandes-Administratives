import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UsersPage from './pages/Dashboard/Users';
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import Demandes from "./pages/Dashboard/Demandes";
import Welcom from "./pages/Welcom";

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
