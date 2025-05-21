
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Peers from "./pages/Peers";
import CrearPeer from "./pages/CrearPeer";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import AuthCheck from "./components/AuthCheck";

const queryClient = new QueryClient();

// Use HashRouter for GitHub Pages compatibility
const Router = process.env.NODE_ENV === "production" ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route element={<AuthCheck><Layout /></AuthCheck>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/peers" element={<Peers />} />
            <Route path="/peers/:clienteId" element={<Peers />} />
            <Route path="/crear-peer" element={<CrearPeer />} />
            <Route path="/crear-peer/:clienteId" element={<CrearPeer />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
