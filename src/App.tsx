
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Peers from "./pages/Peers";
import CrearPeer from "./pages/CrearPeer";
import Layout from "./components/Layout";
import AuthCheck from "./components/AuthCheck";
import Settings from "./pages/Settings";

// Create the client as a constant outside of the component
const queryClient = new QueryClient();

// Make sure App is defined as a proper React functional component
const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
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
          </HashRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
